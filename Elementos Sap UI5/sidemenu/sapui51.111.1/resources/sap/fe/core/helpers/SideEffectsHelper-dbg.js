/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  const fnGetOwnerEntityForSourceEntity = function (oSourceEntity, sEntityType, oMetaModel) {
    const sNavigationPath = oSourceEntity["$NavigationPropertyPath"];
    let pOwnerEntity;
    // Source entities have an empty path, that is same as the target entity type of the side effect annotation
    // or it always involves get target entity for this navigation path
    if (sNavigationPath === "") {
      pOwnerEntity = Promise.resolve(sEntityType);
    } else {
      pOwnerEntity = oMetaModel.requestObject("/" + sEntityType + "/" + sNavigationPath + "/@sapui.name");
    }
    return {
      pOwnerEntity,
      sNavigationPath
    };
  };
  const fnGetObjectToGenerateSideEffectMap = function (sEntityType, sSideEffectAnnotation, oSideEffectAnnotation, oMetaModel) {
    const sQualifier = sSideEffectAnnotation.indexOf("#") > -1 && sSideEffectAnnotation.substr(sSideEffectAnnotation.indexOf("#")) || "",
      aSourceProperties = oSideEffectAnnotation.SourceProperties || [],
      aSourceEntities = oSideEffectAnnotation.SourceEntities || [],
      // for each source property or source entity, there could be a oMetaModel.requestObject(...) to get the target entity type of the navigation involved
      resultArray = [];
    aSourceProperties.forEach(function (oSourceProperty) {
      const {
        sPath,
        pOwnerEntity,
        sNavigationPath
      } = fnGetPathForSourceProperty(oSourceProperty["$PropertyPath"], sEntityType, oMetaModel);
      resultArray.push({
        pOwnerEntity,
        sQualifier,
        sNavigationPath,
        sPath,
        sEntityType,
        oSideEffectAnnotation
      });
    });
    aSourceEntities.forEach(function (oSourceEntity) {
      const {
        pOwnerEntity,
        sNavigationPath
      } = fnGetOwnerEntityForSourceEntity(oSourceEntity, sEntityType, oMetaModel);
      resultArray.push({
        pOwnerEntity,
        sQualifier,
        sNavigationPath,
        sPath: "entity",
        sEntityType,
        oSideEffectAnnotation
      });
    });
    return resultArray;
  };
  const fnGetPathForSourceProperty = function (sPath, sEntityType, oMetaModel) {
    // if the property path has a navigation, get the target entity type of the navigation
    const sNavigationPath = sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
      pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
    sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
    return {
      sPath,
      pOwnerEntity,
      sNavigationPath
    };
  };
  const SideEffectsHelper = {
    IMMEDIATE_REQUEST: "$$ImmediateRequest",
    generateSideEffectsMapFromMetaModel(oMetaModel) {
      const oSideEffects = {};
      let allEntityTypes = [];
      let allSideEffectsDataArray = [];
      return oMetaModel.requestObject("/$").then(function (oEverything) {
        const fnFilterEntityTypes = function (sKey) {
          return oEverything[sKey]["$kind"] === "EntityType";
        };
        // get everything --> filter the entity types which have side effects annotated
        return Object.keys(oEverything).filter(fnFilterEntityTypes);
      }).then(mapEntityTypes => {
        allEntityTypes = mapEntityTypes;
        return Promise.allSettled(mapEntityTypes.map(sEntityType => {
          return oMetaModel.requestObject("/" + sEntityType + "@");
        }));
      }).then(entityTypesAnnotations => {
        let allSideEffectsPromises = [];
        // loop through all entity types and filter entities having side effect annotations
        // then generate map object for all side effects found
        // also generate the promises array out of the side effect object
        entityTypesAnnotations.forEach(function (entityTypeData, index) {
          if (entityTypeData.status === "fulfilled") {
            const sEntityType = allEntityTypes[index];
            const oAnnotations = entityTypeData.value;
            Object.keys(oAnnotations).filter(function (sAnnotation) {
              return sAnnotation.indexOf("@com.sap.vocabularies.Common.v1.SideEffects") > -1;
            }).forEach(function (sSideEffectAnnotation) {
              const sideEffectsMap = fnGetObjectToGenerateSideEffectMap(sEntityType, sSideEffectAnnotation, oAnnotations[sSideEffectAnnotation], oMetaModel);
              allSideEffectsDataArray = allSideEffectsDataArray.concat(sideEffectsMap);
              allSideEffectsPromises = allSideEffectsPromises.concat(sideEffectsMap.map(i => i["pOwnerEntity"]));
            });
          }
        });
        return Promise.allSettled(allSideEffectsPromises);
      }).then(allSideEffectPromisesResult => {
        // when all the side effects promises have been settled(from source properties and ewntites), we generate side effects object based on side effect data objects values, like entity, sourceproperties

        allSideEffectPromisesResult.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const sOwnerEntityType = result.value;
            const sideeffectDataMap = allSideEffectsDataArray[index];
            const {
              sEntityType,
              sQualifier,
              oSideEffectAnnotation,
              sPath
            } = sideeffectDataMap;
            const aSourceProperties = oSideEffectAnnotation.SourceProperties;
            if (sPath === "entity") {
              // data coming from source entities
              oSideEffects[sOwnerEntityType] = oSideEffects[sOwnerEntityType] || [[], {}];
              // side effects for fields referenced via source entities must always be requested immediately
              oSideEffects[sOwnerEntityType][0].push(`${sEntityType}${sQualifier}${SideEffectsHelper.IMMEDIATE_REQUEST}`); // --> mappingSourceEntities
            } else {
              oSideEffects[sOwnerEntityType] = oSideEffects[sOwnerEntityType] || [[], {}];
              oSideEffects[sOwnerEntityType][1][sPath] = oSideEffects[sOwnerEntityType][1][sPath] || [];
              // if there is only one source property, side effect request is required immediately
              oSideEffects[sOwnerEntityType][1][sPath].push(sEntityType + sQualifier + (aSourceProperties.length === 1 && SideEffectsHelper.IMMEDIATE_REQUEST || "")); // --> mappingSourceProperties
            }
          }
        });

        return oSideEffects;
      }).catch(e => Promise.reject(e));
    }
  };
  return SideEffectsHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmbkdldE93bmVyRW50aXR5Rm9yU291cmNlRW50aXR5Iiwib1NvdXJjZUVudGl0eSIsInNFbnRpdHlUeXBlIiwib01ldGFNb2RlbCIsInNOYXZpZ2F0aW9uUGF0aCIsInBPd25lckVudGl0eSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVxdWVzdE9iamVjdCIsImZuR2V0T2JqZWN0VG9HZW5lcmF0ZVNpZGVFZmZlY3RNYXAiLCJzU2lkZUVmZmVjdEFubm90YXRpb24iLCJvU2lkZUVmZmVjdEFubm90YXRpb24iLCJzUXVhbGlmaWVyIiwiaW5kZXhPZiIsInN1YnN0ciIsImFTb3VyY2VQcm9wZXJ0aWVzIiwiU291cmNlUHJvcGVydGllcyIsImFTb3VyY2VFbnRpdGllcyIsIlNvdXJjZUVudGl0aWVzIiwicmVzdWx0QXJyYXkiLCJmb3JFYWNoIiwib1NvdXJjZVByb3BlcnR5Iiwic1BhdGgiLCJmbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eSIsInB1c2giLCJsYXN0SW5kZXhPZiIsIlNpZGVFZmZlY3RzSGVscGVyIiwiSU1NRURJQVRFX1JFUVVFU1QiLCJnZW5lcmF0ZVNpZGVFZmZlY3RzTWFwRnJvbU1ldGFNb2RlbCIsIm9TaWRlRWZmZWN0cyIsImFsbEVudGl0eVR5cGVzIiwiYWxsU2lkZUVmZmVjdHNEYXRhQXJyYXkiLCJ0aGVuIiwib0V2ZXJ5dGhpbmciLCJmbkZpbHRlckVudGl0eVR5cGVzIiwic0tleSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJtYXBFbnRpdHlUeXBlcyIsImFsbFNldHRsZWQiLCJtYXAiLCJlbnRpdHlUeXBlc0Fubm90YXRpb25zIiwiYWxsU2lkZUVmZmVjdHNQcm9taXNlcyIsImVudGl0eVR5cGVEYXRhIiwiaW5kZXgiLCJzdGF0dXMiLCJvQW5ub3RhdGlvbnMiLCJ2YWx1ZSIsInNBbm5vdGF0aW9uIiwic2lkZUVmZmVjdHNNYXAiLCJjb25jYXQiLCJpIiwiYWxsU2lkZUVmZmVjdFByb21pc2VzUmVzdWx0IiwicmVzdWx0Iiwic093bmVyRW50aXR5VHlwZSIsInNpZGVlZmZlY3REYXRhTWFwIiwibGVuZ3RoIiwiY2F0Y2giLCJlIiwicmVqZWN0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaWRlRWZmZWN0c0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmbkdldE93bmVyRW50aXR5Rm9yU291cmNlRW50aXR5ID0gZnVuY3Rpb24gKG9Tb3VyY2VFbnRpdHk6IGFueSwgc0VudGl0eVR5cGU6IHN0cmluZywgb01ldGFNb2RlbDogYW55KSB7XG5cdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IG9Tb3VyY2VFbnRpdHlbXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiXTtcblx0bGV0IHBPd25lckVudGl0eTtcblx0Ly8gU291cmNlIGVudGl0aWVzIGhhdmUgYW4gZW1wdHkgcGF0aCwgdGhhdCBpcyBzYW1lIGFzIHRoZSB0YXJnZXQgZW50aXR5IHR5cGUgb2YgdGhlIHNpZGUgZWZmZWN0IGFubm90YXRpb25cblx0Ly8gb3IgaXQgYWx3YXlzIGludm9sdmVzIGdldCB0YXJnZXQgZW50aXR5IGZvciB0aGlzIG5hdmlnYXRpb24gcGF0aFxuXHRpZiAoc05hdmlnYXRpb25QYXRoID09PSBcIlwiKSB7XG5cdFx0cE93bmVyRW50aXR5ID0gUHJvbWlzZS5yZXNvbHZlKHNFbnRpdHlUeXBlKTtcblx0fSBlbHNlIHtcblx0XHRwT3duZXJFbnRpdHkgPSBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoXCIvXCIgKyBzRW50aXR5VHlwZSArIFwiL1wiICsgc05hdmlnYXRpb25QYXRoICsgXCIvQHNhcHVpLm5hbWVcIik7XG5cdH1cblx0cmV0dXJuIHsgcE93bmVyRW50aXR5LCBzTmF2aWdhdGlvblBhdGggfTtcbn07XG5cbmNvbnN0IGZuR2V0T2JqZWN0VG9HZW5lcmF0ZVNpZGVFZmZlY3RNYXAgPSBmdW5jdGlvbiAoXG5cdHNFbnRpdHlUeXBlOiBzdHJpbmcsXG5cdHNTaWRlRWZmZWN0QW5ub3RhdGlvbjogc3RyaW5nLFxuXHRvU2lkZUVmZmVjdEFubm90YXRpb246IGFueSxcblx0b01ldGFNb2RlbDogYW55XG4pIHtcblx0Y29uc3Qgc1F1YWxpZmllciA9IChzU2lkZUVmZmVjdEFubm90YXRpb24uaW5kZXhPZihcIiNcIikgPiAtMSAmJiBzU2lkZUVmZmVjdEFubm90YXRpb24uc3Vic3RyKHNTaWRlRWZmZWN0QW5ub3RhdGlvbi5pbmRleE9mKFwiI1wiKSkpIHx8IFwiXCIsXG5cdFx0YVNvdXJjZVByb3BlcnRpZXMgPSBvU2lkZUVmZmVjdEFubm90YXRpb24uU291cmNlUHJvcGVydGllcyB8fCBbXSxcblx0XHRhU291cmNlRW50aXRpZXMgPSBvU2lkZUVmZmVjdEFubm90YXRpb24uU291cmNlRW50aXRpZXMgfHwgW10sXG5cdFx0Ly8gZm9yIGVhY2ggc291cmNlIHByb3BlcnR5IG9yIHNvdXJjZSBlbnRpdHksIHRoZXJlIGNvdWxkIGJlIGEgb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KC4uLikgdG8gZ2V0IHRoZSB0YXJnZXQgZW50aXR5IHR5cGUgb2YgdGhlIG5hdmlnYXRpb24gaW52b2x2ZWRcblx0XHRyZXN1bHRBcnJheTogYW55W10gPSBbXTtcblx0YVNvdXJjZVByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAob1NvdXJjZVByb3BlcnR5OiBhbnkpIHtcblx0XHRjb25zdCB7IHNQYXRoLCBwT3duZXJFbnRpdHksIHNOYXZpZ2F0aW9uUGF0aCB9ID0gZm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHkoXG5cdFx0XHRvU291cmNlUHJvcGVydHlbXCIkUHJvcGVydHlQYXRoXCJdLFxuXHRcdFx0c0VudGl0eVR5cGUsXG5cdFx0XHRvTWV0YU1vZGVsXG5cdFx0KTtcblx0XHRyZXN1bHRBcnJheS5wdXNoKHsgcE93bmVyRW50aXR5LCBzUXVhbGlmaWVyLCBzTmF2aWdhdGlvblBhdGgsIHNQYXRoLCBzRW50aXR5VHlwZSwgb1NpZGVFZmZlY3RBbm5vdGF0aW9uIH0pO1xuXHR9KTtcblx0YVNvdXJjZUVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24gKG9Tb3VyY2VFbnRpdHk6IGFueSkge1xuXHRcdGNvbnN0IHsgcE93bmVyRW50aXR5LCBzTmF2aWdhdGlvblBhdGggfSA9IGZuR2V0T3duZXJFbnRpdHlGb3JTb3VyY2VFbnRpdHkob1NvdXJjZUVudGl0eSwgc0VudGl0eVR5cGUsIG9NZXRhTW9kZWwpO1xuXHRcdHJlc3VsdEFycmF5LnB1c2goeyBwT3duZXJFbnRpdHksIHNRdWFsaWZpZXIsIHNOYXZpZ2F0aW9uUGF0aCwgc1BhdGg6IFwiZW50aXR5XCIsIHNFbnRpdHlUeXBlLCBvU2lkZUVmZmVjdEFubm90YXRpb24gfSk7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0QXJyYXk7XG59O1xuXG5jb25zdCBmbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eSA9IGZ1bmN0aW9uIChzUGF0aDogYW55LCBzRW50aXR5VHlwZTogYW55LCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0Ly8gaWYgdGhlIHByb3BlcnR5IHBhdGggaGFzIGEgbmF2aWdhdGlvbiwgZ2V0IHRoZSB0YXJnZXQgZW50aXR5IHR5cGUgb2YgdGhlIG5hdmlnYXRpb25cblx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID1cblx0XHRcdHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCA/IFwiL1wiICsgc0VudGl0eVR5cGUgKyBcIi9cIiArIHNQYXRoLnN1YnN0cigwLCBzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSArIFwiQHNhcHVpLm5hbWVcIiA6IGZhbHNlLFxuXHRcdHBPd25lckVudGl0eSA9ICFzTmF2aWdhdGlvblBhdGggPyBQcm9taXNlLnJlc29sdmUoc0VudGl0eVR5cGUpIDogb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KHNOYXZpZ2F0aW9uUGF0aCk7XG5cdHNQYXRoID0gc05hdmlnYXRpb25QYXRoID8gc1BhdGguc3Vic3RyKHNQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpIDogc1BhdGg7XG5cdHJldHVybiB7IHNQYXRoLCBwT3duZXJFbnRpdHksIHNOYXZpZ2F0aW9uUGF0aCB9O1xufTtcblxuY29uc3QgU2lkZUVmZmVjdHNIZWxwZXIgPSB7XG5cdElNTUVESUFURV9SRVFVRVNUOiBcIiQkSW1tZWRpYXRlUmVxdWVzdFwiLFxuXHRnZW5lcmF0ZVNpZGVFZmZlY3RzTWFwRnJvbU1ldGFNb2RlbChvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHM6IGFueSA9IHt9O1xuXHRcdGxldCBhbGxFbnRpdHlUeXBlczogYW55ID0gW107XG5cdFx0bGV0IGFsbFNpZGVFZmZlY3RzRGF0YUFycmF5OiBhbnkgPSBbXTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0LnJlcXVlc3RPYmplY3QoXCIvJFwiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9FdmVyeXRoaW5nOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgZm5GaWx0ZXJFbnRpdHlUeXBlcyA9IGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0V2ZXJ5dGhpbmdbc0tleV1bXCIka2luZFwiXSA9PT0gXCJFbnRpdHlUeXBlXCI7XG5cdFx0XHRcdH07XG5cdFx0XHRcdC8vIGdldCBldmVyeXRoaW5nIC0tPiBmaWx0ZXIgdGhlIGVudGl0eSB0eXBlcyB3aGljaCBoYXZlIHNpZGUgZWZmZWN0cyBhbm5vdGF0ZWRcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9FdmVyeXRoaW5nKS5maWx0ZXIoZm5GaWx0ZXJFbnRpdHlUeXBlcyk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKG1hcEVudGl0eVR5cGVzOiBhbnkpID0+IHtcblx0XHRcdFx0YWxsRW50aXR5VHlwZXMgPSBtYXBFbnRpdHlUeXBlcztcblx0XHRcdFx0cmV0dXJuIChQcm9taXNlIGFzIGFueSkuYWxsU2V0dGxlZChcblx0XHRcdFx0XHRtYXBFbnRpdHlUeXBlcy5tYXAoKHNFbnRpdHlUeXBlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoXCIvXCIgKyBzRW50aXR5VHlwZSArIFwiQFwiKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChlbnRpdHlUeXBlc0Fubm90YXRpb25zOiBhbnkpID0+IHtcblx0XHRcdFx0bGV0IGFsbFNpZGVFZmZlY3RzUHJvbWlzZXM6IGFueSA9IFtdO1xuXHRcdFx0XHQvLyBsb29wIHRocm91Z2ggYWxsIGVudGl0eSB0eXBlcyBhbmQgZmlsdGVyIGVudGl0aWVzIGhhdmluZyBzaWRlIGVmZmVjdCBhbm5vdGF0aW9uc1xuXHRcdFx0XHQvLyB0aGVuIGdlbmVyYXRlIG1hcCBvYmplY3QgZm9yIGFsbCBzaWRlIGVmZmVjdHMgZm91bmRcblx0XHRcdFx0Ly8gYWxzbyBnZW5lcmF0ZSB0aGUgcHJvbWlzZXMgYXJyYXkgb3V0IG9mIHRoZSBzaWRlIGVmZmVjdCBvYmplY3Rcblx0XHRcdFx0ZW50aXR5VHlwZXNBbm5vdGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRpdHlUeXBlRGF0YTogYW55LCBpbmRleDogYW55KSB7XG5cdFx0XHRcdFx0aWYgKGVudGl0eVR5cGVEYXRhLnN0YXR1cyA9PT0gXCJmdWxmaWxsZWRcIikge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGUgPSBhbGxFbnRpdHlUeXBlc1tpbmRleF07XG5cdFx0XHRcdFx0XHRjb25zdCBvQW5ub3RhdGlvbnMgPSBlbnRpdHlUeXBlRGF0YS52YWx1ZTtcblx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKG9Bbm5vdGF0aW9ucylcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoc0Fubm90YXRpb24pIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc0Fubm90YXRpb24uaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2lkZUVmZmVjdHNcIikgPiAtMTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHNTaWRlRWZmZWN0QW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzTWFwID0gZm5HZXRPYmplY3RUb0dlbmVyYXRlU2lkZUVmZmVjdE1hcChcblx0XHRcdFx0XHRcdFx0XHRcdHNFbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFx0XHRcdFx0c1NpZGVFZmZlY3RBbm5vdGF0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0b0Fubm90YXRpb25zW3NTaWRlRWZmZWN0QW5ub3RhdGlvbl0sXG5cdFx0XHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRhbGxTaWRlRWZmZWN0c0RhdGFBcnJheSA9IGFsbFNpZGVFZmZlY3RzRGF0YUFycmF5LmNvbmNhdChzaWRlRWZmZWN0c01hcCk7XG5cdFx0XHRcdFx0XHRcdFx0YWxsU2lkZUVmZmVjdHNQcm9taXNlcyA9IGFsbFNpZGVFZmZlY3RzUHJvbWlzZXMuY29uY2F0KHNpZGVFZmZlY3RzTWFwLm1hcCgoaTogYW55KSA9PiBpW1wicE93bmVyRW50aXR5XCJdKSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiAoUHJvbWlzZSBhcyBhbnkpLmFsbFNldHRsZWQoYWxsU2lkZUVmZmVjdHNQcm9taXNlcyk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKGFsbFNpZGVFZmZlY3RQcm9taXNlc1Jlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRcdC8vIHdoZW4gYWxsIHRoZSBzaWRlIGVmZmVjdHMgcHJvbWlzZXMgaGF2ZSBiZWVuIHNldHRsZWQoZnJvbSBzb3VyY2UgcHJvcGVydGllcyBhbmQgZXdudGl0ZXMpLCB3ZSBnZW5lcmF0ZSBzaWRlIGVmZmVjdHMgb2JqZWN0IGJhc2VkIG9uIHNpZGUgZWZmZWN0IGRhdGEgb2JqZWN0cyB2YWx1ZXMsIGxpa2UgZW50aXR5LCBzb3VyY2Vwcm9wZXJ0aWVzXG5cblx0XHRcdFx0YWxsU2lkZUVmZmVjdFByb21pc2VzUmVzdWx0LmZvckVhY2goKHJlc3VsdDogYW55LCBpbmRleDogYW55KSA9PiB7XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNPd25lckVudGl0eVR5cGUgPSByZXN1bHQudmFsdWU7XG5cdFx0XHRcdFx0XHRjb25zdCBzaWRlZWZmZWN0RGF0YU1hcCA9IGFsbFNpZGVFZmZlY3RzRGF0YUFycmF5W2luZGV4XTtcblx0XHRcdFx0XHRcdGNvbnN0IHsgc0VudGl0eVR5cGUsIHNRdWFsaWZpZXIsIG9TaWRlRWZmZWN0QW5ub3RhdGlvbiwgc1BhdGggfSA9IHNpZGVlZmZlY3REYXRhTWFwO1xuXHRcdFx0XHRcdFx0Y29uc3QgYVNvdXJjZVByb3BlcnRpZXMgPSBvU2lkZUVmZmVjdEFubm90YXRpb24uU291cmNlUHJvcGVydGllcztcblx0XHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gXCJlbnRpdHlcIikge1xuXHRcdFx0XHRcdFx0XHQvLyBkYXRhIGNvbWluZyBmcm9tIHNvdXJjZSBlbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRvU2lkZUVmZmVjdHNbc093bmVyRW50aXR5VHlwZV0gPSBvU2lkZUVmZmVjdHNbc093bmVyRW50aXR5VHlwZV0gfHwgW1tdLCB7fV07XG5cdFx0XHRcdFx0XHRcdC8vIHNpZGUgZWZmZWN0cyBmb3IgZmllbGRzIHJlZmVyZW5jZWQgdmlhIHNvdXJjZSBlbnRpdGllcyBtdXN0IGFsd2F5cyBiZSByZXF1ZXN0ZWQgaW1tZWRpYXRlbHlcblx0XHRcdFx0XHRcdFx0b1NpZGVFZmZlY3RzW3NPd25lckVudGl0eVR5cGVdWzBdLnB1c2goYCR7c0VudGl0eVR5cGV9JHtzUXVhbGlmaWVyfSR7U2lkZUVmZmVjdHNIZWxwZXIuSU1NRURJQVRFX1JFUVVFU1R9YCk7IC8vIC0tPiBtYXBwaW5nU291cmNlRW50aXRpZXNcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXSA9IG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXSB8fCBbW10sIHt9XTtcblx0XHRcdFx0XHRcdFx0b1NpZGVFZmZlY3RzW3NPd25lckVudGl0eVR5cGVdWzFdW3NQYXRoXSA9IG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXVsxXVtzUGF0aF0gfHwgW107XG5cdFx0XHRcdFx0XHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lIHNvdXJjZSBwcm9wZXJ0eSwgc2lkZSBlZmZlY3QgcmVxdWVzdCBpcyByZXF1aXJlZCBpbW1lZGlhdGVseVxuXHRcdFx0XHRcdFx0XHRvU2lkZUVmZmVjdHNbc093bmVyRW50aXR5VHlwZV1bMV1bc1BhdGhdLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0c0VudGl0eVR5cGUgKyBzUXVhbGlmaWVyICsgKChhU291cmNlUHJvcGVydGllcy5sZW5ndGggPT09IDEgJiYgU2lkZUVmZmVjdHNIZWxwZXIuSU1NRURJQVRFX1JFUVVFU1QpIHx8IFwiXCIpXG5cdFx0XHRcdFx0XHRcdCk7IC8vIC0tPiBtYXBwaW5nU291cmNlUHJvcGVydGllc1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBvU2lkZUVmZmVjdHM7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChlOiBhbnkpID0+IFByb21pc2UucmVqZWN0KGUpKTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgU2lkZUVmZmVjdHNIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFBQSxNQUFNQSwrQkFBK0IsR0FBRyxVQUFVQyxhQUFrQixFQUFFQyxXQUFtQixFQUFFQyxVQUFlLEVBQUU7SUFDM0csTUFBTUMsZUFBZSxHQUFHSCxhQUFhLENBQUMseUJBQXlCLENBQUM7SUFDaEUsSUFBSUksWUFBWTtJQUNoQjtJQUNBO0lBQ0EsSUFBSUQsZUFBZSxLQUFLLEVBQUUsRUFBRTtNQUMzQkMsWUFBWSxHQUFHQyxPQUFPLENB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