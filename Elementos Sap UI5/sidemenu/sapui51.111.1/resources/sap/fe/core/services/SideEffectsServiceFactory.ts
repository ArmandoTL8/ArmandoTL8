import type {
	Action,
	AnnotationTerm,
	ComplexType,
	ConvertedMetadata,
	EntityType,
	NavigationProperty,
	NavigationPropertyPath,
	Property,
	PropertyPath
} from "@sap-ux/vocabularies-types";
import type { SideEffectsType as CommonSideEffectsType } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Common";
import Log from "sap/base/Log";
import type { EnvironmentCapabilities } from "sap/fe/core/converters/MetaModelConverter";
import { convertTypes } from "sap/fe/core/converters/MetaModelConverter";
import Service from "sap/ui/core/service/Service";
import ServiceFactory from "sap/ui/core/service/ServiceFactory";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { ServiceContext, V4Context } from "types/extension_types";
import { isPathExpression } from "../templating/PropertyHelper";

type SideEffectsSettings = {};

export type SideEffectsTargetEntityType = {
	$NavigationPropertyPath: string;
	$PropertyPath?: string;
};
export type SideEffectsTarget = SideEffectsTargetEntityType | string;

type SideEffectsTargetType = {
	TargetProperties: string[];
	TargetEntities: SideEffectsTargetEntityType[];
};

type BaseSideEffectsType = {
	fullyQualifiedName: string;
} & SideEffectsTargetType;

export type ActionSideEffectsType = {
	pathExpressions: SideEffectsTarget[];
	triggerActions?: string[];
};

export type ControlSideEffectsType = Partial<BaseSideEffectsType> & {
	fullyQualifiedName: string;
	SourceProperties: string[];
	sourceControlId: string;
};

export type ODataSideEffectsType = BaseSideEffectsType & {
	SourceProperties?: PropertyPath[];
	SourceEntities?: NavigationPropertyPath[];
	TriggerAction?: string;
};

export type SideEffectsType = ControlSideEffectsType | ODataSideEffectsType;

export type ODataSideEffectsEntityDictionary = Record<string, ODataSideEffectsType>;
export type ODataSideEffectsActionDictionary = Record<string, ActionSideEffectsType>;
export type ControlSideEffectsEntityDictionary = Record<string, ControlSideEffectsType>;

type SideEffectsOriginRegistry = {
	oData: {
		entities: {
			[entity: string]: Record<string, ODataSideEffectsType>;
		};
		actions: {
			[entity: string]: Record<string, ActionSideEffectsType>;
		};
	};
	control: {
		[entity: string]: Record<string, ControlSideEffectsType>;
	};
};

type ExtractorPropertyInfo = {
	property: Property;
	navigationPath?: string;
};

export class SideEffectsService extends Service<SideEffectsSettings> {
	initPromise!: Promise<SideEffectsService>;
	_oSideEffectsType!: SideEffectsOriginRegistry;
	_oCapabilities!: EnvironmentCapabilities | undefined;
	_bInitialized!: boolean;
	// !: means that we know it will be assigned before usage
	init() {
		this._oSideEffectsType = {
			oData: {
				entities: {},
				actions: {}
			},
			control: {}
		};
		this._bInitialized = false;
		this.initPromise = Promise.resolve(this);
	}

	/**
	 * Adds a SideEffects control
	 * SideEffects definition is added by a control to keep data up to date
	 * These SideEffects get limited scope compared with SideEffects coming from an OData service:
	 * - Only one SideEffects definition can be defined for the combination entity type - control Id
	 * - Only SideEffects source properties are recognized and used to trigger SideEffects
	 *
	 * Ensure the sourceControlId matches the associated SAPUI5 control ID.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sEntityType Name of the entity type
	 * @param oSideEffect SideEffects definition
	 */
	public addControlSideEffects(sEntityType: string, oSideEffect: Omit<ControlSideEffectsType, "fullyQualifiedName">): void {
		if (oSideEffect.sourceControlId) {
			const oControlSideEffect: ControlSideEffectsType = {
				...oSideEffect,
				fullyQualifiedName: `${sEntityType}/SideEffectsForControl/${oSideEffect.sourceControlId}`
			};
			const mEntityControlSideEffects = this._oSideEffectsType.control[sEntityType] || {};
			mEntityControlSideEffects[oControlSideEffect.sourceControlId] = oControlSideEffect;
			this._oSideEffectsType.control[sEntityType] = mEntityControlSideEffects;
		}
	}

