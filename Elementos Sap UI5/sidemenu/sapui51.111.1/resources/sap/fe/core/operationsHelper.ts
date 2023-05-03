import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import Message from "sap/ui/core/message/Message";
import type Control from "sap/ui/mdc/Control";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import CommonUtils from "./CommonUtils";
import OperationsDialog from "./controllerextensions/dialog/OperationsDialog.block";
import type MessageHandler from "./controllerextensions/MessageHandler";
import messageHandling from "./controllerextensions/messageHandler/messageHandling";
import { MessageType } from "./formatters/TableFormatterTypes";
type StrictHandlingPromise = {
	resolve: Function;
	groupId: string;
	requestSideEffects?: Function;
};
type StrictHandlingParameters = {
	label: string;
	model: ODataModel;
	internalModelContext?: InternalModelContext;
	control: Control;
	requestSideEffects?: Function;
	dialog?: Dialog;
};
type OperationsHelper = {
	renderMessageView: Function;
	fnOnStrictHandlingFailed: Function;
};

export type StrictHandlingUtilities = {
	is412Executed: boolean;
	strictHandlingTransitionFails: Object[];
	strictHandlingPromises: StrictHandlingPromise[];
	strictHandlingWarningMessages: Message[];
	delaySuccessMessages: Message[];
	processedMessageIds: string[];
};

function renderMessageView(
	mParameters: StrictHandlingParameters,
	oResourceBundle: ResourceBundle,
	messageHandler: MessageHandler | undefined,
	aMessages: Message[],
	strictHandlingUtilities: StrictHandlingUtilities,
	isMultiContext412: boolean,
	resolve?: Function,
	sGroupId?: string
): unknown;
function renderMessageView(
	mParameters: StrictHandlingParameters,
	oResourceBundle: ResourceBundle,
	messageHandler: MessageHandler | undefined,
	aMessages: Message[],
	strictHandlingUtilities: StrictHandlingUtilities,
	isMultiContext412?: boolean,
	resolve?: Function,
	sGroupId?: string
) {
	const sActionName = mParameters.label;
	const oModel = mParameters.model;
	const strictHandlingPromises = strictHandlingUtilities?.strictHandlingPromises;
	let sMessage: string;
	let sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_CANCEL", oResourceBundle);
	if (aMessages.length === 1) {
		const messageText = aMessages[0].getMessage();
		const identifierText = aMessages[0].getAdditionalText();
		if (!isMultiContext412) {
			sMessage = `${messageText}\n${CommonUtils.getTranslatedText("PROCEED", oResourceBundle)}`;
		} else if (identifierText !== undefined && identifierText !== "") {
			sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP", oResourceBundle);
			const sHeaderInfoTypeName = (mParameters.control.getParent() as TableAPI).getTableDefinition().headerInfoTypeName;
			if (sHeaderInfoTypeName) {
				sMessage = `${sHeaderInfoTypeName} ${identifierText}: ${messageText}\n\n${CommonUtils.getTranslatedText(
					"C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT",
					oResourceBundle
				)}`;
			} else {
				sMessage = `${identifierText}: ${messageText}\n\n${CommonUtils.getTranslatedText(
					"C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT",
					oResourceBundle
				)}`;
			}
		} else {
			sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP", oResourceBundle);
			sMessage = `${messageText}\n\n${CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT", oResourceBundle)}`;
		}
		MessageBox.warning(sMessage, {
			title: CommonUtils.getTranslatedText("WARNING", oResourceBundle),
			actions: [sActionName, sCancelButtonTxt],
			emphasizedAction: sActionName,
			onClose: function (sAction: string) {
				if (sAction === sActionName) {
					if (!isMultiContext412) {
						resolve!(true);
						oModel.submitBatch(sGroupId!);
						if (mParameters.requestSideEffects) {
							mParameters.requestSideEffects();
						}
					} else {
						strictHandlingPromises.forEach(function (sHPromise: StrictHandlingPromise) {
							sHPromise.resolve(true);
							oModel.submitBatch(sHPromise.groupId);
							if (sHPromise.requestSideEffects) {
								sHPromise.requestSideEffects();
							}
						});
						const strictHandlingFails = strictHandlingUtilities?.strictHandlingTransitionFails;
						if (strictHandlingFails.length > 0) {
							messageHandler?.removeTransitionMessages();
						}
					}
					if (strictHandlingUtilities) {
						strictHandlingUtilities.is412Executed = true;
					}
				} else {
					if (strictHandlingUtilities) {
						strictHandlingUtilities.is412Executed = false;
					}
					if (!isMultiContext412) {
						resolve!(false);
					} else {
						strictHandlingPromises.forEach(function (sHPromise: StrictHandlingPromise) {
							sHPromise.resolve(false);
						});
					}
				}
				if (strictHandlingUtilities) {
					strictHandlingUtilities.strictHandlingWarningMessages = [];
				}
			}
		});
	} else if (aMessages.length > 1) {
		if (isMultiContext412) {
			sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP", oResourceBundle);
			const genericMessage = new Message({
				message: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_WARNING", oResourceBundle),
				type: MessageType.Warning,
				target: undefined,
				persistent: true,
				description: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_TEXT", oResourceBundle, [sActionName])
			});
			aMessages = [genericMessage].concat(aMessages);
		}
		const oMessageDialogModel = new JSONModel();
		oMessageDialogModel.setData(aMessages);
		const bStrictHandlingFlow = true;
		const oMessageObject = messageHandling.prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, isMultiContext412);
		const operationsDialog = new OperationsDialog({
			messageObject: oMessageObject,
			isMultiContext412: isMultiContext412,
			resolve: resolve,
			model: oModel,
			groupId: sGroupId,
			actionName: sActionName,
			strictHandlingUtilities: strictHandlingUtilities,
			strictHandlingPromises: strictHandlingPromises,
			messageHandler: messageHandler,
			messageDialogModel: oMessageDialogModel,
			cancelButtonTxt: sCancelButtonTxt
		});
		operationsDialog.open();
	}
}

