sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/ui/model/json/JSONModel",
	"sap/rules/ui/ast/constants/Constants",
	"sap/rules/ui/ast/provider/TermsProvider"

], function (Control, List, JSONModel, Constants, TermsProvider) {
	"use strict";

	var instance;
	var LoopFunctionDialog = function () {
		this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
		this.functionLabelDisplay = "";
		this.functionLabel = "";
		this._loopFunctionSelected = "";
		this._whereExpressionId = "";
		this.dataObjectId = "";
		this.dataObjectLabel = "";
		this.dataObjectIdSelected = "";
		this.selectedData = [{
			operationSelected: "",
			preSuggestionContext: "",
			cancelButton: false,
			addButton: true
		}];

		this.enabledData = {
			enabled: false
		};
		this.dataObjectIdData = {
			dataObjectId: ""
		};
	};

	LoopFunctionDialog.prototype._filterloopFunctionVocabulary = function (terms) {
		var vocabularyJson = [];
		var termsProviderInstance = TermsProvider.getInstance();
		if (terms && terms.length > 0) {
			for (var iterator = 0; iterator < terms.length; iterator++) {
				var resultDOId = terms[iterator].ResultDataObjectId;
				if (terms[iterator].type && terms[iterator].type === "T") {
					vocabularyJson.push(terms[iterator]);
				} else if (resultDOId) {
					var resultDO = termsProviderInstance.getTermByTermId(resultDOId);
					if (resultDO && resultDO.getDataObjectType() === Constants.Table) {
						vocabularyJson.push(terms[iterator]);
					}
				}
			}
			return {
				terms: vocabularyJson
			};
		}
	};
	LoopFunctionDialog.prototype._createLoopFunctionDropDown = function (loopFunction, sAriaValue) {
		var that = this;
		var model = new sap.ui.model.json.JSONModel(loopFunction);

		this.functionLoop = new sap.m.Select({
			width: "200px",
			selectedKey: this._loopFunctionSelected,
			forceSelection: false,
			showSecondaryValues: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			ariaLabelledBy: sAriaValue,
			change: function (oEvent) {
				that._loopFunctionSelected = oEvent.getSource().getSelectedItem().getText();
				if (that.dataObjectId && that._loopFunctionSelected) {
					that.functionLabelDisplay = that._loopFunctionSelected + '(' + that.dataObjectLabel + ')';
					that.functionLabel = that._loopFunctionSelected + '(' + that.dataObjectId + ')';
					that.functionLabelField.setValue(that.functionLabelDisplay);
					if ((that.oModel.getData().selectionData[0].operationSelected !== "" &&
							that._loopFunctionSelected === Constants.FOREACH)) {
						that.applyButton.setEnabled(true);
					} else {
						that.applyButton.setEnabled(false);
					}
					that.astExpressionBasicForWhere.setEditable(true);
				} else {
					that.applyButton.setEnabled(false);
					that.astExpressionBasicForWhere.setEditable(false);
					that.astExpressionBasicForWhere.setValue("");
					that.functionLabelField.setValue("");
				}
			}.bind(this)
		}).addStyleClass("sapAstExpressionDialogField");
		this.functionLoop.setModel(model);
		this.functionLoop.bindItems({
			path: "/loop",
			template: new sap.ui.core.ListItem({
				text: "{name}",
				key: "{name}",
				additionalText: "{label}"
			})
		});

		return this.functionLoop;
	};

	LoopFunctionDialog.prototype._getOperationAstExpressionBasic = function (bindingContext, sAriaValue) {
		var that = this;
		this.astExpressionBasicForOperation = new sap.rules.ui.AstExpressionBasic({
			astExpressionLanguage: this._oAstExpressionLanguage,
			value: "{operationSelected}",
			conditionContext: false,
			operationsContext: true,
			editable: true,
			placeholder: this.oBundle.getText("expressionPlaceHolder"),
			ariaLabelledBy: sAriaValue,
			dataObjectInfo: "{preSuggestionContext}",
			change: function (oEvent) {
				var sequence = parseInt(oEvent.getSource().getBindingContext().sPath.split("/")[2]);
				that._expressionForOperationInput = oEvent.getParameter("newValue");
				var selectionData = that.oModel.getData().selectionData;
				if (that._expressionForOperationInput) {
					selectionData[sequence].operationSelected = that._expressionForOperationInput.trim();

				}
				if ((that.oModel.getData().selectionData[0].operationSelected !==
						"" && that._loopFunctionSelected === Constants.FOREACH)) {
					that.applyButton.setEnabled(true);
				} else {
					that.applyButton.setEnabled(false);
				}
				that._setPreSuggestionContextChange(sequence);
			}.bind(this)
		});
		this.astExpressionBasicForOperation.addStyleClass("sapAstExpressionDialog");
		return this.astExpressionBasicForOperation;
	};

	LoopFunctionDialog.prototype._tableColumnsFactory = function (sId, oContext) {
		var that = this;
		var itemTemplate = new sap.m.ColumnListItem({
			cells: [that._getOperationAstExpressionBasic("loopOperationsLabelId"),
				new sap.ui.layout.HorizontalLayout({
					content: [
						new sap.m.Button({
							type: sap.m.ButtonType.Transparent,
							icon: sap.ui.core.IconPool.getIconURI("sys-cancel"),
							visible: "{cancelButton}",
							enabled: "{/enabledData/enabled}",
							press: function (oEvent) {

								/*   //Clear tableData since the columns will be build again
								      this._internalModel.setProperty("/tableData", {}, true);*/
								var sequence = oEvent.getSource().getIdForLabel().split("-")[2];
								//Remove coulmn from JSON model
								that._removeColumnFromJsonModel(parseInt(sequence));

							}.bind(this)
						}),
						new sap.m.Button({
							type: sap.m.ButtonType.Transparent,
							icon: sap.ui.core.IconPool.getIconURI("add"),
							visible: "{addButton}",
							enabled: "{/enabledData/enabled}",
							press: function (oEvent) {
								var sequence = oEvent.getSource().getIdForLabel().split("-")[2];
								//Add coulmn from JSON model
								that._addColumnToJsonModel(parseInt(sequence));

							}.bind(this)
						})
					]
				})
			]
		});

		return itemTemplate;
	};

	LoopFunctionDialog.prototype._addColumnToJsonModel = function (sequence) {
		var newjson = {
			operationSelected: "",
			preSuggestionContext: "",
			cancelButton: true,
			addButton: true,
		}

		this.selectedData.splice(sequence + 1, 0, newjson);
		if (this.selectedData.length > 1) {
			this.selectedData[0].cancelButton = true;
		}

		this._setPreSuggestionContext();
		this.oModel.setData({
			selectionData: this.selectedData,
			enabledData: this.enabledData,
			dataObjectIdData: this.dataObjectIdData

		});

	};

	LoopFunctionDialog.prototype._setPreSuggestionContext = function () {
		for (var i = 1; i < this.selectedData.length; i++) {
			for (var j = 0; j < i; j++) {
				this.selectedData[i].preSuggestionContext = this.selectedData[j].preSuggestionContext + this.selectedData[j].operationSelected + ",";
			}
		}
	};

	LoopFunctionDialog.prototype._setPreSuggestionContextChange = function (sequence) {
		if (sequence >= 0 && sequence < this.selectedData.length - 1) {
			for (var j = sequence; j < this.selectedData.length - 1; j++) {
				this.selectedData[j + 1].preSuggestionContext = this.selectedData[j].preSuggestionContext + this.selectedData[j].operationSelected +
					",";
			}
		}
	};

	LoopFunctionDialog.prototype._removeColumnFromJsonModel = function (sequence) {
		this.selectedData.splice(sequence, 1);
		if (this.selectedData.length === 1) {
			this.selectedData[0].cancelButton = false;
		}
		if (sequence !== 1) {
			this._setPreSuggestionContext();
		}
		this.oModel.setData({
			selectionData: this.selectedData,
			enabledData: this.enabledData,
			dataObjectIdData: this.dataObjectIdData
		});
	};

	LoopFunctionDialog.prototype._getSuggestionsForTheGivenInput = function (inputText) {
		var tokens = this._oAstExpressionLanguage.getTokensForGivenStringInput(inputText);
		var uiModel = this._oAstExpressionLanguage.convertTokensToUiModelForAutoSuggestion(tokens);
		var suggestionContext = {};
		suggestionContext.AttributeContext = true;
		suggestionContext.OperationsContext = false;
		var suggestions = this._oAstExpressionLanguage.getSuggesstions(uiModel, suggestionContext);
		return suggestions;
	};

	LoopFunctionDialog.prototype._createVocabularyDropDown = function (sAriaValue) {
		var that = this;
		var autoSuggestion = this._getSuggestionsForTheGivenInput("");
		var aVocabulary = this._filterloopFunctionVocabulary(autoSuggestion.autoComplete.categories.terms);
		var model = new sap.ui.model.json.JSONModel(aVocabulary);

		this.vocabularySelect = new sap.m.Select({
			width: "100%",
			selectedKey: this.dataObjectIdSelected,
			forceSelection: false,
			ariaLabelledBy: sAriaValue,
			change: function (oEvent) {
				that.dataObjectIdSelected = oEvent.getSource().getSelectedItem().getKey();
				that.dataObjectId = "/" + oEvent.getSource().getSelectedItem().getKey();
				that.dataObjectLabel = oEvent.getSource().getSelectedItem().getText();
				if (that.dataObjectId) {
					that.oModel.getData().dataObjectIdData.dataObjectId = that.dataObjectId;
					that.oModel.getData().enabledData.enabled = true;
				}
				this.selectedData = [{
					operationSelected: "",
					preSuggestionContext: "",
					cancelButton: false,
					addButton: true
				}];
				that.selectedData[0].preSuggestionContext = this._loopFunctionSelected + "(" + that.dataObjectId + ",";
				that._bindOperations();
				var str = that._setDataObjectInfoForWhereConditionAutoSuggestion();
				that.astExpressionBasicForWhere.setDataObjectInfo(str);
				if (that.dataObjectId && that._loopFunctionSelected) {
					that.functionLabelDisplay = that._loopFunctionSelected + '(' + that.dataObjectLabel + ')';
					that.functionLabel = that._loopFunctionSelected + '(' + that.dataObjectId + ')';
					that.functionLabelField.setValue(that.functionLabelDisplay);
					if ((that.oModel.getData().selectionData[0].operationSelected !== "" && that._loopFunctionSelected === Constants.FOREACH)) {
						that.applyButton.setEnabled(true);
					} else {
						that.applyButton.setEnabled(false);
					}
					that.astExpressionBasicForWhere.setValue("");
					that._whereExpressionId = "";
					that.astExpressionBasicForWhere.setEditable(true);
				} else {
					that.applyButton.setEnabled(false);
					that.astExpressionBasicForWhere.setEditable(false);
					that.astExpressionBasicForWhere.setValue("");
					that.functionLabelField.setValue("");
				}
			}.bind(this)
		}).addStyleClass("sapAstExpressionDialogField");
		this.vocabularySelect.setModel(model);
		this.vocabularySelect.bindItems({
			path: "/terms",
			template: new sap.ui.core.ListItem({
				text: "{label}",
				key: "{id}"
			})
		});
		// Add Rules to the same path so that the dataobjects list contain rules as well
		var vocabularyRules = autoSuggestion.autoComplete.categories.vocabularyRules;
		for (var entry in vocabularyRules) {
			var item = new sap.ui.core.ListItem({
				text: vocabularyRules[entry].label,
				key: vocabularyRules[entry].id
			})
			this.vocabularySelect.addItem(item);
		}

		return this.vocabularySelect;
	};

	LoopFunctionDialog.prototype._bindOperations = function () {
		this.oModel = new sap.ui.model.json.JSONModel();
		this.oModel.setData({
			selectionData: this.selectedData,
			enabledData: this.enabledData,
			dataObjectIdData: this.dataObjectIdData
		});
		this.conditionsTable.setModel(this.oModel);
	};
	LoopFunctionDialog.prototype._createWhereAstExpressionBasic = function (sAriaValue) {
		var that = this;
		this.astExpressionBasicForWhere = new sap.rules.ui.AstExpressionBasic({
			astExpressionLanguage: this._oAstExpressionLanguage,
			enableAggregateFunctionWhereClause: true,
			value: this._whereExpressionId,
			editable: "{/value}",
			dataObjectInfo: this._setDataObjectInfoForWhereConditionAutoSuggestion(),
			ariaLabelledBy: sAriaValue,
			change: function (oEvent) {
				that._whereExpressionId = oEvent.getParameter("newValue");
				if (that.selectedData.length === 1 && that._whereExpressionId) {
					that.selectedData[0].preSuggestionContext = that._loopFunctionSelected + "(" + Constants.FILTER + "(" + that.dataObjectId + "," +
						that._whereExpressionId + ") ,";
				} else if (that.selectedData.length === 1 && !that._whereExpressionId) {
					that.selectedData[0].preSuggestionContext = that._loopFunctionSelected + "(" + that.dataObjectId + ",";
				} else if (that.selectedData.length > 1 && that._whereExpressionId) {
					that.selectedData[0].preSuggestionContext = that._loopFunctionSelected + "(" + Constants.FILTER + "(" + that.dataObjectId + "," +
						that._whereExpressionId + ") ,";
					that._setPreSuggestionContextChange(0);
				} else if (that.selectedData.length > 1 && !that._whereExpressionId) {
					that.selectedData[0].preSuggestionContext = that._loopFunctionSelected + "(" + that.dataObjectId + ",";
					that._setPreSuggestionContextChange(0);
				}

				that._bindOperations();
			}.bind(this)
		});
		this.astExpressionBasicForWhere.addStyleClass("sapAstExpressionDialog");
		return this.astExpressionBasicForWhere;
	};

	LoopFunctionDialog.prototype._setDataObjectInfoForWhereConditionAutoSuggestion = function () {
		if (this.dataObjectId) {
			var dataObjectId = this.dataObjectId;
			return this._loopFunctionSelected + "(" + Constants.FILTER + "(" + dataObjectId + ",";

		}
	};

	LoopFunctionDialog.prototype._createFunctionLabel = function () {
		this.functionLabelField = new sap.m.TextArea({
			value: this.functionLabelDisplay,
			enabled: false,
			width: "100%"
		}).addStyleClass("sapAstExpressionDialogTextField");
		return this.functionLabelField;
	};

	LoopFunctionDialog.prototype._clearData = function () {
		this.functionLabelDisplay = "";
		this.functionLabel = "";
		this._loopFunctionSelected = "";
		this._whereExpressionId = "";
		this.dataObjectId = "";
		this.dataObjectLabel = "";
		this.dataObjectIdSelected = "";
		this.operationsPreExpression = "";
		this.selectedData = [{
			operationSelected: "",
			preSuggestionContext: "",
			cancelButton: false,
			addButton: true
		}];

		this.enabledData = {
			enabled: false
		};
		this.dataObjectIdData = {
			dataObjectId: ""
		};
	}

	LoopFunctionDialog.prototype._createTable = function () {
		var that = this;
		this.conditionsTable = new sap.m.Table({
			backgroundDesign: sap.m.BackgroundDesign.Solid,
			showSeparators: sap.m.ListSeparators.None,
			layoutData: new sap.ui.layout.form.GridContainerData({
				halfGrid: false
			}),
			columns: [
				new sap.m.Column({
					width: "89%"
				}).setStyleClass("sapAstOperationColumn"),

				new sap.m.Column({
					width: "11%"
				})
			]
		}).addStyleClass("sapAstOperationTable");

		this._bindOperations();
		var itemTemplate = that._tableColumnsFactory();
		this.conditionsTable.bindItems("/selectionData", itemTemplate);

		return this.conditionsTable;
	};

	LoopFunctionDialog.prototype._convertFunctionLabelToText = function (dataObject, functionLabel) {
		this.termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
		var objectFromReference = this.termsProvider.getTermNameFromASTNodeReference(dataObject);
		functionLabel = functionLabel.replace(dataObject, objectFromReference);
		return functionLabel
	};
	LoopFunctionDialog.prototype._createLoopFunctionDialog = function (data, callBack, AstExpressionLanguage, dialogOpenedCallbackReference,
		jsonData) {
		var that = this;
		var sequence = 0;
		this._clearData();
		this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
		this._oAstExpressionLanguage = AstExpressionLanguage;
		this._loopFunctionSelected = Constants.FOREACH;
		if (jsonData) {
			this._loopFunctionSelected = jsonData.function;
			this._whereExpressionId = jsonData.filter;
			this.dataObjectId = jsonData.dataObject;
			this.functionLabel = jsonData.functionLabel;
			this.dataObjectIdSelected = jsonData.dataObject.replace("/", "");
			this.operationArray = jsonData.actions;
			that.functionLabelDisplay = this._convertFunctionLabelToText(jsonData.dataObject, jsonData.functionLabel);;
			if (this.dataObjectId) {
				this.dataObjectIdData.dataObjectId = this.dataObjectId;
				this.enabledData.enabled = true;
				this.termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
				this.dataObjectLabel = this.termsProvider.getTermNameFromASTNodeReference(this.dataObjectId);
			}
			if (this.operationArray && this.operationArray.length > 0) {
				this.selectedData = [];
				for (var index = 0; index < this.operationArray.length; index++) {
					var newjson = {
						operationSelected: "",
						preSuggestionContext: "",
						cancelButton: true,
						addButton: true,
					}
					newjson.operationSelected = this.operationArray[index];
					this.selectedData.push(newjson);
					sequence++;
				}
				if (sequence === 1) {
					this.selectedData[0].cancelButton = false;
				}
				if (!this._whereExpressionId) {
					that.selectedData[0].preSuggestionContext = this._loopFunctionSelected + "(" + this.dataObjectId + ",";
				} else {
					that.selectedData[0].preSuggestionContext = this._loopFunctionSelected + "(" + Constants.FILTER + "(" + this.dataObjectId + "," +
						that._whereExpressionId + ") ,";
				}
				that._setPreSuggestionContextChange(0);
			}

		}

		var functionLoop = that._createLoopFunctionDropDown(data, "LoopFuntionLabelId");
		var oVocabularyText = new sap.m.Text({
			text: that.oBundle.getText("vocabulary"),
			tooltip: that.oBundle.getText("vocabulary"),
			textAlign: "End",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S2"
			})
		});
		var operationTable = that._createTable();
		var oWhereControl = that._createWhereAstExpressionBasic("loopWhereLabelId");
		var oFunctionLabelControl = that._createFunctionLabel();

		var verticalLayoutForLoopFunction = new sap.ui.layout.form.SimpleForm({
			layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
			editable: true,
			content: [
				new sap.m.Label("loopFunctionSelectionLabelId", {
					text: that.oBundle.getText("function"),
					tooltip: that.oBundle.getText("function"),
					labelFor: functionLoop.getId()
				}), functionLoop,
				oVocabularyText,
				that._createVocabularyDropDown(oVocabularyText.getId()),
				new sap.m.Label("loopWhereLabelId", {
					text: that.oBundle.getText("where"),
					tooltip: that.oBundle.getText("where"),
					labelFor: oWhereControl.getId()
				}),
				oWhereControl,
				new sap.m.Label("loopOperationsLabelId", {
					text: "",
					tooltip: "",
					labelFor: operationTable.getId()
				}).addStyleClass(""),
				operationTable,
				new sap.m.Label({
					text: that.oBundle.getText("function_label"),
					tooltip: that.oBundle.getText("function_label"),
					labelFor: oFunctionLabelControl.getId()
				}),
				oFunctionLabelControl
			]
		});

		var loopFunctionsDialog = new sap.m.Dialog({
			title: this.oBundle.getText("loopFunctionTitle"),
			contentWidth: "800px",
			showHeader: true,
			draggable: true,
			beforeClose: function () {
				dialogOpenedCallbackReference(false);
			},
			content: [verticalLayoutForLoopFunction],
			buttons: [
				this.applyButton = new sap.m.Button({
					text: this.oBundle.getText("apply"),
					tooltip: this.oBundle.getText("applyChangesBtnTooltip"),
					press: function (event) {
						var loopFunctionData = that._createJson()
						event.getSource().mProperties = {
							value: that.functionLabel,
							jsonData: loopFunctionData
						};
						callBack(event);
						that._setModal(false);
						loopFunctionsDialog.close();
						loopFunctionsDialog.destroy();
					}
				}),
				new sap.m.Button({
					text: this.oBundle.getText("cancel"),
					tooltip: this.oBundle.getText("cancelBtnTooltip"),
					press: function (event) {
						that._setModal(false);
						loopFunctionsDialog.close();
						loopFunctionsDialog.destroy();
					}
				})
			]
		}).addStyleClass("sapUiSizeCompact");;
		that._setModal(true);
		loopFunctionsDialog.open();
	};

	LoopFunctionDialog.prototype._setModal = function (value) {
		var pop = sap.ui.getCore().byId("popover");
		if (pop) {
			pop.setModal(value);
		}
	};

	LoopFunctionDialog.prototype._getOperations = function () {
		var actions = [];
		for (var iterator = 0; iterator < this.oModel.getData().selectionData.length; iterator++) {
			if (this.oModel.getData().selectionData[iterator].operationSelected !== "") {
				actions.push(this.oModel.getData().selectionData[iterator].operationSelected);
			}
		}
		return actions;
	};

	LoopFunctionDialog.prototype._createJson = function () {
		var actions = this._getOperations();
		var whereExpressionId = this._whereExpressionId;
		var json = {
			"function": this._loopFunctionSelected,
			"filter": whereExpressionId,
			"functionLabel": this.functionLabel,
			"dataObject": this.dataObjectId,
			"actions": actions,
			"doVocabId": this.dataObjectId
		}

		return json;
	};

	LoopFunctionDialog.prototype.includes = function (parent, str) {
		var returnValue = false;

		if (parent.indexOf(str) !== -1) {
			returnValue = true;
		}

		return returnValue;
	};

	return {

		getInstance: function () {
			instance = new LoopFunctionDialog();
			return instance;
		}
	};
}, true);