	/**
	 * Executes SideEffects action.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sTriggerAction Name of the action
	 * @param oContext Context
	 * @param sGroupId The group ID to be used for the request
	 * @returns A promise that is resolved without data or with a return value context when the action call succeeded
	 */
	public executeAction(sTriggerAction: string, oContext: Context, sGroupId?: string): Promise<any> {
		const oTriggerAction = oContext.getModel().bindContext(`${sTriggerAction}(...)`, oContext);
		return oTriggerAction.execute(sGroupId || oContext.getBinding().getUpdateGroupId());
	}

	/**
	 * Gets converted OData metaModel.
	 *
	 * @private
	 * @ui5-restricted
	 * @returns Converted OData metaModel
	 */
	public getConvertedMetaModel(): ConvertedMetadata {
		const oContext = this.getContext();
		const oComponent = oContext.scopeObject;
		const oMetaModel: ODataMetaModel = oComponent.getModel().getMetaModel();
		return convertTypes(oMetaModel, this._oCapabilities);
	}

	/**
	 * Gets the entity type of a context.
	 *
	 * @function
	 * @name getEntityTypeFromContext
	 * @param oContext Context
	 * @returns Entity Type
	 */
	public getEntityTypeFromContext(oContext: Context): string | undefined {
		const oMetaModel = (oContext as V4Context).getModel().getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
			sEntityType = oMetaModel.getObject(sMetaPath)["$Type"];
		return sEntityType;
	}

	/**
	 * Gets the SideEffects that come from an OData service.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sEntityTypeName Name of the entity type
	 * @returns SideEffects dictionary
	 */
	public getODataEntitySideEffects(sEntityTypeName: string): Record<string, ODataSideEffectsType> {
		return this._oSideEffectsType.oData.entities[sEntityTypeName] || {};
	}

	/**
	 * Gets the global SideEffects that come from an OData service.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sEntityTypeName Name of the entity type
	 * @returns Global SideEffects
	 */
	public getGlobalODataEntitySideEffects(sEntityTypeName: string): ODataSideEffectsType[] {
		const mEntitySideEffects = this.getODataEntitySideEffects(sEntityTypeName);
		const aGlobalSideEffects: ODataSideEffectsType[] = [];
		for (const key in mEntitySideEffects) {
			const oEntitySideEffects = mEntitySideEffects[key];
			if (!oEntitySideEffects.SourceEntities && !oEntitySideEffects.SourceProperties) {
				aGlobalSideEffects.push(oEntitySideEffects);
			}
		}
		return aGlobalSideEffects;
	}

	/**
	 * Gets the SideEffects that come from an OData service.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sActionName Name of the action
	 * @param oContext Context
	 * @returns SideEffects definition
	 */
	public getODataActionSideEffects(sActionName: string, oContext?: Context): ActionSideEffectsType | undefined {
		if (oContext) {
			const sEntityType = this.getEntityTypeFromContext(oContext);
			if (sEntityType) {
				return this._oSideEffectsType.oData.actions[sEntityType]?.[sActionName];
			}
		}
		return undefined;
	}

	/**
	 * Generates the dictionary for the SideEffects.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oCapabilities The current capabilities
	 */
	public initializeSideEffects(oCapabilities?: EnvironmentCapabilities): void {
		this._oCapabilities = oCapabilities;
		if (!this._bInitialized) {
			const oConvertedMetaModel = this.getConvertedMetaModel();
			oConvertedMetaModel.entityTypes.forEach((entityType: EntityType) => {
				this._oSideEffectsType.oData.entities[entityType.fullyQualifiedName] = this._retrieveODataEntitySideEffects(entityType);
				this._oSideEffectsType.oData.actions[entityType.fullyQualifiedName] = this._retrieveODataActionsSideEffects(entityType); // only bound actions are analyzed since unbound ones don't get SideEffects
			});
			this._bInitialized = true;
		}
	}

	/**
	 * Removes all SideEffects related to a control.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sControlId Control Id
	 */
	public removeControlSideEffects(sControlId: string): void {
		Object.keys(this._oSideEffectsType.control).forEach((sEntityType) => {
			if (this._oSideEffectsType.control[sEntityType][sControlId]) {
				delete this._oSideEffectsType.control[sEntityType][sControlId];
			}
		});
	}

