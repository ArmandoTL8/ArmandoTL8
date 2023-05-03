/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ModelHelper"], function (modelHelper) {
  "use strict";

  var _exports = {};
  function getIsRequired(converterContext, sPropertyPath) {
    var _capabilities, _capabilities$FilterR;
    const entitySet = converterContext.getEntitySet();
    const entitySetAnnotations = entitySet === null || entitySet === void 0 ? void 0 : entitySet.annotations;
    let capabilities;
    if (!modelHelper.isSingleton(entitySet)) {
      capabilities = entitySetAnnotations === null || entitySetAnnotations === void 0 ? void 0 : entitySetAnnotations.Capabilities;
    }
    const aRequiredProperties = (_capabilities = capabilities) === null || _capabilities === void 0 ? void 0 : (_capabilities$FilterR = _capabilities.FilterRestrictions) === null || _capabilities$FilterR === void 0 ? void 0 : _capabilities$FilterR.RequiredProperties;
    let bIsRequired = false;
    if (aRequiredProperties) {
      aRequiredProperties.forEach(function (oRequiredProperty) {
        if (sPropertyPath === (oRequiredProperty === null || oRequiredProperty === void 0 ? void 0 : oRequiredProperty.value)) {
          bIsRequired = true;
        }
      });
    }
    return bIsRequired;
  }
  _exports.getIsRequired = getIsRequired;
  function isPropertyFilterable(converterContext, valueListProperty) {
    var _capabilities2, _capabilities2$Filter;
    let bNotFilterable, bHidden;
    const entityType = converterContext.getEntityType();
    const entitySet = converterContext.getEntitySet();
    const entitySetAnnotations = entitySet === null || entitySet === void 0 ? void 0 : entitySet.annotations;
    let capabilities;
    if (!modelHelper.isSingleton(entitySet)) {
      capabilities = entitySetAnnotations === null || entitySetAnnotations === void 0 ? void 0 : entitySetAnnotations.Capabilities;
    }
    const nonFilterableProperties = (_capabilities2 = capabilities) === null || _capabilities2 === void 0 ? void 0 : (_capabilities2$Filter = _capabilities2.FilterRestrictions) === null || _capabilities2$Filter === void 0 ? void 0 : _capabilities2$Filter.NonFilterableProperties;
    const properties = entityType.entityProperties;
    properties.forEach(property => {
      const PropertyPath = property.name;
      if (PropertyPath === valueListProperty) {
        var _property$annotations, _property$annotations2, _property$annotations3;
        bHidden = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf();
      }
    });
    if (nonFilterableProperties && nonFilterableProperties.length > 0) {
      for (let i = 0; i < nonFilterableProperties.length; i++) {
        var _nonFilterablePropert;
        const sPropertyName = (_nonFilterablePropert = nonFilterableProperties[i]) === null || _nonFilterablePropert === void 0 ? void 0 : _nonFilterablePropert.value;
        if (sPropertyName === valueListProperty) {
          bNotFilterable = true;
        }
      }
    }
    return bNotFilterable || bHidden;
  }
  _exports.isPropertyFilterable = isPropertyFilterable;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJc1JlcXVpcmVkIiwiY29udmVydGVyQ29udGV4dCIsInNQcm9wZXJ0eVBhdGgiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJlbnRpdHlTZXRBbm5vdGF0aW9ucyIsImFubm90YXRpb25zIiwiY2FwYWJpbGl0aWVzIiwibW9kZWxIZWxwZXIiLCJpc1NpbmdsZXRvbiIsIkNhcGFiaWxpdGllcyIsImFSZXF1aXJlZFByb3BlcnRpZXMiLCJGaWx0ZXJSZXN0cmljdGlvbnMiLCJSZXF1aXJlZFByb3BlcnRpZXMiLCJiSXNSZXF1aXJlZCIsImZvckVhY2giLCJvUmVxdWlyZWRQcm9wZXJ0eSIsInZhbHVlIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJ2YWx1ZUxpc3RQcm9wZXJ0eSIsImJOb3RGaWx0ZXJhYmxlIiwiYkhpZGRlbiIsImVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwibm9uRmlsdGVyYWJsZVByb3BlcnRpZXMiLCJOb25GaWx0ZXJhYmxlUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbnRpdHlQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJQcm9wZXJ0eVBhdGgiLCJuYW1lIiwiVUkiLCJIaWRkZW4iLCJ2YWx1ZU9mIiwibGVuZ3RoIiwiaSIsInNQcm9wZXJ0eU5hbWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlclRlbXBsYXRpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc19FZG1cIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IG1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJc1JlcXVpcmVkKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHNQcm9wZXJ0eVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBlbnRpdHlTZXRBbm5vdGF0aW9ucyA9IGVudGl0eVNldD8uYW5ub3RhdGlvbnM7XG5cdGxldCBjYXBhYmlsaXRpZXM7XG5cblx0aWYgKCFtb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0Y2FwYWJpbGl0aWVzID0gZW50aXR5U2V0QW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcyBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXM7XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllcyA9IGNhcGFiaWxpdGllcz8uRmlsdGVyUmVzdHJpY3Rpb25zPy5SZXF1aXJlZFByb3BlcnRpZXMgYXMgYW55W107XG5cdGxldCBiSXNSZXF1aXJlZCA9IGZhbHNlO1xuXHRpZiAoYVJlcXVpcmVkUHJvcGVydGllcykge1xuXHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAob1JlcXVpcmVkUHJvcGVydHkpIHtcblx0XHRcdGlmIChzUHJvcGVydHlQYXRoID09PSBvUmVxdWlyZWRQcm9wZXJ0eT8udmFsdWUpIHtcblx0XHRcdFx0YklzUmVxdWlyZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiSXNSZXF1aXJlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlGaWx0ZXJhYmxlKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZhbHVlTGlzdFByb3BlcnR5OiBzdHJpbmcpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0bGV0IGJOb3RGaWx0ZXJhYmxlLCBiSGlkZGVuO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IGVudGl0eVNldEFubm90YXRpb25zID0gZW50aXR5U2V0Py5hbm5vdGF0aW9ucztcblx0bGV0IGNhcGFiaWxpdGllcztcblx0aWYgKCFtb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0Y2FwYWJpbGl0aWVzID0gZW50aXR5U2V0QW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcyBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXM7XG5cdH1cblx0Y29uc3Qgbm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBjYXBhYmlsaXRpZXM/LkZpbHRlclJlc3RyaWN0aW9ucz8uTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgYXMgYW55W107XG5cdGNvbnN0IHByb3BlcnRpZXMgPSBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXM7XG5cdHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IFByb3BlcnR5KSA9PiB7XG5cdFx0Y29uc3QgUHJvcGVydHlQYXRoID0gcHJvcGVydHkubmFtZTtcblx0XHRpZiAoUHJvcGVydHlQYXRoID09PSB2YWx1ZUxpc3RQcm9wZXJ0eSkge1xuXHRcdFx0YkhpZGRlbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCk7XG5cdFx0fVxuXHR9KTtcblx0aWYgKG5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzICYmIG5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gbm9uRmlsdGVyYWJsZVByb3BlcnRpZXNbaV0/LnZhbHVlO1xuXHRcdFx0aWYgKHNQcm9wZXJ0eU5hbWUgPT09IHZhbHVlTGlzdFByb3BlcnR5KSB7XG5cdFx0XHRcdGJOb3RGaWx0ZXJhYmxlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGJOb3RGaWx0ZXJhYmxlIHx8IGJIaWRkZW47XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBS08sU0FBU0EsYUFBYSxDQUFDQyxnQkFBa0MsRUFBRUMsYUFBcUIsRUFBVztJQUFBO0lBQ2pHLE1BQU1DLFNBQVMsR0FBR0YsZ0JBQWdCLENBQUNHLFlBQVksRUFBRTtJQUNqRCxNQUFNQyxvQkFBb0IsR0FBR0YsU0FBUyxhQUFUQSxTQUFTLHVCQUFUQSxTQUFTLENBQUVHLFdBQVc7SUFDbkQsSUFBSUMsWUFBWTtJQUVoQixJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsV0FBVyxDQUFDTixTQUFTLENBQUMsRUFBRTtNQUN4Q0ksWUFBWSxHQUFHRixvQkFBb0IsYUFBcEJBLG9CQUFvQix1QkFBcEJBLG9CQUFvQixDQUFFSyxZQUFpRDtJQUN2RjtJQUNBLE1BQU1DLG1CQUFtQixvQkFBR0osWUFBWSwyRUFBWixjQUFjSyxrQkFBa0IsMERBQWhDLHNCQUFrQ0Msa0JBQTJCO0lBQ3pGLElBQUlDLFdBQVcsR0FBRyxLQUFLO0lBQ3ZCLElBQUlILG1CQUFtQixFQUFFO01BQ3hCQSxtQkFBbUIsQ0FBQ0ksT0FBTyxDQUFDLFVBQVVDLGlCQUFpQixFQUFFO1FBQ3hELElBQUlkLGFBQWEsTUFBS2MsaUJBQWlCLGFBQWpCQSxpQkFBaUIsdUJBQWpCQSxpQkFBaUIsQ0FBRUMsS0FBSyxHQUFFO1VBQy9DSCxXQUFXLEdBQUcsSUFBSTtRQUNuQjtNQUNELENBQUMsQ0FBQztJQUNIO0lBQ0EsT0FBT0EsV0FBVztFQUNuQjtFQUFDO0VBRU0sU0FBU0ksb0JBQW9CLENBQUNqQixnQkFBa0MsRUFBRWtCLGlCQUF5QixFQUF1QjtJQUFBO0lBQ3hILElBQUlDLGNBQWMsRUFBRUMsT0FBTztJQUMzQixNQUFNQyxVQUFVLEdBQUdyQixnQkFBZ0IsQ0FBQ3NCLGFBQWEsRUFBRTtJQUNuRCxNQUFNcEIsU0FBUyxHQUFHRixnQkFBZ0IsQ0FBQ0csWUFBWSxFQUFFO0lBQ2pELE1BQU1DLG9CQUFvQixHQUFHRixTQUFTLGFBQVRBLFNBQVMsdUJBQVRBLFNBQVMsQ0FBRUcsV0FBVztJQUNuRCxJQUFJQyxZQUFZO0lBQ2hCLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxXQUFXLENBQUNOLFNBQVMsQ0FBQyxFQUFFO01BQ3hDSSxZQUFZLEdBQUdGLG9CQUFvQixhQUFwQkEsb0JBQW9CLHVCQUFwQkEsb0JBQW9CLENBQUVLLFlBQWlEO0lBQ3ZGO0lBQ0EsTUFBTWMsdUJBQXVCLHFCQUFHakIsWUFBWSw0RUFBWixlQUFjSyxrQkFBa0IsMERBQWhDLHNCQUFrQ2EsdUJBQWdDO0lBQ2xHLE1BQU1DLFVBQVUsR0FBR0osVUFBVSxDQUFDSyxnQkFBZ0I7SUFDOUNELFVBQVUsQ0FBQ1gsT0FBTyxDQUFFYSxRQUFrQixJQUFLO01BQzFDLE1BQU1DLFlBQVksR0FBR0QsUUFBUSxDQUFDRSxJQUFJO01BQ2xDLElBQUlELFlBQVksS0FBS1YsaUJBQWlCLEVBQUU7UUFBQTtRQUN2Q0UsT0FBTyw0QkFBR08sUUFBUSxDQUFDdEIsV0FBVyxvRkFBcEIsc0JBQXNCeUIsRUFBRSxxRkFBeEIsdUJBQTBCQyxNQUFNLDJEQUFoQyx1QkFBa0NDLE9BQU8sRUFBRTtNQUN0RDtJQUNELENBQUMsQ0FBQztJQUNGLElBQUlULHVCQUF1QixJQUFJQSx1QkFBdUIsQ0FBQ1UsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUNsRSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1gsdUJBQXVCLENBQUNVLE1BQU0sRUFBRUMsQ0FBQyxFQUFFLEVBQUU7UUFBQTtRQUN4RCxNQUFNQyxhQUFhLDRCQUFHWix1QkFBdUIsQ0FBQ1csQ0FBQyxDQUFDLDBEQUExQixzQkFBNEJsQixLQUFLO1FBQ3ZELElBQUltQixhQUFhLEtBQUtqQixpQkFBaUIsRUFBRTtVQUN4Q0MsY0FBYyxHQUFHLElBQUk7UUFDdEI7TUFDRDtJQUNEO0lBQ0EsT0FBT0EsY0FBYyxJQUFJQyxPQUFPO0VBQ2pDO0VBQUM7RUFBQTtBQUFBIn0=