import type ResourceBundle from "sap/base/i18n/ResourceBundle";

import AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import draft, { SiblingInformation } from "sap/fe/core/controllerextensions/editFlow/draft";
import type MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";

import CheckBox from "sap/m/CheckBox";
import MessageToast from "sap/m/MessageToast";
import Text from "sap/m/Text";

import TableAPI from "sap/fe/macros/table/TableAPI";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Table from "sap/ui/mdc/Table";
import Context from "sap/ui/model/odata/v4/Context";
import type { V4Context } from "types/extension_types";
import { InternalModelContext } from "./ModelHelper";

export enum DeleteOptionTypes {
	deletableContexts = "deletableContexts",
	draftsWithDeletableActive = "draftsWithDeletableActive",
	createModeContexts = "createModeContexts",
	unSavedContexts = "unSavedContexts",
	draftsWithNonDeletableActive = "draftsWithNonDeletableActive"
}

export enum DeleteDialogContentControl {
	CHECKBOX = "checkBox",
	TEXT = "text"
}

export type DraftSiblingPair = {
	draft: V4Context;
	siblingInfo: SiblingInformation;
};

export type DeleteOption = {
	type: DeleteOptionTypes;
	contexts: V4Context[];
	selected: boolean;
	text?: string;
	control?: DeleteDialogContentControl;
};

export type ModelObjectProperties = {
	deletableContexts: V4Context[];
	unSavedContexts: V4Context[];
	createModeContexts: V4Context[];
	draftsWithNonDeletableActive: V4Context[];
	lockedContexts: V4Context[];
	draftsWithDeletableActive: DraftSiblingPair[];
	deleteEnabled: boolean;
};

export type DraftAdministrativeDataType = {
	DraftUUID: string;
	InProcessByUser?: string;
	InProcessByUserDescription?: string;
	CreatedByUserDescription?: string;
	CreatedByUser?: string;
	LastChangedByUserDescription?: string;
	LastChangedByUser?: string;
};

export type DeleteParameters = {
	internalModelContext: InternalModelContext;
	numberOfSelectedContexts: number;
	entitySetName: string;
	parentControl: Control;
	description: { path: string };
	beforeDeleteCallBack: Function;
	deletableContexts: V4Context[];
	unSavedContexts: V4Context[];
	createModeContexts: V4Context[];
	draftsWithNonDeletableActive: V4Context[];
	lockedContexts: V4Context[];
	draftsWithDeletableActive: DraftSiblingPair[];
};

export type DeleteTextInfo = {
	infoTxt?: string;
	optionTxt?: string;
	optionWithoutTxt?: boolean;
};

function getUpdatedSelections(
	internalModelContext: InternalModelContext,
	type: DeleteOptionTypes,
	selectedContexts: V4Context[],
	contextsToRemove: V4Context[]
): V4Context[] {
	contextsToRemove.forEach((context: V4Context) => {
		const idx = selectedContexts.indexOf(context);
		if (idx !== -1) {
			selectedContexts.splice(idx, 1);
		}
	});
	internalModelContext.setProperty(type, []);

	return [...selectedContexts];
}

function clearSelectedContextsForOption(internalModelContext: InternalModelContext, option: DeleteOption) {
	let selectedContexts = (internalModelContext.getProperty("selectedContexts") as V4Context[]) || [];

	if (option.type === DeleteOptionTypes.deletableContexts) {
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.deletableContexts,
			selectedContexts,
			internalModelContext.getProperty(DeleteOptionTypes.deletableContexts) || []
		);
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.createModeContexts,
			selectedContexts,
			internalModelContext.getProperty(DeleteOptionTypes.createModeContexts) || []
		);

		const draftSiblingPairs = internalModelContext.getProperty(DeleteOptionTypes.draftsWithDeletableActive) || [];
		const drafts = draftSiblingPairs.map((contextPair: DraftSiblingPair) => {
			return contextPair.draft;
		});
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.draftsWithDeletableActive,
			selectedContexts,
			drafts
		);
	} else {
		const contextsToRemove = internalModelContext.getProperty(option.type) || [];
		selectedContexts = getUpdatedSelections(internalModelContext, option.type, selectedContexts, contextsToRemove);
	}
	internalModelContext.setProperty("selectedContexts", selectedContexts);
	internalModelContext.setProperty("numberOfSelectedContexts", selectedContexts.length);
}