	/**
	 * Request SideEffects on a specific context.
	 *
	 * @function
	 * @name requestSideEffects
	 * @param aPathExpressions Targets of SideEffects to be executed
	 * @param oContext Context where SideEffects need to be executed
	 * @param sGroupId The group ID to be used for the request
	 * @returns Promise on SideEffects request
	 */
	public async requestSideEffects(aPathExpressions: SideEffectsTarget[], oContext: Context, sGroupId?: string | undefined): Promise<any> {
		this._logRequest(aPathExpressions, oContext);
		return oContext.requestSideEffects(aPathExpressions as object[], sGroupId);
	}

	public requestSideEffectsForODataAction(sideEffects: ActionSideEffectsType, oContext: Context): Promise<any> {
		let aPromises: Promise<any>[];

		if (sideEffects.triggerActions?.length) {
			aPromises = sideEffects.triggerActions.map((sTriggerActionName) => {
				return this.executeAction(sTriggerActionName, oContext);
			});
		} else {
			aPromises = [];
		}

		if (sideEffects.pathExpressions?.length) {
			aPromises.push(this.requestSideEffects(sideEffects.pathExpressions, oContext));
		}

		return aPromises.length ? Promise.all(aPromises) : Promise.resolve();
	}

	/**
	 * Request SideEffects for a navigation property on a specific context.
	 *
	 * @function
	 * @name requestSideEffectsForNavigationProperty
	 * @param sNavigationProperty Navigation property
	 * @param oContext Context where SideEffects need to be executed
	 * @returns SideEffects request on SAPUI5 context
	 */
	public requestSideEffectsForNavigationProperty(sNavigationProperty: string, oContext: Context): Promise<any> {
		const sBaseEntityType = this.getEntityTypeFromContext(oContext);
		if (sBaseEntityType) {
			const sNavigationPath = `${sNavigationProperty}/`;
			const aSideEffects = this.getODataEntitySideEffects(sBaseEntityType);
			let targetProperties: string[] = [];
			let targetEntities: SideEffectsTargetEntityType[] = [];
			let sideEffectsTargets: SideEffectsTarget[] = [];
			Object.keys(aSideEffects)
				.filter(
					// Keep relevant SideEffects
					(sAnnotationName) => {
						const oSideEffects: ODataSideEffectsType = aSideEffects[sAnnotationName];
						return (
							(oSideEffects.SourceProperties || []).some((oPropertyPath) => {
								const sPropertyPath = oPropertyPath.value;
								return (
									sPropertyPath.startsWith(sNavigationPath) &&
									sPropertyPath.replace(sNavigationPath, "").indexOf("/") === -1
								);
							}) ||
							(oSideEffects.SourceEntities || []).some(
								(oNavigationPropertyPath) => oNavigationPropertyPath.value === sNavigationProperty
							)
						);
					}
				)
				.forEach((sAnnotationName) => {
					const oSideEffects: ODataSideEffectsType = aSideEffects[sAnnotationName];
					if (oSideEffects.TriggerAction) {
						this.executeAction(oSideEffects.TriggerAction, oContext);
					}
					targetProperties = targetProperties.concat(oSideEffects.TargetProperties);
					targetEntities = targetEntities.concat(oSideEffects.TargetEntities);
				});
			// Remove duplicate targets
			const sideEffectsTargetDefinition = this._removeDuplicateTargets(targetProperties, targetEntities);
			sideEffectsTargets = [...sideEffectsTargetDefinition.TargetProperties, ...sideEffectsTargetDefinition.TargetEntities];
			if (sideEffectsTargets.length > 0) {
				return this.requestSideEffects(sideEffectsTargets, oContext).catch((oError) =>
					Log.error(`SideEffects - Error while processing SideEffects for Navigation Property ${sNavigationProperty}`, oError)
				);
			}
		}
		return Promise.resolve();
	}

	/**
	 * Gets the SideEffects that come from controls.
	 *
	 * @private
	 * @ui5-restricted
	 * @param sEntityTypeName Entity type Name
	 * @returns SideEffects dictionary
	 */
	public getControlEntitySideEffects(sEntityTypeName: string): Record<string, ControlSideEffectsType> {
		return this._oSideEffectsType.control[sEntityTypeName] || {};
	}

