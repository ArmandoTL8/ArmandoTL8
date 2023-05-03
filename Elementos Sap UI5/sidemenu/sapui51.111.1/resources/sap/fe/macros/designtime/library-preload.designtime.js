//@ui5-bundle sap/fe/macros/designtime/library-preload.designtime.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/contact/Contact-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a property set as Contact Data like adress or phone number.
       *
       * <br>
       * <i>Example in OData V4 notation with Contact Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *   &lt;Annotation Property="Common.Label" String="Sold-to Party"/&gt;
       *   &lt;Annotation Property="com.sap.vocabularies.Communication.v1.Contact"&gt;
       *     &lt;Record Type="com.sap.vocabularies.Communication.v1.ContactType"&gt;
       *       &lt;PropertyValue Property="email"&gt;
       *         &lt;Collection&gt;
       *           &lt;Record Type="com.sap.vocabularies.Communication.v1.EmailAddressType"&gt;
       *             &lt;PropertyValue Property="type" EnumMember="com.sap.vocabularies.Communication.v1.ContactInformationType/work"/&gt;
       *             &lt;PropertyValue Property="address" Path="EmailAddress"/&gt;
       *           &lt;/Record&gt;
       *         &lt;/Collection&gt;
       *       &lt;/PropertyValue&gt;
       *         &lt;PropertyValue Property="fn" Path="CustomerName"/&gt;
       *         &lt;PropertyValue Property="tel"&gt;
       *           &lt;Collection&gt;
       *             &lt;Record Type="com.sap.vocabularies.Communication.v1.PhoneNumberType"&gt;
       *               &lt;PropertyValue Property="type" EnumMember="com.sap.vocabularies.Communication.v1.PhoneType/fax"/&gt;
       *               &lt;PropertyValue Property="uri" Path="InternationalPhoneNumber"/&gt;
       *             &lt;/Record&gt;
       *           &lt;/Collection&gt;
       *         &lt;/PropertyValue&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i>Contact Type properties evaluated by this macro :</i>
       *
       * <ul>
       *   <li>Property <b>fn</b> <br/>
       *	   The Full name for the contact
       *   </li>
       *   <li>Property <b>title</b><br/>
       *     The title of the contact
       *   </li>
       *   <li>Property <b>role</b><br/>
       *     The role of the contact
       *   </li>
       *   <li>Property <b>org</b><br/>
       *     The organization of the contact
       *   </li>
       *   <li>Property <b>photo</b><br/>
       *     The photo of the contact
       *   </li>
       *   <li>Property <b>adr</b><br/>
       *     Array of addresses of the contact
       *   </li>
       *   <li>Property <b>email</b><br/>
       *     Array of email addresses of the contact
       *   </li>
       *   <li>Property <b>tel</b><br/>
       *     Array of telephone numbers of the contact
       *   </li>
       * </ul>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Communication.md#contact com.sap.vocabularies.Communication.v1.Contact}</b><br/>
       *   </li>
       * </ul>
       */
      contact: {
        namespace: "com.sap.vocabularies.Communication.v1",
        annotation: "Contact",
        target: ["EntityType"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/contact/Contact.designtime", [],function(){"use strict";return{annotations:{contact:{namespace:"com.sap.vocabularies.Communication.v1",annotation:"Contact",target:["EntityType"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/filterBar/FilterBar-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a collection of properties that might be relevant for filtering a collection of entities.
       * These properties are rendered as filter fields on the UI.
       *
       * <br>
       * <i>Example in OData V4 notation defining selection fields in the Filter Bar</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="com.sap.vocabularies.UI.v1"&gt;
       *     &lt;Collection&gt;
       *     &lt;PropertyPath&gt;SalesOrder&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SoldToParty&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;OverallSDProcessStatus&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SalesOrderDate&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;ShippingCondition&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;LastChangedDateTime&lt;/PropertyPath&gt;
       *     &lt;/Collection&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#SelectionFields  com.sap.vocabularies.UI.v1.SelectionFields}</b><br/>
       *   </li>
       * </ul>
       */
      selectionFields: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "SelectionFields",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines if the Search Field in the filter bar is enabled.
       * Property "hideBasicSearch" must not be true.
       *
       * <br>
       * <i>Example in OData V4 Search Field in Filter Bar be rendered.</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
       *     &lt;Record&gt;
       *       &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions org.OData.Capabilities.V1.SearchRestrictions}</b><br/>
       *   </li>
       * </ul>
       */
      searchRestrictions: {
        namespace: "org.OData.Capabilities.V1",
        annotation: "SearchRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/filterBar/FilterBar.designtime", [],function(){"use strict";return{annotations:{selectionFields:{namespace:"com.sap.vocabularies.UI.v1",annotation:"SelectionFields",target:["EntityType"],since:"1.75"},searchRestrictions:{namespace:"org.OData.Capabilities.V1",annotation:"SearchRestrictions",target:["EntitySet"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/form/Form-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a CollectionFacet that is a container for other CollectionFacests or a set of ReferenceFacets
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 	    &lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 		  &lt;PropertyValue Property="Label" String="Header"/&gt;
       * 		  &lt;PropertyValue Property="ID" String="HeaderInfo"/&gt;
       * 		  &lt;PropertyValue Property="Facets"&gt;
       * 		    &lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 			    &lt;PropertyValue Property="ID" String="GeneralInfo"/&gt;
       * 			    &lt;PropertyValue Property="Label" String="General Information"/&gt;
       * 			    &lt;PropertyValue Property="Facets"&gt;
       * 				  &lt;Collection&gt;
       * 				    &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 					  &lt;PropertyValue Property="Label" String="Adress"/&gt;
       * 					  &lt;PropertyValue Property="ID" String="Adress"/&gt;
       * 					  &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 				    &lt;/Record&gt;
       * 				    &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 					  &lt;PropertyValue Property="Label" String="Contact"/&gt;
       * 					  &lt;PropertyValue Property="ID" String="Partner"/&gt;
       * 					  &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#Contact"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 				    &lt;/Record&gt;
       * 				  &lt;/Collection&gt;
       * 			    &lt;/PropertyValue&gt;
       * 			    &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 			  &lt;/Record&gt;
       * 		    &lt;/Collection&gt;
       * 		  &lt;/PropertyValue&gt;
       * 	    &lt;/Record&gt;
       * 	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#collectionfacet-facet com.sap.vocabularies.UI.v1.CollectionFacet}</b><br/>
       *   </li>
       * </ul>
       */
      CollectionFacet: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "CollectionFacet",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * Defines a ReferenceFacet
       *
       * <br>
       * <i> Example in OData V4 notation with ReferenceFacets within a QuickViewFacet</i>
       *
       * <pre>
       * &ltAnnotation Term="com.sap.vocabularies.UI.v1.QuickViewFacets"&gt
       *   &ltCollection&gt
       *     &ltRecord Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt
       *       &ltPropertyValue Property="Label" String="Address"/&gt
       *       &ltPropertyValue Property="Target" AnnotationPath="@Communication.Contact"/&gt
       *       &ltAnnotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt
       *     &lt/Record&gt
       *     &ltRecord Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt
       *       &ltPropertyValue Property="Label" String="Address"/&gt
       *       &ltPropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt
       *     /Record&gt&lt
       *   &lt/Collection&gt
       * &lt/Annotation&gt
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#referencefacet-facet com.sap.vocabularies.UI.v1.ReferenceFacet}</b><br/>
       *   </li>
       * </ul>
       */
      ReferenceFacet: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "ReferenceFacet",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * partOfPreview is currently under contruction, so we leave it out in metadata and designtime files for now
       *
       * Defines, if a Facet and all included Facets are part of the header preview
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       *
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 		&lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 			&lt;PropertyValue Property="ID" String="GeneralInfo"/&gt;
       * 			&lt;PropertyValue Property="Label" String="General Information"/&gt;
       * 			&lt;PropertyValue Property="Facets"/&gt;
       * 			&lt;Annotation Term="com.sap.vocabularies.UI.v1.PartOfPreview" Bool="false"/&gt;
       * 			&lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="Adress"/&gt;
       * 				&lt;PropertyValue Property="ID" String="Adress"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 			  &lt;/Record&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="Contact"/&gt;
       * 				&lt;PropertyValue Property="ID" String="Partner"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#Contact"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 			  &lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Record&gt;
       *	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
       * </pre>
       */
      // partOfPreview: {
      // 	namespace: "com.sap.vocabularies.UI.v1",
      // 	annotation: "PartOfPreview",
      // 	target: ["Property"],
      // 	since: "1.75"
      // },

      /**
       * Defines that a facet is not displayed. As a consequence the facet will not be created by the macro.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden Reference Facet. Using alias "UI" for namespace "com.sap.vocabularies.UI.v1"</i>
       *
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 		&lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 		...
       * 			&lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="anyLabel"/&gt;
       * 				&lt;PropertyValue Property="ID" String="anyID"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="true"/&gt;
       * 			  &lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Record&gt;
       *	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b><br/>
       *   </li>
       * </ul>
       */
      hidden: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Hidden",
        target: ["Property"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/form/Form.designtime", [],function(){"use strict";return{annotations:{CollectionFacet:{namespace:"com.sap.vocabularies.UI.v1",annotation:"CollectionFacet",target:["Property"],since:"1.75"},ReferenceFacet:{namespace:"com.sap.vocabularies.UI.v1",annotation:"ReferenceFacet",target:["Property"],since:"1.75"},hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/form/FormContainer-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines that the FormContainer is not displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden ProductUUID</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot;/&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b><br/>
       *   </li>
       * </ul>
       */
      hidden: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Hidden",
        target: ["Property", "Record"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/form/FormContainer.designtime", [],function(){"use strict";return{annotations:{hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property","Record"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/Field-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines that a property is not displayed.
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
       * This annotation specifies that a property is rendered as a regular data field.
       *
       * <br>
       * <i>XML Example for OData V4 DataField type</i>
       *
       * <pre>
       *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
       *      &lt;PropertyValue Property="Value" String="Name"/&gt;
       *    &lt;/Record&gt;
       * </pre>
       *
       *  Supported properties are: <code>Criticality, CriticalityRepresentation, Label</code> and <code>Value</code>.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataField  com.sap.vocabularies.UI.v1.DataField}</b><br/>
       *   </li>
       * </ul>
       */
      dataField: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataField",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * This annotation specifies that a property is rendered as a link, if a URL parameter path is present.
       *
       * <br>
       * <i>XML Example for OData V4 DataFieldWithUrl annotation</i>
       * <pre>
       *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl"&gt;
       *      &lt;PropertyValue Property="Label" String="Link to"/&gt;
       *      &lt;PropertyValue Property="Value" String="Google Maps"/&gt;
       *      &lt;PropertyValue Property="Url" String="https://www.google.de/maps"/&gt;
       *    &lt;/Record&gt;
       * </pre>
       *
       *  Supported properties are: <code>Url, Label</code> and <code>Value</code>.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldWithUrl  com.sap.vocabularies.UI.v1.DataFieldWithUrl}</b><br/>
       *   </li>
       * </ul>
       */
      dataFieldWithUrl: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataFieldWithUrl",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * This annotation specifies that a property is rendered as a data field for annotation, e.g. DataPoint or Contact.
       *
       * <br>
       * <i>XML Example for OData V4 DataFieldForAnnotation annotation</i>
       * <pre>
       *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&gt;
       *      &lt;PropertyValue Property="Label" String="SoldToParty"/&gt;
       *      &lt;PropertyValue Property="Target" AnnotationPath="_SoldToParty/@Communication.Contact"/&gt;
       *    &lt;/Record&gt;
       * </pre>
       *
       *  Supported properties are: <code>Target, Label</code>.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldForAnnotation  com.sap.vocabularies.UI.v1.DataFieldForAnnotation}</b><br/>
       *   </li>
       * </ul>
       */
      dataFieldForAnnotation: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataFieldForAnnotation",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * This annotation specifies that a property is rendered as a button.
       * An action can be classified as bound or unbound. A bound action needs a context to be invoked, only then the button will be enabled.
       * The context is usually set by the user, e.g. by selecting an item in a table.
       * A button for an unbound action will always be enabled.
       * An action can have associated parameters which have to be defined in the backend.
       *
       * <br>
       * <i>XML Example for OData V4 DataFieldForAction annotation</i>
       * <pre>
       *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAction"&gt;
       *      &lt;PropertyValue Property="Label" String="Bound Action with params"/&gt;
       *      &lt;PropertyValue Property="Action" String="com.c_salesordermanage_sd.ChangeOrderType"/&gt;
       *    &lt;/Record&gt;
       * </pre>
       *
       *  Supported properties are: <code>Label, Action, Determining, Inline</code> and <code>InvocationGrouping</code>.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldForAction  com.sap.vocabularies.UI.v1.DataFieldForAction}</b><br/>
       *   </li>
       * </ul>
       */
      dataFieldForAction: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataFieldForAction",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * This annotation can be used along with the <code>DataFieldForAnnotation</code> annotation in order to specify that a property
       * is rendered as a DataPoint, e. g. Rating, Progress.
       * Via the Visualization property the VisualizationType can be defined - supported values for EnumMember are <code>Rating</code> and <code>Progress</code>.
       *
       * <br>
       * <i>XML Example for OData V4 DataPoint annotation</i>
       * <pre>
       *     &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&gt;
       *      &lt;PropertyValue Property="Label" String="Rating" /&gt;
       *      &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.DataPoint#Rating" /&gt;
       *     &lt;/Record&gt;
       *
       *    &lt;Annotation Term="com.sap.vocabularies.UI.v1.DataPoint" Qualifier="Rating"&gt;
       *      &lt;Record&gt;
       *          &lt;PropertyValue Property="Value" Path="to_Customer/RatingCount"/&gt;
       *          &lt;PropertyValue Property="TargetValue" Decimal="4"/&gt;
       *          &lt;PropertyValue Property="Visualization" EnumMember="com.sap.vocabularies.UI.v1.VisualizationType/Rating"/&gt;
       *      &lt;/Record&gt;
       *    &lt;/Annotation&gt;
       * </pre>
       *
       *  Supported properties are: <code>Value, TargetValue, Visualization</code>.
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
        target: ["Property"],
        since: "1.75"
      },
      /**
       * This annotation is used to define a default data field,
       * e.g. when a property is added as a table column or form field via personalization.
       *
       * <br>
       * <i>XML Example of OData V4 DataFieldDefault annotation</i>
       * <pre>
       *     &lt;Annotations Target="SalesOrder.SalesOrderItemType/NetAmount"&gt;
       *      &lt;Annotation Term="com.sap.vocabularies.UI.v1.DataFieldDefault"&gt;
       *          &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
       *              &lt;PropertyValue Property="Value" Path="NetAmount" /&gt;
       *          &lt;/Record&gt;
       *      &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldDefault  com.sap.vocabularies.UI.v1.DataFieldDefault}</b><br/>
       *   </li>
       * </ul>
       */
      dataFieldDefault: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataFieldDefault",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * Defines a name of the <code>SemanticObject</code> represented as this entity type or identified by this property and is rendered as a link.
       *
       * <b>Note:</b> Navigation targets are determined using {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} of the unified shell service.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObject annotation</i>
       * <pre>
       *   &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;Product&quot; /&gt;
       *   &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObject  com.sap.vocabularies.Common.v1.SemanticObject}</b><br/>
       *   </li>
       * </ul>
       */
      semanticObject: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObject",
        target: ["EntitySet", "EntityType", "Property"],
        since: "1.75"
      },
      /**
       * Maps properties of the annotated <code>EntityType</code> or sibling properties of the annotated property to properties of the
       * Semantic Object. This allows "renaming" of properties in the current context to match property names of the Semantic Object, e.g. SenderPartyID to PartyID.
       * Only properties explicitly listed in the mapping are renamed, all other properties are available for intent-based navigation with their "local" name.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObjectMapping on Product/Name</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;SemanticObjectName&quot; /&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectMapping&quot;&gt;
       * 		    &lt;Collection&gt;
       * 			    &lt;Record&gt;
       * 				    &lt;PropertyValue Property=&quot;LocalProperty&quot; PropertyPath=&quot;SupplierId&quot; /&gt;
       * 					&lt;PropertyValue Property=&quot;SemanticObjectProperty&quot; String=&quot;SupplierIdOfSemanticObjectName&quot; /&gt;
       * 				&lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObjectMapping  com.sap.vocabularies.Common.v1.SemanticObjectMapping}</b><br/>
       *   </li>
       * </ul>
       */
      semanticObjectMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectMapping",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * List of actions that are not available in the current state of the instance of the Semantic Object
       *
       * <br>
       * <i>XML Example of OData with SemanticObjectUnavailableActions on Product/CustomerId</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/CustomerId&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;CustomerSO&quot; /&gt;
       * 		&lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions&quot;&gt;
       * 			&lt;Collection&gt;
       * 				&lt;String&gt;DeleteCustomer&lt;String/&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObjectUnavailableActions  com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions}</b><br/>
       *   </li>
       * </ul>
       */
      semanticObjectUnavailableActions: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectUnavailableActions",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Defines whether a property is a semantic key which is used for key columns and rendered in bold.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticKey annotation</i>
       * <pre>
       *    &lt;Annotations Target="SalesOrderType" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
       *      &lt;Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey"&gt;
       *        &lt;Collection&gt;
       *          &lt;PropertyPath&gt;SalesOrderID&lt;/PropertyPath&gt;
       *          &lt;PropertyPath&gt;SalesOrderItemID&lt;/PropertyPath&gt;
       *        &lt;/Collection&gt;
       *      &lt;/Annotation&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticKey  com.sap.vocabularies.Common.v1.SemanticKey}</b><br/>
       *   </li>
       * </ul>
       */
      semanticKey: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticKey",
        target: ["EntityType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Renders an image, if the annotation is present.
       *
       * <br>
       * <i>XML Example of OData V4 with the IsImageURL annotation</i>
       * <pre>
       *    &lt;Annotations Target="SalesOrderItemType/ProductPictureURL" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
       *      &lt;Annotation Term="com.sap.vocabularies.Common.v1.IsImageURL" Bool="true" /&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#IsImageURL  com.sap.vocabularies.UI.v1.IsImageURL}</b><br/>
       *   </li>
       * </ul>
       */
      isImageURL: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "IsImageURL",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      },
      /**
       * Defines whether a field is mandatory, or in read-only/editable mode.
       *
       * An Entity Data Model (EDM) property can be <b>dynamically</b> annotated with the
       * <code>com.sap.vocabularies.Common.v1.FieldControl</code> annotation in OData V4 models by providing a binding path to
       * another EDM property typed as <code>Edm.Byte</code>. Or it can be <b>statically</b> annotated
       * with a fixed value provided by as an enumeration member (<code>EnumMember</code>) of the
       * <code>FieldControlType</code> enumeration.
       *
       * <br>
       * Overview of the FieldControlType:
       *
       * <table border = 1>
       *     <tr>
       *      <th>EnumMember</th>
       *      <th>Value</th>
       *      <th>Description</th>
       *     </tr>
       *     <tr>
       *         <td>Mandatory</td>
       *         <td>7</td>
       *         <td>The field is mandatory from a business perspective.
       *         This value does not imply any restrictions on the value range of an EDM property.
       *         For restricting the value range use, for example, the standard type facet <code>Nullable</code> with a
       *         value of <code>false</code> must be used to exclude the <code>null</code> value, or terms from the
       *         <code>Org.OData.Validation.V1</code> vocabulary must be used.</td>
       *     </tr>
       *     <tr>
       *         <td>Optional</td>
       *         <td>3</td>
       *         <td>The field is editable and optional (default). This value does not make sense as a static annotation value.</td>
       *     </tr>
       *     <tr>
       *         <td>ReadOnly</td>
       *         <td>1</td>
       *         <td>The field is in read-only mode and the value cannot be changed. <br>
       *           To statically annotate an EDM property as read-only, use the <code>Org.OData.Core.V1.Computed</code>
       *          annotation instead.</td>
       *     </tr>
       *     <tr>
       *         <td>Inapplicable</td>
       *         <td>0</td>
       *         <td>The field has no meaning in the current entity state. This value does not make sense as a static annotation value.
       *     </tr>
       *     <tr>
       *         <td>Hidden</td>
       *         <td>0</td>
       *         <td>Deprecated synonym for Inapplicable, do not use. To statically hide a property on the UI use
       *         <code>com.sap.vocabularies.UI.v1.Hidden</code> annotation instead</td>
       *     </tr>
       * </table>
       *
       * Supported values are: ReadOnly (1) and Mandatory (7).
       *
       * <br>
       * Example for dynamic use: in a travel expense report the EDM property <code>DestinationCountry</code> is
       * is not applicable if the trip type is domestic, and mandatory if the trip type is international.
       * Whenever the value in the data model of the referenced EDM property changes, the field adapts its state
       * accordingly.
       *
       * <br>
       * <i>XML Example of an EDM Property annotated with the dynamic <code>FieldControl</code> OData V4 annotation
       * in a Service Metadata Document</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; Path=&quot;CompanyCodeFC&quot;/&gt;
       *     &lt;/Annotations&gt;
       *    &lt;Property Name=&quot;CompanyCodeFC&quot; type=&quot;Edm.Byte&quot;/&gt;
       * </pre>
       *
       * <br>
       * <i>XML Example of an EDM Property statically annotated as Read-only</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; EnumMember=&quot;com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly&quot;/&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i>XML Example of OData V4 with static mandatory CompanyCode property</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; EnumMember=&quot;com.sap.vocabularies.Common.v1.FieldControlType/Mandatory&quot;/&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#FieldControl  com.sap.vocabularies.Common.v1.FieldControl}</b><br/>
       *   </li>
       * </ul>
       */
      fieldControl: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "FieldControl",
        target: ["Property", "Record"],
        defaultValue: 3,
        since: "1.75"
      },
      /**
       * Defines a currency code for an amount according to the ISO 4217 standard. <code>ISOCurrency</code> annotation can point to a
       * <code>Property</code>, which can also be <code>null</code>.
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
       * The unit of measure for this measured quantity, for example, cm for centimeters. Renders the value associated with the unit annotation
       * of a <code>Property</code>, which can be <code>null</code>.
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
      },
      /**
       * Properties annotated with this annotation are rendered as multi-line text, e.g. text area.
       *
       * <br>
       * <i>XML Example of OData V4 with multi-line text Description property</i>
       *
       * <pre>
       *    &lt;Property Name=&quot;Description&quot; /&gt;
       *    &lt;Annotations Target=&quot;Description&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.MultiLineText&quot; /&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#MultiLineText  com.sap.vocabularies.UI.v1.MultiLineText}</b><br/>
       *   </li>
       * </ul>
       */
      multiLineText: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "MultiLineText",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      },
      /**
       * Defines whether a <code>Property</code> can be created. A value for this <code>Property</code> is generated on both insert and
       * update actions.
       *
       * <br>
       * <i>XML Example of OData V4 with computed CreatedBy property</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrder.SalesOrderItemType/CreatedBy&quot;&gt;
       *      &lt;Annotation Term=&quot;Org.OData.Core.V1.Computed&quot;/&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Core.V1.md#Computed  Org.OData.Core.V1.Computed}</b><br/>
       *   </li>
       * </ul>
       */
      computed: {
        namespace: "Org.OData.Core.V1",
        annotation: "Computed",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      },
      /**
       * A value for this non-key property can be provided on <code>insert</code> and cannot be changed on update actions.
       *
       * <br>
       * <i>XML Example of OData V4 with immutable CreatedBy property</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrder.SalesOrderItemType/CreatedBy&quot;&gt;
       *      &lt;Annotation Term=&quot;Org.OData.Core.V1.Immutable&quot;/&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Core.V1.md#Immutable  Org.OData.Core.V1.Immutable}</b><br/>
       *   </li>
       * </ul>
       */
      immutable: {
        namespace: "Org.OData.Core.V1",
        annotation: "Immutable",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      },
      /**
       * Changes to the source properties may have side-effects on the target properties or entities. If neither TargetProperties nor
       * TargetEntities are specified, a change to the source property values may have unforeseeable side-effects as the corresponding
       * changes in the background will not be reflected in the UI. An empty
       * NavigationPropertyPath may be used in TargetEntities to specify that any property of the annotated entity type may be affected. Actions
       * are a special case: here the change trigger is the action invocation, so SourceProperties and SourceEntities have no meaning, only
       * TargetProperties and TargetEntities are relevant. They are addressed via the binding parameter of the action. <code>SideEffects</code>
       * can be associated with the given entity, which can be a complex type, entity type or entity set. In addition to this,
       * <code>SideEffects</code> can also be applied to a <code>PropertyPath</code> or a <code>NavigationPropertyPath</code> of the given
       * entity.
       *
       * <br>
       * <i>XML Example of OData V4 with Side Effect when user changes a source property and the system refreshes the price</i>
       *
       * <pre>
       *   &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SideEffects&quot; Qualifier=&quot;PriceChanged&quot;&gt;
       *     &lt;Record&gt;
       *       &lt;PropertyValue Property=&quot;SourceProperties&quot;&gt;
       *         &lt;Collection&gt;
       *           &lt;PropertyPath&gt;Amount&lt;/PropertyPath&gt;
       *           &lt;PropertyPath&gt;Discount&lt;/PropertyPath&gt;
       *           &lt;PropertyPath&gt;Product&lt;/PropertyPath&gt;
       *         &lt;/Collection&gt;
       *       &lt;/PropertyValue&gt;
       *       &lt;PropertyValue Property=&quot;TargetProperties&quot;&gt;
       *         &lt;Collection&gt;
       *           &lt;PropertyPath&gt;Price&lt;/PropertyPath&gt;
       *         &lt;/Collection&gt;
       *       &lt;/PropertyValue&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SideEffects  com.sap.vocabularies.Common.v1.SideEffects}</b><br/>
       *   </li>
       * </ul>
       */
      sideEffects: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SideEffects",
        target: ["EntitySet", "EntityType", "ComplexType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Specifies how to get a list of acceptable values for a property or parameter. Provides the value help dialog and type-ahead function.
       *
       * <br>
       * <i>XML Example of OData V4 Value List on Category Property</i>
       *
       * <pre>
       *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.ValueList&quot;&gt;
       *      &lt;Record&gt;
       *        &lt;PropertyValue Property=&quot;Label&quot; String=&quot;Category&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;CollectionPath&quot; String=&quot;Category&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;SearchSupported&quot; Bool=&quot;true&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;Parameters&quot;&gt;
       *          &lt;Collection&gt;
       *            &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterOut&quot;&gt;
       *              &lt;PropertyValue Property=&quot;LocalDataProperty&quot; PropertyPath=&quot;Category&quot; /&gt;
       *              &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;Description&quot; /&gt;
       *            &lt;/Record&gt;
       *            &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly&quot;&gt;
       *              &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;CategoryName&quot; /&gt;
       *            &lt;/Record&gt;
       *          &lt;/Collection&gt;
       *        &lt;/PropertyValue&gt;
       *      &lt;/Record&gt;
       *    &lt;/Annotation&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueList  com.sap.vocabularies.Common.v1.ValueList}</b><br/>
       *   </li>
       * </ul>
       */
      valueList: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueList",
        target: ["Property", "Parameter"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * A list of URLs of CSDL documents containing value list mappings for this parameter or property.
       * Using this annotation, the OData service only contains an annotation with the property as target
       * and the term com.sap.vocabularies.Common.v1.ValueListReferences pointing to the metadata of the value list service.
       * The ValueList annotation itself is in the referenced service.
       *
       * <br>
       * <i>XML Example of OData V4 Value List References on OriginalArtist Property</i>
       *
       * <pre>
       *    &lt;Annotations Target="sample.TitlesType/OriginalArtist"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListReferences"&gt;
       *             &lt;Collection&gt;
       *                 &lt;String&gt;../i_v4_artistname/$metadata&lt;/String&gt;
       *                 &lt;String&gt;../i_v4_artistperson/$metadata&lt;/String&gt;
       *             &lt;/Collection&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListReferences  com.sap.vocabularies.Common.v1.ValueListReferences}</b><br/>
       *   </li>
       * </ul>
       */
      valueListReferences: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListReferences",
        target: ["Property", "Parameter"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Specifies the mapping between data service properties and value list properties.
       * The value list can be filtered based on user input. It can be used for type-ahead and classical pick lists.
       *
       * <br>
       * <i>XML Example of OData V4 Value List Mapping on Country Property</i>
       *
       * <pre>
       *   &lt;Annotations Target="sample.I_AIVS_RegionType/Country"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListMapping"&gt;
       *             &lt;Record&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="I_AIVS_CountryCode" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Country" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="CountryCode" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListMapping  com.sap.vocabularies.Common.v1.ValueListMapping}</b><br/>
       *   </li>
       * </ul>
       */
      valueListMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListMapping",
        target: ["Property", "Parameter"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Specifies if a DataField is rendered as a email link. The link launches the browser email action.
       *
       * <br>
       * <i>XML Example of OData V4 DataField with email link content</i>
       *
       * <pre>
       *    &lt;Annotations Target="sap.fe.manageitems.TechnicalTestingService.LineItems/emailAddress"&gt;
       *      &lt;Annotation Term="Common.Label" String="Email"/&gt;
       *      &lt;Annotation Term="Communication.IsEmailAddress" Bool="true"/&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       */
      isEmailAddress: {
        namespace: "com.sap.vocabularies.Communication.v1",
        annotation: "IsEmailAddress",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      },
      /**
       * Specifies if a DataField is rendered as a phone link. The link launches the browser phone action.
       *
       * <br>
       * <i>XML Example of OData V4 DataField with phone link content</i>
       *
       * <pre>
       *    &lt;Annotations Target="sap.fe.manageitems.TechnicalTestingService.LineItems/phoneNumber"&gt;
       *      &lt;Annotation Term="Common.Label" String="Mobile"/&gt;
       *      &lt;Annotation Term="Communication.IsPhoneNumber" Bool="true"/&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       */
      isPhoneNumber: {
        namespace: "com.sap.vocabularies.Communication.v1",
        annotation: "IsPhoneNumber",
        target: ["Property"],
        defaultValue: true,
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/Field.designtime", [],function(){"use strict";return{annotations:{hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property","Record"],since:"1.75"},dataField:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataField",target:["Property"],since:"1.75"},dataFieldWithUrl:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataFieldWithUrl",target:["Property"],since:"1.75"},dataFieldForAnnotation:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataFieldForAnnotation",target:["Property"],since:"1.75"},dataFieldForAction:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataFieldForAction",target:["Property"],since:"1.75"},dataPoint:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataPoint",target:["Property"],since:"1.75"},dataFieldDefault:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataFieldDefault",target:["Property"],since:"1.75"},semanticObject:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObject",target:["EntitySet","EntityType","Property"],since:"1.75"},semanticObjectMapping:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObjectMapping",target:["EntitySet","EntityType","Property"],defaultValue:null,since:"1.75"},semanticObjectUnavailableActions:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObjectUnavailableActions",target:["EntitySet","EntityType","Property"],defaultValue:null,since:"1.75"},semanticKey:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticKey",target:["EntityType"],defaultValue:null,since:"1.75"},isImageURL:{namespace:"com.sap.vocabularies.UI.v1",annotation:"IsImageURL",target:["Property"],defaultValue:true,since:"1.75"},fieldControl:{namespace:"com.sap.vocabularies.Common.v1",annotation:"FieldControl",target:["Property","Record"],defaultValue:3,since:"1.75"},currencyCode:{namespace:"Org.OData.Measures.V1",annotation:"ISOCurrency",target:["Property"],defaultValue:null,since:"1.75"},unitOfMeasure:{namespace:"Org.OData.Measures.V1",annotation:"Unit",target:["Property"],defaultValue:null,since:"1.75"},multiLineText:{namespace:"com.sap.vocabularies.UI.v1",annotation:"MultiLineText",target:["Property"],defaultValue:true,since:"1.75"},computed:{namespace:"Org.OData.Core.V1",annotation:"Computed",target:["Property"],defaultValue:true,since:"1.75"},immutable:{namespace:"Org.OData.Core.V1",annotation:"Immutable",target:["Property"],defaultValue:true,since:"1.75"},sideEffects:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SideEffects",target:["EntitySet","EntityType","ComplexType"],defaultValue:null,since:"1.75"},valueList:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueList",target:["Property","Parameter"],defaultValue:null,since:"1.75"},valueListReferences:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListReferences",target:["Property","Parameter"],defaultValue:null,since:"1.75"},valueListMapping:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListMapping",target:["Property","Parameter"],defaultValue:null,since:"1.75"},isEmailAddress:{namespace:"com.sap.vocabularies.Communication.v1",annotation:"IsEmailAddress",target:["Property"],defaultValue:true,since:"1.75"},isPhoneNumber:{namespace:"com.sap.vocabularies.Communication.v1",annotation:"IsPhoneNumber",target:["Property"],defaultValue:true,since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/FilterField-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Annotation to set restrictions on filter expressions.
       * The filter field will not be created, if it is mentioned in a collection of NonFilterableProperties of the entitySet.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;service.BusinessPartnerType&quot;&gt;
       *         &lt;Annotation Term=&quot;Org.OData.Capabilities.V1.FilterRestrictions&quot;&gt;
       *             &lt;Record&gt;
       *                 &lt;PropertyValue Property=&quot;NonFilterableProperties&quot;&gt;
       *                     &lt;Collection&gt;
       *                         &lt;PropertyPath&gt;Region&lt;/PropertyPath&gt;
       *                         &lt;PropertyPath&gt;Info&lt;/PropertyPath&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#FilterRestrictions Org.OData.Capabilities.V1.FilterRestrictions}</b>
       *   </li>
       * </ul>
       */
      filterRestrictions: {
        namespace: "Org.OData.Capabilities.V1",
        annotation: "FilterRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      },
      /**
       * Defines that a property is not displayed. As a consequence the filter field will not be created by the macro.
       * In contrast to <code>HiddenFilter</code>, a property annotated with <code>Hidden</code> is not used as a filter.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden ProductUUID taken form {@link sap.fe.macros.internal.Field#annotations/Hidden}</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;service.Product/ProductUUID&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b>
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
       * Defines that a property is not displayed as a filter. As a consequence the filter field will not be created by the macro.
       *
       * <br>
       * <i>Example in OData V4 notation with invisible, filterable property "LocationName"</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Address/LocationName&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.HiddenFilter&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HiddenFilter com.sap.vocabularies.UI.v1.HiddenFilter}</b>
       *   </li>
       * </ul>
       */
      hiddenFilter: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "HiddenFilter",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * The label for the filter field.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Label&quot; String=&quot;Customer&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Label com.sap.vocabularies.Common.v1.Label}</b>
       *   </li>
       * </ul>
       */
      label: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "Label",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * A descriptive text for values of the annotated property. Value MUST be a dynamic expression when used as metadata annotation.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;CustomerName&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Text com.sap.vocabularies.Common.v1.Text}</b>
       *   </li>
       * </ul>
       */
      text: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "Text",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * Describes the arrangement of a code or ID value and its text.
       * If used for a single property the Common.Text annotation is annotated.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;CustomerName&quot;&gt;
       *             &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.TextArrangement&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst&quot; /&gt;
       *         &lt;Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#TextArrangement com.sap.vocabularies.UI.v1.TextArrangement}</b>
       *   </li>
       * </ul>
       */
      textArrangement: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "TextArrangement",
        target: ["Annotation", "EntityType"],
        since: "1.75"
      },
      /**
       * The currency for this monetary amount as an ISO 4217 currency code.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.internal.Field#annotations/ISOCurrency}</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.SalesOrderItem/NetAmount&quot;&gt;
       *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.ISOCurrency&quot; Path=&quot;TransactionCurrency&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#ISOCurrency Org.OData.Measures.V1.ISOCurrency}</b>
       *   </li>
       * </ul>
       */
      iSOCurrency: {
        namespace: "Org.OData.Measures.V1",
        annotation: "ISOCurrency",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * The unit of measure for this measured quantity, e.g. cm for centimeters or % for percentages
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.internal.Field#annotations/Unit}</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.SalesOrderItem/RequestedQuantity&quot;&gt;
       *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.Unit&quot; Path=&quot;RequestedQuantityUnit&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#Unit Org.OData.Measures.V1.Unit}</b>
       *   </li>
       * </ul>
       */
      unit: {
        namespace: "Org.OData.Measures.V1",
        annotation: "Unit",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * Specifies how to get a list of acceptable values for a property or parameter.
       * The value list can be based on user input that is passed in the value list request.
       * The value list can be used for type-ahead and classical pick lists.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueList}</i>
       * <pre>
       *     &lt;Annotations Target="service.HeaderShipToParty/BusinessPartner"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueList"&gt;
       *             &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListType"&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="Customer" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="BusinessPartner" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="Customer" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="CustomerName" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueList com.sap.vocabularies.Common.v1.ValueList}</b>
       *   </li>
       * </ul>
       */
      valueList: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueList",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * Specifies the mapping between data service properties and value list properties.
       * The value list can be filtered based on user input. It can be used for type-ahead and classical pick lists.
       * There may be many alternative mappings with different qualifiers.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueListMapping}</i>
       * <pre>
       *     &lt;Annotations Target="service.I_AIVS_RegionType/Country"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListMapping"&gt;
       *             &lt;Record&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="I_AIVS_CountryCode" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Country" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="CountryCode" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListMapping com.sap.vocabularies.Common.v1.ValueListMapping}</b>
       *   </li>
       * </ul>
       */
      valueListMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListMapping",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * A list of URLs of CSDL documents containing value list mappings for this parameter or property.
       * Using this annotation, the OData service only contains an annotation with the property as target
       * and the term com.sap.vocabularies.Common.v1.ValueListReferences pointing to the metadata of the value list service.
       * The ValueList annotation itself is in the referenced service.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueListReferences}</i>
       * <pre>
       *     &lt;Annotations Target="service.TitlesType/OriginalArtist"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListReferences"&gt;
       *             &lt;Collection&gt;
       *                 &lt;String&gt;../i_v4_artistname/$metadata&lt;/String&gt;
       *             &lt;/Collection&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListReferences com.sap.vocabularies.Common.v1.ValueListReferences}</b>
       *   </li>
       * </ul>
       */
      valueListReferences: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListReferences",
        target: ["Property", "Parameter"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/FilterField.designtime", [],function(){"use strict";return{annotations:{filterRestrictions:{namespace:"Org.OData.Capabilities.V1",annotation:"FilterRestrictions",target:["EntitySet"],since:"1.75"},hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property","Record"],since:"1.75"},hiddenFilter:{namespace:"com.sap.vocabularies.UI.v1",annotation:"HiddenFilter",target:["Property"],since:"1.75"},label:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Label",target:["Property"],since:"1.75"},text:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Text",target:["Property"],since:"1.75"},textArrangement:{namespace:"com.sap.vocabularies.UI.v1",annotation:"TextArrangement",target:["Annotation","EntityType"],since:"1.75"},iSOCurrency:{namespace:"Org.OData.Measures.V1",annotation:"ISOCurrency",target:["Property"],since:"1.75"},unit:{namespace:"Org.OData.Measures.V1",annotation:"Unit",target:["Property"],since:"1.75"},valueList:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueList",target:["Property","Parameter"],since:"1.75"},valueListMapping:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListMapping",target:["Property","Parameter"],since:"1.75"},valueListReferences:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListReferences",target:["Property","Parameter"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/valuehelp/ValueHelp-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Specifies how to get a list of acceptable values for a property or parameter.
       * The value list can be based on user input that is passed in the value list request.
       * The value list can be used for type-ahead and classical pick lists.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target="sample.SalesOrderItem.Material"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueList"&gt;
       *             &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListType"&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="MaterialBySlsOrgDistrChnl" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Material" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="Material" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterIn"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="DistributionChannel" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="DistributionChannel" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterIn"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="SalesOrganization" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="SalesOrganization" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="RequestedQuantityUnit" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="RequestedQuantityUnit" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="MaterialName" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueList com.sap.vocabularies.Common.v1.ValueList}</b>
       *   </li>
       * </ul>
       */
      valueList: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueList",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * Specifies the mapping between data service properties and value list properties.
       * The value list can be filtered based on user input. It can be used for type-ahead and classical pick lists.
       * There may be many alternative mappings with different qualifiers.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target="sample.I_AIVS_RegionType/Country"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListMapping"&gt;
       *             &lt;Record&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="I_AIVS_CountryCode" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Country" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="CountryCode" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListMapping com.sap.vocabularies.Common.v1.ValueListMapping}</b>
       *   </li>
       * </ul>
       */
      valueListMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListMapping",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * A list of URLs of CSDL documents containing value list mappings for this parameter or property.
       * Using this annotation, the OData service only contains an annotation with the property as target
       * and the term com.sap.vocabularies.Common.v1.ValueListReferences pointing to the metadata of the value list service.
       * The ValueList annotation itself is in the referenced service.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target="sample.TitlesType/OriginalArtist"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListReferences"&gt;
       *             &lt;Collection&gt;
       *                 &lt;String&gt;../i_v4_artistname/$metadata&lt;/String&gt;
       *             &lt;/Collection&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListReferences com.sap.vocabularies.Common.v1.ValueListReferences}</b>
       *   </li>
       * </ul>
       */
      valueListReferences: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListReferences",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * Value list property that is not used to fill the edited entity.
       *
       * <br>
       * <i>Example in OData V4 notation: See example for annotation ValueList</i>
       * <br>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterDisplayOnly com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly}</b>
       *   </li>
       * </ul>
       */
      valueListParameterDisplayOnly: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListParameterDisplayOnly",
        target: ["PropertyPath"],
        since: "1.75"
      },
      /**
       * Value list property that is used to filter the value list with 'eq comparison'.
       *
       * <br>
       * <i>Example in OData V4 notation: See example for annotation ValueList</i>
       * <br>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterIn com.sap.vocabularies.Common.v1.ValueListParameterIn}</b>
       *   </li>
       * </ul>
       */
      valueListParameterIn: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListParameterIn",
        target: ["PropertyPath"],
        since: "1.75"
      },
      /**
       * Value list property that is used to filter the value list with 'startswith comparison' and filled from the picked value list item.
       *
       * <br>
       * <i>Example in OData V4 notation: See example for annotation ValueList</i>
       * <br>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterInOut com.sap.vocabularies.Common.v1.ValueListParameterInOut}</b>
       *   </li>
       * </ul>
       */
      valueListParameterInOut: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListParameterInOut",
        target: ["PropertyPath"],
        since: "1.75"
      },
      /**
       * Value list property that is filled from the response.
       *
       * <br>
       * <i>Example in OData V4 notation: See example for annotation ValueList</i>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterOut com.sap.vocabularies.Common.v1.ValueListParameterOut}</b>
       *   </li>
       * </ul>
       */
      valueListParameterOut: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListParameterOut",
        target: ["PropertyPath"],
        since: "1.75"
      },
      /**
       * If specified as true, there is only one value list mapping and its value list consists of a small number of fixed values.
       * The value list is shown as a dropdown list box rather than an input field. No value help popup is used.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target="sample.Products/priceRange_code"&gt;
       *         &lt;Annotation Term="Common.ValueList"&gt;
       *             &lt;Record Type="Common.ValueListType"&gt;
       *                 &lt;PropertyValue Property="CollectionPath" String="PriceRange" /&gt;
       *                 &lt;PropertyValue Property="Parameters"&gt;
       *                     &lt;Collection&gt;
       *                         &lt;Record Type="Common.ValueListParameterInOut"&gt;
       *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="priceRange_code" /&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="code" /&gt;
       *                         &lt;/Record&gt;
       *                         &lt;Record Type="Common.ValueListParameterDisplayOnly"&gt;
       *                             &lt;PropertyValue Property="ValueListProperty" String="name" /&gt;
       *                         &lt;/Record&gt;
       *                     &lt;/Collection&gt;
       *                 &lt;/PropertyValue&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *         &lt;Annotation Term="Common.ValueListWithFixedValues" Bool="true" /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListWithFixedValues com.sap.vocabularies.Common.v1.ValueListWithFixedValues}</b>
       *   </li>
       * </ul>
       */
      valueListWithFixedValues: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "ValueListWithFixedValues",
        target: ["Property", "Parameter"],
        since: "1.75"
      },
      /**
       * Expresses the importance of a DataField or an annotation, for example.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       *
       * <pre>
       *     &lt;Annotations Target="sample.Person"&gt;
       *         &lt;Annotation Term="com.sap.vocabularies.UI.v1.LineItem"&gt;
       *             &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
       *                 &lt;PropertyValue Property="Label" String="First name" /&gt;
       *                 &lt;PropertyValue Property="Value" String="FirstName" /&gt;
       *                 &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High" /&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Importance com.sap.vocabularies.UI.v1.Importance}</b>
       *   </li>
       * </ul>
       */
      importance: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Importance",
        target: ["Annotation", "Record"],
        since: "1.75"
      },
      /**
       * Defines that the search field in the filter bar is enabled.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.FilterBar#annotations/SearchRestrictions}</i>
       *
       * <pre>
       *     &lt;Annotations Target="service.SalesOrderManage"&gt;
       *         &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
       *             &lt;Record&gt;
       *                 &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
       *             &lt;/Record&gt;
       *         &lt;/Annotation&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions Org.OData.Capabilities.V1.SearchRestrictions}</b>
       *   </li>
       * </ul>
       */
      searchRestrictions: {
        namespace: "Org.OData.Capabilities.V1",
        annotation: "SearchRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      },
      /**
       * Defines that a property is not displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden ProductUUID taken from {@link sap.fe.macros.internal.Field#annotations/Hidden}</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b>
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
       * Defines that a property is not displayed as a filter.
       *
       * <br>
       * <i>Example in OData V4 notation with invisible, filterable property "LocationName", taken from {@link sap.fe.macros.internal.FilterField#annotations/HiddenFilter}</i>
       * <pre>
       *     &lt;Annotations Target=&quot;LocationName&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.HiddenFilter&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HiddenFilter com.sap.vocabularies.UI.v1.HiddenFilter}</b>
       *   </li>
       * </ul>
       */
      hiddenFilter: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "HiddenFilter",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * A short, human-readable text suitable for labels and captions on UIs.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Label&quot; String=&quot;Customer&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Label com.sap.vocabularies.Common.v1.Label}</b>
       *   </li>
       * </ul>
       */
      label: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "Label",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * A descriptive text for values of the annotated property. Value MUST be a dynamic expression when used as metadata annotation.
       * Only the text annotation of the key for the ValueHelp can specify the description.
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;CustomerName&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Text com.sap.vocabularies.Common.v1.Text}</b>
       *   </li>
       * </ul>
       */
      text: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "Text",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * The currency for this monetary amount as an ISO 4217 currency code.
       *
       * <br>
       * <i>Example in OData V4 notation talen from {@link sap.fe.macros.internal.Field#annotations/ISOCurrency}</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.SalesOrderItem/NetAmount&quot;&gt;
       *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.ISOCurrency&quot; Path=&quot;TransactionCurrency&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#ISOCurrency Org.OData.Measures.V1.ISOCurrency}</b>
       *   </li>
       * </ul>
       */
      iSOCurrency: {
        namespace: "Org.OData.Measures.V1",
        annotation: "ISOCurrency",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * The unit of measure for this measured quantity, e.g. cm for centimeters or % for percentages.
       *
       * <br>
       * <i>Example in OData V4 notation taken from {@link sap.fe.macros.internal.Field#annotations/Unit}</i>
       * <pre>
       *     &lt;Annotations Target=&quot;service.SalesOrderItem/RequestedQuantity&quot;&gt;
       *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.Unit&quot; Path=&quot;RequestedQuantityUnit&quot; /&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#Unit Org.OData.Measures.V1.Unit}</b>
       *   </li>
       * </ul>
       */
      unit: {
        namespace: "Org.OData.Measures.V1",
        annotation: "Unit",
        target: ["Property"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/internal/valuehelp/ValueHelp.designtime", [],function(){"use strict";return{annotations:{valueList:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueList",target:["Property","Parameter"],since:"1.75"},valueListMapping:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListMapping",target:["Property","Parameter"],since:"1.75"},valueListReferences:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListReferences",target:["Property","Parameter"],since:"1.75"},valueListParameterDisplayOnly:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListParameterDisplayOnly",target:["PropertyPath"],since:"1.75"},valueListParameterIn:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListParameterIn",target:["PropertyPath"],since:"1.75"},valueListParameterInOut:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListParameterInOut",target:["PropertyPath"],since:"1.75"},valueListParameterOut:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListParameterOut",target:["PropertyPath"],since:"1.75"},valueListWithFixedValues:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListWithFixedValues",target:["Property","Parameter"],since:"1.75"},importance:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Importance",target:["Annotation","Record"],since:"1.75"},searchRestrictions:{namespace:"Org.OData.Capabilities.V1",annotation:"SearchRestrictions",target:["EntitySet"],since:"1.75"},hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property","Record"],since:"1.75"},hiddenFilter:{namespace:"com.sap.vocabularies.UI.v1",annotation:"HiddenFilter",target:["Property"],since:"1.75"},label:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Label",target:["Property"],since:"1.75"},text:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Text",target:["Property"],since:"1.75"},iSOCurrency:{namespace:"Org.OData.Measures.V1",annotation:"ISOCurrency",target:["Property"],since:"1.75"},unit:{namespace:"Org.OData.Measures.V1",annotation:"Unit",target:["Property"],since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/microchart/MicroChart-dbg.designtime", [], function () {
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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/microchart/MicroChart.designtime", [],function(){"use strict";return{annotations:{chart:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Chart",target:["EntityType"],defaultValue:null,since:"1.75"},chartDefinitionType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"ChartDefinitionType",target:["EntityType"],defaultValue:null,since:"1.75"},chartType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"ChartType",target:["Property"],defaultValue:null,since:"1.75"},chartMeasureAttributeType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"ChartMeasureAttributeType",since:"1.75"},dataPoint:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataPoint",target:["EntityType"],defaultValue:null,since:"1.75"},dataPointType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataPointType",target:["EntityType"],defaultValue:null,since:"1.75"},criticalityType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"CriticalityType",target:["Property"],defaultValue:null,since:"1.75"},criticalityCalculationType:{namespace:"com.sap.vocabularies.UI.v1",annotation:"CriticalityCalculationType",target:["Property"],defaultValue:null,since:"1.75"},text:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Text",target:["Property"],defaultValue:null,since:"1.75"},hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property","Record"],since:"1.75"},currencyCode:{namespace:"Org.OData.Measures.V1",annotation:"ISOCurrency",target:["Property"],defaultValue:null,since:"1.75"},unitOfMeasure:{namespace:"Org.OData.Measures.V1",annotation:"Unit",target:["Property"],defaultValue:null,since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/quickView/QuickView-dbg.designtime", [], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Describes the main information of the entity. This annotation is read for the navigation entity of the property, if present.
       * It is displayed in the header of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with HeaderInfo Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *	  &lt;Annotation Term="UI.HeaderInfo"&gt
       *		 &lt;Record Type="UI.HeaderInfoType"&gt
       *			 &lt;PropertyValue Property="Description"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="CustomerName"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="Title"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="Customer"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="TypeName" String="Customer"/&gt
       *			 &lt;PropertyValue Property="TypeNamePlural" String="Customers"/&gt
       *			 &lt;PropertyValue Property="ImageUrl" Path="ImageUrl"/&gt
       *			 &lt;PropertyValue Property="Initials" Path="Initials"/&gt
       *		 &lt;/Record&gt
       *	 &lt;/Annotation&gt
       *	 &lt;/Annotations&gt
       * </pre>
       *
       * <br>
       * <i>HeaderInfo Type properties evaluated by this macro :</i>
       *
       * <ul>
       *   <li>Property <b>Title</b> <br/&gt
       *	   The title to be displayed in the pop up
       *   </li>
       *   <li>Property <b>Description</b><br/>
       *     Will be displayed below the title
       *   </li>
       *   <li>Property <b>ImageUrl</b><br/>
       *     The image in pop up header
       *   </li>
       *   <li>Property <b>Initials</b><br/>
       *     If the image is unavailable, the initials will be displayed
       *   </li>
       * </ul>
       * <br>
       * <i><b><u>Contact Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HeaderInfoType  com.sap.vocabularies.UI.v1.HeaderInfo}
       *   </li>
       * </ul>
       */

      headerInfo: {
        namespace: "com.sap.vocabularies.UI.v1.HeaderInfo",
        annotation: "HeaderInfo",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Describes the facets that may be used for a quick overview of the object
       * It is displayed in the content of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with QuickViewFacets Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="UI.QuickViewFacets"&gt
       *         &lt;Collection&gt
       *             &lt;Record Type="UI.ReferenceFacet"&gt
       *                 &lt;PropertyValue Property="Label" String="Address"/&gt
       *                 &lt;PropertyValue Property="Target" AnnotationPath="@Communication.Contact"/&gt
       *                 &lt;Annotation Term="UI.Hidden" Bool="false"/&gt
       *             &lt;/Record&gt
       *            &lt;Record Type="UI.ReferenceFacet"&gt
       *               &lt;PropertyValue Property="Label" String="Address"/&gt
       *                &lt;PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#SoldToQuickView"/&gt
       *            &lt;/Record&gt
       *         &lt;/Collection&gt
       *     &lt;/Annotation&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>QuickViewFacets Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#QuickViewFacets com.sap.vocabularies.UI.v1.QuickViewFacets}
       *   </li>
       * </ul>
       */
      quickViewFacets: {
        namespace: "com.sap.vocabularies.UI.v1.QuickViewFacets",
        annotation: "QuickViewFacets",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * This tag defines if the entity is represented a natural person and not a product/object entitty
       * It is read to decide the shape of the image in quiview card header - circular if true, otherwise square
       * It is also read to decide the fallback icon of the image : if no image and no initials are available, then a fallback icon will be displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with isNaturalPerson Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="Common.IsNaturalPerson" Bool="true"/&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>IsNaturalPerson Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#IsNaturalPerson com.sap.vocabularies.Common.v1.IsNaturalPerson}
       *   </li>
       * </ul>
       */
      isNaturalPerson: {
        namespace: "com.sap.vocabularies.Common.v1.IsNaturalPerson",
        annotation: "IsNaturalPerson",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines a name of the <code>SemanticObject</code> represented as this entity type or identified by this property and is rendered as a link.
       *
       * <b>Note:</b> Navigation targets are determined using {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} of the unified shell service.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObject annotation</i>
       * <pre>
       *   &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;Product&quot; /&gt;
       *   &lt;/Annotations&gt;
       * </pre>
       */
      semanticObject: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObject",
        target: ["EntitySet", "EntityType", "Property"],
        since: "1.75"
      },
      /**
       * Maps properties of the annotated <code>EntityType</code> or sibling properties of the annotated property to properties of the
       * Semantic Object. This allows "renaming" of properties in the current context to match property names of the Semantic Object, e.g. SenderPartyID to PartyID.
       * Only properties explicitly listed in the mapping are renamed, all other properties are available for intent-based navigation with their "local" name.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObjectMapping on Product/Name</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;SemanticObjectName&quot; /&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectMapping&quot;&gt;
       * 		    &lt;Collection&gt;
       * 			    &lt;Record&gt;
       * 				    &lt;PropertyValue Property=&quot;LocalProperty&quot; PropertyPath=&quot;SupplierId&quot; /&gt;
       * 					&lt;PropertyValue Property=&quot;SemanticObjectProperty&quot; String=&quot;SupplierIdOfSemanticObjectName&quot; /&gt;
       * 				&lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectMapping",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * List of actions that are not available in the current state of the instance of the Semantic Object
       * The actions of this list will not be displayed in the list of links in the quick view cad.
       *
       * <br>
       * <i>XML Example of OData with SemanticObjectUnavailableActions on Product/CustomerId</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/CustomerId&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;CustomerSO&quot; /&gt;
       * 		&lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions&quot;&gt;
       * 			&lt;Collection&gt;
       * 				&lt;String&gt;DeleteCustomer&lt;String/&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectUnavailableActions: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectUnavailableActions",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/quickView/QuickView.designtime", [],function(){"use strict";return{annotations:{headerInfo:{namespace:"com.sap.vocabularies.UI.v1.HeaderInfo",annotation:"HeaderInfo",target:["EntityType"],since:"1.75"},quickViewFacets:{namespace:"com.sap.vocabularies.UI.v1.QuickViewFacets",annotation:"QuickViewFacets",target:["EntityType"],since:"1.75"},isNaturalPerson:{namespace:"com.sap.vocabularies.Common.v1.IsNaturalPerson",annotation:"IsNaturalPerson",target:["EntityType"],since:"1.75"},semanticObject:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObject",target:["EntitySet","EntityType","Property"],since:"1.75"},semanticObjectMapping:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObjectMapping",target:["EntitySet","EntityType","Property"],defaultValue:null,since:"1.75"},semanticObjectUnavailableActions:{namespace:"com.sap.vocabularies.Common.v1",annotation:"SemanticObjectUnavailableActions",target:["EntitySet","EntityType","Property"],defaultValue:null,since:"1.75"}}}},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/valuehelp/ValueHelpFilterBar-dbg.designtime", [], function () {
  "use strict";

  // Provides the Design Time Metadata for the sap.fe.macros.FilterBar macro.
  return {
    annotations: {
      /**
       * Defines a collection of properties that might be relevant for filtering a collection of entities.
       * These properties are rendered as filter fields on the UI.
       *
       * <br>
       * <i>Example in OData V4 notation defining selection fields in the Filter Bar</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="com.sap.vocabularies.UI.v1"&gt;
       *     &lt;Collection&gt;
       *     &lt;PropertyPath&gt;SalesOrder&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SoldToParty&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;OverallSDProcessStatus&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SalesOrderDate&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;ShippingCondition&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;LastChangedDateTime&lt;/PropertyPath&gt;
       *     &lt;/Collection&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#SelectionFields  com.sap.vocabularies.UI.v1.SelectionFields}</b><br/>
       *   </li>
       * </ul>
       */
      selectionFields: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "SelectionFields",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines if the Search Field in the filter bar is enabled.
       * Property "hideBasicSearch" must not be true.
       *
       * <br>
       * <i>Example in OData V4 Search Field in Filter Bar be rendered.</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
       *     &lt;Record&gt;
       *       &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions org.OData.Capabilities.V1.SearchRestrictions}</b><br/>
       *   </li>
       * </ul>
       */
      searchRestrictions: {
        namespace: "org.OData.Capabilities.V1",
        annotation: "SearchRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      }
    }
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/macros/valuehelp/ValueHelpFilterBar.designtime", [],function(){"use strict";return{annotations:{selectionFields:{namespace:"com.sap.vocabularies.UI.v1",annotation:"SelectionFields",target:["EntityType"],since:"1.75"},searchRestrictions:{namespace:"org.OData.Capabilities.V1",annotation:"SearchRestrictions",target:["EntitySet"],since:"1.75"}}}},false);
//# sourceMappingURL=library-preload.designtime.js.map
