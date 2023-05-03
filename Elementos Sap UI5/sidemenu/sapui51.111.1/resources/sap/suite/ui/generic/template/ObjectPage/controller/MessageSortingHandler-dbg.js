sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/util/extend",
	"sap/ui/model/Sorter",
	"sap/ui/core/MessageType",
	"sap/suite/ui/generic/template/lib/MessageUtils",
	"sap/suite/ui/generic/template/genericUtilities/controlHelper"
], function(BaseObject, extend, Sorter, MessageType, MessageUtils, controlHelper) {
	"use strict";

	// This class is a helper class to implement function fnPrepareForMessageHandling within the ControllerImplementation of the object page.
	// For this purpose it provides a single public function getPrepareMessageDisplayPromise, which implements the part of that function
	// that deals with the list binding for the messages to be displayed in the popup/popover.
	// Note that a new instance of this class is created whenever the MessagePopover or the MessageInfluencingCRUDAction popup is opened.
	// The MessageDialog (used for transient messages) is (yet) not using this class.
	function getMethods(oController, oTemplateUtils, oObjectPage) {
		var fnHeartBeat = Function.prototype; // A function that is called when new subtitle information is available. Will be set to a more specific function below.
		
		var mMessageToPlacementInfo; // Cache for message placement infos (see function getMessagePlacementInfo)
		
		var mTableIdToTableInfo; // Cache for table infos (see function getTableInfo)
		
		function fnReset(){ // remove all collected information and prepare to collect new one.
			mMessageToPlacementInfo = Object.create(null);
			if (mTableIdToTableInfo){
				for (var sId in mTableIdToTableInfo){
					var oTableInfo = mTableIdToTableInfo[sId];
					oTableInfo.destroy();
				}
			}
			mTableIdToTableInfo = Object.create(null); 
		}

		// adds the following attributes to oPlacementInfo: controlId, pathToControlId, groupers, getItemBindingPath (see getMessagePlacementInfo() below)
		// Thereby aCandidates is the list of controlIds which should be considered.
		function addControlIdToPlacementInfo(aCandidates, oPlacementInfo){
			var mChildToParent = Object.create(null); // helper map that maps each relevant control id to the parent control. Will be filled as a bonus via onElementVisited while executing getPositionableControlId to find the target control for the message 
			var onElementVisited = function (sElementId, oControl, oChild) { // will be called for sElementId being a member of aControlIds and oControl being one of its ancestors, oChild is a child of oControl and was visited previously
				if (oChild) {
					mChildToParent[oChild.getId()] = oControl;
				}
			};
			oPlacementInfo.controlId = oTemplateUtils.oCommonUtils.getPositionableControlId(aCandidates, true, onElementVisited); // Now we have decided which controlId we want to use for sorting and placing of this message. Note that this entry might be faulty
			var aPathToControlId = []; // an array of strings starting with the id of the identified control and ending at the view id. Thereby the array steps up the control hierarchy step by step.
			var oSection, oTable; // will be set to be the section and table the message belongs to (if such controls can be identified)
			// fill aPathToControlId and determine oSection and oTable if possible. This is done by following the child-parent relationship given by mChildToParent starting from oPlacementInfo.controlId. 
			var sControlId;
			for (var oControl = oPlacementInfo.controlId && controlHelper.byId(oPlacementInfo.controlId); oControl; oControl = mChildToParent[sControlId]){
				sControlId = oControl.getId();
				aPathToControlId.push(sControlId);
				oSection = oSection || (controlHelper.isObjectPageSection(oControl) && oControl);
				oTable = oTable || (controlHelper.isSmartTable(oControl) && oControl);					
			}
			aPathToControlId.reverse(); // reverse the order in the path. Now it has the right order for property pathToControlId of the placement info
			oPlacementInfo.pathToControlId = aPathToControlId;
			// Determine groupers from oSection and oTable
			oPlacementInfo.groupers = oSection ? [oSection] : [];
			if (oSection && oTable) { // we might need to determine getItemBindingPath
				oPlacementInfo.groupers.push(oTable);
				if (oPlacementInfo.message.validation){ // as getItemBindingPath is used to retrieve data of table entries currently not shown, this is not relevant for validation messages
					oPlacementInfo.getItemBindingPath = Function.prototype;
				} else {
					var oTableInfo = getTableInfo(oTable);
					if (oTableInfo){
						var sViewBindingPath = oTemplateUtils.oComponentUtils.getBindingPath();
						var sTableBindingPath = oTableInfo.presentationControlHandler.getBindingPath();
						var sFullTableBindingPath = sViewBindingPath + "/" + sTableBindingPath;
						oPlacementInfo.getItemBindingPath = function(){
							var sFullTarget = oPlacementInfo.message.aFullTargets.find(function(sCandidate){ // find a full target which fits to the binding path of the table
								return sCandidate.startsWith(sFullTableBindingPath);
							});
							if (!sFullTarget){
								return null;
							}
							// sFullTarget should now have the following structure: <sFullTableBindingPath><key information within the table>[/<path to a field or sub entity>]
							// Thereby, the [] is optional. The item binding path which should be returned by this function is just <sFullTableBindingPath><key information within the table>.
							// Thus, we have to remove the []-part. Thereby we assume that <key information within the table> does not contain any "/"
							var sTail = sFullTarget.substring(sFullTableBindingPath.length);
							var sKey = sTail.split("/")[0];
							return sFullTableBindingPath + sKey;
						};
					} else { // no table info was created (i.e. oTable does not have a binding)
						oPlacementInfo.getItemBindingPath = Function.prototype;
					}
				}
			} else {
				oPlacementInfo.getItemBindingPath = Function.prototype;
			}			
		}
		
		// This function retrieves placement info for a message on the object page. The placement info is an object possessing the following properties:
		// - message -> the message
		// - controlIds -> maps the control ids which are currently considered for the message to the corresponding control.
		// - controlId -> The control id which is currently taken to determine the placement of the message in the object page (faulty if no placement is possible).
		//   Note that this is possibly not contained in controlIds (namely, if it has been set by fnFindTableForMessage).
		// - pathToControlId -> an array of controlIds starting with the id of the view down to controlId representing the path via a parent-child relationship (empty if controlId is faulty)
		// - groupers -> an array of controls representing the group the message should belong to.
		//   Currently the structure of this array (if not empty) is as follows:
		//   ~ The first entry is the section the message belongs to
		//   ~ A possible second entry contains the SmartTable the message belongs to
		// - getItemBindingPath -> A function that is only relevant if the message belongs to a SmartTable. In this case it returns the binding path for an item within this table
		//   which is related to this message. Note that the function may also return a faulty value (e.g. if the function relates to the table as a whole).
		// Note that mMessageToPlacementInfo is used as a cash, so that the corresponding information can be reused when the same message id with the same (relevant) list of control ids is passed again.
		// Note that parameter oMessage is optional. However, it must be provided if the message identified by sMsgId is no longer in the message model and no entry for sMsgId is contained in
		// mMessageToPlacementInfo, yet.
		function getMessagePlacementInfo(sMsgId, oMessage) {
			var oRet = mMessageToPlacementInfo[sMsgId]; // the placement info to be returned
			if (oRet) { // check whether if is needs to be invalidated due to change of controlIds which is the case if either a new controlId is present or the chosen one is no longer present
				oMessage = oRet.message; // if oMessage is provided, this should be no change. Otherwise we can take the message from the cache.
				var bControlIdChange = !!oRet.controlId; // if there is a control id we assume a change until we find it
				oMessage.controlIds.some(function (sControlId) {
					if (sControlId === oRet.controlId){
						bControlIdChange = false; // the chosen control id is still present, so this possible reason for invalidation can be excluded
					} else if (!oRet.controlIds[sControlId]){
						bControlIdChange = true;
						return true; // new controlId identified -> invalidation necessary, exit loop
					}
				});
				oRet = !bControlIdChange && oRet; // invalidate cache entry if necessary
			}
			if (!oRet) { // need to determine the placement info
				oMessage = oMessage || MessageUtils.getMessageById(sMsgId);
				var mControlIds = Object.create(null);
				oMessage.controlIds.forEach(function(sControlId){
					mControlIds[sControlId] = controlHelper.byId(sControlId);
				});
				oRet = {
					message: oMessage,
					controlIds: mControlIds
				};
				addControlIdToPlacementInfo(oMessage.controlIds, oRet); // add the missing attributes to oRet
				mMessageToPlacementInfo[sMsgId] = oRet; // add to the cash	
			}
			return oRet;
		}
		
		// This function retrieves table info for a smart table on the object page. The table info is an object possessing the following properties:
		// - table -> the corresponding SmartTable
		// - presentationControlHandler -> the corresponding instance of sap.suite.ui.generic.template.lib.presentationControl.SmartTableHandler
		// - messageToMsgInTableInfo -> a map that maps the ids of messages belonging to rows in this table to detailed information about this relationship
		//   More preceisely, the detailed information is an object containing the following attributes:
		//   ~ index -> The index of the entry in the table realting to this message, resp. 9999999 if no such entry could be found
		//   ~ rowCurrentlyShown -> Information whether the row this message realtes to is currently shown
		//   ~ rowIdentifier -> The human readable identification of the row the message relates to
		//   ~ columnInfo -> Information about the column the message relates to (resp. a faulty value, if no such column could be identified)
		//     More precisely, this is an object containing properties 'label' (string identifying the column) and 'hidden' (boolean informing whether the column is hidden)
		//   This information is set (maybe asynchronosly) by addContextInfoToMessageToMsgInTableInfo resp. getDetailsRetrievedPromise.  
		// - tableLoaded -> a Promise which is resolved when the table has finished loading its data and the data which have been loaded have
		//   been used to update the content of the messageToMsgInTableInfo property
		// - destroy ->  a destroy function for this instance
		// - columnInfo -> a map (created on demand) mapping pathes that represent columns to the columnInfo as described above
		// Note that mTableIdToTableInfo is used as a cash.
		// Moreover, note that this function returns a faulty value if the table does not possess a binding. However, this information is not cached.		
		function getTableInfo(oTable){
			var sTableId = oTable.getId();
			var oRet = mTableIdToTableInfo[sTableId];
			if (!oRet){
				oRet = createTableInfo(oTable);
				mTableIdToTableInfo[sTableId] = oRet;	
			}
			return oRet;
		}

		// returns the string which is used to identify a row (specified by oContext) within a smart table (specified by its PresentationControlHandler)
		function getRowIdentifier(oPresentationControlHandler, oContext){
			var oTitleInfo = oPresentationControlHandler.getTitleInfoForItem(oContext);
			return oTitleInfo && oTitleInfo.title;	
		}

		// creates the columnInfo (see getTableInfo) for a column in a table
		function getColumnInfoForColumn(oTableInfo, oColumn){
			return oColumn && {
				label: oTableInfo.table._getColumnLabel(oColumn),
				hidden: !oColumn.getVisible()
			};
		}

		// creates the columnInfo (see getTableInfo) for a column specified by a path in a table 
		function createColumnInfoForPath(oTableInfo, sColumnPath){
			var aColumns = oTableInfo.table.getTable().getColumns();
			var oColumnForPath = aColumns.find(function(oColumn){
				var sLeadingProperty = oColumn.getLeadingProperty ? oColumn.getLeadingProperty() : oColumn.data("p13nData").leadingProperty;
				return sLeadingProperty === sColumnPath;
			});
			return getColumnInfoForColumn(oTableInfo, oColumnForPath);
		}

		// retrieves the columnInfo (see getTableInfo) for a column specified by a path in a table
		function getColumnInfoForPath(oTableInfo, sColumnPath){
			var mColumnInfo = oTableInfo.columnInfo;
			if (mColumnInfo){ // if the columnInfo cache already exists
				var oRet = mColumnInfo[sColumnPath];
				if (oRet){       // If the cache possesses an entry for the given column path we can return it
					return oRet;
				}
			} else { // the columnInfo cache needs to be created
				mColumnInfo = Object.create(null);
				oTableInfo.columnInfo = mColumnInfo;
			}
			var oColumnInfo = createColumnInfoForPath(oTableInfo, sColumnPath); // determine the columnInfo for sColumnPath
			mColumnInfo[sColumnPath] = oColumnInfo;                              // and add it to the columnInfo cache
			return oColumnInfo;
		}

		// Determine the columnInfo (see getTableInfo) for the message represented by oPlacementInfo within the table represented by oTableInfo
		function getColumnInfoForMessage(oPlacementInfo, oTableInfo){
			var sBindingPath = oPlacementInfo.getItemBindingPath();
			var sRelevantTarget = oPlacementInfo.message.aFullTargets.find(function(sFullTarget){
				return sFullTarget.startsWith(sBindingPath);
			}); // find the relevant target information 
			if (!sRelevantTarget){
				return;
			}
			// determine the path to the column
			var sColumnPath = sRelevantTarget.substring(sBindingPath.length);
			if (sColumnPath.startsWith("/")){
				sColumnPath = sColumnPath.substring(1);
			}
			// if sColumnPath is empty the whole table should be considered as target. If sColumnPath contains a "(" the target points to a subentity of the current item
			// In both cases no column can be identified
			if (!sColumnPath || sColumnPath.indexOf("(") > 0){
				return;
			}
			return getColumnInfoForPath(oTableInfo, sColumnPath);
		}
		
		// This function analyzes a context belonging to a table and adds the information about the
		// messages related to this context to oTableInfo.messageToMsgInTableInfo.
		function addContextInfoToMessageToMsgInTableInfo(oTableInfo, oContext, iPosition){
			var aMessages = oContext && oContext.getMessages();
			if (aMessages && aMessages.length){ // if this context has at least one message
				var sRowIdentifier = getRowIdentifier(oTableInfo.presentationControlHandler, oContext);
				aMessages.forEach(function(oMessage){
					var oPlacementInfo = getMessagePlacementInfo(oMessage.id, oMessage);
					if (oPlacementInfo.groupers[1] === oTableInfo.table){ // ignore messages that are grouped somewhere else 
						var	oEntry = {
							index: iPosition < 0 ? 9999999 : iPosition,
							rowCurrentlyShown: iPosition >= 0,
							rowIdentifier: sRowIdentifier,
							columnInfo: getColumnInfoForMessage(oPlacementInfo, oTableInfo)
						};
						oTableInfo.messageToMsgInTableInfo[oMessage.id] = oEntry;
					}					
				});
			}
		}
		
		// create the table info object (see getTableInfo above) which does not exist yet.
		function createTableInfo(oTable){
			var oPresentationControlHandler = oTemplateUtils.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(oTable);
			var oBinding = oPresentationControlHandler.getBinding();
			if (!oBinding){
				return null;
			}
			var bDestroyed = false;
			var oRet = {
				table: oTable,
				presentationControlHandler: oPresentationControlHandler,
				messageToMsgInTableInfo: Object.create(null)
			};
			var fnSetMessageToMsgInTableInfo = function(){ // sets or resets the messageToMsgInTableInfo property of oRet
				if (bDestroyed){
					return;
				}
				var mPreviousMessageToMsgInTableInfo = oRet.messageToMsgInTableInfo; // the old content might be useful (see below)
				oRet.messageToMsgInTableInfo = Object.create(null);  // However, we create the content from scratch now
				// Analyze all rows currently existing in the table for messages belonging to them
				var fnHandleContext = addContextInfoToMessageToMsgInTableInfo.bind(null, oRet);
				var aContexts = oPresentationControlHandler.getCurrentContexts() || [];
				aContexts.forEach(fnHandleContext);
				// mPreviousMessageToMsgInTableInfo might contain information for messages belonging to rows
				// meanwhile filtered out. Do not loose this information.
				for (var sMsgId in mPreviousMessageToMsgInTableInfo){
					if (!oRet.messageToMsgInTableInfo[sMsgId]){
						var oPreviousEntry = mPreviousMessageToMsgInTableInfo[sMsgId];
						var oMessage = MessageUtils.getMessageById(sMsgId);
						oPreviousEntry.rowCurrentlyShown = oMessage && oMessage.validation;
						oRet.messageToMsgInTableInfo[sMsgId] = oPreviousEntry;
					}
				}
				fnHeartBeat(); // new information available -> inform clients that they may need to update
			};
			// messageToMsgInTableInfo will be filled the first time when the data for the table have been selected.
			// tableLoaded indicates when this has happened.
			oRet.tableLoaded = oPresentationControlHandler.getUnbusyPromise().then(fnSetMessageToMsgInTableInfo);
			// when the binding reloads data the information should be updated
			oBinding.attachChange(fnSetMessageToMsgInTableInfo);
			// when the ui state changes we need to clean more information, since in this case even the visibility
			// information for the columns may have changed.
			oTable.attachUiStateChange(fnReset);
			oRet.destroy = function(){
				bDestroyed = true;
				oBinding.detachChange(fnSetMessageToMsgInTableInfo);
				oTable.detachUiStateChange(fnReset);
			};
			return oRet;
		}

		// Function to get group name for a message. Messages are grouped based on the controls they refer to.
		// The corresponding controls are contained in property 'groupers' of the placement info for that message.
		// groupers is an array which is either empty (message could not be assigned to a specific group), contains one entry which is an object page section,
		// or contains two entries (an object page section and a table within this section). 
		// Depending on the case the group is built.
		function getGroupTitle(sMsgId) {
			var oPlacementInfo = getMessagePlacementInfo(sMsgId);
			var aGroupers = oPlacementInfo.groupers;
			switch (aGroupers.length) {
				case 0:
					return oTemplateUtils.oCommonUtils.getText("GENERIC_MESSAGE_GROUP_NAME");
				case 1:
					return aGroupers[0].getTitle();
				default:
					var sTitle = aGroupers[0].getTitle();
					var oTable = aGroupers[1];
					var sTableHeader = oTable.getHeader();
					return oTemplateUtils.oCommonUtils.getText("MESSAGE_GROUP_TABLE", [sTitle, sTableHeader]);
			}
		}

		// This function returns bias value based on the type of message
		function getBiasForMessageType(sMessageType) {
			switch (sMessageType) {
				case MessageType.Error:
					return 1;
				case MessageType.Warning:
					return 2;
				case MessageType.Success:
					return 3;
				case MessageType.Information:
					return 4;
				case MessageType.None:
					return 5;
				default:
					return 6;
			}
		}

		// Sorter that compares the position of two child controls which have a common parent. One (but not both) of the children might be faulty (which would make it the larger one).
		// Returns a positive integer when oChild1 is larger, a negative number if oChild2 is larger, and 0 if they are identical
		function fnControlSorter(oCommonParent, oChild1, oChild2) {
			if (!oChild1) {
				return oChild2 ? 1 : 0;
			}
			if (!oChild2) {
				return -1;
			}
			return controlHelper.sortChildControls(oCommonParent, oChild1, oChild2);
		}

		// Sorting is done based on the loaction of control, like in which section control is present
		function fnCompare(oMsgObj1, oMsgObj2) {
			var oPlacementInfo1 = getMessagePlacementInfo(oMsgObj1.id);
			var oPlacementInfo2 = getMessagePlacementInfo(oMsgObj2.id);
			var bSameGroup = oPlacementInfo1.groupers.length === oPlacementInfo2.groupers.length && oPlacementInfo1.groupers.every(function (oControl, i) {
				return oPlacementInfo2.groupers[i] === oControl;
			});
			if (bSameGroup) {
				var sItemBindingPath1 = oPlacementInfo1.getItemBindingPath();
				var sItemBindingPath2 = oPlacementInfo2.getItemBindingPath();
				if (sItemBindingPath1 !== sItemBindingPath2){
					var oTable = oPlacementInfo1.groupers[1];
					var oTableInfo = getTableInfo(oTable);
					var oMessageInTableInfo1 = oTableInfo && oTableInfo.messageToMsgInTableInfo[oMsgObj1.id];
					var oMessageInTableInfo2 = oTableInfo && oTableInfo.messageToMsgInTableInfo[oMsgObj2.id];
					if (oMessageInTableInfo1 && oMessageInTableInfo2){
						if (oMessageInTableInfo1.index !== oMessageInTableInfo2.index){
							return oMessageInTableInfo1.index - oMessageInTableInfo2.index;
						}
					} else if (oMessageInTableInfo1 || oMessageInTableInfo2){
						return 1 - 2 * !oMessageInTableInfo2;
					}
					return ("" + sItemBindingPath1).localeCompare("" + sItemBindingPath2);
				}
				var iRet = getBiasForMessageType(oMsgObj1.type) - getBiasForMessageType(oMsgObj2.type); // check whether they can be sorted by severity
				if (iRet || !(oPlacementInfo1.controlId || oPlacementInfo2.controlId)) { // if yes, we are done. We are also done, if both messages could not be assigned to a place on the UI
					return iRet;
				}
			}
			if (!bSameGroup && (oPlacementInfo1.groupers.length === 1 || oPlacementInfo2.groupers.length === 1) && oPlacementInfo1.groupers[0] === oPlacementInfo2.groupers[0]) {
				// message belong to the same section, but one belongs to a table and one canot be associated to a table
				return oPlacementInfo1.groupers.length - oPlacementInfo2.groupers.length;
			}
			var aPath1 = oPlacementInfo1.pathToControlId;
			var aPath2 = oPlacementInfo2.pathToControlId;
			var iMaxPathLength = Math.max(aPath1.length, aPath2.length);
			for (var i = 0; i < iMaxPathLength; i++) {
				if (aPath1[i] !== aPath2[i]) {
					if (i === 0) {
						return fnControlSorter(oObjectPage, oPlacementInfo1.groupers[0], oPlacementInfo2.groupers[0]);
					}
					return fnControlSorter(controlHelper.byId(aPath1[i - 1]), (i < aPath1.length) && controlHelper.byId(aPath1[i]), (i < aPath2.length) && controlHelper.byId(aPath2[i]));
				}
			}
			return 0;
		}

		function performFunctionOnContext(oModel, sBindingPath, fnFunction){
/*			oModel.createBindingContext(sBindingPath, null, {
				transitionMessagesOnly: true
			}, fnFunction);
*/

			oModel.read(sBindingPath, {
				headers: {"sap-messages" : "transientOnly"},
				canonicalRequest : false,
				error : fnFunction.bind(null, null),
				updateAggregatedMessages : false,
				success: function(oData){
					var sKey = oData && oModel._getKey(oData);	
					var oNewContext = sKey ? oModel.getContext('/' + sKey, sBindingPath) : null;
					fnFunction(oNewContext);
				}
			});			
		}

		function getDetailsRetrievedPromise(sBindingPath, oTable, oTableInfo, aBindingPathMessages){
			return new Promise(function(fnResolve){
				var oModel = oObjectPage.getModel();
				performFunctionOnContext(oModel, sBindingPath, function(oContext){
					if (oContext){
						addContextInfoToMessageToMsgInTableInfo(oTableInfo, oContext, -1);
					} else { // could not retrieve a context for the given message, update accordingly
						aBindingPathMessages.forEach(function(sMsgId){
							var oPlacementInfo = getMessagePlacementInfo(sMsgId);
							var oTable = oPlacementInfo.groupers[1];
							var oTableInfo = oTable && getTableInfo(oTable);
							if (!oTableInfo || oTableInfo.messageToMsgInTableInfo[sMsgId]){
								return;
							}
							oTableInfo.messageToMsgInTableInfo[sMsgId] = {
								index: 9999999,
								rowCurrentlyShown: false,
								rowIdentifier: "",
								columnInfo: getColumnInfoForMessage(oPlacementInfo, oTableInfo)
							};
						});
					}
					fnResolve();							
				});
			});			
		}

		function fnFindTableForMessage(oMessage, mTableInfosReadyPromise, sPrefix){
			var bFound = false;
			oMessage.aFullTargets.some(function(sFullPath){
				if (sFullPath.startsWith(sPrefix)){
					oTemplateUtils.oInfoObjectHandler.executeForAllInformationObjects("smartTable", function(oInfoObject){
						if (!bFound){
							var sStart = sPrefix + oInfoObject.getNavigationProperty();
							if (sFullPath === sStart || sFullPath.startsWith(sStart + "(")){
								bFound = true;
								var sTableId = oInfoObject.getId();
								var oReadyPromise = mTableInfosReadyPromise[sTableId];
								if (oReadyPromise){
									oReadyPromise.messages.push(oMessage);
								} else {
									var aMessages = [oMessage];
									oReadyPromise = {
										messages: aMessages,
										promise: oInfoObject.getControlAsync().then(function(oSmartTable){
											var oTableInfo = getTableInfo(oSmartTable);
											return oTableInfo && oTableInfo.tableLoaded.then(function(){
												aMessages.forEach(function(oCollectedMessage){
													var oPlacementInfo = getMessagePlacementInfo(oCollectedMessage.id, oCollectedMessage);
													if (!oPlacementInfo.controlId){
														addControlIdToPlacementInfo([sTableId], oPlacementInfo);
													} 
												});
											});
										})
									};
									mTableInfosReadyPromise[sTableId] = oReadyPromise;
								}
							}
						}
					}, true);
				}
				return bFound;
			});
		}
		
		// The public function provided by this class. It is called from function fnPrepareForMessageHandling in ControllerImplementation.
		// Thereby it is assumed that (if considered necessary) all controls on the OP have been rendered and bound.
		// This should ensure that for all considered messages the connection to their controls has already been established.
		// However, this connection is created by ui5 in an asynchronous way, and currently they do not provide a mechanism which
		// lets us wait until this process has been finished.
		// Therfore, as a second chance we try to establish the connection between messages and tables ourselves, based on metadata.
		function getPrepareMessageDisplayPromise(oItemBinding, aMessages, oHelperModel, sBindingPath){
			fnReset(); // initialize caches
			var mTableInfosReadyPromise = Object.create(null);  // used to collect information about tables which could only be identified via second try
																// maps the id of such a table to an object with attributes:
																// - promise: A Promise resolved when the table is ready and placement info for corresponding messages has been updated
																// - messages: List of messages waiting for which this Promise is used
			aMessages.forEach(function(oMessage){ // create placement info for each relevant message
				var sMsgId = oMessage.id;
				getMessagePlacementInfo(sMsgId, oMessage); // creates and caches the placement info for the message
				if (oMessage.controlIds.length === 0){ // if no control is assigned to this message yet, try the second chance
					fnFindTableForMessage(oMessage, mTableInfosReadyPromise, sBindingPath + "/");
				}
			});
			var aTableInfosReadyPromises = []; // Collect the Promises for all the tables waiting for the second chance
			for (var sTableId in mTableInfosReadyPromise){
				aTableInfosReadyPromises.push(mTableInfosReadyPromise[sTableId].promise);
			}
			return Promise.all(aTableInfosReadyPromises).then(function(){ // all tables are ready
				return getMessageSorterForTableInfos().then(function(oSorter){
					var mMessageToGroupName = Object.create(null);
					var mMessageToSubtitle = Object.create(null);
					aMessages.forEach(function(oMessage){
						mMessageToGroupName[oMessage.id] = getGroupTitle(oMessage.id);
						mMessageToSubtitle[oMessage.id] = getSubtitle(oMessage.id, oMessage.additionalText);
					});
					oHelperModel.setProperty("/messageToGroupName", mMessageToGroupName);
					oHelperModel.setProperty("/messageToSubtitle", mMessageToSubtitle);
					oItemBinding.sort(oSorter);
					fnHeartBeat = function(){
						var iHeartBeat = oHelperModel.getProperty("/heartBeat") || 0;
						iHeartBeat++;
						oHelperModel.setProperty("/heartBeat", iHeartBeat);
					};
					return {
						getSubtitle: getSubtitle
					};
				});
			});
		}

		function getMessageSorterForTableInfos(){
			var aTableInfoPromises = [];
			for (var sTableId in mTableIdToTableInfo){
				var oTableInfo = mTableIdToTableInfo[sTableId];
				if (oTableInfo){
					aTableInfoPromises.push(oTableInfo.tableLoaded);
				}
			}
			return Promise.all(aTableInfoPromises).then(getMessageSorterForPlacementInfos);
		}

		function fnAddValidationInfoToTableInfo(oMessage, oTableInfo){
			var oTargetControl = controlHelper.byId(oMessage.controlIds[0]);
			var oContext = oTargetControl.getBindingContext();
			var aContexts = oTableInfo.presentationControlHandler.getCurrentContexts() || [];
			var iPosition = -1;
			aContexts.some(function(oCandidateContext, i){
				if (oCandidateContext === oContext){
					iPosition = i;
					return true;
				}
			});
			var oColumn = oTableInfo.presentationControlHandler.getColumnForCell(oTargetControl);			
			var oMessageInTableInfo = {
				index: iPosition,
				rowCurrentlyShown: true,
				rowIdentifier: getRowIdentifier(oTableInfo.presentationControlHandler, oContext),
				columnInfo: getColumnInfoForColumn(oTableInfo, oColumn)
			};						
			oTableInfo.messageToMsgInTableInfo[oMessage.id] = oMessageInTableInfo;
			return oMessageInTableInfo;			
		}
		
		function getMessageSorterForPlacementInfos(){
			var aMessageDetailsRetrievedPromises = [];
			var mBindingPathesToMessageList = Object.create(null);
			var fnHandleMessage = function(sMsgId){
				var oPlacementInfo = getMessagePlacementInfo(sMsgId);
				var oTable = oPlacementInfo.groupers[1];
				var oTableInfo = oTable && getTableInfo(oTable);
				if (oTableInfo){
					var oMessage = oPlacementInfo.message;
					var oMessageInTableInfo = oTableInfo.messageToMsgInTableInfo[sMsgId];
					if (!(oMessageInTableInfo && oMessageInTableInfo.rowCurrentlyShown)){
						if (oMessage.validation){
							fnAddValidationInfoToTableInfo(oMessage, oTableInfo);
						} else {
							var sBindingPath = oPlacementInfo.getItemBindingPath();
							if (sBindingPath){
								var aBindingPathMessages = mBindingPathesToMessageList[sBindingPath];
								if (aBindingPathMessages){
									aBindingPathMessages.push(sMsgId);
								} else {
									aBindingPathMessages = [sMsgId];
									mBindingPathesToMessageList[sBindingPath] = aBindingPathMessages;
									var oDetailsRetrievedPromise = getDetailsRetrievedPromise(sBindingPath, oTable, oTableInfo, aBindingPathMessages);
									aMessageDetailsRetrievedPromises.push(oDetailsRetrievedPromise);
								}
							}
						}
					}														
				}
			};
			for (var sMsgId in mMessageToPlacementInfo){
				fnHandleMessage(sMsgId);
			}			
			return Promise.all(aMessageDetailsRetrievedPromises).then(function(){
				var oMessageSorter = new Sorter("");
				oMessageSorter.fnCompare = fnCompare;
				return oMessageSorter;
			});			
		}
		
		function getSubtitleForRow(oMessageInTableInfo){
			var sI18NKey = "MSG_SUBTITLE_ROW";
			var aParams = [oMessageInTableInfo.rowIdentifier];
			if (!oMessageInTableInfo.rowCurrentlyShown){
				sI18NKey += "_HIDDEN";
			}
			if (oMessageInTableInfo.columnInfo){
				aParams.push(oMessageInTableInfo.columnInfo.label);
				sI18NKey += "_COLUMN";
				if (oMessageInTableInfo.columnInfo.hidden){
					sI18NKey += "_HIDDEN";
				}
			}
			return oTemplateUtils.oCommonUtils.getText(sI18NKey, aParams);
		}
		
		function getSubtitle(sMsgId, sAdditionalText){
			var oPlacementInfo = getMessagePlacementInfo(sMsgId);
			var oTable = oPlacementInfo.groupers[1];
			if (!oTable){
				return sAdditionalText;
			}
			var oTableInfo = getTableInfo(oTable);
			if (oTableInfo){
				var oMessageInTableInfo = oTableInfo.messageToMsgInTableInfo[sMsgId];
				if (!oMessageInTableInfo && oPlacementInfo.message.validation){
					oMessageInTableInfo = fnAddValidationInfoToTableInfo(oPlacementInfo.message, oTableInfo);
				}
				if (oMessageInTableInfo && oMessageInTableInfo.rowIdentifier){
					return getSubtitleForRow(oMessageInTableInfo); 
				}
			}
			return sAdditionalText;
		}

		// public instance methods
		return {
			getPrepareMessageDisplayPromise: getPrepareMessageDisplayPromise
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.controller.MessageSortingHandler", {
		constructor: function(oController, oTemplateUtils, oObjectPage) {
			extend(this, getMethods(oController, oTemplateUtils, oObjectPage));
		}
	});
});