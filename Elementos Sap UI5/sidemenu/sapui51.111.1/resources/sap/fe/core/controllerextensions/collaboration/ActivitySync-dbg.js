/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/m/MessageBox"], function (Log, CommonUtils, ActivityBase, CollaborationCommon, MessageBox) {
  "use strict";

  var _exports = {};
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var Activity = CollaborationCommon.Activity;
  var isCollaborationConnected = ActivityBase.isCollaborationConnected;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  const MYACTIVITY = "/collaboration/myActivity";
  const ACTIVEUSERS = "/collaboration/activeUsers";
  const ACTIVITIES = "/collaboration/activities";
  const SYNCGROUPID = "$auto.sync";
  const isConnected = function (control) {
    const internalModel = control.getModel("internal");
    return isCollaborationConnected(internalModel);
  };
  _exports.isConnected = isConnected;
  const send = function (control, action, content, triggeredActionName) {
    if (isConnected(control)) {
      const internalModel = control.getModel("internal");
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
  _exports.send = send;
  const getWebSocketBaseURL = function (bindingContext) {
    return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
  };
  const isCollaborationEnabled = function (view) {
    const bindingContext = (view === null || view === void 0 ? void 0 : view.getBindingContext) && view.getBindingContext();
    return !!(bindingContext && getWebSocketBaseURL(bindingContext));
  };
  _exports.isCollaborationEnabled = isCollaborationEnabled;
  const connect = async function (view) {
    const internalModel = view.getModel("internal");
    const me = CollaborationUtils.getMe(view);

    // Retrieving ME from shell service
    if (!me) {
      // no me = no shell = not sure what to do
      return;
    }
    const bindingContext = view.getBindingContext();
    const webSocketBaseURL = getWebSocketBaseURL(bindingContext);
    const serviceUrl = bindingContext.getModel().getServiceUrl();
    if (!webSocketBaseURL) {
      return;
    }
    const sDraftUUID = await bindingContext.requestProperty("DraftAdministrativeData/DraftUUID");
    if (!sDraftUUID) {
      return;
    }
    initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, message => {
      messageReceive(message, view);
    });
  };
  _exports.connect = connect;
  const disconnect = function (control) {
    const internalModel = control.getModel("internal");
    endCollaboration(internalModel);
  };
  _exports.disconnect = disconnect;
  function messageReceive(message, view) {
    var _message$clientConten, _activities;
    const internalModel = view.getModel("internal");
    let activeUsers = internalModel.getProperty(ACTIVEUSERS);
    let activities;
    let activityKey;
    const metaPath = calculateMetaPath(view, message.clientContent);
    message.userAction = message.userAction || message.clientAction;
    const sender = {
      id: message.userID,
      name: message.userDescription,
      initials: CollaborationUtils.formatInitials(message.userDescription),
      color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
    };
    let mactivity = sender;

    // eslint-disable-next-line default-case
    switch (message.userAction) {
      case Activity.Join:
      case Activity.JoinEcho:
        if (activeUsers.findIndex(user => user.id === sender.id) === -1) {
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
        activeUsers = activeUsers.filter(user => user.id !== sender.id || user.me);
        internalModel.setProperty(ACTIVEUSERS, activeUsers);
        const allActivities = internalModel.getProperty(ACTIVITIES) || {};
        const removeUserActivities = function (bag) {
          if (Array.isArray(bag)) {
            return bag.filter(activity => activity.id !== sender.id);
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
        const metaPaths = message === null || message === void 0 ? void 0 : (_message$clientConten = message.clientContent) === null || _message$clientConten === void 0 ? void 0 : _message$clientConten.split("|").map(path => {
          return view.getModel().getMetaModel().getMetaPath(path);
        });
        metaPaths.forEach((currentMetaPath, i) => {
          var _message$clientConten2, _currentActivities;
          const nesteedMessage = {
            ...message,
            clientContent: message === null || message === void 0 ? void 0 : (_message$clientConten2 = message.clientContent) === null || _message$clientConten2 === void 0 ? void 0 : _message$clientConten2.split("|")[i]
          };
          let currentActivities = internalModel.getProperty(ACTIVITIES + currentMetaPath) || [];
          activityKey = getActivityKey(nesteedMessage.clientContent);
          currentActivities = ((_currentActivities = currentActivities) === null || _currentActivities === void 0 ? void 0 : _currentActivities.filter) && currentActivities.filter(activity => activity.key !== activityKey);
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
        let initJSONModel = "";
        const parts = metaPath.split("/");
        for (let i = 1; i < parts.length - 1; i++) {
          initJSONModel += `/${parts[i]}`;
          if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
            internalModel.setProperty(ACTIVITIES + initJSONModel, {});
          }
        }
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activities = (_activities = activities) !== null && _activities !== void 0 && _activities.slice ? activities.slice() : [];
        activities.push(mactivity);
        internalModel.setProperty(ACTIVITIES + metaPath, activities);
        break;
      case Activity.Undo:
        // The user did a change but reverted it, therefore unblock the control
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activityKey = getActivityKey(message.clientContent);
        internalModel.setProperty(ACTIVITIES + metaPath, activities.filter(a => a.key !== activityKey));
        break;
    }
  }
  function draftClosedByOtherUser(view, message, text) {
    disconnect(view);
    MessageBox.information(text);
    view.getBindingContext().getBinding().resetChanges().then(function () {
      navigate(message.clientContent, view);
    }).catch(function () {
      Log.error("Pending Changes could not be reset - still navigating to active instance");
      navigate(message.clientContent, view);
    });
  }
  function update(view, message, metaPath, action) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    const metaModel = view.getModel().getMetaModel();
    const currentPage = getCurrentPage(view);
    const sideEffectsService = appComponent.getSideEffectsService();
    const currentContext = currentPage.getBindingContext();
    const currentPath = currentContext.getPath();
    const currentMetaPath = metaModel.getMetaPath(currentPath);
    let changedDocument = message.clientContent;
    if (action === Activity.Delete) {
      // check if user currently displays one deleted object
      const deletedObjects = message.clientContent.split("|");
      const parentDeletedIndex = deletedObjects.findIndex(deletedObject => currentPath.startsWith(deletedObject));
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
        bindingParameters = sideEffectsService.getODataActionSideEffects(actionName, currentContext),
        targetPaths = bindingParameters === null || bindingParameters === void 0 ? void 0 : bindingParameters.pathExpressions;
      if (targetPaths && targetPaths.length > 0) {
        sideEffectsService.requestSideEffects(targetPaths, currentContext, SYNCGROUPID);
      }
    }
    if (changedDocument.startsWith(currentPath)) {
      // Execute SideEffects (TODO for Meet there should be one central method)
      const activityPath = metaPath.replace(currentMetaPath, "").slice(1);
      if (activityPath) {
        // Request also the property itself
        const sideEffects = [{
          $PropertyPath: activityPath
        }];
        const entityType = sideEffectsService.getEntityTypeFromContext(currentContext);
        const entityTypeSideEffects = sideEffectsService.getODataEntitySideEffects(entityType);
        // Poor man solution without checking source targets, just for POC, this is throw-way coding only
        const object = Object; // just to overcome TS issues, will be anyway replaced
        const relevantSideEffects = object.fromEntries(object.entries(entityTypeSideEffects).filter(x => {
          var _x$1$SourceProperties;
          return ((_x$1$SourceProperties = x[1].SourceProperties) === null || _x$1$SourceProperties === void 0 ? void 0 : _x$1$SourceProperties.findIndex(source => source.value === activityPath)) > -1;
        }));
        for (const p in relevantSideEffects) {
          relevantSideEffects[p].TargetProperties.forEach(function (targetProperty) {
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
  function navigate(path, view) {
    // TODO: routing.navigate doesn't consider semantic bookmarking
    const currentPage = getCurrentPage(view);
    const targetContext = view.getModel().bindContext(path).getBoundContext();
    currentPage.getController().routing.navigate(targetContext);
  }
  function getCurrentPage(view) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    return CommonUtils.getCurrentPageView(appComponent);
  }
  function getActivityKey(x) {
    return x.substring(x.lastIndexOf("(") + 1, x.lastIndexOf(")"));
  }

  /**
   * Calculates the metapath from one or more data path(s).
   *
   * @param view The current view
   * @param path One ore more data path(s), in case of multiple paths separated by '|'
   * @returns The calculated metaPath
   */
  function calculateMetaPath(view, path) {
    let metaPath = "";
    if (path) {
      // in case more than one path is sent all of them have to use the same metapath therefore we just consider the first one
      const dataPath = path.split("|")[0];
      metaPath = view.getModel().getMetaModel().getMetaPath(dataPath);
    }
    return metaPath;
  }
  return {
    connect: connect,
    disconnect: disconnect,
    isConnected: isConnected,
    isCollaborationEnabled: isCollaborationEnabled,
    send: send
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNWUFDVElWSVRZIiwiQUNUSVZFVVNFUlMiLCJBQ1RJVklUSUVTIiwiU1lOQ0dST1VQSUQiLCJpc0Nvbm5lY3RlZCIsImNvbnRyb2wiLCJpbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWQiLCJzZW5kIiwiYWN0aW9uIiwiY29udGVudCIsInRyaWdnZXJlZEFjdGlvbk5hbWUiLCJjbGllbnRDb250ZW50IiwiQXJyYXkiLCJpc0FycmF5Iiwiam9pbiIsIm15QWN0aXZpdHkiLCJnZXRQcm9wZXJ0eSIsIkFjdGl2aXR5IiwiTGl2ZUNoYW5nZSIsInNldFByb3BlcnR5IiwiVW5kbyIsImJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlIiwiZ2V0V2ViU29ja2V0QmFzZVVSTCIsImJpbmRpbmdDb250ZXh0IiwiZ2V0TWV0YU1vZGVsIiwiZ2V0T2JqZWN0IiwiaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCIsInZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsImNvbm5lY3QiLCJtZSIsIkNvbGxhYm9yYXRpb25VdGlscyIsImdldE1lIiwid2ViU29ja2V0QmFzZVVSTCIsInNlcnZpY2VVcmwiLCJnZXRTZXJ2aWNlVXJsIiwic0RyYWZ0VVVJRCIsInJlcXVlc3RQcm9wZXJ0eSIsImluaXRpYWxpemVDb2xsYWJvcmF0aW9uIiwibWVzc2FnZSIsIm1lc3NhZ2VSZWNlaXZlIiwiZGlzY29ubmVjdCIsImVuZENvbGxhYm9yYXRpb24iLCJhY3RpdmVVc2VycyIsImFjdGl2aXRpZXMiLCJhY3Rpdml0eUtleSIsIm1ldGFQYXRoIiwiY2FsY3VsYXRlTWV0YVBhdGgiLCJ1c2VyQWN0aW9uIiwiY2xpZW50QWN0aW9uIiwic2VuZGVyIiwiaWQiLCJ1c2VySUQiLCJuYW1lIiwidXNlckRlc2NyaXB0aW9uIiwiaW5pdGlhbHMiLCJmb3JtYXRJbml0aWFscyIsImNvbG9yIiwiZ2V0VXNlckNvbG9yIiwibWFjdGl2aXR5IiwiSm9pbiIsIkpvaW5FY2hvIiwiZmluZEluZGV4IiwidXNlciIsInVuc2hpZnQiLCJMZWF2ZSIsImZpbHRlciIsImFsbEFjdGl2aXRpZXMiLCJyZW1vdmVVc2VyQWN0aXZpdGllcyIsImJhZyIsImFjdGl2aXR5IiwicCIsIkNoYW5nZSIsIm1ldGFQYXRocyIsInNwbGl0IiwibWFwIiwicGF0aCIsImdldE1ldGFQYXRoIiwiZm9yRWFjaCIsImN1cnJlbnRNZXRhUGF0aCIsImkiLCJuZXN0ZWVkTWVzc2FnZSIsImN1cnJlbnRBY3Rpdml0aWVzIiwiZ2V0QWN0aXZpdHlLZXkiLCJrZXkiLCJ1cGRhdGUiLCJDcmVhdGUiLCJEZWxldGUiLCJBY3RpdmF0ZSIsImRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIiLCJnZXRUZXh0IiwiRGlzY2FyZCIsIkFjdGlvbiIsImluaXRKU09OTW9kZWwiLCJwYXJ0cyIsImxlbmd0aCIsInNsaWNlIiwicHVzaCIsImEiLCJ0ZXh0IiwiTWVzc2FnZUJveCIsImluZm9ybWF0aW9uIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsInRoZW4iLCJuYXZpZ2F0ZSIsImNhdGNoIiwiTG9nIiwiZXJyb3IiLCJhcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJtZXRhTW9kZWwiLCJjdXJyZW50UGFnZSIsImdldEN1cnJlbnRQYWdlIiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiY3VycmVudENvbnRleHQiLCJjdXJyZW50UGF0aCIsImdldFBhdGgiLCJjaGFuZ2VkRG9jdW1lbnQiLCJkZWxldGVkT2JqZWN0cyIsInBhcmVudERlbGV0ZWRJbmRleCIsImRlbGV0ZWRPYmplY3QiLCJzdGFydHNXaXRoIiwib25DbG9zZSIsInRhcmdldENvbnRleHQiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsImdldENvbnRyb2xsZXIiLCJfcm91dGluZyIsIm5hdmlnYXRlQmFja0Zyb21Db250ZXh0IiwiYWN0aW9uTmFtZSIsImNsaWVudFRyaWdnZXJlZEFjdGlvbk5hbWUiLCJiaW5kaW5nUGFyYW1ldGVycyIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJ0YXJnZXRQYXRocyIsInBhdGhFeHByZXNzaW9ucyIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImFjdGl2aXR5UGF0aCIsInJlcGxhY2UiLCJzaWRlRWZmZWN0cyIsIiRQcm9wZXJ0eVBhdGgiLCJlbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwiZW50aXR5VHlwZVNpZGVFZmZlY3RzIiwiZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyIsIm9iamVjdCIsIk9iamVjdCIsInJlbGV2YW50U2lkZUVmZmVjdHMiLCJmcm9tRW50cmllcyIsImVudHJpZXMiLCJ4IiwiU291cmNlUHJvcGVydGllcyIsInNvdXJjZSIsInZhbHVlIiwiVGFyZ2V0UHJvcGVydGllcyIsInRhcmdldFByb3BlcnR5IiwiZWRpdEZsb3ciLCJ1cGRhdGVEb2N1bWVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwicm91dGluZyIsIkNvbW1vblV0aWxzIiwiZ2V0Q3VycmVudFBhZ2VWaWV3Iiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJkYXRhUGF0aCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQWN0aXZpdHlTeW5jLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHtcblx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UsXG5cdGVuZENvbGxhYm9yYXRpb24sXG5cdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uLFxuXHRpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWRcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UsIFVzZXIsIFVzZXJBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCB7IEFjdGl2aXR5LCBDb2xsYWJvcmF0aW9uVXRpbHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuY29uc3QgTVlBQ1RJVklUWSA9IFwiL2NvbGxhYm9yYXRpb24vbXlBY3Rpdml0eVwiO1xuY29uc3QgQUNUSVZFVVNFUlMgPSBcIi9jb2xsYWJvcmF0aW9uL2FjdGl2ZVVzZXJzXCI7XG5jb25zdCBBQ1RJVklUSUVTID0gXCIvY29sbGFib3JhdGlvbi9hY3Rpdml0aWVzXCI7XG5jb25zdCBTWU5DR1JPVVBJRCA9IFwiJGF1dG8uc3luY1wiO1xuXG5leHBvcnQgY29uc3QgaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiAoY29udHJvbDogQ29udHJvbCk6IGJvb2xlYW4ge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gY29udHJvbC5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0cmV0dXJuIGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZChpbnRlcm5hbE1vZGVsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kID0gZnVuY3Rpb24gKFxuXHRjb250cm9sOiBDb250cm9sLFxuXHRhY3Rpb246IEFjdGl2aXR5LFxuXHRjb250ZW50OiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcblx0dHJpZ2dlcmVkQWN0aW9uTmFtZT86IHN0cmluZyB8IHVuZGVmaW5lZFxuKSB7XG5cdGlmIChpc0Nvbm5lY3RlZChjb250cm9sKSkge1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSBjb250cm9sLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRcdGNvbnN0IGNsaWVudENvbnRlbnQgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gY29udGVudC5qb2luKFwifFwiKSA6IGNvbnRlbnQ7XG5cblx0XHRjb25zdCBteUFjdGl2aXR5ID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShNWUFDVElWSVRZKTtcblx0XHRpZiAoYWN0aW9uID09PSBBY3Rpdml0eS5MaXZlQ2hhbmdlKSB7XG5cdFx0XHQvLyBUbyBhdm9pZCB1bm5lY2Vzc2FyeSB0cmFmZmljIHdlIGtlZXAgdHJhY2sgb2YgbGl2ZSBjaGFuZ2VzIGFuZCBzZW5kIGl0IG9ubHkgb25jZVxuXG5cdFx0XHRpZiAobXlBY3Rpdml0eSA9PT0gY2xpZW50Q29udGVudCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KE1ZQUNUSVZJVFksIGNsaWVudENvbnRlbnQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBObyBuZWVkIHRvIHNlbmQgYW4gVW5kbyBtZXNzYWdlIGlmIHRoZXJlJ3Mgbm8gY3VycmVudCBhY3Rpdml0eVxuXHRcdFx0aWYgKGFjdGlvbiA9PT0gQWN0aXZpdHkuVW5kbyAmJiBteUFjdGl2aXR5ID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdXNlciBmaW5pc2hlZCB0aGUgYWN0aXZpdHlcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoTVlBQ1RJVklUWSwgbnVsbCk7XG5cdFx0fVxuXG5cdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoYWN0aW9uLCBjbGllbnRDb250ZW50LCBpbnRlcm5hbE1vZGVsLCB0cmlnZ2VyZWRBY3Rpb25OYW1lKTtcblx0fVxufTtcblxuY29uc3QgZ2V0V2ViU29ja2V0QmFzZVVSTCA9IGZ1bmN0aW9uIChiaW5kaW5nQ29udGV4dDogVjRDb250ZXh0KTogc3RyaW5nIHtcblx0cmV0dXJuIGJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiL0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuV2ViU29ja2V0QmFzZVVSTFwiKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc0NvbGxhYm9yYXRpb25FbmFibGVkID0gZnVuY3Rpb24gKHZpZXc6IFZpZXcpOiBib29sZWFuIHtcblx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSB2aWV3Py5nZXRCaW5kaW5nQ29udGV4dCAmJiAodmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dCk7XG5cdHJldHVybiAhIShiaW5kaW5nQ29udGV4dCAmJiBnZXRXZWJTb2NrZXRCYXNlVVJMKGJpbmRpbmdDb250ZXh0KSk7XG59O1xuXG5leHBvcnQgY29uc3QgY29ubmVjdCA9IGFzeW5jIGZ1bmN0aW9uICh2aWV3OiBWaWV3KSB7XG5cdGNvbnN0IGludGVybmFsTW9kZWwgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRjb25zdCBtZSA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRNZSh2aWV3KTtcblxuXHQvLyBSZXRyaWV2aW5nIE1FIGZyb20gc2hlbGwgc2VydmljZVxuXHRpZiAoIW1lKSB7XG5cdFx0Ly8gbm8gbWUgPSBubyBzaGVsbCA9IG5vdCBzdXJlIHdoYXQgdG8gZG9cblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHQ7XG5cdGNvbnN0IHdlYlNvY2tldEJhc2VVUkwgPSBnZXRXZWJTb2NrZXRCYXNlVVJMKGJpbmRpbmdDb250ZXh0KTtcblx0Y29uc3Qgc2VydmljZVVybCA9IGJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0U2VydmljZVVybCgpO1xuXG5cdGlmICghd2ViU29ja2V0QmFzZVVSTCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHNEcmFmdFVVSUQgPSBhd2FpdCBiaW5kaW5nQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdFVVSURcIik7XG5cdGlmICghc0RyYWZ0VVVJRCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uKG1lLCB3ZWJTb2NrZXRCYXNlVVJMLCBzRHJhZnRVVUlELCBzZXJ2aWNlVXJsLCBpbnRlcm5hbE1vZGVsLCAobWVzc2FnZTogTWVzc2FnZSkgPT4ge1xuXHRcdG1lc3NhZ2VSZWNlaXZlKG1lc3NhZ2UsIHZpZXcpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNjb25uZWN0ID0gZnVuY3Rpb24gKGNvbnRyb2w6IENvbnRyb2wpIHtcblx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGNvbnRyb2wuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdGVuZENvbGxhYm9yYXRpb24oaW50ZXJuYWxNb2RlbCk7XG59O1xuXG5mdW5jdGlvbiBtZXNzYWdlUmVjZWl2ZShtZXNzYWdlOiBNZXNzYWdlLCB2aWV3OiBWaWV3KSB7XG5cdGNvbnN0IGludGVybmFsTW9kZWw6IGFueSA9IHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKTtcblx0bGV0IGFjdGl2ZVVzZXJzOiBVc2VyW10gPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWRVVTRVJTKTtcblx0bGV0IGFjdGl2aXRpZXM6IFVzZXJBY3Rpdml0eVtdO1xuXHRsZXQgYWN0aXZpdHlLZXk6IHN0cmluZztcblx0Y29uc3QgbWV0YVBhdGggPSBjYWxjdWxhdGVNZXRhUGF0aCh2aWV3LCBtZXNzYWdlLmNsaWVudENvbnRlbnQpO1xuXHRtZXNzYWdlLnVzZXJBY3Rpb24gPSBtZXNzYWdlLnVzZXJBY3Rpb24gfHwgbWVzc2FnZS5jbGllbnRBY3Rpb247XG5cblx0Y29uc3Qgc2VuZGVyOiBVc2VyID0ge1xuXHRcdGlkOiBtZXNzYWdlLnVzZXJJRCxcblx0XHRuYW1lOiBtZXNzYWdlLnVzZXJEZXNjcmlwdGlvbixcblx0XHRpbml0aWFsczogQ29sbGFib3JhdGlvblV0aWxzLmZvcm1hdEluaXRpYWxzKG1lc3NhZ2UudXNlckRlc2NyaXB0aW9uKSxcblx0XHRjb2xvcjogQ29sbGFib3JhdGlvblV0aWxzLmdldFVzZXJDb2xvcihtZXNzYWdlLnVzZXJJRCwgYWN0aXZlVXNlcnMsIFtdKVxuXHR9O1xuXG5cdGxldCBtYWN0aXZpdHk6IFVzZXJBY3Rpdml0eSA9IHNlbmRlcjtcblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZGVmYXVsdC1jYXNlXG5cdHN3aXRjaCAobWVzc2FnZS51c2VyQWN0aW9uKSB7XG5cdFx0Y2FzZSBBY3Rpdml0eS5Kb2luOlxuXHRcdGNhc2UgQWN0aXZpdHkuSm9pbkVjaG86XG5cdFx0XHRpZiAoYWN0aXZlVXNlcnMuZmluZEluZGV4KCh1c2VyKSA9PiB1c2VyLmlkID09PSBzZW5kZXIuaWQpID09PSAtMSkge1xuXHRcdFx0XHRhY3RpdmVVc2Vycy51bnNoaWZ0KHNlbmRlcik7XG5cdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZFVVNFUlMsIGFjdGl2ZVVzZXJzKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1lc3NhZ2UudXNlckFjdGlvbiA9PT0gQWN0aXZpdHkuSm9pbikge1xuXHRcdFx0XHQvLyB3ZSBlY2hvIG91ciBleGlzdGVuY2UgdG8gdGhlIG5ld2x5IGVudGVyZWQgdXNlciBhbmQgYWxzbyBzZW5kIHRoZSBjdXJyZW50IGFjdGl2aXR5IGlmIHRoZXJlIGlzIGFueVxuXHRcdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShBY3Rpdml0eS5Kb2luRWNobywgaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShNWUFDVElWSVRZKSwgaW50ZXJuYWxNb2RlbCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZXNzYWdlLnVzZXJBY3Rpb24gPT09IEFjdGl2aXR5LkpvaW5FY2hvKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmNsaWVudENvbnRlbnQpIHtcblx0XHRcdFx0XHQvLyBhbm90aGVyIHVzZXIgd2FzIGFscmVhZHkgdHlwaW5nIHRoZXJlZm9yZSBJIHdhbnQgdG8gc2VlIGhpcyBhY3Rpdml0eSBpbW1lZGlhdGVseS4gQ2FsbGluZyBtZSBhZ2FpbiBhcyBhIGxpdmUgY2hhbmdlXG5cdFx0XHRcdFx0bWVzc2FnZS51c2VyQWN0aW9uID0gQWN0aXZpdHkuTGl2ZUNoYW5nZTtcblx0XHRcdFx0XHRtZXNzYWdlUmVjZWl2ZShtZXNzYWdlLCB2aWV3KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkxlYXZlOlxuXHRcdFx0Ly8gUmVtb3ZpbmcgdGhlIGFjdGl2ZSB1c2VyLiBOb3QgcmVtb3ZpbmcgXCJtZVwiIGlmIEkgaGFkIHRoZSBzY3JlZW4gb3BlbiBpbiBhbm90aGVyIHNlc3Npb25cblx0XHRcdGFjdGl2ZVVzZXJzID0gYWN0aXZlVXNlcnMuZmlsdGVyKCh1c2VyKSA9PiB1c2VyLmlkICE9PSBzZW5kZXIuaWQgfHwgdXNlci5tZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHRjb25zdCBhbGxBY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTKSB8fCB7fTtcblx0XHRcdGNvbnN0IHJlbW92ZVVzZXJBY3Rpdml0aWVzID0gZnVuY3Rpb24gKGJhZzogYW55KSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGJhZykpIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFnLmZpbHRlcigoYWN0aXZpdHkpID0+IGFjdGl2aXR5LmlkICE9PSBzZW5kZXIuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcCBpbiBiYWcpIHtcblx0XHRcdFx0XHRcdGJhZ1twXSA9IHJlbW92ZVVzZXJBY3Rpdml0aWVzKGJhZ1twXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBiYWc7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRyZW1vdmVVc2VyQWN0aXZpdGllcyhhbGxBY3Rpdml0aWVzKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUywgYWxsQWN0aXZpdGllcyk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuQ2hhbmdlOlxuXHRcdFx0Y29uc3QgbWV0YVBhdGhzID0gbWVzc2FnZT8uY2xpZW50Q29udGVudD8uc3BsaXQoXCJ8XCIpLm1hcCgocGF0aCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCkuZ2V0TWV0YVBhdGgocGF0aCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0bWV0YVBhdGhzLmZvckVhY2goKGN1cnJlbnRNZXRhUGF0aCwgaSkgPT4ge1xuXHRcdFx0XHRjb25zdCBuZXN0ZWVkTWVzc2FnZSA9IHtcblx0XHRcdFx0XHQuLi5tZXNzYWdlLFxuXHRcdFx0XHRcdGNsaWVudENvbnRlbnQ6IG1lc3NhZ2U/LmNsaWVudENvbnRlbnQ/LnNwbGl0KFwifFwiKVtpXVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRsZXQgY3VycmVudEFjdGl2aXRpZXM6IGFueVtdID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgY3VycmVudE1ldGFQYXRoKSB8fCBbXTtcblx0XHRcdFx0YWN0aXZpdHlLZXkgPSBnZXRBY3Rpdml0eUtleShuZXN0ZWVkTWVzc2FnZS5jbGllbnRDb250ZW50KTtcblx0XHRcdFx0Y3VycmVudEFjdGl2aXRpZXMgPSBjdXJyZW50QWN0aXZpdGllcz8uZmlsdGVyICYmIGN1cnJlbnRBY3Rpdml0aWVzLmZpbHRlcigoYWN0aXZpdHkpID0+IGFjdGl2aXR5LmtleSAhPT0gYWN0aXZpdHlLZXkpO1xuXHRcdFx0XHRpZiAoY3VycmVudEFjdGl2aXRpZXMpIHtcblx0XHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWSVRJRVMgKyBjdXJyZW50TWV0YVBhdGgsIGN1cnJlbnRBY3Rpdml0aWVzKTtcblx0XHRcdFx0XHR1cGRhdGUodmlldywgbmVzdGVlZE1lc3NhZ2UsIGN1cnJlbnRNZXRhUGF0aCwgQWN0aXZpdHkuQ2hhbmdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkNyZWF0ZTpcblx0XHRcdC8vIEZvciBjcmVhdGUgd2UgYWN0dWFsbHkganVzdCBuZWVkIHRvIHJlZnJlc2ggdGhlIHRhYmxlXG5cdFx0XHR1cGRhdGUodmlldywgbWVzc2FnZSwgbWV0YVBhdGgsIEFjdGl2aXR5LkNyZWF0ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkRlbGV0ZTpcblx0XHRcdC8vIEZvciBub3cgYWxzbyByZWZyZXNoIHRoZSBwYWdlIGJ1dCBpbiBjYXNlIG9mIGRlbGV0aW9uIHdlIG5lZWQgdG8gaW5mb3JtIHRoZSB1c2VyXG5cdFx0XHR1cGRhdGUodmlldywgbWVzc2FnZSwgbWV0YVBhdGgsIEFjdGl2aXR5LkRlbGV0ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkFjdGl2YXRlOlxuXHRcdFx0ZHJhZnRDbG9zZWRCeU90aGVyVXNlcih2aWV3LCBtZXNzYWdlLCBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0FDVElWQVRFXCIsIHNlbmRlci5uYW1lKSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkRpc2NhcmQ6XG5cdFx0XHRkcmFmdENsb3NlZEJ5T3RoZXJVc2VyKHZpZXcsIG1lc3NhZ2UsIENvbGxhYm9yYXRpb25VdGlscy5nZXRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfRElTQ0FSRFwiLCBzZW5kZXIubmFtZSkpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkFjdGlvbjpcblx0XHRcdHVwZGF0ZSh2aWV3LCBtZXNzYWdlLCBtZXRhUGF0aCwgQWN0aXZpdHkuQWN0aW9uKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5MaXZlQ2hhbmdlOlxuXHRcdFx0bWFjdGl2aXR5ID0gc2VuZGVyO1xuXHRcdFx0bWFjdGl2aXR5LmtleSA9IGdldEFjdGl2aXR5S2V5KG1lc3NhZ2UuY2xpZW50Q29udGVudCk7XG5cblx0XHRcdC8vIHN0dXBpZCBKU09OIG1vZGVsLi4uXG5cdFx0XHRsZXQgaW5pdEpTT05Nb2RlbDogc3RyaW5nID0gXCJcIjtcblx0XHRcdGNvbnN0IHBhcnRzID0gbWV0YVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0aW5pdEpTT05Nb2RlbCArPSBgLyR7cGFydHNbaV19YDtcblx0XHRcdFx0aWYgKCFpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyBpbml0SlNPTk1vZGVsKSkge1xuXHRcdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIGluaXRKU09OTW9kZWwsIHt9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgpO1xuXHRcdFx0YWN0aXZpdGllcyA9IGFjdGl2aXRpZXM/LnNsaWNlID8gYWN0aXZpdGllcy5zbGljZSgpIDogW107XG5cdFx0XHRhY3Rpdml0aWVzLnB1c2gobWFjdGl2aXR5KTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIG1ldGFQYXRoLCBhY3Rpdml0aWVzKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQWN0aXZpdHkuVW5kbzpcblx0XHRcdC8vIFRoZSB1c2VyIGRpZCBhIGNoYW5nZSBidXQgcmV2ZXJ0ZWQgaXQsIHRoZXJlZm9yZSB1bmJsb2NrIHRoZSBjb250cm9sXG5cdFx0XHRhY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgpO1xuXHRcdFx0YWN0aXZpdHlLZXkgPSBnZXRBY3Rpdml0eUtleShtZXNzYWdlLmNsaWVudENvbnRlbnQpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdFx0QUNUSVZJVElFUyArIG1ldGFQYXRoLFxuXHRcdFx0XHRhY3Rpdml0aWVzLmZpbHRlcigoYSkgPT4gYS5rZXkgIT09IGFjdGl2aXR5S2V5KVxuXHRcdFx0KTtcblx0XHRcdGJyZWFrO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIodmlldzogVmlldywgbWVzc2FnZTogTWVzc2FnZSwgdGV4dDogc3RyaW5nKSB7XG5cdGRpc2Nvbm5lY3Qodmlldyk7XG5cdE1lc3NhZ2VCb3guaW5mb3JtYXRpb24odGV4dCk7XG5cdCh2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgVjRDb250ZXh0KVxuXHRcdC5nZXRCaW5kaW5nKClcblx0XHQucmVzZXRDaGFuZ2VzKClcblx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRuYXZpZ2F0ZShtZXNzYWdlLmNsaWVudENvbnRlbnQsIHZpZXcpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdExvZy5lcnJvcihcIlBlbmRpbmcgQ2hhbmdlcyBjb3VsZCBub3QgYmUgcmVzZXQgLSBzdGlsbCBuYXZpZ2F0aW5nIHRvIGFjdGl2ZSBpbnN0YW5jZVwiKTtcblx0XHRcdG5hdmlnYXRlKG1lc3NhZ2UuY2xpZW50Q29udGVudCwgdmlldyk7XG5cdFx0fSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlLCBtZXRhUGF0aDogc3RyaW5nLCBhY3Rpb246IEFjdGl2aXR5KSB7XG5cdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRBcHBDb21wb25lbnQodmlldyk7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRjb25zdCBjdXJyZW50Q29udGV4dCA9IGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdGNvbnN0IGN1cnJlbnRQYXRoID0gY3VycmVudENvbnRleHQuZ2V0UGF0aCgpO1xuXHRjb25zdCBjdXJyZW50TWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY3VycmVudFBhdGgpO1xuXHRsZXQgY2hhbmdlZERvY3VtZW50ID0gbWVzc2FnZS5jbGllbnRDb250ZW50O1xuXG5cdGlmIChhY3Rpb24gPT09IEFjdGl2aXR5LkRlbGV0ZSkge1xuXHRcdC8vIGNoZWNrIGlmIHVzZXIgY3VycmVudGx5IGRpc3BsYXlzIG9uZSBkZWxldGVkIG9iamVjdFxuXHRcdGNvbnN0IGRlbGV0ZWRPYmplY3RzID0gbWVzc2FnZS5jbGllbnRDb250ZW50LnNwbGl0KFwifFwiKTtcblx0XHRjb25zdCBwYXJlbnREZWxldGVkSW5kZXggPSBkZWxldGVkT2JqZWN0cy5maW5kSW5kZXgoKGRlbGV0ZWRPYmplY3QpID0+IGN1cnJlbnRQYXRoLnN0YXJ0c1dpdGgoZGVsZXRlZE9iamVjdCkpO1xuXHRcdGlmIChwYXJlbnREZWxldGVkSW5kZXggPiAtMSkge1xuXHRcdFx0Ly8gYW55IG90aGVyIHVzZXIgZGVsZXRlZCB0aGUgb2JqZWN0IEknbSBjdXJyZW50bHkgbG9va2luZyBhdC4gSW5mb3JtIHRoZSB1c2VyIHdlIHdpbGwgbmF2aWdhdGUgdG8gcm9vdCBub3dcblx0XHRcdE1lc3NhZ2VCb3guaW5mb3JtYXRpb24oQ29sbGFib3JhdGlvblV0aWxzLmdldFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9ERUxFVEVcIiwgbWVzc2FnZS51c2VyRGVzY3JpcHRpb24pLCB7XG5cdFx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRDb250ZXh0ID0gdmlldy5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGRlbGV0ZWRPYmplY3RzW3BhcmVudERlbGV0ZWRJbmRleF0pLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5fcm91dGluZy5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dCh0YXJnZXRDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vIFRPRE86IEZvciBub3cganVzdCB0YWtlIHRoZSBmaXJzdCBvYmplY3QgdG8gZ2V0IHRoZSBtZXRhIHBhdGggYW5kIGRvIGEgZnVsbCByZWZyZXNoIG9mIHRoZSB0YWJsZVxuXHRcdGNoYW5nZWREb2N1bWVudCA9IGRlbGV0ZWRPYmplY3RzWzBdO1xuXHR9XG5cblx0aWYgKGFjdGlvbiA9PT0gQWN0aXZpdHkuQWN0aW9uKSB7XG5cdFx0Y29uc3QgYWN0aW9uTmFtZSA9IG1lc3NhZ2UuY2xpZW50VHJpZ2dlcmVkQWN0aW9uTmFtZSxcblx0XHRcdGJpbmRpbmdQYXJhbWV0ZXJzID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMoYWN0aW9uTmFtZSEsIGN1cnJlbnRDb250ZXh0KSxcblx0XHRcdHRhcmdldFBhdGhzID0gYmluZGluZ1BhcmFtZXRlcnM/LnBhdGhFeHByZXNzaW9ucztcblx0XHRpZiAodGFyZ2V0UGF0aHMgJiYgdGFyZ2V0UGF0aHMubGVuZ3RoID4gMCkge1xuXHRcdFx0c2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyh0YXJnZXRQYXRocywgY3VycmVudENvbnRleHQsIFNZTkNHUk9VUElEKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoY2hhbmdlZERvY3VtZW50LnN0YXJ0c1dpdGgoY3VycmVudFBhdGgpKSB7XG5cdFx0Ly8gRXhlY3V0ZSBTaWRlRWZmZWN0cyAoVE9ETyBmb3IgTWVldCB0aGVyZSBzaG91bGQgYmUgb25lIGNlbnRyYWwgbWV0aG9kKVxuXHRcdGNvbnN0IGFjdGl2aXR5UGF0aCA9IG1ldGFQYXRoLnJlcGxhY2UoY3VycmVudE1ldGFQYXRoLCBcIlwiKS5zbGljZSgxKTtcblx0XHRpZiAoYWN0aXZpdHlQYXRoKSB7XG5cdFx0XHQvLyBSZXF1ZXN0IGFsc28gdGhlIHByb3BlcnR5IGl0c2VsZlxuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHM6IGFueVtdID0gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogYWN0aXZpdHlQYXRoXG5cdFx0XHRcdH1cblx0XHRcdF07XG5cdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChjdXJyZW50Q29udGV4dCk7XG5cdFx0XHRjb25zdCBlbnRpdHlUeXBlU2lkZUVmZmVjdHMgPSBzaWRlRWZmZWN0c1NlcnZpY2UuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlISk7XG5cdFx0XHQvLyBQb29yIG1hbiBzb2x1dGlvbiB3aXRob3V0IGNoZWNraW5nIHNvdXJjZSB0YXJnZXRzLCBqdXN0IGZvciBQT0MsIHRoaXMgaXMgdGhyb3ctd2F5IGNvZGluZyBvbmx5XG5cdFx0XHRjb25zdCBvYmplY3Q6IGFueSA9IE9iamVjdDsgLy8ganVzdCB0byBvdmVyY29tZSBUUyBpc3N1ZXMsIHdpbGwgYmUgYW55d2F5IHJlcGxhY2VkXG5cdFx0XHRjb25zdCByZWxldmFudFNpZGVFZmZlY3RzID0gb2JqZWN0LmZyb21FbnRyaWVzKFxuXHRcdFx0XHRvYmplY3Rcblx0XHRcdFx0XHQuZW50cmllcyhlbnRpdHlUeXBlU2lkZUVmZmVjdHMpXG5cdFx0XHRcdFx0LmZpbHRlcigoeDogYW55W10pID0+IHhbMV0uU291cmNlUHJvcGVydGllcz8uZmluZEluZGV4KChzb3VyY2U6IGFueSkgPT4gc291cmNlLnZhbHVlID09PSBhY3Rpdml0eVBhdGgpID4gLTEpXG5cdFx0XHQpO1xuXHRcdFx0Zm9yIChjb25zdCBwIGluIHJlbGV2YW50U2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0cmVsZXZhbnRTaWRlRWZmZWN0c1twXS5UYXJnZXRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHRhcmdldFByb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0XHRzaWRlRWZmZWN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IHRhcmdldFByb3BlcnR5XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0c2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cywgY3VycmVudENvbnRleHQsIFNZTkNHUk9VUElEKTtcblx0XHR9XG5cdH1cblxuXHQvLyBTaW11bGF0ZSBhbnkgY2hhbmdlIHNvIHRoZSBlZGl0IGZsb3cgc2hvd3MgdGhlIGRyYWZ0IGluZGljYXRvciBhbmQgc2V0cyB0aGUgcGFnZSB0byBkaXJ0eVxuXHRjdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuZWRpdEZsb3cudXBkYXRlRG9jdW1lbnQoY3VycmVudENvbnRleHQsIFByb21pc2UucmVzb2x2ZSgpKTtcbn1cblxuZnVuY3Rpb24gbmF2aWdhdGUocGF0aDogc3RyaW5nLCB2aWV3OiBWaWV3KSB7XG5cdC8vIFRPRE86IHJvdXRpbmcubmF2aWdhdGUgZG9lc24ndCBjb25zaWRlciBzZW1hbnRpYyBib29rbWFya2luZ1xuXHRjb25zdCBjdXJyZW50UGFnZSA9IGdldEN1cnJlbnRQYWdlKHZpZXcpO1xuXHRjb25zdCB0YXJnZXRDb250ZXh0ID0gdmlldy5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KHBhdGgpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRjdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkucm91dGluZy5uYXZpZ2F0ZSh0YXJnZXRDb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFBhZ2UodmlldzogVmlldykge1xuXHRjb25zdCBhcHBDb21wb25lbnQgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZpZXcpO1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0Q3VycmVudFBhZ2VWaWV3KGFwcENvbXBvbmVudCk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGl2aXR5S2V5KHg6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiB4LnN1YnN0cmluZyh4Lmxhc3RJbmRleE9mKFwiKFwiKSArIDEsIHgubGFzdEluZGV4T2YoXCIpXCIpKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBtZXRhcGF0aCBmcm9tIG9uZSBvciBtb3JlIGRhdGEgcGF0aChzKS5cbiAqXG4gKiBAcGFyYW0gdmlldyBUaGUgY3VycmVudCB2aWV3XG4gKiBAcGFyYW0gcGF0aCBPbmUgb3JlIG1vcmUgZGF0YSBwYXRoKHMpLCBpbiBjYXNlIG9mIG11bHRpcGxlIHBhdGhzIHNlcGFyYXRlZCBieSAnfCdcbiAqIEByZXR1cm5zIFRoZSBjYWxjdWxhdGVkIG1ldGFQYXRoXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZU1ldGFQYXRoKHZpZXc6IFZpZXcsIHBhdGg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgbWV0YVBhdGggPSBcIlwiO1xuXHRpZiAocGF0aCkge1xuXHRcdC8vIGluIGNhc2UgbW9yZSB0aGFuIG9uZSBwYXRoIGlzIHNlbnQgYWxsIG9mIHRoZW0gaGF2ZSB0byB1c2UgdGhlIHNhbWUgbWV0YXBhdGggdGhlcmVmb3JlIHdlIGp1c3QgY29uc2lkZXIgdGhlIGZpcnN0IG9uZVxuXHRcdGNvbnN0IGRhdGFQYXRoID0gcGF0aC5zcGxpdChcInxcIilbMF07XG5cdFx0bWV0YVBhdGggPSAodmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKS5nZXRNZXRhUGF0aChkYXRhUGF0aCk7XG5cdH1cblx0cmV0dXJuIG1ldGFQYXRoO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGNvbm5lY3Q6IGNvbm5lY3QsXG5cdGRpc2Nvbm5lY3Q6IGRpc2Nvbm5lY3QsXG5cdGlzQ29ubmVjdGVkOiBpc0Nvbm5lY3RlZCxcblx0aXNDb2xsYWJvcmF0aW9uRW5hYmxlZDogaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCxcblx0c2VuZDogc2VuZFxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7RUFpQkEsTUFBTUEsVUFBVSxHQUFHLDJCQUEyQjtFQUM5QyxNQUFNQyxXQUFXLEdBQUcsNEJBQTRCO0VBQ2hELE1BQU1DLFVBQVUsR0FBRywyQkFBMkI7RUFDOUMsTUFBTUMsV0FBVyxHQUFHLFlBQVk7RUFFekIsTUFBTUMsV0FBVyxHQUFHLFVBQVVDLE9BQWdCLEVBQVc7SUFDL0QsTUFBTUMsYUFBYSxHQUFHRCxPQUFPLENBQUNFLFFBQVEsQ0FBQyxVQUFVLENBQWM7SUFDL0QsT0FBT0Msd0JBQXdCLENBQUNGLGFBQWEsQ0FBQztFQUMvQyxDQUFDO0VBQUM7RUFFSyxNQUFNRyxJQUFJLEdBQUcsVUFDbkJKLE9BQWdCLEVBQ2hC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