function afterDeleteProcess(parameters: DeleteParameters, options: DeleteOption[], contexts: V4Context[], oResourceBundle: ResourceBundle) {
	const { internalModelContext, entitySetName } = parameters;
	if (internalModelContext) {
		if (internalModelContext.getProperty("deleteEnabled") != undefined) {
			options.forEach((option) => {
				// if an option is selected, then it is deleted. So, we need to remove them from selected contexts.
				if (option.selected) {
					clearSelectedContextsForOption(internalModelContext, option);
				}
			});
		}
		// if atleast one of the options is not selected, then the delete button needs to be enabled.
		internalModelContext.setProperty(
			"deleteEnabled",
			options.some((option) => !option.selected)
		);
	}

	if (contexts.length === 1) {
		MessageToast.show(
			CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", oResourceBundle, undefined, entitySetName)
		);
	} else {
		MessageToast.show(
			CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", oResourceBundle, undefined, entitySetName)
		);
	}
}

function getLockedContextUser(lockedContext: V4Context): string {
	const draftAdminData = lockedContext.getObject()["DraftAdministrativeData"] as DraftAdministrativeDataType;
	return (draftAdminData && draftAdminData["InProcessByUser"]) || "";
}

function getLockedObjectsText(oResourceBundle: ResourceBundle, numberOfSelectedContexts: number, lockedContexts: V4Context[]): string {
	let retTxt = "";

	if (numberOfSelectedContexts === 1 && lockedContexts.length === 1) {
		//only one unsaved object
		const lockedUser = getLockedContextUser(lockedContexts[0]);
		retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", oResourceBundle, [
			lockedUser
		]);
	} else if (lockedContexts.length == 1) {
		const lockedUser = getLockedContextUser(lockedContexts[0]);
		retTxt = CommonUtils.getTranslatedText(
			"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED",
			oResourceBundle,
			[numberOfSelectedContexts, lockedUser]
		);
	} else if (lockedContexts.length > 1) {
		retTxt = CommonUtils.getTranslatedText(
			"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED",
			oResourceBundle,
			[lockedContexts.length, numberOfSelectedContexts]
		);
	}

	return retTxt;
}

function getNonDeletableActivesOfDraftsText(oResourceBundle: ResourceBundle, numberOfDrafts: number, totalDeletable: number): string {
	let retTxt = "";

	if (totalDeletable === numberOfDrafts) {
		if (numberOfDrafts === 1) {
			retTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFT_OF_NON_DELETABLE_ACTIVE",
				oResourceBundle
			);
		} else {
			retTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFTS_OF_NON_DELETABLE_ACTIVE",
				oResourceBundle
			);
		}
	} else if (numberOfDrafts === 1) {
		retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFT_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
	} else {
		retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFTS_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
	}

	return retTxt;
}

function getUnSavedContextUser(unSavedContext: V4Context): string {
	const draftAdminData = unSavedContext.getObject()["DraftAdministrativeData"] as DraftAdministrativeDataType;
	let sLastChangedByUser = "";
	if (draftAdminData) {
		sLastChangedByUser = draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
	}

	return sLastChangedByUser;
}

function getUnsavedContextsText(
	oResourceBundle: ResourceBundle,
	numberOfSelectedContexts: number,
	unSavedContexts: V4Context[],
	totalDeletable: number
): DeleteTextInfo {
	let infoTxt = "",
		optionTxt = "",
		optionWithoutTxt = false;
	if (numberOfSelectedContexts === 1 && unSavedContexts.length === 1) {
		//only one unsaved object are selected
		const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
		infoTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", oResourceBundle, [
			lastChangedByUser
		]);
		optionWithoutTxt = true;
	} else if (numberOfSelectedContexts === unSavedContexts.length) {
		//only multiple unsaved objects are selected
		infoTxt = CommonUtils.getTranslatedText(
			"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS",
			oResourceBundle
		);
		optionWithoutTxt = true;
	} else if (totalDeletable === unSavedContexts.length) {
		// non-deletable/locked exists, all deletable are unsaved by others
		if (unSavedContexts.length === 1) {
			const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
			infoTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR",
				oResourceBundle,
				[lastChangedByUser]
			);
		} else {
			infoTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL",
				oResourceBundle
			);
		}
		optionWithoutTxt = true;
	} else if (totalDeletable > unSavedContexts.length) {
		// non-deletable/locked exists, deletable include unsaved and other types.
		if (unSavedContexts.length === 1) {
			const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
			optionTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR",
				oResourceBundle,
				[lastChangedByUser]
			);
		} else {
			optionTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL",
				oResourceBundle
			);
		}
	}

	return { infoTxt, optionTxt, optionWithoutTxt };
}

