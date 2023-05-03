/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/Object", "./NavError"], function (Log, BaseObject, NavError) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.<br> Creates a new instance of a PresentationVariant class. If no parameter is passed, an new empty instance is created whose ID has been set to <code>""</code>. Passing a JSON-serialized string complying to the Selection Variant Specification will parse it, and the newly created instance will contain the same information.
   *
   * @public
   * @name sap.fe.navigation.PresentationVariant
   * @class This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.
   * @extends sap.ui.base.Object
   * @since 1.83.0
   */
  let PresentationVariant = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(PresentationVariant, _BaseObject);
    /**
     * If no parameter is passed, a new empty instance is created whose ID has been set to <code>""</code>.
     * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
     * and the newly created instance will contain the same information.
     *
     * @param presentationVariant If of type <code>string</code>, the selection variant is JSON-formatted;
     * if of type <code>object</code>, the object represents a selection variant
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
     * <tr><td>PresentationVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
     * <tr><td>PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the PresentationVariantID cannot be retrieved</td></tr>
     * <tr><td>PresentationVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
     * </table>
     * These exceptions can only be thrown if the parameter <code>vPresentationVariant</code> has been provided.
     */
    function PresentationVariant(presentationVariant) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.id = "";
      if (presentationVariant !== undefined) {
        if (typeof presentationVariant === "string") {
          _this.parseFromString(presentationVariant);
        } else if (typeof presentationVariant === "object") {
          _this.parseFromObject(presentationVariant);
        } else {
          throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
        }
      }
      return _this;
    }

    /**
     * Returns the identification of the selection variant.
     *
     * @returns The identification of the selection variant as made available during construction
     * @public
     */
    _exports.PresentationVariant = PresentationVariant;
    var _proto = PresentationVariant.prototype;
    _proto.getID = function getID() {
      return this.id;
    }

    /**
     * Sets the identification of the selection variant.
     *
     * @param id The new identification of the selection variant
     * @public
     */;
    _proto.setID = function setID(id) {
      this.id = id;
    }

    /**
     * Sets the text / description of the selection variant.
     *
     * @param newText The new description to be used
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setText = function setText(newText) {
      if (typeof newText !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.text = newText;
    }

    /**
     * Returns the current text / description of this selection variant.
     *
     * @returns The current description of this selection variant.
     * @public
     */;
    _proto.getText = function getText() {
      return this.text;
    }

    /**
     * Sets the context URL.
     *
     * @param url The URL of the context
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setContextUrl = function setContextUrl(url) {
      if (typeof url !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.ctxUrl = url;
    }

    /**
     * Gets the current context URL intended for the query.
     *
     * @returns The current context URL for the query
     * @public
     */;
    _proto.getContextUrl = function getContextUrl() {
      return this.ctxUrl;
    }

    /**
     * Returns <code>true</code> if the presentation variant does not contain any properties.
     * nor ranges.
     *
     * @returns If set to <code>true</code> there are no current properties set; <code>false</code> otherwise.
     * @public
     */;
    _proto.isEmpty = function isEmpty() {
      return Object.keys(this.getTableVisualization() ?? {}).length === 0 && Object.keys(this.getChartVisualization() ?? {}).length === 0 && Object.keys(this.getProperties() ?? {}).length === 0;
    }

    /**
     * Sets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @param properties The properties to be used.
     * @public
     */;
    _proto.setProperties = function setProperties(properties) {
      this.properties = Object.assign({}, properties);
    }

    /**
     * Gets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @returns The current properties.
     * @public
     */;
    _proto.getProperties = function getProperties() {
      return this.properties;
    }

    /**
     * Sets the table visualization property.
     *
     * @param properties An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.setTableVisualization = function setTableVisualization(properties) {
      this.visTable = Object.assign({}, properties);
    }

    /**
     * Gets the table visualization property.
     *
     * @returns An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.getTableVisualization = function getTableVisualization() {
      return this.visTable;
    }

    /**
     * Sets the chart visualization property.
     *
     * @param properties An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.setChartVisualization = function setChartVisualization(properties) {
      this.visChart = Object.assign({}, properties);
    }

    /**
     * Gets the chart visualization property.
     *
     * @returns An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.getChartVisualization = function getChartVisualization() {
      return this.visChart;
    }

    /**
     * Returns the external representation of the selection variant as JSON object.
     *
     * @returns The external representation of this instance as a JSON object
     * @public
     */;
    _proto.toJSONObject = function toJSONObject() {
      const externalPresentationVariant = {
        Version: {
          // Version attributes are not part of the official specification,
          Major: "1",
          // but could be helpful later for implementing a proper lifecycle/interoperability
          Minor: "0",
          Patch: "0"
        },
        PresentationVariantID: this.id
      };
      if (this.ctxUrl) {
        externalPresentationVariant.ContextUrl = this.ctxUrl;
      }
      if (this.text) {
        externalPresentationVariant.Text = this.text;
      } else {
        externalPresentationVariant.Text = "Presentation Variant with ID " + this.id;
      }
      this.serializeProperties(externalPresentationVariant);
      this.serializeVisualizations(externalPresentationVariant);
      return externalPresentationVariant;
    }

    /**
     * Serializes this instance into a JSON-formatted string.
     *
     * @returns The JSON-formatted representation of this instance in stringified format
     * @public
     */;
    _proto.toJSONString = function toJSONString() {
      return JSON.stringify(this.toJSONObject());
    };
    _proto.serializeProperties = function serializeProperties(externalPresentationVariant) {
      if (this.properties) {
        Object.assign(externalPresentationVariant, this.properties);
      }
    };
    _proto.serializeVisualizations = function serializeVisualizations(externalPresentationVariant) {
      if (this.visTable) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visTable);
      }
      if (this.visChart) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visChart);
      }
    };
    _proto.parseFromString = function parseFromString(jsonString) {
      if (jsonString === undefined) {
        throw new NavError("PresentationVariant.UNABLE_TO_PARSE_INPUT");
      }
      if (typeof jsonString !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.parseFromObject(JSON.parse(jsonString));
    };
    _proto.parseFromObject = function parseFromObject(input) {
      if (input.PresentationVariantID === undefined) {
        // Do not throw an error, but only write a warning into the log.
        // The PresentationVariantID is mandatory according to the specification document version 1.0,
        // but this document is not a universally valid standard.
        // It is said that the "implementation of the SmartFilterBar" may supersede the specification.
        // Thus, also allow an initial PresentationVariantID.
        //		throw new sap.fe.navigation.NavError("PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
        Log.warning("PresentationVariantID is not defined");
        input.PresentationVariantID = "";
      }
      const inputCopy = Object.assign({}, input);
      delete inputCopy.Version;
      this.setID(input.PresentationVariantID);
      delete inputCopy.PresentationVariantID;
      if (input.ContextUrl !== undefined && input.ContextUrl !== "") {
        this.setContextUrl(input.ContextUrl);
        delete input.ContextUrl;
      }
      if (input.Text !== undefined) {
        this.setText(input.Text);
        delete input.Text;
      }
      if (input.Visualizations) {
        this.parseVisualizations(input.Visualizations);
        delete inputCopy.Visualizations;
      }
      this.setProperties(inputCopy);
    };
    _proto.parseVisualizations = function parseVisualizations(visualizations) {
      if (!Array.isArray(visualizations)) {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      for (const visualization of visualizations) {
        if (visualization !== null && visualization !== void 0 && visualization.Type && visualization.Type.indexOf("Chart") >= 0) {
          this.setChartVisualization(visualization);
        } else {
          this.setTableVisualization(visualization);
        }
      }
    };
    return PresentationVariant;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.PresentationVariant = PresentationVariant;
  const UI5Class = BaseObject.extend("sap.fe.navigation.PresentationVariant", PresentationVariant.prototype);
  return UI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVzZW50YXRpb25WYXJpYW50IiwicHJlc2VudGF0aW9uVmFyaWFudCIsImlkIiwidW5kZWZpbmVkIiwicGFyc2VGcm9tU3RyaW5nIiwicGFyc2VGcm9tT2JqZWN0IiwiTmF2RXJyb3IiLCJnZXRJRCIsInNldElEIiwic2V0VGV4dCIsIm5ld1RleHQiLCJ0ZXh0IiwiZ2V0VGV4dCIsInNldENvbnRleHRVcmwiLCJ1cmwiLCJjdHhVcmwiLCJnZXRDb250ZXh0VXJsIiwiaXNFbXB0eSIsIk9iamVjdCIsImtleXMiLCJnZXRUYWJsZVZpc3VhbGl6YXRpb24iLCJsZW5ndGgiLCJnZXRDaGFydFZpc3VhbGl6YXRpb24iLCJnZXRQcm9wZXJ0aWVzIiwic2V0UHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJhc3NpZ24iLCJzZXRUYWJsZVZpc3VhbGl6YXRpb24iLCJ2aXNUYWJsZSIsInNldENoYXJ0VmlzdWFsaXphdGlvbiIsInZpc0NoYXJ0IiwidG9KU09OT2JqZWN0IiwiZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50IiwiVmVyc2lvbiIsIk1ham9yIiwiTWlub3IiLCJQYXRjaCIsIlByZXNlbnRhdGlvblZhcmlhbnRJRCIsIkNvbnRleHRVcmwiLCJUZXh0Iiwic2VyaWFsaXplUHJvcGVydGllcyIsInNlcmlhbGl6ZVZpc3VhbGl6YXRpb25zIiwidG9KU09OU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsIlZpc3VhbGl6YXRpb25zIiwicHVzaCIsImpzb25TdHJpbmciLCJwYXJzZSIsImlucHV0IiwiTG9nIiwid2FybmluZyIsImlucHV0Q29weSIsInBhcnNlVmlzdWFsaXphdGlvbnMiLCJ2aXN1YWxpemF0aW9ucyIsIkFycmF5IiwiaXNBcnJheSIsInZpc3VhbGl6YXRpb24iLCJUeXBlIiwiaW5kZXhPZiIsIkJhc2VPYmplY3QiLCJVSTVDbGFzcyIsImV4dGVuZCIsInByb3RvdHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUHJlc2VudGF0aW9uVmFyaWFudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCYXNlT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9PYmplY3RcIjtcbmltcG9ydCBOYXZFcnJvciBmcm9tIFwiLi9OYXZFcnJvclwiO1xuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiBhIHZpc3VhbGl6YXRpb24gb2JqZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpc3VhbGl6YXRpb24ge1xuXHRba2V5OiBzdHJpbmddOiB1bmtub3duO1xuXHRUeXBlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiB0aGUgZXh0ZXJuYWwgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgUHJlc2VudGF0aW9uVmFyaWFudFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCB7XG5cdFtrZXk6IHN0cmluZ106IHVua25vd247XG5cdFByZXNlbnRhdGlvblZhcmlhbnRJRDogc3RyaW5nO1xuXHRWZXJzaW9uPzoge1xuXHRcdE1ham9yOiBzdHJpbmc7XG5cdFx0TWlub3I6IHN0cmluZztcblx0XHRQYXRjaDogc3RyaW5nO1xuXHR9O1xuXHRUZXh0Pzogc3RyaW5nO1xuXHRDb250ZXh0VXJsPzogc3RyaW5nO1xuXHRWaXN1YWxpemF0aW9ucz86IFZpc3VhbGl6YXRpb25bXTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuUHJlc2VudGF0aW9uVmFyaWFudH0uPGJyPiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgUHJlc2VudGF0aW9uVmFyaWFudCBjbGFzcy4gSWYgbm8gcGFyYW1ldGVyIGlzIHBhc3NlZCwgYW4gbmV3IGVtcHR5IGluc3RhbmNlIGlzIGNyZWF0ZWQgd2hvc2UgSUQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPlwiXCI8L2NvZGU+LiBQYXNzaW5nIGEgSlNPTi1zZXJpYWxpemVkIHN0cmluZyBjb21wbHlpbmcgdG8gdGhlIFNlbGVjdGlvbiBWYXJpYW50IFNwZWNpZmljYXRpb24gd2lsbCBwYXJzZSBpdCwgYW5kIHRoZSBuZXdseSBjcmVhdGVkIGluc3RhbmNlIHdpbGwgY29udGFpbiB0aGUgc2FtZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5QcmVzZW50YXRpb25WYXJpYW50XG4gKiBAY2xhc3MgVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLlByZXNlbnRhdGlvblZhcmlhbnR9LlxuICogQGV4dGVuZHMgc2FwLnVpLmJhc2UuT2JqZWN0XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbmV4cG9ydCBjbGFzcyBQcmVzZW50YXRpb25WYXJpYW50IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdHByaXZhdGUgaWQ6IHN0cmluZztcblx0cHJpdmF0ZSB0ZXh0Pzogc3RyaW5nO1xuXHRwcml2YXRlIGN0eFVybD86IHN0cmluZztcblx0cHJpdmF0ZSBwcm9wZXJ0aWVzPzogb2JqZWN0O1xuXHRwcml2YXRlIHZpc1RhYmxlPzogVmlzdWFsaXphdGlvbjtcblx0cHJpdmF0ZSB2aXNDaGFydD86IFZpc3VhbGl6YXRpb247XG5cblx0LyoqXG5cdCAqIElmIG5vIHBhcmFtZXRlciBpcyBwYXNzZWQsIGEgbmV3IGVtcHR5IGluc3RhbmNlIGlzIGNyZWF0ZWQgd2hvc2UgSUQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPlwiXCI8L2NvZGU+LlxuXHQgKiBQYXNzaW5nIGEgSlNPTi1zZXJpYWxpemVkIHN0cmluZyBjb21wbHlpbmcgdG8gdGhlIFNlbGVjdGlvbiBWYXJpYW50IFNwZWNpZmljYXRpb24gd2lsbCBwYXJzZSBpdCxcblx0ICogYW5kIHRoZSBuZXdseSBjcmVhdGVkIGluc3RhbmNlIHdpbGwgY29udGFpbiB0aGUgc2FtZSBpbmZvcm1hdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnQgSWYgb2YgdHlwZSA8Y29kZT5zdHJpbmc8L2NvZGU+LCB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgaXMgSlNPTi1mb3JtYXR0ZWQ7XG5cdCAqIGlmIG9mIHR5cGUgPGNvZGU+b2JqZWN0PC9jb2RlPiwgdGhlIG9iamVjdCByZXByZXNlbnRzIGEgc2VsZWN0aW9uIHZhcmlhbnRcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgZGF0YSBmb3JtYXQgb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50IHByb3ZpZGVkIGlzIGluY29uc2lzdGVudDwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5QcmVzZW50YXRpb25WYXJpYW50LlVOQUJMRV9UT19QQVJTRV9JTlBVVDwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IHRoZSBwcm92aWRlZCBzdHJpbmcgaXMgbm90IGEgSlNPTi1mb3JtYXR0ZWQgc3RyaW5nPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuSU5QVVRfRE9FU19OT1RfQ09OVEFJTl9TRUxFQ1RJT05WQVJJQU5UX0lEPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIFByZXNlbnRhdGlvblZhcmlhbnRJRCBjYW5ub3QgYmUgcmV0cmlldmVkPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuUEFSQU1FVEVSX1dJVEhPVVRfVkFMVUU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGVyZSB3YXMgYW4gYXR0ZW1wdCB0byBzcGVjaWZ5IGEgcGFyYW1ldGVyLCBidXQgd2l0aG91dCBwcm92aWRpbmcgYW55IHZhbHVlIChub3QgZXZlbiBhbiBlbXB0eSB2YWx1ZSk8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5TRUxFQ1RfT1BUSU9OX1dJVEhPVVRfUFJPUEVSVFlfTkFNRTwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IGEgc2VsZWN0aW9uIG9wdGlvbiBoYXMgYmVlbiBkZWZpbmVkLCBidXQgdGhlIFJhbmdlcyBkZWZpbml0aW9uIGlzIG1pc3Npbmc8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5TRUxFQ1RfT1BUSU9OX1JBTkdFU19OT1RfQVJSQVk8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgUmFuZ2VzIGRlZmluaXRpb24gaXMgbm90IGFuIGFycmF5PC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKiBUaGVzZSBleGNlcHRpb25zIGNhbiBvbmx5IGJlIHRocm93biBpZiB0aGUgcGFyYW1ldGVyIDxjb2RlPnZQcmVzZW50YXRpb25WYXJpYW50PC9jb2RlPiBoYXMgYmVlbiBwcm92aWRlZC5cblx0ICovXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihwcmVzZW50YXRpb25WYXJpYW50Pzogc3RyaW5nIHwgb2JqZWN0KSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmlkID0gXCJcIjtcblxuXHRcdGlmIChwcmVzZW50YXRpb25WYXJpYW50ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmICh0eXBlb2YgcHJlc2VudGF0aW9uVmFyaWFudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHR0aGlzLnBhcnNlRnJvbVN0cmluZyhwcmVzZW50YXRpb25WYXJpYW50KTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHByZXNlbnRhdGlvblZhcmlhbnQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0dGhpcy5wYXJzZUZyb21PYmplY3QocHJlc2VudGF0aW9uVmFyaWFudCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgaWRlbnRpZmljYXRpb24gb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgaWRlbnRpZmljYXRpb24gb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFzIG1hZGUgYXZhaWxhYmxlIGR1cmluZyBjb25zdHJ1Y3Rpb25cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cHVibGljIGdldElEKCkge1xuXHRcdHJldHVybiB0aGlzLmlkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBuZXcgaWRlbnRpZmljYXRpb24gb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldElEKGlkOiBzdHJpbmcpIHtcblx0XHR0aGlzLmlkID0gaWQ7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdGV4dCAvIGRlc2NyaXB0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHBhcmFtIG5ld1RleHQgVGhlIG5ldyBkZXNjcmlwdGlvbiB0byBiZSB1c2VkXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdHNldFRleHQobmV3VGV4dD86IHN0cmluZykge1xuXHRcdGlmICh0eXBlb2YgbmV3VGV4dCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdHRoaXMudGV4dCA9IG5ld1RleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCB0ZXh0IC8gZGVzY3JpcHRpb24gb2YgdGhpcyBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgZGVzY3JpcHRpb24gb2YgdGhpcyBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0VGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy50ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGNvbnRleHQgVVJMLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIFRoZSBVUkwgb2YgdGhlIGNvbnRleHRcblx0ICogQHB1YmxpY1xuXHQgKiBAdGhyb3dzIEFuIGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaW4gY2FzZSBvZiBpbnB1dCBlcnJvcnMuIFZhbGlkIGVycm9yIGNvZGVzIGFyZTpcblx0ICogPHRhYmxlPlxuXHQgKiA8dHI+PHRoPk5hdkVycm9yIGNvZGU8L3RoPjx0aD5EZXNjcmlwdGlvbjwvdGg+PC90cj5cblx0ICogPHRyPjx0ZD5QcmVzZW50YXRpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRTwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IGFuIGlucHV0IHBhcmFtZXRlciBoYXMgYW4gaW52YWxpZCB0eXBlPC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKi9cblx0c2V0Q29udGV4dFVybCh1cmw6IHN0cmluZykge1xuXHRcdGlmICh0eXBlb2YgdXJsICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cdFx0dGhpcy5jdHhVcmwgPSB1cmw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgY3VycmVudCBjb250ZXh0IFVSTCBpbnRlbmRlZCBmb3IgdGhlIHF1ZXJ5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb250ZXh0IFVSTCBmb3IgdGhlIHF1ZXJ5XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldENvbnRleHRVcmwoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3R4VXJsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIHByZXNlbnRhdGlvbiB2YXJpYW50IGRvZXMgbm90IGNvbnRhaW4gYW55IHByb3BlcnRpZXMuXG5cdCAqIG5vciByYW5nZXMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIElmIHNldCB0byA8Y29kZT50cnVlPC9jb2RlPiB0aGVyZSBhcmUgbm8gY3VycmVudCBwcm9wZXJ0aWVzIHNldDsgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aXNFbXB0eSgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0T2JqZWN0LmtleXModGhpcy5nZXRUYWJsZVZpc3VhbGl6YXRpb24oKSA/PyB7fSkubGVuZ3RoID09PSAwICYmXG5cdFx0XHRPYmplY3Qua2V5cyh0aGlzLmdldENoYXJ0VmlzdWFsaXphdGlvbigpID8/IHt9KS5sZW5ndGggPT09IDAgJiZcblx0XHRcdE9iamVjdC5rZXlzKHRoaXMuZ2V0UHJvcGVydGllcygpID8/IHt9KS5sZW5ndGggPT09IDBcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1vcmUgdHJpdmlhbCBwcm9wZXJ0aWVzLiBCYXNpY2FsbHkgYWxsIHByb3BlcnRpZXMgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRoZSBWaXN1YWxpemF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBUaGUgcHJvcGVydGllcyB0byBiZSB1c2VkLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXM6IG9iamVjdCkge1xuXHRcdHRoaXMucHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIG1vcmUgdHJpdmlhbCBwcm9wZXJ0aWVzLiBCYXNpY2FsbHkgYWxsIHByb3BlcnRpZXMgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRoZSBWaXN1YWxpemF0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBwcm9wZXJ0aWVzLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRQcm9wZXJ0aWVzKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdGFibGUgdmlzdWFsaXphdGlvbiBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHByb3BlcnRpZXMgdG8gYmUgdXNlZCBmb3IgdGhlIHRhYmxlIHZpc3VhbGl6YXRpb24uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldFRhYmxlVmlzdWFsaXphdGlvbihwcm9wZXJ0aWVzOiBWaXN1YWxpemF0aW9uKSB7XG5cdFx0dGhpcy52aXNUYWJsZSA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHRhYmxlIHZpc3VhbGl6YXRpb24gcHJvcGVydHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgZm9yIHRoZSB0YWJsZSB2aXN1YWxpemF0aW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRUYWJsZVZpc3VhbGl6YXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmlzVGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgY2hhcnQgdmlzdWFsaXphdGlvbiBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHByb3BlcnRpZXMgdG8gYmUgdXNlZCBmb3IgdGhlIGNoYXJ0IHZpc3VhbGl6YXRpb24uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldENoYXJ0VmlzdWFsaXphdGlvbihwcm9wZXJ0aWVzOiBWaXN1YWxpemF0aW9uKSB7XG5cdFx0dGhpcy52aXNDaGFydCA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGNoYXJ0IHZpc3VhbGl6YXRpb24gcHJvcGVydHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgZm9yIHRoZSBjaGFydCB2aXN1YWxpemF0aW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRDaGFydFZpc3VhbGl6YXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmlzQ2hhcnQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZXh0ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFzIEpTT04gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgZXh0ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBpbnN0YW5jZSBhcyBhIEpTT04gb2JqZWN0XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRvSlNPTk9iamVjdCgpIHtcblx0XHRjb25zdCBleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQ6IEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCA9IHtcblx0XHRcdFZlcnNpb246IHtcblx0XHRcdFx0Ly8gVmVyc2lvbiBhdHRyaWJ1dGVzIGFyZSBub3QgcGFydCBvZiB0aGUgb2ZmaWNpYWwgc3BlY2lmaWNhdGlvbixcblx0XHRcdFx0TWFqb3I6IFwiMVwiLCAvLyBidXQgY291bGQgYmUgaGVscGZ1bCBsYXRlciBmb3IgaW1wbGVtZW50aW5nIGEgcHJvcGVyIGxpZmVjeWNsZS9pbnRlcm9wZXJhYmlsaXR5XG5cdFx0XHRcdE1pbm9yOiBcIjBcIixcblx0XHRcdFx0UGF0Y2g6IFwiMFwiXG5cdFx0XHR9LFxuXHRcdFx0UHJlc2VudGF0aW9uVmFyaWFudElEOiB0aGlzLmlkXG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLmN0eFVybCkge1xuXHRcdFx0ZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LkNvbnRleHRVcmwgPSB0aGlzLmN0eFVybDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy50ZXh0KSB7XG5cdFx0XHRleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVGV4dCA9IHRoaXMudGV4dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LlRleHQgPSBcIlByZXNlbnRhdGlvbiBWYXJpYW50IHdpdGggSUQgXCIgKyB0aGlzLmlkO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VyaWFsaXplUHJvcGVydGllcyhleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQpO1xuXHRcdHRoaXMuc2VyaWFsaXplVmlzdWFsaXphdGlvbnMoZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50KTtcblxuXHRcdHJldHVybiBleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdH1cblxuXHQvKipcblx0ICogU2VyaWFsaXplcyB0aGlzIGluc3RhbmNlIGludG8gYSBKU09OLWZvcm1hdHRlZCBzdHJpbmcuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBKU09OLWZvcm1hdHRlZCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIGluc3RhbmNlIGluIHN0cmluZ2lmaWVkIGZvcm1hdFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0b0pTT05TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudG9KU09OT2JqZWN0KCkpO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXJpYWxpemVQcm9wZXJ0aWVzKGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudDogRXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcGVydGllcykge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQsIHRoaXMucHJvcGVydGllcyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBzZXJpYWxpemVWaXN1YWxpemF0aW9ucyhleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQ6IEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdGlmICh0aGlzLnZpc1RhYmxlKSB7XG5cdFx0XHRpZiAoIWV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5WaXN1YWxpemF0aW9ucykge1xuXHRcdFx0XHRleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMgPSBbXTtcblx0XHRcdH1cblx0XHRcdGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5WaXN1YWxpemF0aW9ucy5wdXNoKHRoaXMudmlzVGFibGUpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnZpc0NoYXJ0KSB7XG5cdFx0XHRpZiAoIWV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5WaXN1YWxpemF0aW9ucykge1xuXHRcdFx0XHRleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMgPSBbXTtcblx0XHRcdH1cblx0XHRcdGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5WaXN1YWxpemF0aW9ucy5wdXNoKHRoaXMudmlzQ2hhcnQpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcGFyc2VGcm9tU3RyaW5nKGpzb25TdHJpbmc/OiBzdHJpbmcpIHtcblx0XHRpZiAoanNvblN0cmluZyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LlVOQUJMRV9UT19QQVJTRV9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGpzb25TdHJpbmcgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblxuXHRcdHRoaXMucGFyc2VGcm9tT2JqZWN0KEpTT04ucGFyc2UoanNvblN0cmluZykpO1xuXHR9XG5cblx0cHJpdmF0ZSBwYXJzZUZyb21PYmplY3QoaW5wdXQ6IFBhcnRpYWw8RXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50Pikge1xuXHRcdGlmIChpbnB1dC5QcmVzZW50YXRpb25WYXJpYW50SUQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gRG8gbm90IHRocm93IGFuIGVycm9yLCBidXQgb25seSB3cml0ZSBhIHdhcm5pbmcgaW50byB0aGUgbG9nLlxuXHRcdFx0Ly8gVGhlIFByZXNlbnRhdGlvblZhcmlhbnRJRCBpcyBtYW5kYXRvcnkgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpY2F0aW9uIGRvY3VtZW50IHZlcnNpb24gMS4wLFxuXHRcdFx0Ly8gYnV0IHRoaXMgZG9jdW1lbnQgaXMgbm90IGEgdW5pdmVyc2FsbHkgdmFsaWQgc3RhbmRhcmQuXG5cdFx0XHQvLyBJdCBpcyBzYWlkIHRoYXQgdGhlIFwiaW1wbGVtZW50YXRpb24gb2YgdGhlIFNtYXJ0RmlsdGVyQmFyXCIgbWF5IHN1cGVyc2VkZSB0aGUgc3BlY2lmaWNhdGlvbi5cblx0XHRcdC8vIFRodXMsIGFsc28gYWxsb3cgYW4gaW5pdGlhbCBQcmVzZW50YXRpb25WYXJpYW50SUQuXG5cdFx0XHQvL1x0XHR0aHJvdyBuZXcgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LklOUFVUX0RPRVNfTk9UX0NPTlRBSU5fU0VMRUNUSU9OVkFSSUFOVF9JRFwiKTtcblx0XHRcdExvZy53YXJuaW5nKFwiUHJlc2VudGF0aW9uVmFyaWFudElEIGlzIG5vdCBkZWZpbmVkXCIpO1xuXHRcdFx0aW5wdXQuUHJlc2VudGF0aW9uVmFyaWFudElEID0gXCJcIjtcblx0XHR9XG5cblx0XHRjb25zdCBpbnB1dENvcHkgPSBPYmplY3QuYXNzaWduKHt9LCBpbnB1dCk7XG5cdFx0ZGVsZXRlIGlucHV0Q29weS5WZXJzaW9uO1xuXG5cdFx0dGhpcy5zZXRJRChpbnB1dC5QcmVzZW50YXRpb25WYXJpYW50SUQpO1xuXHRcdGRlbGV0ZSBpbnB1dENvcHkuUHJlc2VudGF0aW9uVmFyaWFudElEO1xuXG5cdFx0aWYgKGlucHV0LkNvbnRleHRVcmwgIT09IHVuZGVmaW5lZCAmJiBpbnB1dC5Db250ZXh0VXJsICE9PSBcIlwiKSB7XG5cdFx0XHR0aGlzLnNldENvbnRleHRVcmwoaW5wdXQuQ29udGV4dFVybCk7XG5cdFx0XHRkZWxldGUgaW5wdXQuQ29udGV4dFVybDtcblx0XHR9XG5cblx0XHRpZiAoaW5wdXQuVGV4dCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFRleHQoaW5wdXQuVGV4dCk7XG5cdFx0XHRkZWxldGUgaW5wdXQuVGV4dDtcblx0XHR9XG5cblx0XHRpZiAoaW5wdXQuVmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdHRoaXMucGFyc2VWaXN1YWxpemF0aW9ucyhpbnB1dC5WaXN1YWxpemF0aW9ucyk7XG5cdFx0XHRkZWxldGUgaW5wdXRDb3B5LlZpc3VhbGl6YXRpb25zO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0UHJvcGVydGllcyhpbnB1dENvcHkpO1xuXHR9XG5cblx0cHJpdmF0ZSBwYXJzZVZpc3VhbGl6YXRpb25zKHZpc3VhbGl6YXRpb25zOiBWaXN1YWxpemF0aW9uW10pIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmlzdWFsaXphdGlvbnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IHZpc3VhbGl6YXRpb24gb2YgdmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdGlmICh2aXN1YWxpemF0aW9uPy5UeXBlICYmIHZpc3VhbGl6YXRpb24uVHlwZS5pbmRleE9mKFwiQ2hhcnRcIikgPj0gMCkge1xuXHRcdFx0XHR0aGlzLnNldENoYXJ0VmlzdWFsaXphdGlvbih2aXN1YWxpemF0aW9uKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2V0VGFibGVWaXN1YWxpemF0aW9uKHZpc3VhbGl6YXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vLyBFeHBvcnRpbmcgdGhlIGNsYXNzIGFzIHByb3Blcmx5IHR5cGVkIFVJNUNsYXNzXG5jb25zdCBVSTVDbGFzcyA9IEJhc2VPYmplY3QuZXh0ZW5kKFxuXHRcInNhcC5mZS5uYXZpZ2F0aW9uLlByZXNlbnRhdGlvblZhcmlhbnRcIixcblx0UHJlc2VudGF0aW9uVmFyaWFudC5wcm90b3R5cGUgYXMgYW55XG4pIGFzIHR5cGVvZiBQcmVzZW50YXRpb25WYXJpYW50O1xudHlwZSBVSTVDbGFzcyA9IEluc3RhbmNlVHlwZTx0eXBlb2YgUHJlc2VudGF0aW9uVmFyaWFudD47XG5leHBvcnQgZGVmYXVsdCBVSTVDbGFzcztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQTRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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