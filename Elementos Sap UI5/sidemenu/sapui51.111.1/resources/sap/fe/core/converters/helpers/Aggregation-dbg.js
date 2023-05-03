/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ModelHelper"], function (ModelHelper) {
  "use strict";

  var _exports = {};
  /**
   * helper class for Aggregation annotations.
   */
  let AggregationHelper = /*#__PURE__*/function () {
    /**
     * Creates a helper for a specific entity type and a converter context.
     *
     * @param entityType The EntityType
     * @param converterContext The ConverterContext
     */
    function AggregationHelper(entityType, converterContext) {
      var _this$_oAggregationAn, _this$_oAggregationAn4, _this$_oAggregationAn7, _this$oTargetAggregat;
      this._entityType = entityType;
      this._converterContext = converterContext;
      this._oAggregationAnnotationTarget = this._determineAggregationAnnotationTarget();
      if (((_this$_oAggregationAn = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn === void 0 ? void 0 : _this$_oAggregationAn._type) === "NavigationProperty") {
        var _this$_oAggregationAn2, _this$_oAggregationAn3;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn2 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn2 === void 0 ? void 0 : (_this$_oAggregationAn3 = _this$_oAggregationAn2.annotations) === null || _this$_oAggregationAn3 === void 0 ? void 0 : _this$_oAggregationAn3.Aggregation;
      } else if (((_this$_oAggregationAn4 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn4 === void 0 ? void 0 : _this$_oAggregationAn4._type) === "EntityType") {
        var _this$_oAggregationAn5, _this$_oAggregationAn6;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn5 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn5 === void 0 ? void 0 : (_this$_oAggregationAn6 = _this$_oAggregationAn5.annotations) === null || _this$_oAggregationAn6 === void 0 ? void 0 : _this$_oAggregationAn6.Aggregation;
      } else if (((_this$_oAggregationAn7 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn7 === void 0 ? void 0 : _this$_oAggregationAn7._type) === "EntitySet") {
        var _this$_oAggregationAn8, _this$_oAggregationAn9;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn8 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn8 === void 0 ? void 0 : (_this$_oAggregationAn9 = _this$_oAggregationAn8.annotations) === null || _this$_oAggregationAn9 === void 0 ? void 0 : _this$_oAggregationAn9.Aggregation;
      }
      this._bApplySupported = (_this$oTargetAggregat = this.oTargetAggregationAnnotations) !== null && _this$oTargetAggregat !== void 0 && _this$oTargetAggregat.ApplySupported ? true : false;
      if (this._bApplySupported) {
        var _this$oTargetAggregat2, _this$oTargetAggregat3, _this$oTargetAggregat4, _this$oTargetAggregat5;
        this._aGroupableProperties = (_this$oTargetAggregat2 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat2 === void 0 ? void 0 : (_this$oTargetAggregat3 = _this$oTargetAggregat2.ApplySupported) === null || _this$oTargetAggregat3 === void 0 ? void 0 : _this$oTargetAggregat3.GroupableProperties;
        this._aAggregatableProperties = (_this$oTargetAggregat4 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat4 === void 0 ? void 0 : (_this$oTargetAggregat5 = _this$oTargetAggregat4.ApplySupported) === null || _this$oTargetAggregat5 === void 0 ? void 0 : _this$oTargetAggregat5.AggregatableProperties;
        this.oContainerAggregationAnnotation = converterContext.getEntityContainer().annotations.Aggregation;
      }
    }
    /**
     * Determines the most appropriate target for the aggregation annotations.
     *
     * @returns  EntityType, EntitySet or NavigationProperty where aggregation annotations should be read from.
     */
    _exports.AggregationHelper = AggregationHelper;
    var _proto = AggregationHelper.prototype;
    _proto._determineAggregationAnnotationTarget = function _determineAggregationAnnotationTarget() {
      var _this$_converterConte, _this$_converterConte2, _this$_converterConte3, _this$_converterConte4, _this$_converterConte5;
      const bIsParameterized = (_this$_converterConte = this._converterContext.getDataModelObjectPath()) !== null && _this$_converterConte !== void 0 && (_this$_converterConte2 = _this$_converterConte.targetEntitySet) !== null && _this$_converterConte2 !== void 0 && (_this$_converterConte3 = _this$_converterConte2.entityType) !== null && _this$_converterConte3 !== void 0 && (_this$_converterConte4 = _this$_converterConte3.annotations) !== null && _this$_converterConte4 !== void 0 && (_this$_converterConte5 = _this$_converterConte4.Common) !== null && _this$_converterConte5 !== void 0 && _this$_converterConte5.ResultContext ? true : false;
      let oAggregationAnnotationSource;

      // find ApplySupported
      if (bIsParameterized) {
        var _oNavigationPropertyO, _oNavigationPropertyO2, _oEntityTypeObject$an, _oEntityTypeObject$an2;
        // if this is a parameterized view then applysupported can be found at either the navProp pointing to the result set or entityType.
        // If applySupported is present at both the navProp and the entityType then navProp is more specific so take annotations from there
        // targetObject in the converter context for a parameterized view is the navigation property pointing to th result set
        const oDataModelObjectPath = this._converterContext.getDataModelObjectPath();
        const oNavigationPropertyObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetObject;
        const oEntityTypeObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetEntityType;
        if (oNavigationPropertyObject !== null && oNavigationPropertyObject !== void 0 && (_oNavigationPropertyO = oNavigationPropertyObject.annotations) !== null && _oNavigationPropertyO !== void 0 && (_oNavigationPropertyO2 = _oNavigationPropertyO.Aggregation) !== null && _oNavigationPropertyO2 !== void 0 && _oNavigationPropertyO2.ApplySupported) {
          oAggregationAnnotationSource = oNavigationPropertyObject;
        } else if (oEntityTypeObject !== null && oEntityTypeObject !== void 0 && (_oEntityTypeObject$an = oEntityTypeObject.annotations) !== null && _oEntityTypeObject$an !== void 0 && (_oEntityTypeObject$an2 = _oEntityTypeObject$an.Aggregation) !== null && _oEntityTypeObject$an2 !== void 0 && _oEntityTypeObject$an2.ApplySupported) {
          oAggregationAnnotationSource = oEntityTypeObject;
        }
      } else {
        var _annotations, _annotations$Aggregat;
        // For the time being, we ignore annotations at the container level, until the vocabulary is stabilized
        const oEntitySetObject = this._converterContext.getEntitySet();
        if (!ModelHelper.isSingleton(oEntitySetObject) && oEntitySetObject !== null && oEntitySetObject !== void 0 && (_annotations = oEntitySetObject.annotations) !== null && _annotations !== void 0 && (_annotations$Aggregat = _annotations.Aggregation) !== null && _annotations$Aggregat !== void 0 && _annotations$Aggregat.ApplySupported) {
          oAggregationAnnotationSource = oEntitySetObject;
        } else {
          oAggregationAnnotationSource = this._converterContext.getEntityType();
        }
      }
      return oAggregationAnnotationSource;
    }

    /**
     * Checks if the entity supports analytical queries.
     *
     * @returns `true` if analytical queries are supported, false otherwise.
     */;
    _proto.isAnalyticsSupported = function isAnalyticsSupported() {
      return this._bApplySupported;
    }

    /**
     * Checks if a property is groupable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyGroupable = function isPropertyGroupable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else if (!this._aGroupableProperties || this._aGroupableProperties.length === 0) {
        // No groupableProperties --> all properties are groupable
        return true;
      } else {
        return this._aGroupableProperties.findIndex(path => path.$target.fullyQualifiedName === property.fullyQualifiedName) >= 0;
      }
    }

    /**
     * Checks if a property is aggregatable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyAggregatable = function isPropertyAggregatable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else {
        // Get the custom aggregates
        const aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);

        // Check if a custom aggregate has a qualifier that corresponds to the property name
        return aCustomAggregateAnnotations.some(annotation => {
          return property.name === annotation.qualifier;
        });
      }
    };
    _proto.getGroupableProperties = function getGroupableProperties() {
      return this._aGroupableProperties;
    };
    _proto.getAggregatableProperties = function getAggregatableProperties() {
      return this._aAggregatableProperties;
    };
    _proto.getEntityType = function getEntityType() {
      return this._entityType;
    }

    /**
     * Returns AggregatedProperties or AggregatedProperty based on param Term.
     * The Term here indicates if the AggregatedProperty should be retrieved or the deprecated AggregatedProperties.
     *
     * @param Term The Annotation Term
     * @returns Annotations The appropriate annotations based on the given Term.
     */;
    _proto.getAggregatedProperties = function getAggregatedProperties(Term) {
      if (Term === "AggregatedProperties") {
        return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperties", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
      }
      return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperty", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
    }
    // retirve all transformation aggregates by prioritizing AggregatedProperty over AggregatedProperties objects
    ;
    _proto.getTransAggregations = function getTransAggregations() {
      var _aAggregatedPropertyO;
      let aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperty");
      if (!aAggregatedPropertyObjects || aAggregatedPropertyObjects.length === 0) {
        aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperties")[0];
      }
      return (_aAggregatedPropertyO = aAggregatedPropertyObjects) === null || _aAggregatedPropertyO === void 0 ? void 0 : _aAggregatedPropertyO.filter(aggregatedProperty => {
        if (this._getAggregatableAggregates(aggregatedProperty.AggregatableProperty)) {
          return aggregatedProperty;
        }
      });
    }

    /**
     * Check if each transformation is aggregatable.
     *
     * @param property The property to check
     * @returns 'aggregatedProperty'
     */;
    _proto._getAggregatableAggregates = function _getAggregatableAggregates(property) {
      const aAggregatableProperties = this.getAggregatableProperties() || [];
      return aAggregatableProperties.find(function (obj) {
        return obj.Property.value === (property.qualifier ? property.qualifier : property.$target.name);
      });
    }

    /**
     * Returns the list of custom aggregate definitions for the entity type.
     *
     * @returns A map (propertyName --> array of context-defining property names) for each custom aggregate corresponding to a property. The array of
     * context-defining property names is empty if the custom aggregate doesn't have any context-defining property.
     */;
    _proto.getCustomAggregateDefinitions = function getCustomAggregateDefinitions() {
      // Get the custom aggregates
      const aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);
      return aCustomAggregateAnnotations;
    }

    /**
     * Returns the list of allowed transformations in the $apply.
     * First look at the current EntitySet, then look at the default values provided at the container level.
     *
     * @returns The list of transformations, or undefined if no list is found
     */;
    _proto.getAllowedTransformations = function getAllowedTransformations() {
      var _this$oTargetAggregat6, _this$oTargetAggregat7, _this$oContainerAggre, _this$oContainerAggre2;
      return ((_this$oTargetAggregat6 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat6 === void 0 ? void 0 : (_this$oTargetAggregat7 = _this$oTargetAggregat6.ApplySupported) === null || _this$oTargetAggregat7 === void 0 ? void 0 : _this$oTargetAggregat7.Transformations) || ((_this$oContainerAggre = this.oContainerAggregationAnnotation) === null || _this$oContainerAggre === void 0 ? void 0 : (_this$oContainerAggre2 = _this$oContainerAggre.ApplySupportedDefaults) === null || _this$oContainerAggre2 === void 0 ? void 0 : _this$oContainerAggre2.Transformations);
    };
    return AggregationHelper;
  }();
  _exports.AggregationHelper = AggregationHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZ2dyZWdhdGlvbkhlbHBlciIsImVudGl0eVR5cGUiLCJjb252ZXJ0ZXJDb250ZXh0IiwiX2VudGl0eVR5cGUiLCJfY29udmVydGVyQ29udGV4dCIsIl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0IiwiX2RldGVybWluZUFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCIsIl90eXBlIiwib1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiX2JBcHBseVN1cHBvcnRlZCIsIkFwcGx5U3VwcG9ydGVkIiwiX2FHcm91cGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsIl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJvQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uIiwiZ2V0RW50aXR5Q29udGFpbmVyIiwiYklzUGFyYW1ldGVyaXplZCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0YXJnZXRFbnRpdHlTZXQiLCJDb21tb24iLCJSZXN1bHRDb250ZXh0Iiwib0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSIsIm9EYXRhTW9kZWxPYmplY3RQYXRoIiwib05hdmlnYXRpb25Qcm9wZXJ0eU9iamVjdCIsInRhcmdldE9iamVjdCIsIm9FbnRpdHlUeXBlT2JqZWN0IiwidGFyZ2V0RW50aXR5VHlwZSIsIm9FbnRpdHlTZXRPYmplY3QiLCJnZXRFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImlzU2luZ2xldG9uIiwiZ2V0RW50aXR5VHlwZSIsImlzQW5hbHl0aWNzU3VwcG9ydGVkIiwiaXNQcm9wZXJ0eUdyb3VwYWJsZSIsInByb3BlcnR5IiwidW5kZWZpbmVkIiwibGVuZ3RoIiwiZmluZEluZGV4IiwicGF0aCIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJpc1Byb3BlcnR5QWdncmVnYXRhYmxlIiwiYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zIiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJzb21lIiwiYW5ub3RhdGlvbiIsIm5hbWUiLCJxdWFsaWZpZXIiLCJnZXRHcm91cGFibGVQcm9wZXJ0aWVzIiwiZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcyIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwiVGVybSIsImdldFRyYW5zQWdncmVnYXRpb25zIiwiYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMiLCJmaWx0ZXIiLCJhZ2dyZWdhdGVkUHJvcGVydHkiLCJfZ2V0QWdncmVnYXRhYmxlQWdncmVnYXRlcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJmaW5kIiwib2JqIiwiUHJvcGVydHkiLCJ2YWx1ZSIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsIlRyYW5zZm9ybWF0aW9ucyIsIkFwcGx5U3VwcG9ydGVkRGVmYXVsdHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFnZ3JlZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblRlcm0sIEVudGl0eVNldCwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSwgUHJvcGVydHlQYXRoIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSwgQXBwbHlTdXBwb3J0ZWRUeXBlLCBDdXN0b21BZ2dyZWdhdGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkFubm90YXRpb25zX0FnZ3JlZ2F0aW9uLFxuXHRFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbixcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQWdncmVnYXRpb24sXG5cdEVudGl0eVR5cGVBbm5vdGF0aW9uc19BZ2dyZWdhdGlvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9BbmFseXRpY3NcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuXG4vKipcbiAqIGhlbHBlciBjbGFzcyBmb3IgQWdncmVnYXRpb24gYW5ub3RhdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBZ2dyZWdhdGlvbkhlbHBlciB7XG5cdF9lbnRpdHlUeXBlOiBFbnRpdHlUeXBlO1xuXHRfY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dDtcblx0X2JBcHBseVN1cHBvcnRlZDogYm9vbGVhbjtcblx0X2FHcm91cGFibGVQcm9wZXJ0aWVzPzogUHJvcGVydHlQYXRoW107XG5cdF9hQWdncmVnYXRhYmxlUHJvcGVydGllcz87XG5cdF9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0OiBFbnRpdHlUeXBlIHwgRW50aXR5U2V0IHwgTmF2aWdhdGlvblByb3BlcnR5O1xuXHRvVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucz86XG5cdFx0fCBDb2xsZWN0aW9uQW5ub3RhdGlvbnNfQWdncmVnYXRpb25cblx0XHR8IEVudGl0eVR5cGVBbm5vdGF0aW9uc19BZ2dyZWdhdGlvblxuXHRcdHwgRW50aXR5U2V0QW5ub3RhdGlvbnNfQWdncmVnYXRpb247XG5cblx0b0NvbnRhaW5lckFnZ3JlZ2F0aW9uQW5ub3RhdGlvbj86IEVudGl0eUNvbnRhaW5lckFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgaGVscGVyIGZvciBhIHNwZWNpZmljIGVudGl0eSB0eXBlIGFuZCBhIGNvbnZlcnRlciBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgRW50aXR5VHlwZVxuXHQgKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgQ29udmVydGVyQ29udGV4dFxuXHQgKi9cblx0Y29uc3RydWN0b3IoZW50aXR5VHlwZTogRW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRcdHRoaXMuX2VudGl0eVR5cGUgPSBlbnRpdHlUeXBlO1xuXHRcdHRoaXMuX2NvbnZlcnRlckNvbnRleHQgPSBjb252ZXJ0ZXJDb250ZXh0O1xuXG5cdFx0dGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCA9IHRoaXMuX2RldGVybWluZUFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCgpO1xuXHRcdGlmICh0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0Py5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0dGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucyA9IHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQ/LmFubm90YXRpb25zXG5cdFx0XHRcdD8uQWdncmVnYXRpb24gYXMgQ29sbGVjdGlvbkFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldD8uX3R5cGUgPT09IFwiRW50aXR5VHlwZVwiKSB7XG5cdFx0XHR0aGlzLm9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zID0gdGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldD8uYW5ub3RhdGlvbnNcblx0XHRcdFx0Py5BZ2dyZWdhdGlvbiBhcyBFbnRpdHlUeXBlQW5ub3RhdGlvbnNfQWdncmVnYXRpb247XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0Py5fdHlwZSA9PT0gXCJFbnRpdHlTZXRcIikge1xuXHRcdFx0dGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucyA9IHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQ/LmFubm90YXRpb25zXG5cdFx0XHRcdD8uQWdncmVnYXRpb24gYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfQWdncmVnYXRpb247XG5cdFx0fVxuXHRcdHRoaXMuX2JBcHBseVN1cHBvcnRlZCA9IHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/LkFwcGx5U3VwcG9ydGVkID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdFx0aWYgKHRoaXMuX2JBcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0dGhpcy5fYUdyb3VwYWJsZVByb3BlcnRpZXMgPSB0aGlzLm9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zPy5BcHBseVN1cHBvcnRlZD8uR3JvdXBhYmxlUHJvcGVydGllcyBhcyBQcm9wZXJ0eVBhdGhbXTtcblx0XHRcdHRoaXMuX2FBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gdGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucz8uQXBwbHlTdXBwb3J0ZWQ/LkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM7XG5cblx0XHRcdHRoaXMub0NvbnRhaW5lckFnZ3JlZ2F0aW9uQW5ub3RhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCkuYW5ub3RhdGlvbnNcblx0XHRcdFx0LkFnZ3JlZ2F0aW9uIGFzIEVudGl0eUNvbnRhaW5lckFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgbW9zdCBhcHByb3ByaWF0ZSB0YXJnZXQgZm9yIHRoZSBhZ2dyZWdhdGlvbiBhbm5vdGF0aW9ucy5cblx0ICpcblx0ICogQHJldHVybnMgIEVudGl0eVR5cGUsIEVudGl0eVNldCBvciBOYXZpZ2F0aW9uUHJvcGVydHkgd2hlcmUgYWdncmVnYXRpb24gYW5ub3RhdGlvbnMgc2hvdWxkIGJlIHJlYWQgZnJvbS5cblx0ICovXG5cdHByaXZhdGUgX2RldGVybWluZUFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCgpOiBFbnRpdHlUeXBlIHwgRW50aXR5U2V0IHwgTmF2aWdhdGlvblByb3BlcnR5IHtcblx0XHRjb25zdCBiSXNQYXJhbWV0ZXJpemVkID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk/LnRhcmdldEVudGl0eVNldD8uZW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LkNvbW1vblxuXHRcdFx0Py5SZXN1bHRDb250ZXh0XG5cdFx0XHQ/IHRydWVcblx0XHRcdDogZmFsc2U7XG5cdFx0bGV0IG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2U7XG5cblx0XHQvLyBmaW5kIEFwcGx5U3VwcG9ydGVkXG5cdFx0aWYgKGJJc1BhcmFtZXRlcml6ZWQpIHtcblx0XHRcdC8vIGlmIHRoaXMgaXMgYSBwYXJhbWV0ZXJpemVkIHZpZXcgdGhlbiBhcHBseXN1cHBvcnRlZCBjYW4gYmUgZm91bmQgYXQgZWl0aGVyIHRoZSBuYXZQcm9wIHBvaW50aW5nIHRvIHRoZSByZXN1bHQgc2V0IG9yIGVudGl0eVR5cGUuXG5cdFx0XHQvLyBJZiBhcHBseVN1cHBvcnRlZCBpcyBwcmVzZW50IGF0IGJvdGggdGhlIG5hdlByb3AgYW5kIHRoZSBlbnRpdHlUeXBlIHRoZW4gbmF2UHJvcCBpcyBtb3JlIHNwZWNpZmljIHNvIHRha2UgYW5ub3RhdGlvbnMgZnJvbSB0aGVyZVxuXHRcdFx0Ly8gdGFyZ2V0T2JqZWN0IGluIHRoZSBjb252ZXJ0ZXIgY29udGV4dCBmb3IgYSBwYXJhbWV0ZXJpemVkIHZpZXcgaXMgdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgcG9pbnRpbmcgdG8gdGggcmVzdWx0IHNldFxuXHRcdFx0Y29uc3Qgb0RhdGFNb2RlbE9iamVjdFBhdGggPSB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0XHRcdGNvbnN0IG9OYXZpZ2F0aW9uUHJvcGVydHlPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aD8udGFyZ2V0T2JqZWN0O1xuXHRcdFx0Y29uc3Qgb0VudGl0eVR5cGVPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aD8udGFyZ2V0RW50aXR5VHlwZTtcblx0XHRcdGlmIChvTmF2aWdhdGlvblByb3BlcnR5T2JqZWN0Py5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkFwcGx5U3VwcG9ydGVkKSB7XG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2UgPSBvTmF2aWdhdGlvblByb3BlcnR5T2JqZWN0O1xuXHRcdFx0fSBlbHNlIGlmIChvRW50aXR5VHlwZU9iamVjdD8uYW5ub3RhdGlvbnM/LkFnZ3JlZ2F0aW9uPy5BcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0XHRvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlID0gb0VudGl0eVR5cGVPYmplY3Q7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEZvciB0aGUgdGltZSBiZWluZywgd2UgaWdub3JlIGFubm90YXRpb25zIGF0IHRoZSBjb250YWluZXIgbGV2ZWwsIHVudGlsIHRoZSB2b2NhYnVsYXJ5IGlzIHN0YWJpbGl6ZWRcblx0XHRcdGNvbnN0IG9FbnRpdHlTZXRPYmplY3QgPSB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRcdFx0aWYgKCFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihvRW50aXR5U2V0T2JqZWN0KSAmJiAob0VudGl0eVNldE9iamVjdCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkFwcGx5U3VwcG9ydGVkKSB7XG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2UgPSBvRW50aXR5U2V0T2JqZWN0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGVudGl0eSBzdXBwb3J0cyBhbmFseXRpY2FsIHF1ZXJpZXMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiBhbmFseXRpY2FsIHF1ZXJpZXMgYXJlIHN1cHBvcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKi9cblx0cHVibGljIGlzQW5hbHl0aWNzU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9iQXBwbHlTdXBwb3J0ZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgcHJvcGVydHkgaXMgZ3JvdXBhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIGB1bmRlZmluZWRgIGlmIHRoZSBlbnRpdHkgZG9lc24ndCBzdXBwb3J0IGFuYWx5dGljYWwgcXVlcmllcywgdHJ1ZSBvciBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdHB1YmxpYyBpc1Byb3BlcnR5R3JvdXBhYmxlKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5fYkFwcGx5U3VwcG9ydGVkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAoIXRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzIHx8IHRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gTm8gZ3JvdXBhYmxlUHJvcGVydGllcyAtLT4gYWxsIHByb3BlcnRpZXMgYXJlIGdyb3VwYWJsZVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9hR3JvdXBhYmxlUHJvcGVydGllcy5maW5kSW5kZXgoKHBhdGgpID0+IHBhdGguJHRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUgPT09IHByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZSkgPj0gMDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgcHJvcGVydHkgaXMgYWdncmVnYXRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIGB1bmRlZmluZWRgIGlmIHRoZSBlbnRpdHkgZG9lc24ndCBzdXBwb3J0IGFuYWx5dGljYWwgcXVlcmllcywgdHJ1ZSBvciBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdHB1YmxpYyBpc1Byb3BlcnR5QWdncmVnYXRhYmxlKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5fYkFwcGx5U3VwcG9ydGVkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBHZXQgdGhlIGN1c3RvbSBhZ2dyZWdhdGVzXG5cdFx0XHRjb25zdCBhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnM6IEN1c3RvbUFnZ3JlZ2F0ZVtdID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcblx0XHRcdFx0XCJBZ2dyZWdhdGlvblwiLFxuXHRcdFx0XHRBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcy5DdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHRcdFt0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0XVxuXHRcdFx0KTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgYSBjdXN0b20gYWdncmVnYXRlIGhhcyBhIHF1YWxpZmllciB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBwcm9wZXJ0eSBuYW1lXG5cdFx0XHRyZXR1cm4gYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zLnNvbWUoKGFubm90YXRpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnR5Lm5hbWUgPT09IGFubm90YXRpb24ucXVhbGlmaWVyO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldEdyb3VwYWJsZVByb3BlcnRpZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzO1xuXHR9XG5cblx0cHVibGljIGdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzO1xuXHR9XG5cblx0cHVibGljIGdldEVudGl0eVR5cGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2VudGl0eVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBBZ2dyZWdhdGVkUHJvcGVydGllcyBvciBBZ2dyZWdhdGVkUHJvcGVydHkgYmFzZWQgb24gcGFyYW0gVGVybS5cblx0ICogVGhlIFRlcm0gaGVyZSBpbmRpY2F0ZXMgaWYgdGhlIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBzaG91bGQgYmUgcmV0cmlldmVkIG9yIHRoZSBkZXByZWNhdGVkIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gVGVybSBUaGUgQW5ub3RhdGlvbiBUZXJtXG5cdCAqIEByZXR1cm5zIEFubm90YXRpb25zIFRoZSBhcHByb3ByaWF0ZSBhbm5vdGF0aW9ucyBiYXNlZCBvbiB0aGUgZ2l2ZW4gVGVybS5cblx0ICovXG5cdHB1YmxpYyBnZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhUZXJtOiBTdHJpbmcpIHtcblx0XHRpZiAoVGVybSA9PT0gXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkFuYWx5dGljc1wiLCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydGllc1wiLCBbXG5cdFx0XHRcdHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCksXG5cdFx0XHRcdHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdFx0XHRdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJBbmFseXRpY3NcIiwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnR5XCIsIFtcblx0XHRcdHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCksXG5cdFx0XHR0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRcdF0pO1xuXHR9XG5cdC8vIHJldGlydmUgYWxsIHRyYW5zZm9ybWF0aW9uIGFnZ3JlZ2F0ZXMgYnkgcHJpb3JpdGl6aW5nIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBvdmVyIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIG9iamVjdHNcblx0cHVibGljIGdldFRyYW5zQWdncmVnYXRpb25zKCkge1xuXHRcdGxldCBhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cyA9IHRoaXMuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydHlcIik7XG5cdFx0aWYgKCFhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cyB8fCBhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cy5sZW5ndGggPT09IDApIHtcblx0XHRcdGFBZ2dyZWdhdGVkUHJvcGVydHlPYmplY3RzID0gdGhpcy5nZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhcIkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXCIpWzBdO1xuXHRcdH1cblx0XHRyZXR1cm4gYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHM/LmZpbHRlcigoYWdncmVnYXRlZFByb3BlcnR5OiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5fZ2V0QWdncmVnYXRhYmxlQWdncmVnYXRlcyhhZ2dyZWdhdGVkUHJvcGVydHkuQWdncmVnYXRhYmxlUHJvcGVydHkpKSB7XG5cdFx0XHRcdHJldHVybiBhZ2dyZWdhdGVkUHJvcGVydHk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgZWFjaCB0cmFuc2Zvcm1hdGlvbiBpcyBhZ2dyZWdhdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcblx0ICogQHJldHVybnMgJ2FnZ3JlZ2F0ZWRQcm9wZXJ0eSdcblx0ICovXG5cblx0cHJpdmF0ZSBfZ2V0QWdncmVnYXRhYmxlQWdncmVnYXRlcyhwcm9wZXJ0eTogUHJvcGVydHlQYXRoIHwgQW5ub3RhdGlvblRlcm08Q3VzdG9tQWdncmVnYXRlPikge1xuXHRcdGNvbnN0IGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gKHRoaXMuZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcygpIGFzIEFwcGx5U3VwcG9ydGVkVHlwZVtcIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXNcIl0pIHx8IFtdO1xuXHRcdHJldHVybiBhQWdncmVnYXRhYmxlUHJvcGVydGllcy5maW5kKGZ1bmN0aW9uIChvYmo6IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b2JqLlByb3BlcnR5LnZhbHVlID09PVxuXHRcdFx0XHQoKHByb3BlcnR5IGFzIEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pLnF1YWxpZmllclxuXHRcdFx0XHRcdD8gKHByb3BlcnR5IGFzIEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pLnF1YWxpZmllclxuXHRcdFx0XHRcdDogKHByb3BlcnR5IGFzIFByb3BlcnR5UGF0aCkuJHRhcmdldC5uYW1lKVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGN1c3RvbSBhZ2dyZWdhdGUgZGVmaW5pdGlvbnMgZm9yIHRoZSBlbnRpdHkgdHlwZS5cblx0ICpcblx0ICogQHJldHVybnMgQSBtYXAgKHByb3BlcnR5TmFtZSAtLT4gYXJyYXkgb2YgY29udGV4dC1kZWZpbmluZyBwcm9wZXJ0eSBuYW1lcykgZm9yIGVhY2ggY3VzdG9tIGFnZ3JlZ2F0ZSBjb3JyZXNwb25kaW5nIHRvIGEgcHJvcGVydHkuIFRoZSBhcnJheSBvZlxuXHQgKiBjb250ZXh0LWRlZmluaW5nIHByb3BlcnR5IG5hbWVzIGlzIGVtcHR5IGlmIHRoZSBjdXN0b20gYWdncmVnYXRlIGRvZXNuJ3QgaGF2ZSBhbnkgY29udGV4dC1kZWZpbmluZyBwcm9wZXJ0eS5cblx0ICovXG5cdHB1YmxpYyBnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpIHtcblx0XHQvLyBHZXQgdGhlIGN1c3RvbSBhZ2dyZWdhdGVzXG5cdFx0Y29uc3QgYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zOiBDdXN0b21BZ2dyZWdhdGVbXSA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXG5cdFx0XHRcIkFnZ3JlZ2F0aW9uXCIsXG5cdFx0XHRBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcy5DdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHRbdGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldF1cblx0XHQpO1xuXHRcdHJldHVybiBhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbGlzdCBvZiBhbGxvd2VkIHRyYW5zZm9ybWF0aW9ucyBpbiB0aGUgJGFwcGx5LlxuXHQgKiBGaXJzdCBsb29rIGF0IHRoZSBjdXJyZW50IEVudGl0eVNldCwgdGhlbiBsb29rIGF0IHRoZSBkZWZhdWx0IHZhbHVlcyBwcm92aWRlZCBhdCB0aGUgY29udGFpbmVyIGxldmVsLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiB0cmFuc2Zvcm1hdGlvbnMsIG9yIHVuZGVmaW5lZCBpZiBubyBsaXN0IGlzIGZvdW5kXG5cdCAqL1xuXHRwdWJsaWMgZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucygpOiBTdHJpbmdbXSB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIChcblx0XHRcdCh0aGlzLm9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zPy5BcHBseVN1cHBvcnRlZD8uVHJhbnNmb3JtYXRpb25zIGFzIFN0cmluZ1tdKSB8fFxuXHRcdFx0KHRoaXMub0NvbnRhaW5lckFnZ3JlZ2F0aW9uQW5ub3RhdGlvbj8uQXBwbHlTdXBwb3J0ZWREZWZhdWx0cz8uVHJhbnNmb3JtYXRpb25zIGFzIFN0cmluZ1tdKVxuXHRcdCk7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFhQTtBQUNBO0FBQ0E7RUFGQSxJQUdhQSxpQkFBaUI7SUFjN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0MsMkJBQVlDLFVBQXNCLEVBQUVDLGdCQUFrQyxFQUFFO01BQUE7TUFDdkUsSUFBSSxDQUFDQyxXQUFXLEdBQUdGLFVBQVU7TUFDN0IsSUFBSSxDQUFDRyxpQkFBaUIsR0FBR0YsZ0JBQWdCO01BRXpDLElBQUksQ0FBQ0csNkJBQTZCLEdBQUcsSUFBSSxDQUFDQyxxQ0FBcUMsRUFBRTtNQUNqRixJQUFJLDhCQUFJLENBQUNELDZCQUE2QiwwREFBbEMsc0JBQW9DRSxLQUFLLE1BQUssb0JBQW9CLEVBQUU7UUFBQTtRQUN2RSxJQUFJLENBQUNDLDZCQUE2Qiw2QkFBRyxJ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