function getNonDeletableText(mParameters: DeleteParameters, totalNumDeletableContexts: number, oResourceBundle: ResourceBundle): string {
	const { numberOfSelectedContexts, lockedContexts, draftsWithNonDeletableActive } = mParameters;
	const nonDeletableContexts =
		numberOfSelectedContexts - (lockedContexts.length + totalNumDeletableContexts - draftsWithNonDeletableActive.length);
	let retTxt = "";

	if (
		nonDeletableContexts > 0 &&
		(totalNumDeletableContexts === 0 || draftsWithNonDeletableActive.length === totalNumDeletableContexts)
	) {
		// 1. None of the ccontexts are deletable
		// 2. Only drafts of non deletable contexts exist.
		if (lockedContexts.length > 0) {
			// Locked contexts exist
			if (nonDeletableContexts === 1) {
				retTxt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_SINGULAR",
					oResourceBundle,
					undefined
				);
			} else {
				retTxt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_PLURAL",
					oResourceBundle,
					undefined
				);
			}
		} else if (nonDeletableContexts === 1) {
			// Only pure non-deletable contexts exist single
			retTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_AND_ONE_OBJECT_NON_DELETABLE",
				oResourceBundle,
				undefined
			);
		} else {
			// Only pure non-deletable contexts exist multiple
			retTxt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_MULTIPLE_AND_ALL_OBJECT_NON_DELETABLE",
				oResourceBundle,
				undefined
			);
		}
	} else if (nonDeletableContexts === 1) {
		// deletable and non-deletable exists together, single
		retTxt = CommonUtils.getTranslatedText(
			"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE",
			oResourceBundle,
			[numberOfSelectedContexts]
		);
	} else if (nonDeletableContexts > 1) {
		// deletable and non-deletable exists together, multiple
		retTxt = CommonUtils.getTranslatedText(
			"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE",
			oResourceBundle,
			[nonDeletableContexts, numberOfSelectedContexts]
		);
	}

	return retTxt;
}

function getConfirmedDeletableContext(contexts: V4Context[], options: DeleteOption[]): V4Context[] {
	return options.reduce((result, option) => {
		return option.selected ? result.concat(option.contexts) : result;
	}, contexts);
}

function updateDraftOptionsForDeletableTexts(
	mParameters: DeleteParameters,
	vContexts: V4Context[],
	totalDeletable: number,
	oResourceBundle: ResourceBundle,
	items: Control[],
	options: DeleteOption[]
) {
	const {
		numberOfSelectedContexts,
		draftsWithDeletableActive,
		unSavedContexts,
		createModeContexts,
		lockedContexts,
		draftsWithNonDeletableActive
	} = mParameters;
	let nonDeletableContextText = "",
		lockedContextsTxt = "";

	// drafts with active
	if (draftsWithDeletableActive.length > 0) {
		draftsWithDeletableActive.forEach((deletableDraftInfo: DraftSiblingPair) => {
			vContexts.push(deletableDraftInfo.siblingInfo.targetContext);
		});
	}

	// create mode drafts
	if (createModeContexts.length > 0) {
		// create mode drafts
		createModeContexts.forEach((context) => vContexts.push(context));
	}

	// items locked msg
	if (lockedContexts.length > 0) {
		lockedContextsTxt = deleteHelper.getLockedObjectsText(oResourceBundle, numberOfSelectedContexts, lockedContexts) || "";
		items.push(new Text({ text: lockedContextsTxt }));
	}

	// non deletable msg
	if (numberOfSelectedContexts != totalDeletable - draftsWithNonDeletableActive.length + lockedContexts.length) {
		nonDeletableContextText = deleteHelper.getNonDeletableText(mParameters, totalDeletable, oResourceBundle);
		items.push(new Text({ text: nonDeletableContextText }));
	}

	// option: unsaved changes by others
	if (unSavedContexts.length > 0) {
		const unsavedChangesTxts =
			deleteHelper.getUnsavedContextsText(oResourceBundle, numberOfSelectedContexts, unSavedContexts, totalDeletable) || {};
		if (unsavedChangesTxts.infoTxt) {
			items.push(new Text({ text: unsavedChangesTxts.infoTxt }));
		}
		if (unsavedChangesTxts.optionTxt || unsavedChangesTxts.optionWithoutTxt) {
			options.push({
				type: DeleteOptionTypes.unSavedContexts,
				contexts: unSavedContexts,
				text: unsavedChangesTxts.optionTxt,
				selected: true,
				control: DeleteDialogContentControl.CHECKBOX
			});
		}
	}

	// option: drafts with active not deletable
	if (draftsWithNonDeletableActive.length > 0) {
		const nonDeletableActivesOfDraftsText =
			deleteHelper.getNonDeletableActivesOfDraftsText(oResourceBundle, draftsWithNonDeletableActive.length, totalDeletable) || "";
		if (nonDeletableActivesOfDraftsText) {
			options.push({
				type: DeleteOptionTypes.draftsWithNonDeletableActive,
				contexts: draftsWithNonDeletableActive,
				text: nonDeletableActivesOfDraftsText,
				selected: true,
				control: totalDeletable > 0 ? DeleteDialogContentControl.CHECKBOX : DeleteDialogContentControl.TEXT
			});
		}
	}
}