async function fnOnStrictHandlingFailed(
	sGroupId: string,
	mParameters: StrictHandlingParameters,
	oResourceBundle: ResourceBundle,
	currentContextIndex: number | null,
	oContext: Context | null,
	iContextLength: number | null,
	messageHandler: MessageHandler | undefined,
	strictHandlingUtilities: StrictHandlingUtilities,
	a412Messages: Message[]
) {
	if ((currentContextIndex === null && iContextLength === null) || (currentContextIndex === 1 && iContextLength === 1)) {
		return new Promise(function (resolve) {
			operationsHelper.renderMessageView(
				mParameters,
				oResourceBundle,
				messageHandler,
				a412Messages,
				strictHandlingUtilities,
				false,
				resolve,
				sGroupId
			);
		});
	} else {
		const sActionName = mParameters.label;
		const a412TransitionMessages: Message[] = strictHandlingUtilities?.strictHandlingWarningMessages;
		const sColumn = (mParameters.control.getParent() as TableAPI).getIdentifierColumn();
		let sValue = "";
		if (sColumn && iContextLength && iContextLength > 1) {
			sValue = oContext && oContext.getObject(sColumn);
		}
		a412Messages.forEach(function (msg: Message) {
			msg.setType("Warning");
			msg.setAdditionalText(sValue);
			a412TransitionMessages.push(msg);
		});
		if (mParameters.dialog && mParameters.dialog.isOpen()) {
			mParameters.dialog.close();
		}
		const strictHandlingPromises = strictHandlingUtilities?.strictHandlingPromises;
		const strictHandlingPromise = new Promise(function (resolve) {
			strictHandlingPromises.push({
				groupId: sGroupId,
				resolve: resolve,
				actionName: sActionName,
				model: mParameters.model,
				value: sValue,
				requestSideEffects: mParameters.requestSideEffects
			} as StrictHandlingPromise);
		});
		strictHandlingUtilities.strictHandlingWarningMessages = a412TransitionMessages;
		strictHandlingUtilities.strictHandlingPromises = strictHandlingPromises;

		if (currentContextIndex === iContextLength) {
			operationsHelper.renderMessageView(
				mParameters,
				oResourceBundle,
				messageHandler,
				strictHandlingUtilities.strictHandlingWarningMessages,
				strictHandlingUtilities,
				true
			);
		}
		return strictHandlingPromise;
	}
}

const operationsHelper: OperationsHelper = {
	renderMessageView: renderMessageView,
	fnOnStrictHandlingFailed: fnOnStrictHandlingFailed
};

export default operationsHelper;
