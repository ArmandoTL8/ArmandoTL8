
sap.ui.define([
    "sap/ui/base/Object",
    "sap/suite/ui/generic/template/genericUtilities/controlHelper",
    "sap/base/util/extend"
], function (BaseObject, controlHelper, extend) {
        "use strict";

        /**
         * This class handles the creation of multiple empty rows (inline creation rows) in the table. 
         * The empty rows are created when the table receives the data.
         * 
         * The code flow starts from "fnOnBeforeRebindControl" method. 
         * This method attaches listener for "dataReceived" event for the table.
         * 
         * --------------------
         * Pre-conditions
         * --------------------
         * In order to create empty rows, the following conditions should be met
         * 1. The application is draft enabled
         * 2. The table type should be either Responsive Table or Grid Table
         * 3. In the table's manifest setting, the value of "createMode" should be either "creationRows" or "creationRowsHiddenInEditMode"
         * 
         * If the "createMode" is "creationRows"
         *  - The inline creation rows added to the table when the page is in either "Create" or "Edit" mode
         * If the "createMode" is "creationRowsHiddenInEditMode"
         *  - When the page is in "Create" mode, it works same as "creationRows"
         *  - When the page is in "Edit" mode, the inline creation rows are added to the table only after "Create" button is clicked
         * 
         * Note: Please refer the method "fnHandleAddEntry" to understand the "Create" button functionality
         * --------------------
         * Creation phase
         * --------------------
         * 1. The inline creation rows are created at
         *  a. The top of Responsive Table
         *  b. The bottom of Grid Table
         * 2. When the current inline creation row is edited, a new inline creation row will be created below the current one
         * 
         * --------------------
         * Post process
         * --------------------
         * This class also makes the following changes after inline creation rows are added to the table.
         * In both Responsive & Grid tables,
         *      a. Navigation & inline delete icons are hidden from the newly created inline creation rows (Row is in "inactive" state)
         *      b. Navigation & inline delete icons are restored when the the inline creation rows are edited (Row is in "transient" state)
         * In Responsive table,
         *      The "Create" button is hidden in the table toolbar
         * In Grid table,
         *      When the "Create" button in the toolbar is clicked, it scrolls down to the bottom of the table
         */

        function getMethods(oObjectPage, oTemplateUtils, fnGetSmartTableCreationMode) {
            var BINDING_PATH_TRANSIENT_CONTEXT = "@$ui5.context.isTransient";
            /**
             * In order to create the inline creation rows,
             *  - The UI model's "/editable" property should be true for the "creationRows" mode.
             *  - Similarly, UI model's "/createMode" property should be true for the "creationRowsHiddenInEditMode" mode.
             * 
             * If the corresponding UI model property is false, the table ids will be added to the respective set in the below "oTablesToBeProcessed" object.
             * Please refer the function "fnCheckUIModelProp" for the same.
             * 
             * When the UI model property becomes true, inline creation rows will be added to all the tables stored in the set.
             * Please refer the function "onUIModelPropChanged". Once the inline creation rows added to a table, it's id will be removed from the set.
             * 
             */
            var oTablesToBeProcessed = {
                creationRows: new Set(),
                creationRowsHiddenInEditMode: new Set()
            };
            var oUIModelPropForCreationMode = {
                creationRows: "/editable",
                creationRowsHiddenInEditMode: "/createMode"
            };
            var oBindingSet;
            var mDefaultRowTypeByTableId = new Map();
            var oUIModelPropsWithChangeEventAttached = new Set();
            var iInlineCreationRowCount = 2; //Hardcoding the count

            function fnOnBeforeRebindObjectPage(){
                //Clear the cache
                oTablesToBeProcessed.creationRows.clear();
                oTablesToBeProcessed.creationRowsHiddenInEditMode.clear();
            }

            /***
             * Utility functions
             */
            function fnIsCreationAllowed (oSmartTable) {
                var sBoolRestrictions = oSmartTable.data("isEntityCreatableUsingBooleanRestrictions"),
                    vPathRestrictions = oSmartTable.data("isEntityCreatableUsingPathRestrictions");
                
                return sBoolRestrictions === "true" && ["true", true].includes(vPathRestrictions);
            }

            // Should be called by the outside in the onBeforeRebind event of any of the affected smart controls.
            function fnOnBeforeRebindControl (oEvent) {
                //Inline Creation Rows are supported only on draft based apps
                if (!oTemplateUtils.oComponentUtils.isDraftEnabled()) {
                    return;
                }
                var oSmartTable = oEvent.getSource();
                var oTable = oSmartTable.getTable();
                //Inline Creation Rows are not supported in AnalyticalTable and TreeTable
                if (controlHelper.isAnalyticalTable(oTable) || controlHelper.isTreeTable(oTable)) {
                    return;
                }
                //Smart table's creation mode should support inline creation rows
                var sSmartTableCreationMode = fnGetSmartTableCreationMode(oSmartTable);
                var bIsInlineCreateEnabled = ["creationRows", "creationRowsHiddenInEditMode"].includes(sSmartTableCreationMode);
                if (!bIsInlineCreateEnabled) {
                    return;
                }

                var oUIModel = oObjectPage.getModel("ui");
                var oBindingParams = oEvent.getParameters().bindingParams;
                var fnOldDataReceived = oBindingParams.events.dataReceived || Function.prototype;
                oBindingParams.events.dataReceived = function (onDataReceivedEvent) {
                    fnOldDataReceived.call(this, onDataReceivedEvent);
                    fnCheckUIModelProp(oSmartTable, sSmartTableCreationMode, oUIModel);
                };
            }

            function fnCheckUIModelProp(oSmartTable, sSmartTableCreationMode, oUIModel) {
                var sUIModelProp = oUIModelPropForCreationMode[sSmartTableCreationMode];
                //Add the smart table id to the list of tables to be processed
                oTablesToBeProcessed[sSmartTableCreationMode].add(oSmartTable.getId());
                //If the property is true, proceed with the creating inline creation rows
                if (oUIModel.getProperty(sUIModelProp)) {
                    fnFetchDefaultValues(oSmartTable).then(function (oDefaultValues){
                        fnAddCreationRowsImpl(oSmartTable, oDefaultValues);
                    });
                }
                //Additionally, ensure the required registration of "onEditablePropertyChanged". See more there
                if (!oUIModelPropsWithChangeEventAttached.has(sUIModelProp)) {
                    oUIModel.bindProperty(sUIModelProp).attachChange(onUIModelPropChanged.bind(null, sSmartTableCreationMode));
                    oUIModelPropsWithChangeEventAttached.add(sUIModelProp);
                }
            }

            /**
             * This method is invoked when "editable" or "createMode" property of the UI model is changed.
             * When the property value becomes true, this method invokes the logic of creating inline rows
             * Note: This method is registered at the UI model once in function "fnCheckUIModelProp" 
             */
            function onUIModelPropChanged(sSmartTableCreationMode, oEvent) {
                if (oEvent.getSource().getValue()) { // called by the change of UI Model
                    var oTablesToBeProcessedOnCreationMode = oTablesToBeProcessed[sSmartTableCreationMode];
                    oTablesToBeProcessedOnCreationMode.forEach(function (sSmartTableId) {
                        var oControl = sap.ui.getCore().byId(sSmartTableId);
                        fnFetchDefaultValues(oControl).then(function (oDefaultValues){
                            fnAddCreationRowsImpl(oControl, oDefaultValues);
                        });
                    });
                }
            }

            /***
             * Invokes "createInactiveLineItem" method to create inline rows.
             * 
             * If the table is "Responsive Table", the inline rows are created at the beginning of the table. 
             * But for "Grid Table", rows are created at the end
             */
            function fnAddCreationRowsImpl(oSmartTable, oDefaultValues) {
                var oTable = oSmartTable.getTable();
                var sSmartTableCreationMode = fnGetSmartTableCreationMode(oSmartTable);
                var oSmartTableHandler = oTemplateUtils.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(oSmartTable);
                var bResponsiveTable = oSmartTableHandler.isMTable();
                var oItemsBinding = oSmartTableHandler.getBinding();
                // for grid table, all creations are at the end. only add creation rows when list binding's length is final
                var bIsLengthFinal = oSmartTableHandler.isLengthFinal();
                var bIsCreationAllowed = fnIsCreationAllowed(oSmartTable);
                if (oItemsBinding.isFirstCreateAtEnd() === undefined && bIsLengthFinal && oItemsBinding.getContext() && bIsCreationAllowed) { // no inline creation rows have been added yet
                    var i;
                    for (i = 0; i < iInlineCreationRowCount; i++) {
                        // for responsive table, the very first creation is at the start and the following at the end
                        createInactiveLineItem(oItemsBinding, oDefaultValues, bResponsiveTable ? (i !== 0) : true);
                    }
                    //Remove the smart table id from the list of tables to be processed
                    oTablesToBeProcessed[sSmartTableCreationMode].delete(oSmartTable.getId());
                }

                //Hide navigation and delete controls on transient rows
                var fnAfterRenderCallback = fnUpdateTableRows.bind(null, oTable);
                fnInvokeCallbackAfterRendering(oTable, fnAfterRenderCallback);

                //Attaching "createActivate" event to items binding. 
                // So that when the inline creation rows are updated, a new inline row is getting created
                oBindingSet = oBindingSet || new Set();
                if (!oBindingSet.has(oItemsBinding)) {
                    fnAttachCreateActivateEventOnItemsBinding(oSmartTable, oItemsBinding);
                    oBindingSet.add(oItemsBinding);
                }
            }

            /**
             * This method creates a new inline creation row when the current inline row is updated.
             * The new row will be created below the current row
             */
            function fnAttachCreateActivateEventOnItemsBinding(oSmartTable, oItemsBinding) {
                oItemsBinding.attachCreateActivate(function () {
                    fnFetchDefaultValues(oSmartTable).then(function(oDefaultValues){
                        createInactiveLineItem(oItemsBinding, oDefaultValues, true);
                        fnUpdateTableRows(oSmartTable.getTable());
                    });
                }); 
            }

            /**
             * Actual implementation of creating inline rows.
             * It invokes the ODataListBinding#create method with the parameter "inactive" as true. 
             * 
             * @param {*} oItemsBinding Items binding of the table
             * @param {*} oDefaultValues Default values 
             * @param {*} bAtEnd Flag determines whether the new row should be added at the beginning or end
             */
            function createInactiveLineItem(oItemsBinding, oDefaultValues, bAtEnd) {                
				oItemsBinding.create(oDefaultValues, bAtEnd, { inactive: true });
            }

            /***
             * Fetches the default values for the table.
             * 
             * @param {*} oSmartTable Smart table 
             */
            function fnFetchDefaultValues (oSmartTable) {
                return new Promise(function (fnResolve) {
                    var oGetDefaultValuesPromise = oTemplateUtils.oServices.oCRUDManager.getDefaultValues(oSmartTable, null, true);

                    if (oGetDefaultValuesPromise instanceof Promise) {
                        oGetDefaultValuesPromise.then(function (aResponse){
                            var oDefaultValues = aResponse[0];
                            fnResolve(oDefaultValues);
                        }).catch(function(){
                            fnResolve(null);
                        });
                    } else {
                        fnResolve(null);
                    }
                });
            }

            /**
             * When the component is already rendered, immediately invokes the callback.
             * Otherwise, invokes the callback after the first render.
             * 
             * @param {sap.ui.core.Control} oControl Control to be rendered
             * @param {Function} fnCallback Callback function to be invoked after render
             */
            function fnInvokeCallbackAfterRendering (oControl, fnCallback) {
                var oEventDelegate;

                if (oControl.getDomRef()) {
                    fnCallback();
                } else {
                    oEventDelegate = oControl.addEventDelegate({
                        onAfterRendering: function () {
                            fnCallback();
                            oControl.removeEventDelegate(oEventDelegate);
                        }
                    });
                }
            }

            //Based on the table type, this method invokes the appropriate method to update table rows
            function fnUpdateTableRows(oTable) {
                if (controlHelper.isMTable(oTable)) {
                    fnUpdateResponsiveTableRows(oTable);
                }
            }

            /**
             * Filters out the transient rows which are not yet bounded with the "Context.isTransient" path.
             * And, invokes "fnHideInlineControlsOnTransientRow" for each rows
             * @param {sap.m.Table} oTable 
             */
            function fnUpdateResponsiveTableRows(oTable) {
                var sDefaultRowType,
                    sTableId = oTable.getId(),
                    aTransientRows = oTable.getItems().filter(function (oCurrentRow){
                        var bIsTransient = oCurrentRow.getBindingContext().isTransient();
                        var bIsCurrentRowAlreadyBound = oCurrentRow.getBinding("type") && oCurrentRow.getBinding("type").getPath() === BINDING_PATH_TRANSIENT_CONTEXT;
                        return bIsTransient && !bIsCurrentRowAlreadyBound;
                    });

                if (aTransientRows.length === 0) {
                    return;
                }    
                // Preserving the default row type into "mDefaultRowTypeByTableId".
                // sDefaultRowType is used by "fnHideInlineControlsOnTransientRow" to restore the row type when the row is peristed 
                if (mDefaultRowTypeByTableId.get(sTableId)) {
                    sDefaultRowType = mDefaultRowTypeByTableId.get(sTableId);
                } else {
                    sDefaultRowType = aTransientRows.at(0).getProperty("type");
                    mDefaultRowTypeByTableId.set(sTableId, sDefaultRowType);
                }

                aTransientRows.forEach(function(oCurrentRow){
                    var fnAfterRenderCallback = fnHideInlineControlsOnTransientRow.bind(null, oCurrentRow, sDefaultRowType);
                    fnInvokeCallbackAfterRendering(oCurrentRow, fnAfterRenderCallback);
                });
            }

            /**
             * This method binds the row type and the visibility of delete control with row's binding context
             * 1. When the binding context is transient ($context.isTransient = true)
             *  a. Row type becomes inactive. So that, the navigation icon is hidden
             *  b. Delete control becomes invisible
             * 2. When the binding context is persisted ($context.isTransient = false)
             *  a. Restores the List Type (i.e., restores the navigation icon)
             *  b. Restores the delete control
             * 3. When the transient row becomes draft row and the row is selected, enables the relevant toolbar buttons 
             * @param {sap.m.ColumnListItem} oTableRow Responsive table row
             * @param {sap.m.ListType} sDefaultRowType Default row type
             */
            function fnHideInlineControlsOnTransientRow (oTableRow, sDefaultRowType) {
                var oDeleteControl = oTableRow.getDeleteControl();

                oTableRow.bindProperty("type", {
                    path: BINDING_PATH_TRANSIENT_CONTEXT,
                    formatter: function (bIsTransient) {
                        return bIsTransient ? "Inactive" : sDefaultRowType;
                    }
                });
                oDeleteControl && oDeleteControl.bindProperty("visible", {
                    path: BINDING_PATH_TRANSIENT_CONTEXT,
                    formatter: function (bIsTransient) {
                        return !bIsTransient;
                    }
                });

                //The "created" method returns a promise and it's resolved when the transient row becomes a draft row
                var oConextCreationPromise = oTableRow.getBindingContext().created();
                oConextCreationPromise && oConextCreationPromise.then(function(){
                    //If the row is selected, enable the relevant toolbar buttons
                    oTableRow.isSelected() && oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oTableRow);
                });
            }

            /**
             * ------------------------------------ 
             * Handling the creation button click
             * ------------------------------------
             * If table's creation mode is "creationRows"
             *  - Focuses the first editable field on the first inline creation row
             * If creation mode is "creationRowsHiddenInEditMode"
             *  - If the "Create" button is clicked first time, adds the "Inline Creation Rows" to the table
             *  - Otherwise, focuses the first editable field on the first inline creation row
             * 
             * @param {*} oSmartTable Smart Table
             */
            function fnHandleAddEntry (oSmartTable) {
                var oSmartTableHandler = oTemplateUtils.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(oSmartTable),
                    bFirstClick = oSmartTableHandler.getBinding().isFirstCreateAtEnd() === undefined,
                    sSmartTableCreationMode = fnGetSmartTableCreationMode(oSmartTable);

                if (sSmartTableCreationMode === "creationRows") {
                    oSmartTableHandler.focusOnFirstTransientRow();
                }  else if (sSmartTableCreationMode === "creationRowsHiddenInEditMode") {
                    //Create inline creation rows on first click
                    if (bFirstClick)  {
                        fnFetchDefaultValues(oSmartTable).then(function (oDefaultValues){
                            fnAddCreationRowsImpl(oSmartTable, oDefaultValues);
                        });
                    } else {
                        oSmartTableHandler.focusOnFirstTransientRow();                   
                    }
                }   
            }

            return {
                onBeforeRebindObjectPage: fnOnBeforeRebindObjectPage,
                addCreationRowsImpl: fnAddCreationRowsImpl,
                onBeforeRebindControl: fnOnBeforeRebindControl,
                handleAddEntry: fnHandleAddEntry
            };

        }

        return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.controller.InlineCreationRowsHelper", {
            constructor: function (oObjectPage, oTemplateUtils, fnGetSmartTableCreationMode) {
                extend(this, getMethods(oObjectPage, oTemplateUtils, fnGetSmartTableCreationMode));
            }
        });
    });