function updateContentForDeleteDialog(options: DeleteOption[], items: Control[]) {
	if (options.length === 1) {
		// Single option doesn't need checkBox
		const option = options[0];
		if (option.text) {
			items.push(new Text({ text: option.text }));
		}
	} else if (options.length > 1) {
		// Multiple Options

		// Texts
		options.forEach((option: DeleteOption) => {
			if (option.control === "text" && option.text) {
				items.push(new Text({ text: option.text }));
			}
		});
		// CheckBoxs
		options.forEach((option: DeleteOption) => {
			if (option.control === "checkBox" && option.text) {
				items.push(
					new CheckBox({
						text: option.text,
						selected: true,
						select: function (oEvent: Event) {
							const checkBox = oEvent.getSource() as CheckBox;
							const selected = checkBox.getSelected();
							option.selected = selected;
						}
					})
				);
			}
		});
	}
}

function updateOptionsForDeletableTexts(
	mParameters: DeleteParameters,
	directDeletableContexts: V4Context[],
	oResourceBundle: ResourceBundle,
	options: DeleteOption[]
) {
	const {
		numberOfSelectedContexts,
		entitySetName,
		parentControl,
		description,
		lockedContexts,
		draftsWithNonDeletableActive,
		unSavedContexts
	} = mParameters;
	const totalDeletable = directDeletableContexts.length + draftsWithNonDeletableActive.length + unSavedContexts.length;
	const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalDeletable - draftsWithNonDeletableActive.length);

	if (numberOfSelectedContexts === 1 && numberOfSelectedContexts === directDeletableContexts.length) {
		// single deletable context
		const oLineContextData = directDeletableContexts[0].getObject();
		const oTable = parentControl as Table;
		const sKey = oTable && (oTable.getParent() as TableAPI).getIdentifierColumn();
		let txt;
		let aParams = [];
		if (sKey) {
			const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
			const sDescription = description && description.path ? oLineContextData[description.path] : undefined;
			if (sKeyValue) {
				if (sDescription && description && sKey !== description.path) {
					aParams = [sKeyValue + " ", sDescription];
				} else {
					aParams = [sKeyValue, ""];
				}
				txt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
					oResourceBundle,
					aParams,
					entitySetName
				);
			} else if (sKeyValue) {
				aParams = [sKeyValue, ""];
				txt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
					oResourceBundle,
					aParams,
					entitySetName
				);
			} else {
				txt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
					oResourceBundle,
					undefined,
					entitySetName
				);
			}
		} else {
			txt = CommonUtils.getTranslatedText(
				"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
				oResourceBundle,
				undefined,
				entitySetName
			);
		}
		options.push({
			type: DeleteOptionTypes.deletableContexts,
			contexts: directDeletableContexts,
			text: txt,
			selected: true,
			control: DeleteDialogContentControl.TEXT
		});
	} else if (
		unSavedContexts.length !== totalDeletable &&
		numberOfSelectedContexts > 0 &&
		(directDeletableContexts.length > 0 || (unSavedContexts.length > 0 && draftsWithNonDeletableActive.length > 0))
	) {
		if (numberOfSelectedContexts > directDeletableContexts.length && nonDeletableContexts + lockedContexts.length > 0) {
			// other types exists with pure deletable ones
			let deletableOptionTxt = "";
			if (totalDeletable === 1) {
				deletableOptionTxt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE",
					oResourceBundle,
					undefined,
					entitySetName
				);
			} else {
				deletableOptionTxt = CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE",
					oResourceBundle,
					undefined,
					entitySetName
				);
			}
			options.unshift({
				type: DeleteOptionTypes.deletableContexts,
				contexts: directDeletableContexts,
				text: deletableOptionTxt,
				selected: true,
				control: DeleteDialogContentControl.TEXT
			});
		} else {
			// only deletable
			const allDeletableTxt =
				totalDeletable === 1
					? CommonUtils.getTranslatedText(
							"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
							oResourceBundle,
							undefined,
							entitySetName
					  )
					: CommonUtils.getTranslatedText(
							"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL",
							oResourceBundle,
							undefined,
							entitySetName
					  );
			options.push({
				type: DeleteOptionTypes.deletableContexts,
				contexts: directDeletableContexts,
				text: allDeletableTxt,
				selected: true,
				control: DeleteDialogContentControl.TEXT
			});
		}
	}
}

