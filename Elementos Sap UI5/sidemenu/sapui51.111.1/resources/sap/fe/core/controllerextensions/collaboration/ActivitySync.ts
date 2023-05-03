import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import {
	broadcastCollaborationMessage,
	endCollaboration,
	initializeCollaboration,
	isCollaborationConnected
} from "sap/fe/core/controllerextensions/collaboration/ActivityBase";
import type { Message, User, UserActivity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { Activity, CollaborationUtils } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import MessageBox from "sap/m/MessageBox";
import type Control from "sap/ui/core/Control";
import type View from "sap/ui/core/mvc/View";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { V4Context } from "types/extension_types";

const MYACTIVITY = "/collaboration/myActivity";
const ACTIVEUSERS = "/collaboration/activeUsers";
const ACTIVITIES = "/collaboration/activities";
const SYNCGROUPID = "$auto.sync";

export const isConnected = function (control: Control): boolean {
	const internalModel = control.getModel("internal") as JSONModel;
	return isCollaborationConnected(internalModel);
};

export const send = function (
	control: Control,
	action: Activity,
	content: string | string[] | undefined,
	triggeredActionName?: string | undefined
) {
	if (isConnected(control)) {
		const internalModel = control.getModel("internal") as JSONModel;
		const clientContent = Array.isArray(content) ? content.join("|") : content;

		const myActivity = internalModel.getProperty(MYACTIVITY);
		if (action === Activity.LiveChange) {
			// To avoid unnecessary traffic we keep track of live changes and send it only once

			if (myActivity === clientContent) {
				return;
			} else {
				internalModel.setProperty(MYACTIVITY, clientContent);
			}
		} else {
			// No need to send an Undo message if there's no current activity
			if (action === Activity.Undo && myActivity === null) {
				return;
			}

			// user finished the activity
			internalModel.setProperty(MYACTIVITY, null);
		}

		broadcastCollaborationMessage(action, clientContent, internalModel, triggeredActionName);
	}
};

const getWebSocketBaseURL = function (bindingContext: V4Context): string {
	return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
};

export const isCollaborationEnabled = function (view: View): boolean {
	const bindingContext = view?.getBindingContext && (view.getBindingContext() as V4Context);
	return !!(bindingContext && getWebSocketBaseURL(bindingContext));
};

export const connect = async function (view: View) {
	const internalModel = view.getModel("internal") as JSONModel;
	const me = CollaborationUtils.getMe(view);

	// Retrieving ME from shell service
	if (!me) {
		// no me = no shell = not sure what to do
		return;
	}

	const bindingContext = view.getBindingContext() as V4Context;
	const webSocketBaseURL = getWebSocketBaseURL(bindingContext);
	const serviceUrl = bindingContext.getModel().getServiceUrl();

	if (!webSocketBaseURL) {
		return;
	}

	const sDraftUUID = await bindingContext.requestProperty("DraftAdministrativeData/DraftUUID");
	if (!sDraftUUID) {
		return;
	}

	initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, (message: Message) => {
		messageReceive(message, view);
	});
};

export const disconnect = function (control: Control) {
	const internalModel = control.getModel("internal") as JSONModel;
	endCollaboration(internalModel);
};