	/**
	 * Adds the text properties required for SideEffects
	 * If a property has an associated text then this text needs to be added as targetProperties or targetEntities.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oSideEffect SideEffects definition
	 * @param mEntityType Entity type
	 * @returns SideEffects definition with added text properties
	 */
	private _addRequiredTextProperties(oSideEffect: BaseSideEffectsType, mEntityType: EntityType): BaseSideEffectsType {
		const aInitialProperties: string[] = oSideEffect.TargetProperties,
			aEntitiesRequested: string[] = oSideEffect.TargetEntities.map((navigation) => navigation.$NavigationPropertyPath);
		let aDerivedProperties: ExtractorPropertyInfo[] = [];

		aInitialProperties.forEach((sPropertyPath) => {
			const bIsStarProperty = sPropertyPath.endsWith("*"), // Can be '*' or '.../navProp/*'
				sNavigationPropertyPath: string = sPropertyPath.substring(0, sPropertyPath.lastIndexOf("/")),
				sRelativePath = sNavigationPropertyPath ? `${sNavigationPropertyPath}/` : "",
				mTarget = mEntityType.resolvePath(sNavigationPropertyPath) || mEntityType;

			// mTarget can be an entity type, navigationProperty or or a complexType
			const aTargetEntityProperties: Property[] =
				(mTarget as EntityType).entityProperties ||
				((mTarget as Property).targetType as ComplexType)?.properties ||
				(mTarget as NavigationProperty).targetType.entityProperties;
			if (aTargetEntityProperties) {
				if (bIsStarProperty) {
					// Add all required properties behind the *
					aEntitiesRequested.push(sNavigationPropertyPath);
					aDerivedProperties = aDerivedProperties.concat(
						aTargetEntityProperties.map((mProperty) => {
							return {
								navigationPath: sRelativePath,
								property: mProperty
							};
						})
					);
				} else {
					aDerivedProperties.push({
						property: aTargetEntityProperties.find(
							(mProperty) => mProperty.name === sPropertyPath.split("/").pop()
						) as Property,
						navigationPath: sRelativePath
					});
				}
			} else {
				Log.info(`SideEffects - The entity type associated to property path ${sPropertyPath} cannot be resolved`);
			}
		});

		aDerivedProperties.forEach((mPropertyInfo) => {
			const textAnnotation = mPropertyInfo.property?.annotations?.Common?.Text;
			if (textAnnotation && isPathExpression(textAnnotation)) {
				const sTargetTextPath = textAnnotation.path,
					sTextPathFromInitialEntity = mPropertyInfo.navigationPath + sTargetTextPath,
					sTargetCollectionPath = sTextPathFromInitialEntity.substring(0, sTextPathFromInitialEntity.lastIndexOf("/"));
				/**
				 * The property Text must be added only if the property is
				 * - not part of a star property (.i.e '*' or 'navigation/*') or a targeted Entity
				 * - not include into the initial targeted properties of SideEffects
				 *  Indeed in the two listed cases, the property containing text will be/is requested by initial SideEffects configuration.
				 */

				if (
					sTargetTextPath &&
					aEntitiesRequested.indexOf(sTargetCollectionPath) === -1 &&
					aInitialProperties.indexOf(sTextPathFromInitialEntity) === -1
				) {
					// The Text association is added as TargetEntities if it's contained on a different entitySet and not a complexType
					// Otherwise it's added as targetProperties
					if (
						sTargetTextPath.lastIndexOf("/") > -1 &&
						mEntityType.resolvePath(sTargetCollectionPath)?._type === "NavigationProperty"
					) {
						oSideEffect.TargetEntities.push({ $NavigationPropertyPath: sTargetCollectionPath });
						aEntitiesRequested.push(sTargetCollectionPath);
					} else {
						oSideEffect.TargetProperties.push(sTextPathFromInitialEntity);
					}
				}
			}
		});

		return oSideEffect;
	}
	/**
	 * Converts SideEffects to expected format
	 *  - Converts SideEffects targets to expected format
	 *  - Removes binding parameter from SideEffects targets properties
	 *  - Adds the text properties
	 *  - Replaces TargetProperties having reference to Source Properties for a SideEffects.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oSideEffects SideEffects definition
	 * @param mEntityType Entity type
	 * @param sBindingParameter Name of the binding parameter
	 * @returns SideEffects definition
	 */
	private _convertSideEffects(
		oSideEffects: CommonSideEffectsType,
		mEntityType: EntityType,
		sBindingParameter?: string
	): ODataSideEffectsType {
		const oTempSideEffects = this._removeBindingParameter(this._convertTargetsFormat(oSideEffects), sBindingParameter);
		return this._addRequiredTextProperties(oTempSideEffects, mEntityType);
	}

