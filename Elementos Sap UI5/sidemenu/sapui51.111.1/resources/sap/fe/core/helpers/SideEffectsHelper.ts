const fnGetOwnerEntityForSourceEntity = function (oSourceEntity: any, sEntityType: string, oMetaModel: any) {
	const sNavigationPath = oSourceEntity["$NavigationPropertyPath"];
	let pOwnerEntity;
	// Source entities have an empty path, that is same as the target entity type of the side effect annotation
	// or it always involves get target entity for this navigation path
	if (sNavigationPath === "") {
		pOwnerEntity = Promise.resolve(sEntityType);
	} else {
		pOwnerEntity = oMetaModel.requestObject("/" + sEntityType + "/" + sNavigationPath + "/@sapui.name");
	}
	return { pOwnerEntity, sNavigationPath };
};

const fnGetObjectToGenerateSideEffectMap = function (
	sEntityType: string,
	sSideEffectAnnotation: string,
	oSideEffectAnnotation: any,
	oMetaModel: any
) {
	const sQualifier = (sSideEffectAnnotation.indexOf("#") > -1 && sSideEffectAnnotation.substr(sSideEffectAnnotation.indexOf("#"))) || "",
		aSourceProperties = oSideEffectAnnotation.SourceProperties || [],
		aSourceEntities = oSideEffectAnnotation.SourceEntities || [],
		// for each source property or source entity, there could be a oMetaModel.requestObject(...) to get the target entity type of the navigation involved
		resultArray: any[] = [];
	aSourceProperties.forEach(function (oSourceProperty: any) {
		const { sPath, pOwnerEntity, sNavigationPath } = fnGetPathForSourceProperty(
			oSourceProperty["$PropertyPath"],
			sEntityType,
			oMetaModel
		);
		resultArray.push({ pOwnerEntity, sQualifier, sNavigationPath, sPath, sEntityType, oSideEffectAnnotation });
	});
	aSourceEntities.forEach(function (oSourceEntity: any) {
		const { pOwnerEntity, sNavigationPath } = fnGetOwnerEntityForSourceEntity(oSourceEntity, sEntityType, oMetaModel);
		resultArray.push({ pOwnerEntity, sQualifier, sNavigationPath, sPath: "entity", sEntityType, oSideEffectAnnotation });
	});
	return resultArray;
};

const fnGetPathForSourceProperty = function (sPath: any, sEntityType: any, oMetaModel: any) {
	// if the property path has a navigation, get the target entity type of the navigation
	const sNavigationPath =
			sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
		pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
	sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
	return { sPath, pOwnerEntity, sNavigationPath };
};

const SideEffectsHelper = {
	IMMEDIATE_REQUEST: "$$ImmediateRequest",
	generateSideEffectsMapFromMetaModel(oMetaModel: any) {
		const oSideEffects: any = {};
		let allEntityTypes: any = [];
		let allSideEffectsDataArray: any = [];
		return oMetaModel
			.requestObject("/$")
			.then(function (oEverything: any) {
				const fnFilterEntityTypes = function (sKey: string) {
					return oEverything[sKey]["$kind"] === "EntityType";
				};
				// get everything --> filter the entity types which have side effects annotated
				return Object.keys(oEverything).filter(fnFilterEntityTypes);
			})
			.then((mapEntityTypes: any) => {
				allEntityTypes = mapEntityTypes;
				return (Promise as any).allSettled(
					mapEntityTypes.map((sEntityType: string) => {
						return oMetaModel.requestObject("/" + sEntityType + "@");
					})
				);
			})
			.then((entityTypesAnnotations: any) => {
				let allSideEffectsPromises: any = [];
				// loop through all entity types and filter entities having side effect annotations
				// then generate map object for all side effects found
				// also generate the promises array out of the side effect object
				entityTypesAnnotations.forEach(function (entityTypeData: any, index: any) {
					if (entityTypeData.status === "fulfilled") {
						const sEntityType = allEntityTypes[index];
						const oAnnotations = entityTypeData.value;
						Object.keys(oAnnotations)
							.filter(function (sAnnotation) {
								return sAnnotation.indexOf("@com.sap.vocabularies.Common.v1.SideEffects") > -1;
							})
							.forEach(function (sSideEffectAnnotation) {
								const sideEffectsMap = fnGetObjectToGenerateSideEffectMap(
									sEntityType,
									sSideEffectAnnotation,
									oAnnotations[sSideEffectAnnotation],
									oMetaModel
								);
								allSideEffectsDataArray = allSideEffectsDataArray.concat(sideEffectsMap);
								allSideEffectsPromises = allSideEffectsPromises.concat(sideEffectsMap.map((i: any) => i["pOwnerEntity"]));
							});
					}
				});
				return (Promise as any).allSettled(allSideEffectsPromises);
			})
			.then((allSideEffectPromisesResult: any) => {
				// when all the side effects promises have been settled(from source properties and ewntites), we generate side effects object based on side effect data objects values, like entity, sourceproperties

				allSideEffectPromisesResult.forEach((result: any, index: any) => {
					if (result.status === "fulfilled") {
						const sOwnerEntityType = result.value;
						const sideeffectDataMap = allSideEffectsDataArray[index];
						const { sEntityType, sQualifier, oSideEffectAnnotation, sPath } = sideeffectDataMap;
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
							oSideEffects[sOwnerEntityType][1][sPath].push(
								sEntityType + sQualifier + ((aSourceProperties.length === 1 && SideEffectsHelper.IMMEDIATE_REQUEST) || "")
							); // --> mappingSourceProperties
						}
					}
				});
				return oSideEffects;
			})
			.catch((e: any) => Promise.reject(e));
	}
};

export default SideEffectsHelper;