function messageReceive(message: Message, view: View) {
	const internalModel: any = view.getModel("internal");
	let activeUsers: User[] = internalModel.getProperty(ACTIVEUSERS);
	let activities: UserActivity[];
	let activityKey: string;
	const metaPath = calculateMetaPath(view, message.clientContent);
	message.userAction = message.userAction || message.clientAction;

	const sender: User = {
		id: message.userID,
		name: message.userDescription,
		initials: CollaborationUtils.formatInitials(message.userDescription),
		color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
	};

	let mactivity: UserActivity = sender;

	// eslint-disable-next-line default-case
	switch (message.userAction) {
		case Activity.Join:
		case Activity.JoinEcho:
			if (activeUsers.findIndex((user) => user.id === sender.id) === -1) {
				activeUsers.unshift(sender);
				internalModel.setProperty(ACTIVEUSERS, activeUsers);
			}

			if (message.userAction === Activity.Join) {
				// we echo our existence to the newly entered user and also send the current activity if there is any
				broadcastCollaborationMessage(Activity.JoinEcho, internalModel.getProperty(MYACTIVITY), internalModel);
			}

			if (message.userAction === Activity.JoinEcho) {
				if (message.clientContent) {
					// another user was already typing therefore I want to see his activity immediately. Calling me again as a live change
					message.userAction = Activity.LiveChange;
					messageReceive(message, view);
				}
			}

			break;
		case Activity.Leave:
			// Removing the active user. Not removing "me" if I had the screen open in another session
			activeUsers = activeUsers.filter((user) => user.id !== sender.id || user.me);
			internalModel.setProperty(ACTIVEUSERS, activeUsers);
			const allActivities = internalModel.getProperty(ACTIVITIES) || {};
			const removeUserActivities = function (bag: any) {
				if (Array.isArray(bag)) {
					return bag.filter((activity) => activity.id !== sender.id);
				} else {
					for (const p in bag) {
						bag[p] = removeUserActivities(bag[p]);
					}
					return bag;
				}
			};
			removeUserActivities(allActivities);
			internalModel.setProperty(ACTIVITIES, allActivities);
			break;

		case Activity.Change:
			const metaPaths = message?.clientContent?.split("|").map((path) => {
				return (view.getModel().getMetaModel() as ODataMetaModel).getMetaPath(path);
			});

			metaPaths.forEach((currentMetaPath, i) => {
				const nesteedMessage = {
					...message,
					clientContent: message?.clientContent?.split("|")[i]
				};
				let currentActivities: any[] = internalModel.getProperty(ACTIVITIES + currentMetaPath) || [];
				activityKey = getActivityKey(nesteedMessage.clientContent);
				currentActivities = currentActivities?.filter && currentActivities.filter((activity) => activity.key !== activityKey);
				if (currentActivities) {
					internalModel.setProperty(ACTIVITIES + currentMetaPath, currentActivities);
					update(view, nesteedMessage, currentMetaPath, Activity.Change);
				}
			});
			break;
		case Activity.Create:
			// For create we actually just need to refresh the table
			update(view, message, metaPath, Activity.Create);
			break;
		case Activity.Delete:
			// For now also refresh the page but in case of deletion we need to inform the user
			update(view, message, metaPath, Activity.Delete);
			break;
		case Activity.Activate:
			draftClosedByOtherUser(view, message, CollaborationUtils.getText("C_COLLABORATIONDRAFT_ACTIVATE", sender.name));
			break;
		case Activity.Discard:
			draftClosedByOtherUser(view, message, CollaborationUtils.getText("C_COLLABORATIONDRAFT_DISCARD", sender.name));
			break;

		case Activity.Action:
			update(view, message, metaPath, Activity.Action);
			break;

		case Activity.LiveChange:
			mactivity = sender;
			mactivity.key = getActivityKey(message.clientContent);

			// stupid JSON model...
			let initJSONModel: string = "";
			const parts = metaPath.split("/");
			for (let i = 1; i < parts.length - 1; i++) {
				initJSONModel += `/${parts[i]}`;
				if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
					internalModel.setProperty(ACTIVITIES + initJSONModel, {});
				}
			}

			activities = internalModel.getProperty(ACTIVITIES + metaPath);
			activities = activities?.slice ? activities.slice() : [];
			activities.push(mactivity);
			internalModel.setProperty(ACTIVITIES + metaPath, activities);
			break;
		case Activity.Undo:
			// The user did a change but reverted it, therefore unblock the control
			activities = internalModel.getProperty(ACTIVITIES + metaPath);
			activityKey = getActivityKey(message.clientContent);
			internalModel.setProperty(
				ACTIVITIES + metaPath,
				activities.filter((a) => a.key !== activityKey)
			);
			break;
	}
}

function draftClosedByOtherUser(view: View, message: Message, text: string) {
	disconnect(view);
	MessageBox.information(text);
	(view.getBindingContext() as V4Context)
		.getBinding()
		.resetChanges()
		.then(function () {
			navigate(message.clientContent, view);
		})
		.catch(function () {
			Log.error("Pending Changes could not be reset - still navigating to active instance");
			navigate(message.clientContent, view);
		});
}