	/**
	 * Converts SideEffects targets (TargetEntities and TargetProperties) to expected format
	 *  - TargetProperties as array of string
	 *  - TargetEntities as array of object with property $NavigationPropertyPath.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oSideEffects SideEffects definition
	 * @returns Converted SideEffects
	 */
	private _convertTargetsFormat(oSideEffects: CommonSideEffectsType): BaseSideEffectsType {
		const TargetProperties: string[] = ((oSideEffects.TargetProperties || []) as (string | PropertyPath)[]).reduce(
				(aTargetProperties: string[], vTarget) => {
					const sTarget = ((vTarget as PropertyPath).type && (vTarget as PropertyPath).value) || (vTarget as string);
					if (sTarget) {
						aTargetProperties.push(sTarget);
					} else {
						Log.error(
							`SideEffects - Error while processing TargetProperties for SideEffects${oSideEffects.fullyQualifiedName}`
						);
					}
					return aTargetProperties;
				},
				[]
			),
			TargetEntities: SideEffectsTargetEntityType[] = (oSideEffects.TargetEntities || []).map((mTargetEntity) => {
				return { $NavigationPropertyPath: mTargetEntity.value || "" };
			});
		return { ...oSideEffects, ...{ TargetProperties, TargetEntities } };
	}

	/**
	 * Gets SideEffects related to an entity type or action that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action
	 * and to convert these SideEffects with expected format.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oSource Entity type or action
	 * @returns Array of SideEffects
	 */
	private _getSideEffectsFromSource(oSource: EntityType | Action): ODataSideEffectsType[] {
		const aSideEffects: ODataSideEffectsType[] = [];
		const mEntityType: EntityType | undefined = oSource._type === "EntityType" ? oSource : oSource.sourceEntityType;
		if (mEntityType) {
			const mCommonAnnotation = oSource.annotations?.Common || ({} as Record<string, AnnotationTerm<any>>);
			const mBindingParameter = ((oSource as Action).parameters || []).find(
				(mParameter) => mParameter.type === mEntityType.fullyQualifiedName
			);
			const sBindingParameter = mBindingParameter ? mBindingParameter.fullyQualifiedName.split("/")[1] : "";
			Object.keys(mCommonAnnotation)
				.filter((sAnnotationName) => mCommonAnnotation[sAnnotationName].$Type === CommonAnnotationTypes.SideEffectsType)
				.forEach((sAnnotationName) => {
					aSideEffects.push(
						this._convertSideEffects(
							mCommonAnnotation[sAnnotationName] as CommonSideEffectsType,
							mEntityType,
							sBindingParameter
						)
					);
				});
		}
		return aSideEffects;
	}

	/**
	 * Logs SideEffects request.
	 *
	 * @private
	 * @ui5-restricted
	 * @param aPathExpressions SideEffects targets
	 * @param oContext Context
	 */
	private _logRequest(aPathExpressions: SideEffectsTarget[], oContext: Context) {
		const sTargetPaths = aPathExpressions.reduce(function (sPaths, mTarget) {
			return `${sPaths}\n\t\t${(mTarget as SideEffectsTargetEntityType).$NavigationPropertyPath || mTarget || ""}`;
		}, "");
		Log.debug(`SideEffects - Request:\n\tContext path : ${oContext.getPath()}\n\tProperty paths :${sTargetPaths}`);
	}

