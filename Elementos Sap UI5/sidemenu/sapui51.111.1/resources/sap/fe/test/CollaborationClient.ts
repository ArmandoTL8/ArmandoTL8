import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import CollaborationAPI from "sap/fe/test/api/CollaborationAPI";
import type Opa5 from "sap/ui/test/Opa5";
import OpaBuilder from "sap/ui/test/OpaBuilder";

function CollaborationClient(oPageDefinition: { appId: string; componentId: string }) {
	const sAppId = oPageDefinition.appId,
		sComponentId = oPageDefinition.componentId,
		viewId = `${sAppId}::${sComponentId}`;

	return {
		actions: {
			iEnterDraft: function (userID: string, userName: string) {
				return OpaBuilder.create(this as any as Opa5)
					.hasId(viewId)
					.do(function (view: any) {
						const oContext = view.getBindingContext();
						CollaborationAPI.enterDraft(oContext, userID, userName);
					})
					.viewId("")
					.description("Remote session entering draft")
					.execute();
			},

			iLeaveDraft: function () {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.leaveDraft();
					})
					.description("Remote session leaving draft")
					.execute();
			},

			iLockPropertyForEdition: function (sPropertyPath: string) {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.startLiveChange(sPropertyPath);
					})
					.description(`Remote session locking property ${sPropertyPath}`)
					.execute();
			},

			iUnlockPropertyForEdition: function () {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.undoChange();
					})
					.description("Remote session unlocking property ")
					.execute();
			},

			iUpdatePropertyValue: function (sPropertyPath: string, value: any) {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.updatePropertyValue(sPropertyPath, value);
					})
					.description(`Remote session updating property ${sPropertyPath} with ${value}`)
					.execute();
			},

			iDiscardDraft: function () {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.discardDraft();
					})
					.description("Remote session discarding draft")
					.execute();
			},

			iDeleteDraft: function () {
				return OpaBuilder.create(this as any as Opa5)
					.do(function () {
						CollaborationAPI.deleteDraft();
					})
					.description("Remote session deleting draft")
					.execute();
			}
		},
		assertions: {
			iCheckDefaultUserChangedValue: function (sPropertyPath: string) {
				return OpaBuilder.create(this as any as Opa5)
					.check(function () {
						return CollaborationAPI.checkReceived({
							userID: "DEFAULT_USER",
							userAction: Activity.Change,
							clientContent: sPropertyPath
						});
					})
					.description(`Remote session received change notification for${sPropertyPath} changed`)
					.execute();
			},
			iCheckDefaultUserCanceledChangedValue: function (sPropertyPath: string) {
				return OpaBuilder.create(this as any as Opa5)
					.check(function () {
						return CollaborationAPI.checkReceived({
							userID: "DEFAULT_USER",
							userAction: Activity.Undo,
							clientContent: sPropertyPath
						});
					})
					.description(`Remote session received undo change notification for${sPropertyPath}`)
					.execute();
			},
			iCheckDefaultUserLeftDraft: function () {
				return OpaBuilder.create(this as any as Opa5)
					.check(function () {
						return CollaborationAPI.checkReceived({ userID: "DEFAULT_USER", userAction: Activity.Leave });
					})
					.description("Remote session received notification on default user leaving the draft session")
					.execute();
			},

			iCheckDefaultUserEnteredDraft: function () {
				return OpaBuilder.create(this as any as Opa5)
					.check(function () {
						return CollaborationAPI.checkReceived({ userID: "DEFAULT_USER", userAction: Activity.Join });
					})
					.description("Remote session received notification on default user entering the draft session")
					.execute();
			},

			iCheckDefaultUserCreatedDocument: function (sDocumentPath?: string) {
				return OpaBuilder.create(this as any as Opa5)
					.check(function () {
						return CollaborationAPI.checkReceived({
							userID: "DEFAULT_USER",
							userAction: Activity.Create,
							clientContent: sDocumentPath
						});
					})
					.description(
						sDocumentPath
							? `Remote session received create notification for ${sDocumentPath}`
							: "Remote session received create notification"
					)
					.execute();
			}
		}
	};
}

export default CollaborationClient;