function update(view: View, message: Message, metaPath: string, action: Activity) {
	const appComponent = CollaborationUtils.getAppComponent(view);
	const metaModel = view.getModel().getMetaModel() as ODataMetaModel;
	const currentPage = getCurrentPage(view);
	const sideEffectsService = appComponent.getSideEffectsService();
	const currentContext = currentPage.getBindingContext();
	const currentPath = currentContext.getPath();
	const currentMetaPath = metaModel.getMetaPath(currentPath);
	let changedDocument = message.clientContent;

	if (action === Activity.Delete) {
		// check if user currently displays one deleted object
		const deletedObjects = message.clientContent.split("|");
		const parentDeletedIndex = deletedObjects.findIndex((deletedObject) => currentPath.startsWith(deletedObject));
		if (parentDeletedIndex > -1) {
			// any other user deleted the object I'm currently looking at. Inform the user we will navigate to root now
			MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DELETE", message.userDescription), {
				onClose: function () {
					const targetContext = view.getModel().bindContext(deletedObjects[parentDeletedIndex]).getBoundContext();
					currentPage.getController()._routing.navigateBackFromContext(targetContext);
				}
			});
		}
		// TODO: For now just take the first object to get the meta path and do a full refresh of the table
		changedDocument = deletedObjects[0];
	}

	if (action === Activity.Action) {
		const actionName = message.clientTriggeredActionName,
			bindingParameters = sideEffectsService.getODataActionSideEffects(actionName!, currentContext),
			targetPaths = bindingParameters?.pathExpressions;
		if (targetPaths && targetPaths.length > 0) {
			sideEffectsService.requestSideEffects(targetPaths, currentContext, SYNCGROUPID);
		}
	}

	if (changedDocument.startsWith(currentPath)) {
		// Execute SideEffects (TODO for Meet there should be one central method)
		const activityPath = metaPath.replace(currentMetaPath, "").slice(1);
		if (activityPath) {
			// Request also the property itself
			const sideEffects: any[] = [
				{
					$PropertyPath: activityPath
				}
			];
			const entityType = sideEffectsService.getEntityTypeFromContext(currentContext);
			const entityTypeSideEffects = sideEffectsService.getODataEntitySideEffects(entityType!);
			// Poor man solution without checking source targets, just for POC, this is throw-way coding only
			const object: any = Object; // just to overcome TS issues, will be anyway replaced
			const relevantSideEffects = object.fromEntries(
				object
					.entries(entityTypeSideEffects)
					.filter((x: any[]) => x[1].SourceProperties?.findIndex((source: any) => source.value === activityPath) > -1)
			);
			for (const p in relevantSideEffects) {
				relevantSideEffects[p].TargetProperties.forEach(function (targetProperty: any) {
					sideEffects.push({
						$PropertyPath: targetProperty
					});
				});
			}
			sideEffectsService.requestSideEffects(sideEffects, currentContext, SYNCGROUPID);
		}
	}

	// Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
	currentPage.getController().editFlow.updateDocument(currentContext, Promise.resolve());
}

function navigate(path: string, view: View) {
	// TODO: routing.navigate doesn't consider semantic bookmarking
	const currentPage = getCurrentPage(view);
	const targetContext = view.getModel().bindContext(path).getBoundContext();
	currentPage.getController().routing.navigate(targetContext);
}

function getCurrentPage(view: View) {
	const appComponent = CollaborationUtils.getAppComponent(view);
	return CommonUtils.getCurrentPageView(appComponent);
}

function getActivityKey(x: string): string {
	return x.substring(x.lastIndexOf("(") + 1, x.lastIndexOf(")"));
}

/**
 * Calculates the metapath from one or more data path(s).
 *
 * @param view The current view
 * @param path One ore more data path(s), in case of multiple paths separated by '|'
 * @returns The calculated metaPath
 */
function calculateMetaPath(view: View, path?: string): string {
	let metaPath = "";
	if (path) {
		// in case more than one path is sent all of them have to use the same metapath therefore we just consider the first one
		const dataPath = path.split("|")[0];
		metaPath = (view.getModel().getMetaModel() as ODataMetaModel).getMetaPath(dataPath);
	}
	return metaPath;
}

export default {
	connect: connect,
	disconnect: disconnect,
	isConnected: isConnected,
	isCollaborationEnabled: isCollaborationEnabled,
	send: send
};