	/**
	 * Removes name of binding parameter on SideEffects targets.
	 *
	 * @private
	 * @ui5-restricted
	 * @param oSideEffects SideEffects definition
	 * @param sBindingParameterName Name of binding parameter
	 * @returns SideEffects definition
	 */
	private _removeBindingParameter(oSideEffects: BaseSideEffectsType, sBindingParameterName?: string): BaseSideEffectsType {
		if (sBindingParameterName) {
			const replaceBindingParameter = function (value: string) {
				return value.replace(new RegExp(`^${sBindingParameterName}/?`), "");
			};

			oSideEffects.TargetProperties = oSideEffects.TargetProperties.map((targetProperty) => replaceBindingParameter(targetProperty));
			oSideEffects.TargetEntities = oSideEffects.TargetEntities.map((targetEntity) => {
				return { $NavigationPropertyPath: replaceBindingParameter(targetEntity.$NavigationPropertyPath) };
			});
		}
		return oSideEffects;
	}

	/**
	 * Remove duplicates in SideEffects targets.
	 *
	 * @private
	 * @ui5-restricted
	 * @param targetProperties SideEffects TargetProperties
	 * @param targetEntities SideEffects TargetEntities
	 * @returns SideEffects targets without duplicates
	 */
	private _removeDuplicateTargets(targetProperties: string[], targetEntities: SideEffectsTargetEntityType[]): SideEffectsTargetType {
		const uniqueTargetedEntitiesPath = new Set<string>([]);
		const uniqueTargetProperties = new Set<string>(targetProperties);
		const uniqueTargetedEntities = targetEntities.filter((targetEntity) => {
			const navigationPath = targetEntity.$NavigationPropertyPath;
			if (!uniqueTargetedEntitiesPath.has(navigationPath)) {
				uniqueTargetedEntitiesPath.add(navigationPath);
				return true;
			}
			return false;
		});

		return { TargetProperties: Array.from(uniqueTargetProperties), TargetEntities: uniqueTargetedEntities };
	}

	/**
	 * Gets SideEffects action type that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects on actions
	 * related to a specific entity type and to convert these SideEffects with
	 * expected format.
	 *
	 * @private
	 * @ui5-restricted
	 * @param entityType Entity type
	 * @returns Entity type SideEffects dictionary
	 */
	private _retrieveODataActionsSideEffects(entityType: EntityType): Record<string, ActionSideEffectsType> {
		const sideEffects: Record<string, ActionSideEffectsType> = {};
		const actions = entityType.actions;
		if (actions) {
			Object.keys(actions).forEach((actionName) => {
				const action = entityType.actions[actionName];
				const triggerActions = new Set<string>();
				let targetProperties: string[] = [];
				let targetEntities: SideEffectsTargetEntityType[] = [];

				this._getSideEffectsFromSource(action).forEach((oDataSideEffect) => {
					const triggerAction = oDataSideEffect.TriggerAction;
					targetProperties = targetProperties.concat(oDataSideEffect.TargetProperties);
					targetEntities = targetEntities.concat(oDataSideEffect.TargetEntities);
					if (triggerAction) {
						triggerActions.add(triggerAction);
					}
				});
				const sideEffectsTargets = this._removeDuplicateTargets(targetProperties, targetEntities);
				sideEffects[actionName] = {
					pathExpressions: [...sideEffectsTargets.TargetProperties, ...sideEffectsTargets.TargetEntities],
					triggerActions: Array.from(triggerActions)
				};
			});
		}
		return sideEffects;
	}

	/**
	 * Gets SideEffects entity type that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects
	 * related to a specific entity type and to convert these SideEffects with
	 * expected format.
	 *
	 * @private
	 * @ui5-restricted
	 * @param mEntityType Entity type
	 * @returns Entity type SideEffects dictionary
	 */
	private _retrieveODataEntitySideEffects(mEntityType: EntityType): Record<string, ODataSideEffectsType> {
		const oEntitySideEffects: Record<string, ODataSideEffectsType> = {};
		this._getSideEffectsFromSource(mEntityType).forEach((oSideEffects) => {
			oEntitySideEffects[oSideEffects.fullyQualifiedName] = oSideEffects;
		});
		return oEntitySideEffects;
	}

	getInterface(): SideEffectsService {
		return this;
	}
}

class SideEffectsServiceFactory extends ServiceFactory<SideEffectsSettings> {
	createInstance(oServiceContext: ServiceContext<SideEffectsSettings>): Promise<SideEffectsService> {
		const SideEffectsServiceService = new SideEffectsService(oServiceContext);
		return SideEffectsServiceService.initPromise;
	}
}

export default SideEffectsServiceFactory;