async function deleteConfirmHandler(
	options: DeleteOption[],
	mParameters: DeleteParameters,
	messageHandler: MessageHandler,
	oResourceBundle: ResourceBundle,
	appComponent: AppComponent,
	draftEnabled: boolean
) {
	try {
		const contexts = deleteHelper.getConfirmedDeletableContext([], options);
		const { beforeDeleteCallBack, parentControl } = mParameters;
		if (beforeDeleteCallBack) {
			await beforeDeleteCallBack({ contexts: contexts });
		}

		if (contexts && contexts.length) {
			try {
				await Promise.all(
					contexts.map(function (context: V4Context) {
						if (draftEnabled && !context.getProperty("IsActiveEntity")) {
							//delete the draft
							const enableStrictHandling = contexts.length === 1 ? true : false;
							return draft.deleteDraft(context, appComponent, enableStrictHandling);
						}
						return context.delete();
					})
				);
				deleteHelper.afterDeleteProcess(mParameters, options, contexts, oResourceBundle);
			} catch (error) {
				await messageHandler.showMessageDialog({ control: parentControl });
				// re-throw error to enforce rejecting the general promise
				throw error;
			}
		}
	} catch (oError) {
		await messageHandler.showMessages();
		// re-throw error to enforce rejecting the general promise
		throw oError;
	}
}

// Table Runtime Helpers:

/* refreshes data in internal model relevant for enablement of delete button according to selected contexts
relevant data are: deletableContexts, draftsWithDeletableActive, draftsWithNonDeletableActive, createModeContexts, unSavedContexts, deleteEnabled
not relevant: lockedContexts
*/
async function updateDeleteInfoForSelectedContexts(internalModelContext: InternalModelContext, selectedContexts: Context[]) {
	type contextInfo = {
		context: Context;
		siblingPromise: Promise<SiblingInformation | undefined | void>;
		siblingInfo: SiblingInformation | undefined;
		isDraftRoot: boolean;
		isDraftNode: boolean;
		isActive: boolean;
		hasActive: boolean;
		hasDraft: boolean;
		locked: boolean;
		deletable: boolean;
		siblingDeletable: boolean;
	};
	const contextInfos = selectedContexts.map((context) => {
		// assuming metaContext is the same for all contexts, still not relying on this assumption
		const metaContext = context.getModel().getMetaModel().getMetaContext(context.getCanonicalPath());
		const deletablePath = metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable/$Path");
		const staticDeletable =
			!deletablePath && metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable") !== false;
		// default values according to non-draft case (sticky behaves the same as non-draft from UI point of view regarding deletion)
		const info: contextInfo = {
			context: context,
			isDraftRoot: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftRoot"),
			isDraftNode: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftNode"),
			isActive: true,
			hasActive: false,
			hasDraft: false,
			locked: false,
			deletable: deletablePath ? context.getProperty(deletablePath) : staticDeletable,
			siblingPromise: Promise.resolve(undefined),
			siblingInfo: undefined,
			siblingDeletable: false
		};

		if (info.isDraftRoot) {
			info.locked = !!context.getObject("DraftAdministrativeData")?.InProcessByUser;
			info.hasDraft = context.getProperty("HasDraftEntity");
		}
		if (info.isDraftRoot || info.isDraftNode) {
			info.isActive = context.getProperty("IsActiveEntity");
			info.hasActive = context.getProperty("HasActiveEntity");
			if (!info.isActive && info.hasActive) {
				// get sibling contexts
				// draft.computeSiblingInformation expects draft root as first parameter - if we are on a subnode, this is not given
				// - done wrong also above, but seems not to break anything
				// - why is draft.computeSiblingInformation not able to calculate draft root on its own?!
				// - and why is it not able to deal with contexts not draft enabled (of course they never have a sibling - could just return undefined)
				info.siblingPromise = draft.computeSiblingInformation(context, context).then(async (siblingInformation) => {
					// For draftWithDeletableActive bucket, currently also siblingInformation is put into internalModel and used
					// from there in case of deletion. Therefore, sibling needs to be retrieved in case of staticDeletable.
					// Possible improvement: Only read siblingInfo here if needed for determination of delete button enablement,
					// in other cases, read it only if deletion really happens.
					info.siblingInfo = siblingInformation;
					if (deletablePath) {
						info.siblingDeletable = await siblingInformation?.targetContext?.requestProperty(deletablePath);
					} else {
						info.siblingDeletable = staticDeletable;
					}
				});
			}
		}
		return info;
	});
	// wait for all siblingPromises. If no sibling exists, promise is resolved to undefined (but it's still a promise)
	await Promise.all(contextInfos.map((info) => info.siblingPromise));

	const buckets = [
		{
			key: "draftsWithDeletableActive",
			// only for draft root: In that case, the delete request needs to be sent for the active (i.e. the sibling),
			// while in draft node, the delete request needs to be send for the draft itself
			value: contextInfos.filter((info) => info.isDraftRoot && !info.isActive && info.hasActive && info.siblingDeletable)
		},
		{
			key: "draftsWithNonDeletableActive",
			value: contextInfos.filter((info) => !info.isActive && info.hasActive && !info.siblingDeletable)
		},
		{ key: "lockedContexts", value: contextInfos.filter((info) => info.isDraftRoot && info.isActive && info.hasDraft && info.locked) },
		{
			key: "unSavedContexts",
			value: contextInfos.filter((info) => info.isDraftRoot && info.isActive && info.hasDraft && !info.locked)
		},
		// non-draft/sticky and deletable
		// active draft root without any draft and deletable
		// created draft root (regardless of deletable)
		// draft node without active (regardless whether root is create or edit, and regardless of deletable)
		// draft node with deletable active
		{
			key: "deletableContexts",
			value: contextInfos.filter(
				(info) =>
					(!info.isDraftRoot && !info.isDraftNode && info.deletable) ||
					(info.isDraftRoot && info.isActive && !info.hasDraft && info.deletable) ||
					(info.isDraftRoot && !info.isActive && !info.hasActive) ||
					(info.isDraftNode && !info.isActive && !info.hasActive) ||
					(info.isDraftNode && !info.isActive && info.hasActive && info.siblingDeletable)
			)
		}
	];

	for (const { key, value } of buckets) {
		internalModelContext.setProperty(
			key,
			// Currently, bucket draftsWithDeletableActive has a different structure (containing also sibling information, which is used
			// in case of deletion). Possible improvement: Read sibling information only when needed, and build all buckets with same
			// structure. However, in that case siblingInformation might need to be read twice (if already needed for button enablement),
			// thus a buffer probably would make sense.
			value.map((info) =>
				key === "draftsWithDeletableActive" ? { draft: info.context, siblingInfo: info.siblingInfo } : info.context
			)
		);
	}
}

const deleteHelper = {
	getNonDeletableText,
	deleteConfirmHandler,
	updateOptionsForDeletableTexts,
	updateContentForDeleteDialog,
	updateDraftOptionsForDeletableTexts,
	getConfirmedDeletableContext,
	getLockedObjectsText,
	getUnsavedContextsText,
	getNonDeletableActivesOfDraftsText,
	afterDeleteProcess,

	updateDeleteInfoForSelectedContexts
};

export default deleteHelper;
