/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2240.ui.program","sap/sac/df/firefly/ff2700.export"
],
function(oFF)
{
"use strict";

oFF.DayUiModel = function() {};
oFF.DayUiModel.prototype = new oFF.XObject();
oFF.DayUiModel.prototype._ff_c = "DayUiModel";

oFF.DayUiModel.create = function(dayNumberAsString, isPartOfCurrentMonth, isWeekend)
{
	var obj = new oFF.DayUiModel();
	obj.m_dayNumberAsString = dayNumberAsString;
	obj.m_isPartOfCurrentMonth = isPartOfCurrentMonth;
	obj.m_isWeekend = isWeekend;
	return obj;
};
oFF.DayUiModel.prototype.m_dayNumberAsString = null;
oFF.DayUiModel.prototype.m_isPartOfCurrentMonth = false;
oFF.DayUiModel.prototype.m_isWeekend = false;
oFF.DayUiModel.prototype.getDayNumber = function()
{
	return this.m_dayNumberAsString;
};
oFF.DayUiModel.prototype.isPartOfCurrentMode = function()
{
	return this.m_isPartOfCurrentMonth;
};
oFF.DayUiModel.prototype.isWeekend = function()
{
	return this.m_isWeekend;
};

oFF.MonthUiModel = function() {};
oFF.MonthUiModel.prototype = new oFF.XObject();
oFF.MonthUiModel.prototype._ff_c = "MonthUiModel";

oFF.MonthUiModel.createWithYearAndMonth = function(year, month)
{
	var obj = new oFF.MonthUiModel();
	obj.m_calendar = oFF.XGregorianCalendar.createWithYearMonthDay(year, month, 1);
	obj.m_calendar.setFirstDayOfWeek(oFF.DateConstants.SUNDAY);
	obj.m_calendar.setMinimalDaysInFirstWeek(4);
	obj.createMonthNames();
	obj.createWeekNames();
	obj.setWeeks();
	return obj;
};
oFF.MonthUiModel.create = function()
{
	var currentTimeInMilli = oFF.XSystemUtils.getCurrentTimeInMilliseconds();
	var obj = new oFF.MonthUiModel();
	obj.m_calendar = oFF.XGregorianCalendar.create();
	obj.m_calendar.setTimeInMillis(currentTimeInMilli);
	obj.m_calendar.setFirstDayOfWeek(oFF.DateConstants.SUNDAY);
	obj.m_calendar.setMinimalDaysInFirstWeek(4);
	obj.createMonthNames();
	obj.createWeekNames();
	obj.setWeeks();
	return obj;
};
oFF.MonthUiModel.prototype.m_monthNames = null;
oFF.MonthUiModel.prototype.m_weekdayNames = null;
oFF.MonthUiModel.prototype.m_calendar = null;
oFF.MonthUiModel.prototype.m_weeks = null;
oFF.MonthUiModel.prototype.createWeekNames = function()
{
	this.m_weekdayNames = oFF.XArrayOfString.create(7);
	this.m_weekdayNames.set(0, "Sun");
	this.m_weekdayNames.set(1, "Mon");
	this.m_weekdayNames.set(2, "Tue");
	this.m_weekdayNames.set(3, "Wed");
	this.m_weekdayNames.set(4, "Thu");
	this.m_weekdayNames.set(5, "Fri");
	this.m_weekdayNames.set(6, "Sat");
};
oFF.MonthUiModel.prototype.createMonthNames = function()
{
	this.m_monthNames = oFF.XArrayOfString.create(12);
	this.m_monthNames.set(0, "January");
	this.m_monthNames.set(1, "February");
	this.m_monthNames.set(2, "March");
	this.m_monthNames.set(3, "April");
	this.m_monthNames.set(4, "May");
	this.m_monthNames.set(5, "June");
	this.m_monthNames.set(6, "July");
	this.m_monthNames.set(7, "August");
	this.m_monthNames.set(8, "September");
	this.m_monthNames.set(9, "October");
	this.m_monthNames.set(10, "November");
	this.m_monthNames.set(11, "December");
};
oFF.MonthUiModel.prototype.getMonthString = function()
{
	return this.m_monthNames.get(this.m_calendar.get(oFF.DateConstants.MONTH) - 1);
};
oFF.MonthUiModel.prototype.addOneMonth = function()
{
	this.m_calendar.add(oFF.DateConstants.MONTH, 1);
	this.setWeeks();
};
oFF.MonthUiModel.prototype.subtractOneMonth = function()
{
	this.m_calendar.add(oFF.DateConstants.MONTH, -1);
	this.setWeeks();
};
oFF.MonthUiModel.prototype.setWeeks = function()
{
	oFF.XObjectExt.release(this.m_weeks);
	var weeks = oFF.XList.create();
	var currentMonth = oFF.XGregorianCalendar.createWithYearMonthDay(this.m_calendar.get(oFF.DateConstants.YEAR), this.m_calendar.get(oFF.DateConstants.MONTH), 1);
	currentMonth.setMinimalDaysInFirstWeek(this.m_calendar.getMinimalDaysInFirstWeek());
	currentMonth.setFirstDayOfWeek(this.m_calendar.getFirstDayOfWeek());
	var dayOfWeekFirstDayOfMonth = currentMonth.get(oFF.DateConstants.DAY_OF_WEEK);
	currentMonth.add(oFF.DateConstants.DAY_OF_MONTH, -dayOfWeekFirstDayOfMonth);
	while (currentMonth.get(oFF.DateConstants.MONTH) <= this.m_calendar.get(oFF.DateConstants.MONTH) || this.m_calendar.get(oFF.DateConstants.MONTH) === oFF.DateConstants.JANUARY && currentMonth.get(oFF.DateConstants.MONTH) === oFF.DateConstants.DECEMBER)
	{
		if (this.m_calendar.get(oFF.DateConstants.MONTH) === oFF.DateConstants.DECEMBER && currentMonth.get(oFF.DateConstants.YEAR) > this.m_calendar.get(oFF.DateConstants.YEAR))
		{
			break;
		}
		var daysOfWeek = oFF.XArray.create(7);
		for (var i = 0; i < 7; i++)
		{
			currentMonth.add(oFF.DateConstants.DAY_OF_MONTH, 1);
			var isPartOfCurrentMonth = currentMonth.get(oFF.DateConstants.MONTH) === this.m_calendar.get(oFF.DateConstants.MONTH);
			var isWeekend = currentMonth.get(oFF.DateConstants.DAY_OF_WEEK) === oFF.DateConstants.SATURDAY || currentMonth.get(oFF.DateConstants.DAY_OF_WEEK) === oFF.DateConstants.SUNDAY;
			var dayUiModel = oFF.DayUiModel.create(oFF.XInteger.convertToString(currentMonth.get(oFF.DateConstants.DAY_OF_MONTH)), isPartOfCurrentMonth, isWeekend);
			daysOfWeek.set(i, dayUiModel);
		}
		var weekNumber = currentMonth.get(oFF.DateConstants.WEEK_OF_YEAR);
		var week = oFF.WeekUiModel.create(weekNumber, daysOfWeek);
		if (!this.isAllWeekNotPartOfMonth(daysOfWeek))
		{
			weeks.add(week);
		}
	}
	this.m_weeks = weeks;
};
oFF.MonthUiModel.prototype.isAllWeekNotPartOfMonth = function(week)
{
	for (var i = 0; i < week.size(); i++)
	{
		if (week.get(i).isPartOfCurrentMode())
		{
			return false;
		}
	}
	return true;
};
oFF.MonthUiModel.prototype.getWeeks = function()
{
	return this.m_weeks;
};
oFF.MonthUiModel.prototype.getYear = function()
{
	return this.m_calendar.get(oFF.DateConstants.YEAR);
};
oFF.MonthUiModel.prototype.getYearString = function()
{
	return oFF.XInteger.convertToString(this.m_calendar.get(oFF.DateConstants.YEAR));
};
oFF.MonthUiModel.prototype.getWeekdayNames = function()
{
	return this.m_weekdayNames;
};
oFF.MonthUiModel.prototype.getMonth = function()
{
	return this.m_calendar.get(oFF.DateConstants.MONTH);
};

oFF.WeekUiModel = function() {};
oFF.WeekUiModel.prototype = new oFF.XObject();
oFF.WeekUiModel.prototype._ff_c = "WeekUiModel";

oFF.WeekUiModel.create = function(weekOfYear, days)
{
	var obj = new oFF.WeekUiModel();
	obj.m_weekOfYear = weekOfYear;
	obj.m_days = days;
	return obj;
};
oFF.WeekUiModel.prototype.m_weekOfYear = 0;
oFF.WeekUiModel.prototype.m_days = null;
oFF.WeekUiModel.prototype.getWeekOfYearNumber = function()
{
	return oFF.XInteger.convertToString(this.m_weekOfYear);
};
oFF.WeekUiModel.prototype.getWeekDays = function()
{
	return this.m_days;
};

oFF.YearSelectionUiModel = function() {};
oFF.YearSelectionUiModel.prototype = new oFF.XObject();
oFF.YearSelectionUiModel.prototype._ff_c = "YearSelectionUiModel";

oFF.YearSelectionUiModel.create = function(year)
{
	var obj = new oFF.YearSelectionUiModel();
	obj.m_year = year;
	obj.calculateFirstAndLastYear();
	return obj;
};
oFF.YearSelectionUiModel.prototype.m_firstYear = 0;
oFF.YearSelectionUiModel.prototype.m_year = 0;
oFF.YearSelectionUiModel.prototype.m_lastYear = 0;
oFF.YearSelectionUiModel.prototype.getFirstYear = function()
{
	return this.m_firstYear;
};
oFF.YearSelectionUiModel.prototype.getLastYear = function()
{
	return this.m_lastYear;
};
oFF.YearSelectionUiModel.prototype.getYear = function()
{
	return this.m_year;
};
oFF.YearSelectionUiModel.prototype.toString = function()
{
	var firstYearString = oFF.XInteger.convertToString(this.m_firstYear);
	var lastYearString = oFF.XInteger.convertToString(this.m_lastYear);
	return oFF.XStringUtils.concatenate3(firstYearString, " - ", lastYearString);
};
oFF.YearSelectionUiModel.prototype.calculateFirstAndLastYear = function()
{
	this.m_firstYear = this.m_year - 10;
	this.m_lastYear = this.m_year + 9;
};
oFF.YearSelectionUiModel.prototype.subtractYears = function()
{
	this.m_year = this.m_year - 20;
	this.calculateFirstAndLastYear();
};
oFF.YearSelectionUiModel.prototype.addYears = function()
{
	this.m_year = this.m_year + 20;
	this.calculateFirstAndLastYear();
};

oFF.YearUiModel = function() {};
oFF.YearUiModel.prototype = new oFF.XObject();
oFF.YearUiModel.prototype._ff_c = "YearUiModel";

oFF.YearUiModel.create = function()
{
	var currentTimeInMilli = oFF.XSystemUtils.getCurrentTimeInMilliseconds();
	var obj = new oFF.YearUiModel();
	var calendar = oFF.XGregorianCalendar.create();
	calendar.setTimeInMillis(currentTimeInMilli);
	obj.m_year = calendar.get(oFF.DateConstants.YEAR);
	obj.setMonths();
	return obj;
};
oFF.YearUiModel.createWithYear = function(year)
{
	var obj = new oFF.YearUiModel();
	obj.m_year = year;
	obj.setMonths();
	return obj;
};
oFF.YearUiModel.prototype.m_year = 0;
oFF.YearUiModel.prototype.m_months = null;
oFF.YearUiModel.prototype.setMonths = function()
{
	oFF.XObjectExt.release(this.m_months);
	this.m_months = oFF.XArray.create(12);
	for (var i = oFF.DateConstants.JANUARY; i <= oFF.DateConstants.DECEMBER; i++)
	{
		this.m_months.set(i - 1, oFF.MonthUiModel.createWithYearAndMonth(this.m_year, i));
	}
};
oFF.YearUiModel.prototype.getYearString = function()
{
	return oFF.XInteger.convertToString(this.m_year);
};
oFF.YearUiModel.prototype.getMonths = function()
{
	return this.m_months;
};

oFF.WeekView = function() {};
oFF.WeekView.prototype = new oFF.XObject();
oFF.WeekView.prototype._ff_c = "WeekView";

oFF.WeekView.create = function(uiGenesis, weekUiModel)
{
	var obj = new oFF.WeekView();
	obj.m_weekUiModel = weekUiModel;
	obj.m_uiGenesis = uiGenesis;
	obj.buildUi();
	return obj;
};
oFF.WeekView.prototype.m_uiGenesis = null;
oFF.WeekView.prototype.m_root = null;
oFF.WeekView.prototype.m_weekUiModel = null;
oFF.WeekView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_root.setDirection(oFF.UiFlexDirection.ROW);
	var weekNumberLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	weekNumberLayout.setDirection(oFF.UiFlexDirection.COLUMN_REVERSE);
	weekNumberLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	weekNumberLayout.setWidth(oFF.UiCssLength.create("100%"));
	weekNumberLayout.setFlex("1");
	var weekNumberButton = weekNumberLayout.addNewItemOfType(oFF.UiType.BUTTON);
	weekNumberButton.setText(this.m_weekUiModel.getWeekOfYearNumber());
	weekNumberButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	weekNumberButton.setEnabled(false);
	weekNumberButton.setWidth(oFF.UiCssLength.create("100%"));
	weekNumberButton.setHeight(oFF.UiCssLength.create("100%"));
	weekNumberButton.setPadding(oFF.UiCssBoxEdges.create("0px"));
	for (var i = 0; i < this.m_weekUiModel.getWeekDays().size(); i++)
	{
		var dayUiModel = this.m_weekUiModel.getWeekDays().get(i);
		var dayButton = this.m_root.addNewItemOfType(oFF.UiType.BUTTON);
		dayButton.setText(dayUiModel.getDayNumber());
		dayButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		dayButton.setWidth(oFF.UiCssLength.create("100%"));
		dayButton.setHeight(oFF.UiCssLength.create("100%"));
		dayButton.setPadding(oFF.UiCssBoxEdges.create("0px"));
		dayButton.setFlex("1");
		if (!dayUiModel.isPartOfCurrentMode())
		{
			dayButton.setEnabled(false);
		}
		if (dayUiModel.isPartOfCurrentMode() && dayUiModel.isWeekend())
		{
			dayButton.setBackgroundColor(oFF.UiColor.create("#dedede"));
		}
	}
};
oFF.WeekView.prototype.getRoot = function()
{
	return this.m_root;
};

oFF.YearView = function() {};
oFF.YearView.prototype = new oFF.XObject();
oFF.YearView.prototype._ff_c = "YearView";

oFF.YearView.MONTHS_PER_LINE = 3;
oFF.YearView.NUMBER_OF_LINES = 4;
oFF.YearView.create = function(genesis, uiModel)
{
	var obj = new oFF.YearView();
	obj.m_uiGenesis = genesis;
	obj.m_uiModel = uiModel;
	obj.buildUi();
	return obj;
};
oFF.YearView.prototype.m_uiGenesis = null;
oFF.YearView.prototype.m_uiModel = null;
oFF.YearView.prototype.m_root = null;
oFF.YearView.prototype.m_topLayout = null;
oFF.YearView.prototype.m_yearLabel = null;
oFF.YearView.prototype.m_yearLayout = null;
oFF.YearView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_topLayout = this.m_root.addNewItemOfType(oFF.UiType.HORIZONTAL_LAYOUT);
	this.m_topLayout.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	this.m_yearLabel = this.m_topLayout.addNewItemOfType(oFF.UiType.LABEL);
	this.m_yearLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_yearLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.setContent();
};
oFF.YearView.prototype.setContent = function()
{
	this.m_yearLabel.setText(this.m_uiModel.getYearString());
	this.setYearGrid();
};
oFF.YearView.prototype.setYearGrid = function()
{
	this.m_yearLayout.clearItems();
	var months = this.m_uiModel.getMonths();
	var monthIndex = 0;
	for (var i = 0; i < oFF.YearView.NUMBER_OF_LINES; i++)
	{
		var monthRow = this.m_yearLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		for (var j = 0; j < oFF.YearView.MONTHS_PER_LINE; j++)
		{
			var monthView = oFF.FlexMonthView.create(this.m_uiGenesis, months.get(monthIndex), false);
			var cellLayout = monthRow.addNewItemOfType(oFF.UiType.VERTICAL_LAYOUT);
			cellLayout.addItem(monthView.getRoot());
			monthIndex++;
		}
	}
};
oFF.YearView.prototype.getRoot = function()
{
	return this.m_root;
};

oFF.FeApolloDialog = function() {};
oFF.FeApolloDialog.prototype = new oFF.XObject();
oFF.FeApolloDialog.prototype._ff_c = "FeApolloDialog";

oFF.FeApolloDialog.createFileExplorer = function()
{
	var obj = new oFF.FeApolloDialog();
	obj.setupDialog();
	return obj;
};
oFF.FeApolloDialog.prototype.m_application = null;
oFF.FeApolloDialog.prototype.m_fileExplorerWindowContainer = null;
oFF.FeApolloDialog.prototype.setupDialog = function()
{
	this.m_application = oFF.ApplicationFactory.createDefaultApplication();
	var session = this.m_application.getSession();
	var newApolloPrg = oFF.FeApollo.createNewApollo();
	newApolloPrg.setProcess(session);
	var appProgram = newApolloPrg;
	appProgram.setApplication(this.m_application);
	this.m_fileExplorerWindowContainer = oFF.UiPrgContainerWindow.createExt(null, newApolloPrg);
	this.m_fileExplorerWindowContainer.setTitle("File Explorer");
};
oFF.FeApolloDialog.prototype.releaseObject = function()
{
	this.m_fileExplorerWindowContainer = oFF.XObjectExt.release(this.m_fileExplorerWindowContainer);
	this.m_application = oFF.XObjectExt.release(this.m_application);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.FeApolloDialog.prototype.open = function()
{
	if (oFF.notNull(this.m_fileExplorerWindowContainer) && this.m_fileExplorerWindowContainer.isContainerOpen() === false)
	{
		var uiManager = this.m_application.getUiManager();
		this.m_fileExplorerWindowContainer.openAndRun(uiManager);
	}
};

oFF.FeApolloFileExtension = function() {};
oFF.FeApolloFileExtension.prototype = new oFF.XObject();
oFF.FeApolloFileExtension.prototype._ff_c = "FeApolloFileExtension";

oFF.FeApolloFileExtension.s_apolloExtenstions = null;
oFF.FeApolloFileExtension.s_defaultApolloExtension = null;
oFF.FeApolloFileExtension.s_prgApolloExtension = null;
oFF.FeApolloFileExtension.staticSetup = function()
{
	if (oFF.notNull(oFF.FeApolloFileExtension.s_apolloExtenstions))
	{
		return;
	}
	oFF.FeApolloFileExtension.s_apolloExtenstions = oFF.XHashMapByString.create();
	oFF.FeApolloFileExtension.registerNewExtension("qsa", "Quasar", "Quasar Viewer", null);
	oFF.FeApolloFileExtension.registerNewExtension("pos", "Poseidon", "Poseidon Viewer", null);
	oFF.FeApolloFileExtension.registerNewExtension("gsp", "GalaxyStudio", "Galaxy Studio", null);
	oFF.FeApolloFileExtension.registerNewExtension("krs", "Kreios", "Kreios Viewer", null);
	oFF.FeApolloFileExtension.registerNewExtension("asd", "Atlas", "SAC Story Renderer", null);
	oFF.FeApolloFileExtension.registerNewExtension("gdf", "GalaxyDataStudio", "Galaxy Data Studio", null);
	oFF.FeApolloFileExtension.registerNewExtension("insight", "GalaxyDataStudio", "Galaxy Data Studio",  function(file){
		if (oFF.notNull(file) && file.getAttributes() !== null)
		{
			return oFF.XString.isEqual(file.getAttributes().getStringByKey(oFF.XFileAttribute.NODE_TYPE.getName()), "STORY") && oFF.XString.isEqual(file.getAttributes().getStringByKey(oFF.XFileAttribute.NODE_SUB_TYPE.getName()), "INSIGHT");
		}
		return false;
	}.bind(this));
	oFF.FeApolloFileExtension.registerNewExtension("model", "GalaxyDataStudio", "Galaxy Data Studio",  function(file2){
		if (oFF.notNull(file2) && file2.getAttributes() !== null)
		{
			if (oFF.XString.isEqual(file2.getAttributes().getStringByKey(oFF.XFileAttribute.NODE_TYPE.getName()), "CUBE"))
			{
				var nodeSubType = file2.getAttributes().getStringByKey(oFF.XFileAttribute.NODE_SUB_TYPE.getName());
				return oFF.XString.isEqual(nodeSubType, "PLANNING") || oFF.XString.isEqual(nodeSubType, "ANALYTIC");
			}
		}
		return false;
	}.bind(this));
	oFF.FeApolloFileExtension.registerNewExtension("txt", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "Text Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "text").setDefault();
	oFF.FeApolloFileExtension.registerNewExtension("json", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "JSON Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "json");
	oFF.FeApolloFileExtension.registerNewExtension("js", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "JavaScript Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "javascript");
	oFF.FeApolloFileExtension.registerNewExtension("java", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "Java Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "java");
	oFF.FeApolloFileExtension.registerNewExtension("ts", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "Typescript Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "ts");
	oFF.FeApolloFileExtension.registerNewExtension("css", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "CSS Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "css");
	oFF.FeApolloFileExtension.registerNewExtension("html", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "HTML Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "html");
	oFF.FeApolloFileExtension.registerNewExtension("cpp", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "C++ Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "c_cpp");
	oFF.FeApolloFileExtension.registerNewExtension("swift", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "Swift Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "swift");
	oFF.FeApolloFileExtension.registerNewExtension("m", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "ObjC Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "objectivec");
	oFF.FeApolloFileExtension.registerNewExtension("cfg", oFF.SuAthena.DEFAULT_PROGRAM_NAME, "Config Editor", null).addArgument(oFF.SuAthena.PARAM_TYPE, "json");
	oFF.FeApolloFileExtension.registerNewExtension("png", oFF.SuMinerva.DEFAULT_PROGRAM_NAME, "Image Viewer", null);
	oFF.FeApolloFileExtension.registerNewExtension("jpg", oFF.SuMinerva.DEFAULT_PROGRAM_NAME, "Image Viewer", null);
	oFF.FeApolloFileExtension.registerNewExtension("jpeg", oFF.SuMinerva.DEFAULT_PROGRAM_NAME, "Image Viewer", null);
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("qsa", "pos");
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("qsa", "gsp");
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("qsa", "krs");
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("qsa", "gdf");
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("qsa", "json");
	oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension("gdf", "json");
	oFF.FeApolloFileExtension.s_prgApolloExtension = oFF.FeApolloFileExtension.registerNewExtension("prg", null, "Program", null);
};
oFF.FeApolloFileExtension.registerNewExtension = function(extension, programName, friendlyName, filePredicate)
{
	var newConstant = new oFF.FeApolloFileExtension();
	newConstant.setupInternal(extension, programName, friendlyName, filePredicate);
	return newConstant;
};
oFF.FeApolloFileExtension.assignAdditionalApolloExtensionToExtension = function(extension, additionalExtension)
{
	var apolloFileExtension = oFF.FeApolloFileExtension.lookup(extension);
	var additionalApolloFileExtension = oFF.FeApolloFileExtension.lookup(additionalExtension);
	if (oFF.isNull(apolloFileExtension))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("Could not find the extension ", extension, ". Do you try to add additional apollo extension to a non registered exntension?"));
	}
	if (oFF.isNull(additionalApolloFileExtension))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("Could not find the additional extension ", additionalExtension, ". Does the apollo extension exist?"));
	}
	apolloFileExtension.addAdditionalApolloExtension(additionalApolloFileExtension);
};
oFF.FeApolloFileExtension.lookup = function(name)
{
	var valueLower = oFF.XString.toLowerCase(name);
	return oFF.FeApolloFileExtension.s_apolloExtenstions.getByKey(valueLower);
};
oFF.FeApolloFileExtension.lookupByPredicate = function(file)
{
	var foundFileExtension = oFF.XCollectionUtils.findFirst(oFF.FeApolloFileExtension.s_apolloExtenstions.getValuesAsReadOnlyList(),  function(fileExtension){
		return fileExtension.runFilePredicate(file);
	}.bind(this));
	return foundFileExtension;
};
oFF.FeApolloFileExtension.getApolloExtensionForFile = function(file)
{
	var fileExtRegistration = null;
	if (oFF.notNull(file) && file.isMetadataLoaded() === false)
	{
		throw oFF.XException.createIllegalStateException("File metadata is not initialized");
	}
	if (oFF.notNull(file) && file.isMetadataLoaded() && file.getFileType() !== oFF.XFileType.DIR)
	{
		if (file.getFileType() === oFF.XFileType.PRG)
		{
			fileExtRegistration = oFF.FeApolloFileExtension.s_prgApolloExtension;
		}
		else
		{
			var fileName = file.getName();
			var extension = null;
			var extPoint = oFF.XString.lastIndexOf(fileName, ".");
			if (extPoint !== -1)
			{
				extension = oFF.XString.substring(fileName, extPoint + 1, -1);
			}
			fileExtRegistration = oFF.FeApolloFileExtension.lookup(extension);
			if (oFF.isNull(fileExtRegistration))
			{
				fileExtRegistration = oFF.FeApolloFileExtension.lookupByPredicate(file);
			}
			if (oFF.isNull(fileExtRegistration))
			{
				fileExtRegistration = oFF.FeApolloFileExtension.s_defaultApolloExtension;
			}
		}
	}
	return fileExtRegistration;
};
oFF.FeApolloFileExtension.prototype.m_extension = null;
oFF.FeApolloFileExtension.prototype.m_programName = null;
oFF.FeApolloFileExtension.prototype.m_friendlyName = null;
oFF.FeApolloFileExtension.prototype.m_filePredicate = null;
oFF.FeApolloFileExtension.prototype.m_additionalApolloExtensions = null;
oFF.FeApolloFileExtension.prototype.m_argumentsStructure = null;
oFF.FeApolloFileExtension.prototype.releaseObject = function()
{
	this.m_additionalApolloExtensions.clear();
	this.m_additionalApolloExtensions = oFF.XObjectExt.release(this.m_additionalApolloExtensions);
	this.m_argumentsStructure = oFF.XObjectExt.release(this.m_argumentsStructure);
	this.m_filePredicate = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.FeApolloFileExtension.prototype.getExtension = function()
{
	return this.m_extension;
};
oFF.FeApolloFileExtension.prototype.getProgramName = function()
{
	return this.m_programName;
};
oFF.FeApolloFileExtension.prototype.getFriendlyName = function()
{
	return this.m_friendlyName;
};
oFF.FeApolloFileExtension.prototype.getAdditionalApolloExtensions = function()
{
	return this.m_additionalApolloExtensions;
};
oFF.FeApolloFileExtension.prototype.getProgramManifest = function(process)
{
	var prgManifest = null;
	if (this.isExecutable() === false)
	{
		prgManifest = process.getKernel().getProgramManifest(this.m_programName);
	}
	return prgManifest;
};
oFF.FeApolloFileExtension.prototype.getDefaultArguments = function()
{
	var prgArgs = oFF.ProgramArgs.create();
	if (oFF.notNull(this.m_argumentsStructure) && this.m_argumentsStructure.size() > 0)
	{
		prgArgs.getArgumentStructure().putAll(this.m_argumentsStructure);
	}
	return prgArgs;
};
oFF.FeApolloFileExtension.prototype.isExecutable = function()
{
	return oFF.XString.isEqual("prg", this.getExtension());
};
oFF.FeApolloFileExtension.prototype.setupInternal = function(extension, programName, friendlyName, filePredicate)
{
	this.m_extension = extension;
	this.m_programName = programName;
	this.m_friendlyName = friendlyName;
	this.m_filePredicate = filePredicate;
	this.m_additionalApolloExtensions = oFF.XList.create();
	this.m_argumentsStructure = oFF.PrFactory.createStructure();
	if (oFF.FeApolloFileExtension.s_apolloExtenstions.containsKey(extension))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("The extension ", extension, " is already registered!"));
	}
	oFF.FeApolloFileExtension.s_apolloExtenstions.put(oFF.XString.toLowerCase(extension), this);
};
oFF.FeApolloFileExtension.prototype.addArgument = function(key, value)
{
	this.m_argumentsStructure.putString(key, value);
	return this;
};
oFF.FeApolloFileExtension.prototype.addAdditionalApolloExtension = function(additionalApolloFileExtension)
{
	if (oFF.notNull(this.m_additionalApolloExtensions) && oFF.notNull(additionalApolloFileExtension))
	{
		this.m_additionalApolloExtensions.add(additionalApolloFileExtension);
	}
};
oFF.FeApolloFileExtension.prototype.setDefault = function()
{
	oFF.FeApolloFileExtension.s_defaultApolloExtension = this;
};
oFF.FeApolloFileExtension.prototype.runFilePredicate = function(file)
{
	if (oFF.notNull(this.m_filePredicate))
	{
		return this.m_filePredicate(file);
	}
	return false;
};

oFF.SuVulcanViewFactory = {

	create:function(viewType, genesis)
	{
			var newView = null;
		var tmpView = viewType.getViewClass().newInstance(null);
		tmpView.renderView(genesis);
		newView = tmpView;
		return newView;
	}
};

oFF.SuVulcanSampleRegistration = {

	s_samples:null,
	staticSetup:function()
	{
			oFF.SuVulcanSampleRegistration.s_samples = oFF.XLinkedHashMapByString.create();
	},
	registerSample:function(sampleView)
	{
			if (oFF.notNull(sampleView) && oFF.XStringUtils.isNotNullAndNotEmpty(sampleView.getName()) && !oFF.SuVulcanSampleRegistration.s_samples.containsKey(sampleView.getName()))
		{
			oFF.SuVulcanSampleRegistration.s_samples.put(sampleView.getName(), sampleView);
		}
	},
	getAllWidgetSampleViews:function()
	{
			return oFF.SuVulcanSampleRegistration.s_samples.getValuesAsReadOnlyList();
	}
};

oFF.SuResourceExplorerContext = function() {};
oFF.SuResourceExplorerContext.prototype = new oFF.XObject();
oFF.SuResourceExplorerContext.prototype._ff_c = "SuResourceExplorerContext";

oFF.SuResourceExplorerContext.create = function(isDatasource, isSave)
{
	var context = new oFF.SuResourceExplorerContext();
	context.m_isDatasource = isDatasource;
	context.m_isSave = isSave;
	return context;
};
oFF.SuResourceExplorerContext.createDefault = function()
{
	return oFF.SuResourceExplorerContext.create(false, false);
};
oFF.SuResourceExplorerContext.prototype.m_isDatasource = false;
oFF.SuResourceExplorerContext.prototype.m_isSave = false;
oFF.SuResourceExplorerContext.prototype.isDatasource = function()
{
	return this.m_isDatasource;
};
oFF.SuResourceExplorerContext.prototype.isSave = function()
{
	return this.m_isSave;
};

oFF.SuResourceExplorerPromise = {

	loadFile:function(process, config)
	{
			var loadFilePromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(process))
			{
				reject(oFF.XError.create("Missing process!"));
				return;
			}
			var reOpenConfig = config;
			if (oFF.isNull(reOpenConfig))
			{
				reOpenConfig = oFF.SuResourceExplorerConfigWrapper.create();
			}
			reOpenConfig.getToolbar(true).enableSearch(false);
			reOpenConfig.getDetailsView(true);
			reOpenConfig.getDialogMode(true).setMode(oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN).setSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE).setSelectionMode(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON);
			var tmpConfigStruct = reOpenConfig.generateConfig();
			var okListener = oFF.SuResourceExplorerListener.createOK( function(resourceInfo, resourceExplorer){
				if (oFF.notNull(resourceInfo) && !resourceInfo.isDirectory())
				{
					var filePath = resourceInfo.getUrl();
					if (oFF.XStringUtils.isNotNullAndNotEmpty(filePath))
					{
						var selectedFile = oFF.XFile.createWithVars(process, filePath);
						if (oFF.notNull(selectedFile))
						{
							oFF.UtFilePromise.loadContent(selectedFile).then( function(loadedContent){
								resolve(selectedFile);
								return loadedContent;
							}.bind(this),  function(errorMsg){
								reject(errorMsg);
							}.bind(this)).onFinally( function(){
								resourceExplorer.close();
							}.bind(this));
						}
						else
						{
							resourceExplorer.close();
							reject(oFF.XError.create("Failed to create file object!"));
						}
					}
					else
					{
						resourceExplorer.close();
						reject(oFF.XError.create("Invalid file path!"));
					}
				}
				else
				{
					resourceExplorer.close();
					reject(oFF.XError.create("Selected resource is not a file!"));
				}
			}.bind(this));
			var reProgram = oFF.ProgramRunner.createRunner(process, oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME);
			reProgram.setArgument(oFF.SuResourceExplorer.PARAM_CONFIG, tmpConfigStruct.getStringRepresentation());
			reProgram.setObjectArgument(oFF.SuResourceExplorer.PARAM_CALLBACKS, okListener);
			reProgram.setContainerType(oFF.ProgramContainerType.DIALOG);
			reProgram.runProgram();
		}.bind(this));
		return loadFilePromise;
	},
	selectDirectory:function(process, config)
	{
			return oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(process))
			{
				reject(oFF.XError.create("Missing process!"));
				return;
			}
			var reOpenConfig = config;
			if (oFF.isNull(reOpenConfig))
			{
				reOpenConfig = oFF.SuResourceExplorerConfigWrapper.create();
			}
			reOpenConfig.getToolbar(true).enableSearch(false);
			reOpenConfig.getDetailsView(true);
			reOpenConfig.getDialogMode(true).setMode(oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN).setSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY).setSelectionMode(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON);
			var tmpConfigStruct = reOpenConfig.generateConfig();
			var okListener = oFF.SuResourceExplorerListener.createOkAndCancel( function(resourceInfo, resourceExplorer){
				if (oFF.notNull(resourceInfo) && resourceInfo.isDirectory())
				{
					var directoryPath = resourceInfo.getUrl();
					if (oFF.XStringUtils.isNotNullAndNotEmpty(directoryPath))
					{
						var selectedDirectory = oFF.XFile.createWithVars(process, directoryPath);
						resourceExplorer.close();
						resolve(selectedDirectory);
					}
					else
					{
						resourceExplorer.close();
						reject(oFF.XError.create("Invalid directory path!"));
					}
				}
				else
				{
					resourceExplorer.close();
					reject(oFF.XError.create("Selected resource is not a directory!"));
				}
			}.bind(this),  function(){
				resolve(null);
			}.bind(this));
			var reProgram = oFF.ProgramRunner.createRunner(process, oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME);
			reProgram.setArgument(oFF.SuResourceExplorer.PARAM_CONFIG, tmpConfigStruct.getStringRepresentation());
			reProgram.setObjectArgument(oFF.SuResourceExplorer.PARAM_CALLBACKS, okListener);
			reProgram.setContainerType(oFF.ProgramContainerType.DIALOG);
			reProgram.runProgram();
		}.bind(this));
	},
	saveContent:function(process, contentToSave, config)
	{
			var saveContentPromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(process))
			{
				reject(oFF.XError.create("Missing process!"));
				return;
			}
			if (oFF.isNull(contentToSave))
			{
				reject(oFF.XError.create("Missing content!"));
				return;
			}
			var reOpenConfig = config;
			if (oFF.isNull(reOpenConfig))
			{
				reOpenConfig = oFF.SuResourceExplorerConfigWrapper.create();
			}
			reOpenConfig.getToolbar(true).enableSearch(false);
			reOpenConfig.getDetailsView(true);
			reOpenConfig.getDialogMode(true).setMode(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE).setOkButtonLabel("Save").setSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY).setSelectionMode(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON);
			var tmpConfigStruct = reOpenConfig.generateConfig();
			var okListener = oFF.SuResourceExplorerListener.createOK( function(resourceInfo, resourceExplorer){
				if (oFF.notNull(resourceInfo) && !resourceInfo.isDirectory())
				{
					var filePath = resourceInfo.getUrl();
					if (oFF.XStringUtils.isNotNullAndNotEmpty(filePath))
					{
						var selectedFile = oFF.XFile.createWithVars(process, filePath);
						if (oFF.notNull(selectedFile))
						{
							oFF.UtFilePromise.saveContent(selectedFile, contentToSave).then( function(file){
								resolve(file);
								return file;
							}.bind(this),  function(errorMsg){
								reject(errorMsg);
							}.bind(this)).onFinally( function(){
								resourceExplorer.close();
							}.bind(this));
						}
						else
						{
							resourceExplorer.close();
							reject(oFF.XError.create("Failed to create file object!"));
						}
					}
					else
					{
						resourceExplorer.close();
						reject(oFF.XError.create("Invalid file path!"));
					}
				}
				else
				{
					resourceExplorer.close();
					reject(oFF.XError.create("Selected resource is a directory!"));
				}
			}.bind(this));
			var reProgram = oFF.ProgramRunner.createRunner(process, oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME);
			reProgram.setArgument(oFF.SuResourceExplorer.PARAM_CONFIG, tmpConfigStruct.getStringRepresentation());
			reProgram.setObjectArgument(oFF.SuResourceExplorer.PARAM_CALLBACKS, okListener);
			reProgram.setContainerType(oFF.ProgramContainerType.DIALOG);
			reProgram.runProgram();
		}.bind(this));
		return saveContentPromise;
	}
};

oFF.SuResourceExplorerRecentlyUsedCallback = function() {};
oFF.SuResourceExplorerRecentlyUsedCallback.prototype = new oFF.XObject();
oFF.SuResourceExplorerRecentlyUsedCallback.prototype._ff_c = "SuResourceExplorerRecentlyUsedCallback";

oFF.SuResourceExplorerRecentlyUsedCallback.create = function(listener)
{
	var newCallback = new oFF.SuResourceExplorerRecentlyUsedCallback();
	newCallback.m_listener = listener;
	return newCallback;
};
oFF.SuResourceExplorerRecentlyUsedCallback.prototype.m_listener = null;
oFF.SuResourceExplorerRecentlyUsedCallback.prototype.onUpdateRecentlyUsedList = function(list)
{
	this.m_listener.onQuickAccessChange(oFF.SuResourceExplorerState.QUICK_ACCESS_UPDATE_RECENTLY_USED, list);
};
oFF.SuResourceExplorerRecentlyUsedCallback.prototype.onAddToRecentlyUsed = function(datasource)
{
	var list = oFF.XList.create();
	this.getRecentlyUsedDatasources(list);
	if (list.contains(datasource))
	{
		list.removeElement(datasource);
	}
	list.insert(0, datasource);
	this.onUpdateRecentlyUsedList(list);
};
oFF.SuResourceExplorerRecentlyUsedCallback.prototype.getRecentlyUsedDatasources = function(list)
{
	return this.m_listener.onQuickAccessChange(oFF.SuResourceExplorerState.QUICK_ACCESS_FETCH_RECENTLY_USED, list);
};

oFF.SuDetailsResourceViewerConfig = function() {};
oFF.SuDetailsResourceViewerConfig.prototype = new oFF.XObject();
oFF.SuDetailsResourceViewerConfig.prototype._ff_c = "SuDetailsResourceViewerConfig";

oFF.SuDetailsResourceViewerConfig.s_fieldsDefaultLabelMapping = null;
oFF.SuDetailsResourceViewerConfig.createFromConfig = function(config)
{
	var newConfig = oFF.SuDetailsResourceViewerConfig.createDefault();
	if (oFF.notNull(config))
	{
		newConfig.m_version = config.getVersion();
		newConfig.m_pageSize = config.getPageSize();
		newConfig.m_isApiRemote = config.isApiRemote();
		if (config.getUserProfile() !== null)
		{
			newConfig.m_userName = config.getUserProfile().getSAPName();
		}
		newConfig.m_groupDirectoriesEnabled = config.isGroupDirectoriesEnabled();
		var listElement = config.getByPath2(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER, oFF.SuDetailsViewConfigWrapper.FIELDS_PATH);
		if (oFF.notNull(listElement))
		{
			var list = listElement.asList();
			for (var i = 0; i < list.size(); i++)
			{
				var fieldKey = null;
				var fieldLabel = null;
				var fieldElement = list.get(i);
				if (fieldElement.isString())
				{
					fieldKey = fieldElement.asString().getString();
				}
				else
				{
					var fieldStructure = fieldElement.asStructure();
					fieldKey = fieldStructure.getStringByKey(oFF.SuDetailsViewConfigWrapper.FIELD_KEY);
					fieldLabel = fieldStructure.getStringByKey(oFF.SuDetailsViewConfigWrapper.FIELD_LABEL);
					var fieldSortable = oFF.XBooleanValue.create(fieldStructure.getBooleanByKeyExt(oFF.SuDetailsViewConfigWrapper.FIELD_SORTABLE, false));
					newConfig.m_sortableFields.put(fieldKey, fieldSortable);
					if (newConfig.isVersionGTE(oFF.SuResourceExplorerConfig.VERSION_3))
					{
						var fieldSelectable = oFF.XBooleanValue.create(fieldStructure.getBooleanByKeyExt(oFF.SuDetailsViewConfigWrapper.FIELD_SELECTABLE, false));
						newConfig.m_selectableFields.put(fieldKey, fieldSelectable);
					}
				}
				newConfig.m_fields.put(fieldKey, fieldLabel);
			}
		}
	}
	return newConfig;
};
oFF.SuDetailsResourceViewerConfig.create = function(fields, sortableFields)
{
	var newConfig = oFF.SuDetailsResourceViewerConfig.createDefault();
	if (oFF.notNull(fields))
	{
		newConfig.m_fields.putAll(fields);
	}
	if (oFF.notNull(sortableFields))
	{
		newConfig.m_sortableFields.putAll(sortableFields);
	}
	return newConfig;
};
oFF.SuDetailsResourceViewerConfig.createEmpty = function()
{
	return oFF.SuDetailsResourceViewerConfig.create(null, null);
};
oFF.SuDetailsResourceViewerConfig.createDefault = function()
{
	var newConfig = new oFF.SuDetailsResourceViewerConfig();
	if (oFF.isNull(oFF.SuDetailsResourceViewerConfig.s_fieldsDefaultLabelMapping))
	{
		oFF.SuDetailsResourceViewerConfig.s_fieldsDefaultLabelMapping = oFF.SuDetailsResourceViewerConfig.createMapping();
	}
	newConfig.m_selectableFields = oFF.XLinkedHashMapByString.create();
	newConfig.m_sortableFields = oFF.XLinkedHashMapByString.create();
	newConfig.m_fields = oFF.XLinkedHashMapOfStringByString.create();
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	newConfig.m_fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_NAME));
	newConfig.m_sortableFields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, oFF.XBooleanValue.create(true));
	newConfig.m_navigationEnabled = true;
	newConfig.m_version = oFF.SuResourceExplorerConfig.VERSION_DEFAULT;
	return newConfig;
};
oFF.SuDetailsResourceViewerConfig.createMapping = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var fieldsDefaultLabelMapping = oFF.XHashMapOfStringByString.create();
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_NAME));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_DESCRIPTION));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_TYPE, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_TYPE));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_OWNER));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_OWNER));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_CREATED));
	fieldsDefaultLabelMapping.put(oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_MODFIED));
	return fieldsDefaultLabelMapping;
};
oFF.SuDetailsResourceViewerConfig.prototype.m_fields = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_sortableFields = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_selectableFields = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_version = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_userName = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_rowsToFill = -1;
oFF.SuDetailsResourceViewerConfig.prototype.m_breadcrumbsEnabled = false;
oFF.SuDetailsResourceViewerConfig.prototype.m_groupDirectoriesEnabled = false;
oFF.SuDetailsResourceViewerConfig.prototype.m_navigationEnabled = true;
oFF.SuDetailsResourceViewerConfig.prototype.m_highlightText = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_rootResource = null;
oFF.SuDetailsResourceViewerConfig.prototype.m_pageSize = 0;
oFF.SuDetailsResourceViewerConfig.prototype.m_isApiRemote = false;
oFF.SuDetailsResourceViewerConfig.prototype.isVersionGTE = function(version)
{
	return oFF.SuResourceExplorerConfig.isVersionGTEV(this.m_version, version);
};
oFF.SuDetailsResourceViewerConfig.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuDetailsFileViewerConfig");
	buf.append("(version:");
	buf.append(this.m_version);
	buf.append(")");
	buf.append("(fields:");
	buf.append(this.m_fields.toString());
	buf.append(")");
	buf.append("(sortableFields:");
	buf.append(this.m_sortableFields.toString());
	buf.append(")");
	buf.append("(selectableFields:");
	buf.append(this.m_selectableFields.toString());
	buf.append(")");
	buf.append("(userName:");
	buf.append(this.m_userName);
	buf.append(")");
	buf.append("(navigationEnabled:");
	buf.append(oFF.XBooleanValue.create(this.m_navigationEnabled).getStringRepresentation());
	buf.append(")");
	buf.append("]");
	return buf.toString();
};
oFF.SuDetailsResourceViewerConfig.prototype.isFieldEnabled = function(fieldName)
{
	if (oFF.isNull(this.m_fields))
	{
		return false;
	}
	return this.m_fields.containsKey(fieldName);
};
oFF.SuDetailsResourceViewerConfig.prototype.isFieldSortable = function(fieldName)
{
	if (this.isFieldEnabled(fieldName))
	{
		var isSortable = this.m_sortableFields.getByKey(fieldName);
		if (oFF.notNull(isSortable))
		{
			return isSortable.getBoolean();
		}
	}
	return false;
};
oFF.SuDetailsResourceViewerConfig.prototype.isFieldSelectable = function(fieldName)
{
	if (this.isFieldEnabled(fieldName))
	{
		if (!oFF.SuResourceExplorerConfig.isVersionGTEV(this.m_version, oFF.SuResourceExplorerConfig.VERSION_3))
		{
			return false;
		}
		var isSelectable = this.m_selectableFields.getByKey(fieldName);
		if (oFF.notNull(isSelectable))
		{
			return isSelectable.getBoolean();
		}
	}
	return false;
};
oFF.SuDetailsResourceViewerConfig.prototype.clearSortableFields = function()
{
	this.m_sortableFields.clear();
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.getFieldLabel = function(fieldName)
{
	var label = null;
	if (this.isFieldEnabled(fieldName))
	{
		label = this.m_fields.getByKey(fieldName);
		label = oFF.notNull(label) ? label : oFF.SuDetailsResourceViewerConfig.s_fieldsDefaultLabelMapping.getByKey(fieldName);
	}
	return label;
};
oFF.SuDetailsResourceViewerConfig.prototype.isNavigationEnabled = function()
{
	return this.m_navigationEnabled;
};
oFF.SuDetailsResourceViewerConfig.prototype.isGroupDirectoriesEnabled = function()
{
	return this.m_groupDirectoriesEnabled;
};
oFF.SuDetailsResourceViewerConfig.prototype.setNavigationEnabled = function(navigationEnabled)
{
	this.m_navigationEnabled = navigationEnabled;
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.getFields = function()
{
	return this.m_fields;
};
oFF.SuDetailsResourceViewerConfig.prototype.getUserName = function()
{
	return this.m_userName;
};
oFF.SuDetailsResourceViewerConfig.prototype.setRowsToFill = function(rowsToFill)
{
	this.m_rowsToFill = rowsToFill;
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.getRowsToFill = function()
{
	return this.m_rowsToFill;
};
oFF.SuDetailsResourceViewerConfig.prototype.enableBreadcrumbs = function(enable)
{
	this.m_breadcrumbsEnabled = enable;
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.isBreadcrumbsEnabled = function()
{
	return this.m_breadcrumbsEnabled;
};
oFF.SuDetailsResourceViewerConfig.prototype.setHighlightText = function(text)
{
	this.m_highlightText = text;
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.isHighlightText = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_highlightText);
};
oFF.SuDetailsResourceViewerConfig.prototype.getHighlightText = function()
{
	return this.m_highlightText;
};
oFF.SuDetailsResourceViewerConfig.prototype.setRootResource = function(resource)
{
	this.m_rootResource = resource;
	return this;
};
oFF.SuDetailsResourceViewerConfig.prototype.getRootResource = function()
{
	return this.m_rootResource;
};
oFF.SuDetailsResourceViewerConfig.prototype.getPageSize = function()
{
	return this.m_pageSize;
};
oFF.SuDetailsResourceViewerConfig.prototype.isApiRemote = function()
{
	return this.m_isApiRemote;
};

oFF.SuQuickAccessConfig = function() {};
oFF.SuQuickAccessConfig.prototype = new oFF.XObject();
oFF.SuQuickAccessConfig.prototype._ff_c = "SuQuickAccessConfig";

oFF.SuQuickAccessConfig.ICON = "icon";
oFF.SuQuickAccessConfig.LABEL = "label";
oFF.SuQuickAccessConfig.KEY = "key";
oFF.SuQuickAccessConfig.LINK = "link";
oFF.SuQuickAccessConfig.ITEMS = "items";
oFF.SuQuickAccessConfig.ENABLED = "enabled";
oFF.SuQuickAccessConfig.create = function(config, resourceNavigationHelper)
{
	var qaConfig = new oFF.SuQuickAccessConfig();
	qaConfig.m_resourceNavigationHelper = resourceNavigationHelper;
	var quickAccess = oFF.XLinkedHashMapByString.create();
	var qaList = config.getByPath(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER).asList();
	if (oFF.notNull(qaList))
	{
		for (var i = 0; i < qaList.size(); i++)
		{
			var qaElement = qaList.get(i).asStructure();
			var quickAccessCategory = oFF.SuQuickAccessCategory.createCategoryFromStructure(qaElement, i);
			qaConfig.decorateQuickAccessCategoryWithLinkResource(quickAccessCategory);
			quickAccess.put(quickAccessCategory.getKey(), quickAccessCategory);
		}
		qaConfig.m_quickAccess = quickAccess;
		qaConfig.cleanUpCategories();
	}
	return qaConfig;
};
oFF.SuQuickAccessConfig.prototype.m_quickAccess = null;
oFF.SuQuickAccessConfig.prototype.m_resourceNavigationHelper = null;
oFF.SuQuickAccessConfig.prototype.getQuickAccess = function()
{
	return this.m_quickAccess;
};
oFF.SuQuickAccessConfig.prototype.decorateQuickAccessCategoryWithLinkResource = function(quickAccessCategory)
{
	if (quickAccessCategory.getLink() !== null)
	{
		quickAccessCategory.setResource(this.m_resourceNavigationHelper.getResourceByPath(quickAccessCategory.getLink()));
	}
	if (!quickAccessCategory.isEmpty())
	{
		for (var i = 0; i < quickAccessCategory.getLinks().size(); i++)
		{
			var qaLink = quickAccessCategory.getLinks().get(i);
			if (qaLink.getLink() !== null)
			{
				qaLink.setResource(this.m_resourceNavigationHelper.getResourceByPath(qaLink.getLink()));
			}
		}
	}
};
oFF.SuQuickAccessConfig.prototype.cleanUpCategories = function()
{
	var keys = this.m_quickAccess.getKeysAsIteratorOfString();
	while (keys.hasNext())
	{
		var key = keys.next();
		var quickAccessCategory = this.m_quickAccess.getByKey(key);
		if (!quickAccessCategory.isEmpty())
		{
			var qaLinkIterator = quickAccessCategory.getLinks().getIterator();
			var linkToRemove = oFF.XList.create();
			while (qaLinkIterator.hasNext())
			{
				var qaLink = qaLinkIterator.next();
				if (qaLink.getResource() === null)
				{
					linkToRemove.add(qaLink);
				}
			}
			var qaLinkToRemoveIterator = linkToRemove.getIterator();
			while (qaLinkToRemoveIterator.hasNext())
			{
				quickAccessCategory.getLinks().removeElement(qaLinkToRemoveIterator.next());
			}
		}
	}
};

oFF.SuResourceExplorerConfig = function() {};
oFF.SuResourceExplorerConfig.prototype = new oFF.XObject();
oFF.SuResourceExplorerConfig.prototype._ff_c = "SuResourceExplorerConfig";

oFF.SuResourceExplorerConfig.VERSION = "version";
oFF.SuResourceExplorerConfig.DATA = "data";
oFF.SuResourceExplorerConfig.DATA_API = "api";
oFF.SuResourceExplorerConfig.DATA_PAGE_SIZE = "pageSize";
oFF.SuResourceExplorerConfig.PROGRAM_TITLE = "title";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER = "filter";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY = "key";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE = "type";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_VALUE = "value";
oFF.SuResourceExplorerConfig.INITIAL_PATH = "initialPath";
oFF.SuResourceExplorerConfig.ROOT = "root";
oFF.SuResourceExplorerConfig.TREE_NAVIGATION = "treeNav";
oFF.SuResourceExplorerConfig.TOOLBAR = "toolbar";
oFF.SuResourceExplorerConfig.TILES_FILE_VIEWER = "tileView";
oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER = "detailsView";
oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER = "quickAccess";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION = "datasource";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM = "system";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_CONNECTION = "connection";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM_TYPES = "systemTypes";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED = "recentlyUsed";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SYSTEM_NAME = "systemName";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DATASOURCE_NAME = "dataSourceName";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SCHEMA_NAME = "schemaName";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_OBJECT_TYPE = "objectType";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_PACKAGE_NAME = "packageName";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_CONNECTION = "connectionName";
oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DESCRIPTION = "description";
oFF.SuResourceExplorerConfig.ALLOW_IGNORE_QUICKFILTER = "allowIgnoreQuickFilter";
oFF.SuResourceExplorerConfig.SHARED_BASED_ON_USERNAME = "sharedBasedOnUsername";
oFF.SuResourceExplorerConfig.DIALOG_MODE = "dialogMode";
oFF.SuResourceExplorerConfig.MESSAGE_AREA = "messageArea";
oFF.SuResourceExplorerConfig.GROUP_DIRECTORIES = "groupDirectories";
oFF.SuResourceExplorerConfig.VERSION_DEFAULT = "1";
oFF.SuResourceExplorerConfig.VERSION_1 = "1";
oFF.SuResourceExplorerConfig.VERSION_2 = "2";
oFF.SuResourceExplorerConfig.VERSION_3 = "3";
oFF.SuResourceExplorerConfig.DATA_API_LOCAL = "local";
oFF.SuResourceExplorerConfig.DATA_API_REMOTE = "remote";
oFF.SuResourceExplorerConfig.PROFILE_DETAILS = "details";
oFF.SuResourceExplorerConfig.PROFILE_DATASOURCE = "datasource";
oFF.SuResourceExplorerConfig.PROFILE_FULL = "full";
oFF.SuResourceExplorerConfig.PROFILE_DETAILS_ONLY = "detailsOnly";
oFF.SuResourceExplorerConfig.PROFILE_TREE_ONLY = "treeOnly";
oFF.SuResourceExplorerConfig.PROFILE_TILES_ONLY = "tilesOnly";
oFF.SuResourceExplorerConfig.PROFILE_WINDOW_DEFAULT = "windowDefault";
oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH = "search";
oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH_FOLDER = "folder";
oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS = "breadcrumbs";
oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS_NAV = "nav";
oFF.SuResourceExplorerConfig.TOOLBAR_OPERATIONS = "operations";
oFF.SuResourceExplorerConfig.TOOLBAR_NAVIGATION = "navigation";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY_EXT = "ext";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE_FILE = "file";
oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE_DATASOURCE = "datasource";
oFF.SuResourceExplorerConfig.RESOURCE_MAPPING = "resourceMap";
oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_PATH = "path";
oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_ALIAS = "alias";
oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_NAME = "name";
oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_DISPLAY = "display";
oFF.SuResourceExplorerConfig.createByProfile = function(profile, configJson, isDialog, userProfile)
{
	var wrapper = oFF.SuResourceExplorerConfigWrapperFactory.createByProfile(profile, configJson);
	return oFF.SuResourceExplorerConfig.createByWrapper(wrapper, isDialog, userProfile);
};
oFF.SuResourceExplorerConfig.createWindowDefault = function(userProfile)
{
	var wrapper = oFF.SuResourceExplorerConfigWrapperFactory.createWindowDefault();
	return oFF.SuResourceExplorerConfig.createByWrapper(wrapper, false, userProfile);
};
oFF.SuResourceExplorerConfig.createByWrapper = function(config, isDialog, userProfile)
{
	var newConfig = new oFF.SuResourceExplorerConfig();
	newConfig.m_dialogMode = oFF.SuResourceExplorerDialogModeConfig.createFromStructure(config.getDialogMode(true).generateConfig(), isDialog);
	newConfig.m_config = oFF.SuResourceExplorerConfigWrapperFactory.createDefault();
	newConfig.m_config.merge(config);
	newConfig.m_userProfile = userProfile;
	return newConfig;
};
oFF.SuResourceExplorerConfig.createByJSON = function(configJSON, isDialog, userProfile)
{
	var wrapper = oFF.SuResourceExplorerConfigWrapper.createByJson(configJSON);
	return oFF.SuResourceExplorerConfig.createByWrapper(wrapper, isDialog, userProfile);
};
oFF.SuResourceExplorerConfig.isVersionGTEV = function(version, versionToCheck)
{
	return oFF.XInteger.convertFromString(version) >= oFF.XInteger.convertFromString(versionToCheck);
};
oFF.SuResourceExplorerConfig.prototype.m_config = null;
oFF.SuResourceExplorerConfig.prototype.m_dialogMode = null;
oFF.SuResourceExplorerConfig.prototype.m_userProfile = null;
oFF.SuResourceExplorerConfig.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[ResourceExplorerConfig");
	buf.append("(config:");
	buf.append(this.m_config.toString());
	buf.append(")");
	buf.append("(dialogMode:");
	buf.append(this.m_dialogMode.toString());
	buf.append(")");
	buf.append("(userProfile:");
	buf.append(this.m_userProfile.getSAPName());
	buf.append(")");
	buf.append("]");
	return buf.toString();
};
oFF.SuResourceExplorerConfig.prototype.isVersionGTE = function(version)
{
	return oFF.SuResourceExplorerConfig.isVersionGTEV(this.getVersion(), version);
};
oFF.SuResourceExplorerConfig.prototype.isVersion = function(version)
{
	var configVersion = this.getVersion();
	return oFF.XString.isEqual(configVersion, version);
};
oFF.SuResourceExplorerConfig.prototype.getVersion = function()
{
	var versionElement = this.m_config.getElementByPath(oFF.SuResourceExplorerConfig.VERSION, false);
	if (oFF.isNull(versionElement) || !versionElement.isString())
	{
		return oFF.SuResourceExplorerConfig.VERSION_1;
	}
	return versionElement.asString().getString();
};
oFF.SuResourceExplorerConfig.prototype.isApiRemote = function()
{
	if (this.isVersion(oFF.SuResourceExplorerConfig.VERSION_1))
	{
		return false;
	}
	var apiPath = oFF.XStringUtils.concatenate3(oFF.SuResourceExplorerConfig.DATA, ".", oFF.SuResourceExplorerConfig.DATA_API);
	var api = this.getStringOrNull(apiPath);
	var isApiLocal = oFF.isNull(api) || oFF.XString.isEqual(api, oFF.SuResourceExplorerConfig.DATA_API_LOCAL);
	return !isApiLocal;
};
oFF.SuResourceExplorerConfig.prototype.getWrapper = function()
{
	return this.m_config;
};
oFF.SuResourceExplorerConfig.prototype.isEnabledByPath = function(key, path)
{
	var structureByPath = this.getByPath2(key, path);
	if (oFF.isNull(structureByPath))
	{
		return false;
	}
	if (structureByPath.isBoolean())
	{
		return structureByPath.asBoolean().getBoolean();
	}
	return true;
};
oFF.SuResourceExplorerConfig.prototype.getResourceType = function()
{
	return oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_STORY;
};
oFF.SuResourceExplorerConfig.prototype.getUserProfile = function()
{
	return this.m_userProfile;
};
oFF.SuResourceExplorerConfig.prototype.getDialogMode = function()
{
	return this.m_dialogMode;
};
oFF.SuResourceExplorerConfig.prototype.getInitialPath = function()
{
	return this.getStringOrNull(oFF.SuResourceExplorerConfig.INITIAL_PATH);
};
oFF.SuResourceExplorerConfig.prototype.getRootPath = function()
{
	return this.getStringOrNull(oFF.SuResourceExplorerConfig.ROOT);
};
oFF.SuResourceExplorerConfig.prototype.getTitle = function()
{
	return this.getStringOrNull(oFF.SuResourceExplorerConfig.PROGRAM_TITLE);
};
oFF.SuResourceExplorerConfig.prototype.isAllowIgnoreQuickFilterEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.ALLOW_IGNORE_QUICKFILTER);
};
oFF.SuResourceExplorerConfig.prototype.isSharedBasedOnUsernameEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.SHARED_BASED_ON_USERNAME);
};
oFF.SuResourceExplorerConfig.prototype.isTreeNavigationEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.TREE_NAVIGATION);
};
oFF.SuResourceExplorerConfig.prototype.isDefined = function()
{
	return oFF.notNull(this.m_config);
};
oFF.SuResourceExplorerConfig.prototype.isToolbarEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.TOOLBAR);
};
oFF.SuResourceExplorerConfig.prototype.isTilesFileViewerEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.TILES_FILE_VIEWER);
};
oFF.SuResourceExplorerConfig.prototype.isDetailsFileViewerEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER);
};
oFF.SuResourceExplorerConfig.prototype.isQuickAccessEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER) && this.getByPath(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER).isList() && !this.getByPath(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER).asList().isEmpty();
};
oFF.SuResourceExplorerConfig.prototype.isDatasourceNavigationEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION);
};
oFF.SuResourceExplorerConfig.prototype.isMessageAreaEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.MESSAGE_AREA);
};
oFF.SuResourceExplorerConfig.prototype.isGroupDirectoriesEnabled = function()
{
	return this.isEnabled(oFF.SuResourceExplorerConfig.GROUP_DIRECTORIES);
};
oFF.SuResourceExplorerConfig.prototype.getByPath2 = function(key, attribute)
{
	var path = oFF.XStringUtils.concatenate3(key, ".", attribute);
	return this.getByPath(path);
};
oFF.SuResourceExplorerConfig.prototype.getByPath = function(path)
{
	return this.m_config.getElementByPath(path, false);
};
oFF.SuResourceExplorerConfig.prototype.getStringOrNull = function(path)
{
	var titleElement = this.getByPath(path);
	if (oFF.notNull(titleElement))
	{
		return titleElement.asString().getString();
	}
	return null;
};
oFF.SuResourceExplorerConfig.prototype.isEnabled = function(key)
{
	var structureByKey = this.m_config.getElementByPath(key, false);
	if (oFF.isNull(structureByKey))
	{
		return false;
	}
	if (structureByKey.isBoolean())
	{
		return structureByKey.asBoolean().getBoolean();
	}
	return true;
};
oFF.SuResourceExplorerConfig.prototype.getDialogWidth = function()
{
	var wrapper = this.m_config.getDialogMode(false);
	return oFF.notNull(wrapper) ? wrapper.getWidth() : null;
};
oFF.SuResourceExplorerConfig.prototype.getDialogHeight = function()
{
	var wrapper = this.m_config.getDialogMode(false);
	return oFF.notNull(wrapper) ? wrapper.getHeight() : null;
};
oFF.SuResourceExplorerConfig.prototype.getPageSize = function()
{
	return this.getWrapper().getData(true).getPageSize();
};

oFF.SuResourceExplorerDialogModeConfig = function() {};
oFF.SuResourceExplorerDialogModeConfig.prototype = new oFF.XObject();
oFF.SuResourceExplorerDialogModeConfig.prototype._ff_c = "SuResourceExplorerDialogModeConfig";

oFF.SuResourceExplorerDialogModeConfig.PARAM_RESIZABLE = "resizable";
oFF.SuResourceExplorerDialogModeConfig.PARAM_MODE = "mode";
oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION = "selection";
oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION_TYPE = "resType";
oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION_MODE = "mode";
oFF.SuResourceExplorerDialogModeConfig.PARAM_OK_BUTTON_lABEL = "okButtonLabel";
oFF.SuResourceExplorerDialogModeConfig.PARAM_CANCEL_BUTTON_lABEL = "cancelButtonLabel";
oFF.SuResourceExplorerDialogModeConfig.PARAM_SAVE = "save";
oFF.SuResourceExplorerDialogModeConfig.PARAM_SAVE_NEXT_FREE_RESOURCE_NAME = "nextFreeResourceName";
oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN = "open";
oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE = "save";
oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_SELECTION = "selection";
oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON = "button";
oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE = "file";
oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY = "directory";
oFF.SuResourceExplorerDialogModeConfig.create = function(mode, selectionType, selectionMode, resizable, okBtnLabel, cancelBtnLabel, nextFreeResourceName)
{
	var newConfig = new oFF.SuResourceExplorerDialogModeConfig();
	newConfig.m_resizable = resizable;
	newConfig.m_mode = mode;
	newConfig.m_selectionType = selectionType;
	newConfig.m_selectionMode = selectionMode;
	newConfig.m_okBtnLabel = okBtnLabel;
	newConfig.m_cancelBtnLabel = cancelBtnLabel;
	newConfig.m_nextFreeResourceName = nextFreeResourceName;
	return newConfig;
};
oFF.SuResourceExplorerDialogModeConfig.createDefault = function(isDialog)
{
	var mode = isDialog ? oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN : null;
	var selectionMode = isDialog ? oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON : null;
	return oFF.SuResourceExplorerDialogModeConfig.create(mode, oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE, selectionMode, true, null, null, true);
};
oFF.SuResourceExplorerDialogModeConfig.createFromStructure = function(config, isDialog)
{
	if (oFF.isNull(config))
	{
		return oFF.SuResourceExplorerDialogModeConfig.createDefault(isDialog);
	}
	var mode = config.getStringByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_MODE);
	var resizable = config.getBooleanByKeyExt(oFF.SuResourceExplorerDialogModeConfig.PARAM_RESIZABLE, true);
	var selectionStruct = config.getStructureByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION);
	var selectionType = oFF.notNull(selectionStruct) ? selectionStruct.getStringByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION_TYPE) : null;
	var selectionMode = oFF.notNull(selectionStruct) ? selectionStruct.getStringByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_SELECTION_MODE) : null;
	var okBtnLabel = config.getStringByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_OK_BUTTON_lABEL);
	var cancelBtnLabel = config.getStringByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_CANCEL_BUTTON_lABEL);
	var saveStruct = config.getStructureByKey(oFF.SuResourceExplorerDialogModeConfig.PARAM_SAVE);
	var nextFreeResourceName = oFF.isNull(saveStruct) ? true : saveStruct.getBooleanByKeyExt(oFF.SuResourceExplorerDialogModeConfig.PARAM_SAVE_NEXT_FREE_RESOURCE_NAME, true);
	return oFF.SuResourceExplorerDialogModeConfig.create(mode, selectionType, selectionMode, resizable, okBtnLabel, cancelBtnLabel, nextFreeResourceName);
};
oFF.SuResourceExplorerDialogModeConfig.createFromJSON = function(configJSON, isDialog)
{
	if (oFF.isNull(configJSON))
	{
		return oFF.SuResourceExplorerDialogModeConfig.createDefault(isDialog);
	}
	var configStruct = oFF.JsonParserFactory.createFromString(configJSON).asStructure();
	return oFF.SuResourceExplorerDialogModeConfig.createFromStructure(configStruct, isDialog);
};
oFF.SuResourceExplorerDialogModeConfig.prototype.m_mode = null;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_selectionType = null;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_selectionMode = null;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_okBtnLabel = null;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_cancelBtnLabel = null;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_resizable = false;
oFF.SuResourceExplorerDialogModeConfig.prototype.m_nextFreeResourceName = false;
oFF.SuResourceExplorerDialogModeConfig.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuResourceExplorerDialogModeConfig");
	buf.append("(mode:");
	buf.append(this.m_mode);
	buf.append(")");
	buf.append("(selectionType:");
	buf.append(this.m_selectionType);
	buf.append(")");
	buf.append("(okBtnLabel:");
	buf.append(this.m_okBtnLabel);
	buf.append(")");
	buf.append("(cancelBtnLabel:");
	buf.append(this.m_cancelBtnLabel);
	buf.append(")");
	buf.append("(resizable:");
	buf.append(oFF.XBooleanValue.create(this.m_resizable).getStringRepresentation());
	buf.append(")");
	buf.append("]");
	buf.append("(resizable:");
	buf.append(oFF.XBooleanValue.create(this.m_nextFreeResourceName).getStringRepresentation());
	buf.append(")");
	buf.append("]");
	return buf.toString();
};
oFF.SuResourceExplorerDialogModeConfig.prototype.isMode = function(mode)
{
	return oFF.XString.isEqual(this.m_mode, mode);
};
oFF.SuResourceExplorerDialogModeConfig.prototype.isSelectionType = function(selectionType)
{
	return oFF.XString.isEqual(this.m_selectionType, selectionType);
};
oFF.SuResourceExplorerDialogModeConfig.prototype.isSelectionMode = function(selectionMode)
{
	return oFF.XString.isEqual(this.m_selectionMode, selectionMode);
};
oFF.SuResourceExplorerDialogModeConfig.prototype.getOkBtnLabel = function()
{
	return this.m_okBtnLabel;
};
oFF.SuResourceExplorerDialogModeConfig.prototype.getCancelBtnLabel = function()
{
	return this.m_cancelBtnLabel;
};
oFF.SuResourceExplorerDialogModeConfig.prototype.isResizable = function()
{
	return this.m_resizable;
};
oFF.SuResourceExplorerDialogModeConfig.prototype.isNextFreeResourceName = function()
{
	return this.m_nextFreeResourceName;
};

oFF.SuResourceExplorerStyle = {

	LINK_FONT_SIZE_EM:"1em",
	QUICK_ACCESS_ITEM_HEIGHT:"3rem",
	LINK_PADDING_EM:"0.3125em",
	PAGINATION_BUTTON_SIZE_REM:"0.25rem",
	CHAR_SIZE_REM:0.5,
	STATUS_ERROR_CSSCLASS:"ffReErrorStatus",
	LINK_FONT_SIZE:null,
	LINK_PADDING:null,
	createLinkFontSize:function()
	{
			if (oFF.isNull(oFF.SuResourceExplorerStyle.LINK_FONT_SIZE))
		{
			oFF.SuResourceExplorerStyle.LINK_FONT_SIZE = oFF.UiCssLength.create(oFF.SuResourceExplorerStyle.LINK_FONT_SIZE_EM);
		}
		return oFF.SuResourceExplorerStyle.LINK_FONT_SIZE;
	},
	createLinkPadding:function()
	{
			if (oFF.isNull(oFF.SuResourceExplorerStyle.LINK_PADDING))
		{
			oFF.SuResourceExplorerStyle.LINK_PADDING = oFF.UiCssBoxEdges.create(oFF.SuResourceExplorerStyle.LINK_PADDING_EM);
		}
		return oFF.SuResourceExplorerStyle.LINK_PADDING;
	},
	setBorderStyle:function(control, width, color, style)
	{
			if (oFF.notNull(width))
		{
			control.setBorderWidth(oFF.UiCssBoxEdges.create(width));
		}
		if (oFF.notNull(color))
		{
			control.setBorderColor(oFF.UiColor.create(color));
		}
		if (oFF.notNull(style))
		{
			control.setBorderStyle(style);
		}
	},
	getStringSizeRem:function(str)
	{
			return oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(oFF.XString.size(str) * oFF.SuResourceExplorerStyle.CHAR_SIZE_REM), "rem");
	}
};

oFF.SuResourceInfoFormConfig = function() {};
oFF.SuResourceInfoFormConfig.prototype = new oFF.XObject();
oFF.SuResourceInfoFormConfig.prototype._ff_c = "SuResourceInfoFormConfig";

oFF.SuResourceInfoFormConfig.create = function(config)
{
	var infoConfig = new oFF.SuResourceInfoFormConfig();
	infoConfig.m_config = config;
	return infoConfig;
};
oFF.SuResourceInfoFormConfig.prototype.m_config = null;
oFF.SuResourceInfoFormConfig.prototype.getNewResourceName = function()
{
	var newResourceNameConfig = this.m_config.getByPath(oFF.XStringUtils.concatenate2(oFF.SuResourceExplorerConfig.DIALOG_MODE, ".save.newResourceName"));
	if (oFF.notNull(newResourceNameConfig))
	{
		return newResourceNameConfig.asString().getString();
	}
	return oFF.UiLocalizationCenter.getCenter().getText(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME_NEW);
};
oFF.SuResourceInfoFormConfig.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_config = null;
};

oFF.SuConfigWrapperBase = function() {};
oFF.SuConfigWrapperBase.prototype = new oFF.XObject();
oFF.SuConfigWrapperBase.prototype._ff_c = "SuConfigWrapperBase";

oFF.SuConfigWrapperBase.EMPTY_CONFIG = "{}";
oFF.SuConfigWrapperBase.deepMerge = function(source, target)
{
	var sourceCloned = source.clone();
	var keyIterator = source.getKeysAsIteratorOfString();
	while (keyIterator.hasNext())
	{
		var key = keyIterator.next();
		var elementSrc = sourceCloned.getByKey(key);
		var elementTrg = target.getByKey(key);
		if (oFF.isNull(elementSrc))
		{
			continue;
		}
		if (oFF.isNull(elementTrg))
		{
			target.put(key, elementSrc);
		}
		else
		{
			if (elementTrg.getType() !== elementSrc.getType())
			{
				target.put(key, elementSrc);
			}
			else if (elementSrc.isStructure())
			{
				if (elementSrc.asStructure().isEmpty())
				{
					target.put(key, elementSrc);
				}
				else
				{
					oFF.SuConfigWrapperBase.deepMerge(elementSrc.asStructure(), elementTrg.asStructure());
				}
			}
			else if (elementSrc.isList())
			{
				if (true)
				{
					target.put(key, elementSrc);
				}
			}
			else
			{
				target.put(key, elementSrc);
			}
		}
	}
};
oFF.SuConfigWrapperBase.getElementFromStructure = function(element, relativePath)
{
	if (element.getType() === oFF.PrElementType.STRUCTURE)
	{
		var elementStruct = element;
		return elementStruct.getByKey(relativePath);
	}
	else
	{
		return null;
	}
};
oFF.SuConfigWrapperBase.getElementFromList = function(element, indexStr)
{
	if (element.getType() === oFF.PrElementType.LIST)
	{
		var index = oFF.XInteger.convertFromString(indexStr);
		var currStructure = element;
		return currStructure.get(index);
	}
	else
	{
		return null;
	}
};
oFF.SuConfigWrapperBase.prototype.m_config = null;
oFF.SuConfigWrapperBase.prototype.m_wrappers = null;
oFF.SuConfigWrapperBase.prototype.setupEmpty = function()
{
	this.setupByJson(oFF.SuConfigWrapperBase.EMPTY_CONFIG);
	this.setup();
	return this;
};
oFF.SuConfigWrapperBase.prototype.setupByJson = function(json)
{
	this.m_config = oFF.isNull(json) ? null : oFF.JsonParserFactory.createFromString(json).asStructure();
	this.setup();
	return this;
};
oFF.SuConfigWrapperBase.prototype.setupStatic = function() {};
oFF.SuConfigWrapperBase.prototype.setup = function()
{
	this.setupStatic();
	this.m_wrappers = oFF.XLinkedHashMapByString.create();
	this.updateWrappers();
};
oFF.SuConfigWrapperBase.prototype.toString = function()
{
	return this.generateConfig().toString();
};
oFF.SuConfigWrapperBase.prototype.generateConfig = function()
{
	this.updateFromWrappers();
	return this.m_config;
};
oFF.SuConfigWrapperBase.prototype.clear = function()
{
	this.m_wrappers.clear();
	this.m_config.clear();
	return this.m_config;
};
oFF.SuConfigWrapperBase.prototype.getConfigWrapper = function(name)
{
	return this.getConfigWrapperExt(name, false);
};
oFF.SuConfigWrapperBase.prototype.getConfigWrapperExt = function(name, createIfNotExsist)
{
	var wrapper = this.m_wrappers.getByKey(name);
	if (oFF.isNull(wrapper) && createIfNotExsist)
	{
		wrapper = oFF.SuResourceExplorerConfigWrapperFactory.createConfigWrapper(name);
		this.m_wrappers.put(name, wrapper);
	}
	return wrapper;
};
oFF.SuConfigWrapperBase.prototype.setConfigWrapper = function(name, wrapper)
{
	this.m_wrappers.put(name, wrapper);
	return this;
};
oFF.SuConfigWrapperBase.prototype.removeConfigWrapper = function(name)
{
	if (this.m_wrappers.containsKey(name))
	{
		return this.m_wrappers.remove(name);
	}
	return null;
};
oFF.SuConfigWrapperBase.prototype.merge = function(other)
{
	if (oFF.isNull(other))
	{
		return this.generateConfig();
	}
	if (!oFF.XString.isEqual(this.getClassName(), other.getClassName()))
	{
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate5("Different ConfigWrapper types:'", this.getClassName(), "' :'", other.getClassName(), "'"));
	}
	return this.mergeConfig(other.generateConfig());
};
oFF.SuConfigWrapperBase.prototype.mergeConfig = function(other)
{
	oFF.SuConfigWrapperBase.deepMerge(other, this.m_config);
	this.updateWrappers();
	return this.m_config;
};
oFF.SuConfigWrapperBase.prototype.setStructureToRoot = function(attribute, structure)
{
	return this.setStructure(null, attribute, structure);
};
oFF.SuConfigWrapperBase.prototype.setStructure = function(path, attribute, newStructure)
{
	var structure = this.getElementByPath(path, true).asStructure();
	structure.put(attribute, newStructure);
	return this;
};
oFF.SuConfigWrapperBase.prototype.setStringToRoot = function(attribute, str)
{
	return this.setString(null, attribute, str);
};
oFF.SuConfigWrapperBase.prototype.setIntegertToRoot = function(attribute, n)
{
	return this.setInteger(null, attribute, n);
};
oFF.SuConfigWrapperBase.prototype.setInteger = function(path, attribute, n)
{
	var structure = this.getElementByPath(path, true).asStructure();
	structure.putInteger(attribute, n);
	return this;
};
oFF.SuConfigWrapperBase.prototype.setString = function(path, attribute, str)
{
	var structure = this.getElementByPath(path, true).asStructure();
	structure.putString(attribute, str);
	return this;
};
oFF.SuConfigWrapperBase.prototype.getBooleanFromRoot = function(attribute)
{
	return this.getBoolean(null, attribute);
};
oFF.SuConfigWrapperBase.prototype.getBoolean = function(path, attribute)
{
	var structure = this.getElementByPath(path, false).asStructure();
	if (oFF.notNull(structure) && structure.containsKey(attribute) && structure.getByKey(attribute).isBoolean())
	{
		return oFF.XBooleanValue.create(structure.getBooleanByKey(attribute));
	}
	return null;
};
oFF.SuConfigWrapperBase.prototype.getBooleanFromRootExt = function(attribute, defaultValue)
{
	return this.getBooleanExt(null, attribute, defaultValue);
};
oFF.SuConfigWrapperBase.prototype.getBooleanExt = function(path, attribute, defaultValue)
{
	var value = this.getBoolean(path, attribute);
	if (oFF.isNull(value))
	{
		return defaultValue;
	}
	return value.getBoolean();
};
oFF.SuConfigWrapperBase.prototype.getInteger = function(path, attribute)
{
	var structure = this.getElementByPath(path, false).asStructure();
	if (oFF.notNull(structure) && structure.containsKey(attribute) && structure.getByKey(attribute).isNumeric())
	{
		return oFF.XIntegerValue.create(structure.getIntegerByKey(attribute));
	}
	return null;
};
oFF.SuConfigWrapperBase.prototype.getIntegerFromRoot = function(attribute)
{
	return this.getInteger(null, attribute);
};
oFF.SuConfigWrapperBase.prototype.getIntegerExt = function(path, attribute, defaultValue)
{
	var value = this.getInteger(path, attribute);
	if (oFF.isNull(value))
	{
		return defaultValue;
	}
	return value.getInteger();
};
oFF.SuConfigWrapperBase.prototype.getIntegerFromRootExt = function(attribute, defaultValue)
{
	return this.getIntegerExt(null, attribute, defaultValue);
};
oFF.SuConfigWrapperBase.prototype.enableWrapper = function(wrapperName, enable)
{
	this.removeConfigWrapper(wrapperName);
	this.setBooleanToRoot(wrapperName, enable);
	return this;
};
oFF.SuConfigWrapperBase.prototype.setBooleanToRoot = function(attribute, value)
{
	return this.setBoolean(null, attribute, value);
};
oFF.SuConfigWrapperBase.prototype.setBoolean = function(path, attribute, value)
{
	var structure = this.getElementByPath(path, true).asStructure();
	structure.putBoolean(attribute, value);
	return this;
};
oFF.SuConfigWrapperBase.prototype.addStringToList = function(path, attribute, str)
{
	var structure = this.getElementByPath(path, true).asStructure();
	var list = structure.containsKey(attribute) ? structure.getListByKey(attribute) : structure.putNewList(attribute);
	list.addString(str);
	return this;
};
oFF.SuConfigWrapperBase.prototype.addToList = function(path, attribute, element)
{
	var structure = this.getElementByPath(path, true).asStructure();
	var list = structure.containsKey(attribute) ? structure.getListByKey(attribute) : structure.putNewList(attribute);
	list.add(element);
	return this;
};
oFF.SuConfigWrapperBase.prototype.addToListRoot = function(attribute, element)
{
	return this.addToList(null, attribute, element);
};
oFF.SuConfigWrapperBase.prototype.getStructure = function(path)
{
	return this.getElementByPath(path, true).asStructure();
};
oFF.SuConfigWrapperBase.prototype.removeStructureFromRoot = function(attribute)
{
	return this.removeStructure(null, attribute);
};
oFF.SuConfigWrapperBase.prototype.removeStructure = function(path, attribute)
{
	var structure = this.getElementByPath(path, true).asStructure();
	structure.remove(attribute);
	return structure;
};
oFF.SuConfigWrapperBase.prototype.getElementByPath = function(path, createIfNotExsist)
{
	var curr = this.m_config;
	var prev = curr;
	if (oFF.isNull(path))
	{
		return curr;
	}
	var pathTokens = oFF.XStringTokenizer.splitString(path, ".");
	var i = 0;
	for (; i < pathTokens.size(); i++)
	{
		var relativePath = pathTokens.get(i);
		if (oFF.XString.match(relativePath, "[0-9]+"))
		{
			curr = oFF.SuConfigWrapperBase.getElementFromList(curr, relativePath);
		}
		else
		{
			curr = oFF.SuConfigWrapperBase.getElementFromStructure(curr, relativePath);
		}
		if (oFF.isNull(curr))
		{
			break;
		}
	}
	if (oFF.isNull(curr) && createIfNotExsist)
	{
		for (; i < pathTokens.size(); i++)
		{
			var relativePathToCreate = pathTokens.get(i);
			curr = prev.asStructure().putNewStructure(relativePathToCreate);
			prev = curr;
		}
	}
	return curr;
};
oFF.SuConfigWrapperBase.prototype.putStringIfNotNull = function(structure, name, value)
{
	if (oFF.notNull(value))
	{
		structure.putString(name, value);
	}
};
oFF.SuConfigWrapperBase.prototype.putBooleanIfNotNull = function(structure, name, value)
{
	if (oFF.notNull(value))
	{
		structure.putBoolean(name, value.getBoolean());
	}
};
oFF.SuConfigWrapperBase.prototype.updateWrappers = function()
{
	return;
};
oFF.SuConfigWrapperBase.prototype.updateFromWrappers = function()
{
	var keyIt = this.m_wrappers.getKeysAsIteratorOfString();
	while (keyIt.hasNext())
	{
		var key = keyIt.next();
		var wrapper = this.m_wrappers.getByKey(key);
		this.m_config.put(key, wrapper.generateConfig().clone());
	}
};
oFF.SuConfigWrapperBase.prototype.updateWrapper = function(wrapperName)
{
	if (this.m_config.containsKey(wrapperName))
	{
		var configWrapper = this.getConfigWrapperExt(wrapperName, true);
		if (oFF.notNull(configWrapper))
		{
			configWrapper.clear();
			var configElement = this.m_config.getByKey(wrapperName);
			if (configElement.isStructure())
			{
				configWrapper.setupByJson(configElement.getStringRepresentation());
			}
			else
			{
				this.removeConfigWrapper(wrapperName);
			}
		}
	}
	else
	{
		this.removeConfigWrapper(wrapperName);
	}
};

oFF.SuResourceExplorerConfigWrapperFactory = {

	createDefault:function()
	{
			var configWrapper = oFF.SuResourceExplorerConfigWrapper.create();
		configWrapper.enableTreeNav(true);
		configWrapper.enableTileView(false);
		configWrapper.enableQuickAccess(false);
		configWrapper.enableDatasource(false);
		configWrapper.enableMessageArea(true);
		var toolbarWrapper = configWrapper.getToolbar(true);
		toolbarWrapper.setStringToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS, oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS_NAV);
		toolbarWrapper.enableNavigation(true);
		toolbarWrapper.enableSearch(true);
		toolbarWrapper.enableOperations(true);
		var detailsViewWrapper = configWrapper.getDetailsView(true);
		detailsViewWrapper.addField("name", null, oFF.XBooleanValue.create(true), null);
		detailsViewWrapper.addField("description", null, oFF.XBooleanValue.create(true), null);
		detailsViewWrapper.addFieldName("ownerDisplayName");
		configWrapper.generateConfig();
		return configWrapper;
	},
	createWindowDefault:function()
	{
			var configWrapper = oFF.SuResourceExplorerConfigWrapperFactory.createDefault();
		configWrapper.getToolbar(true).enableOperations(false);
		return configWrapper;
	},
	createConfigWrapper:function(name)
	{
			switch (name)
		{
			case oFF.SuResourceExplorerConfig.TOOLBAR:
				return oFF.SuToolbarConfigWrapper.create();

			case oFF.SuResourceExplorerConfig.DIALOG_MODE:
				return oFF.SuDialogModeConfigWrapper.create();

			case oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER:
				return oFF.SuDetailsViewConfigWrapper.create();

			case oFF.SuResourceExplorerConfig.DATA:
				return oFF.SuDataConfigWrapper.create();

			default:
				return oFF.SuResourceExplorerConfigWrapper.create();
		}
	},
	createByProfile:function(profile, config)
	{
			var configInput = oFF.isNull(config) ? oFF.PrFactory.createStructure() : oFF.JsonParserFactory.createFromString(config).asStructure();
		switch (profile)
		{
			case oFF.SuResourceExplorerConfig.PROFILE_DETAILS:
				return oFF.SuResourceExplorerConfigWrapperFactory.getDetailsViewJSON(configInput);

			case oFF.SuResourceExplorerConfig.PROFILE_DATASOURCE:
				return oFF.SuResourceExplorerConfigWrapperFactory.getDatasourceJSON(configInput);

			case oFF.SuResourceExplorerConfig.PROFILE_DETAILS_ONLY:
				return oFF.SuResourceExplorerConfigWrapperFactory.getDetailsViewOnlyJSON(configInput);

			case oFF.SuResourceExplorerConfig.PROFILE_TILES_ONLY:
				return oFF.SuResourceExplorerConfigWrapperFactory.getTilesViewOnlyJSON(configInput);

			case oFF.SuResourceExplorerConfig.PROFILE_TREE_ONLY:
				return oFF.SuResourceExplorerConfigWrapperFactory.getTreeNavOnlyJSON(configInput);

			case oFF.SuResourceExplorerConfig.PROFILE_FULL:
				return oFF.SuResourceExplorerConfigWrapperFactory.getFullJSON(configInput);

			default:
				return oFF.SuResourceExplorerConfigWrapperFactory.createWindowDefault();
		}
	},
	getDetailsViewJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.enableMessageArea(true);
		wrapper.getToolbar(true).enableNavigation(false);
		wrapper.enableDefaultDetailsView();
		wrapper.enableQuickAccess(true);
		wrapper.mergeConfig(configInput);
		wrapper.enableDatasource(false);
		wrapper.enableTileView(false);
		wrapper.enableTreeNav(false);
		return wrapper;
	},
	getDatasourceJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.enableDatasource(true);
		wrapper.enableQuickAccess(true);
		wrapper.setDatasourceRoot("/sys");
		wrapper.mergeConfig(configInput);
		wrapper.enableDetailsView(false);
		wrapper.enableTileView(false);
		wrapper.enableToolbar(false);
		wrapper.enableTreeNav(false);
		return wrapper;
	},
	getDetailsViewOnlyJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.enableMessageArea(true);
		wrapper.enableDefaultDetailsView();
		wrapper.getToolbar(true).enableNavigation(false);
		wrapper.mergeConfig(configInput);
		wrapper.enableDatasource(false);
		wrapper.enableQuickAccess(false);
		wrapper.enableTileView(false);
		wrapper.enableTreeNav(false);
		return wrapper;
	},
	getTilesViewOnlyJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.enableMessageArea(true);
		wrapper.enableTileView(true);
		wrapper.getToolbar(true);
		wrapper.mergeConfig(configInput);
		wrapper.enableDatasource(false);
		wrapper.enableQuickAccess(false);
		wrapper.enableDetailsView(false);
		wrapper.enableTreeNav(false);
		return wrapper;
	},
	getTreeNavOnlyJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.mergeConfig(configInput);
		wrapper.enableTreeNav(true);
		wrapper.enableDetailsView(false);
		wrapper.getToolbar(false);
		wrapper.enableDatasource(false);
		wrapper.enableQuickAccess(false);
		wrapper.enableTileView(false);
		return wrapper;
	},
	getFullJSON:function(configInput)
	{
			var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.enableMessageArea(true);
		wrapper.enableTreeNav(true);
		wrapper.enableDefaultDetailsView();
		wrapper.getToolbar(true);
		wrapper.enableQuickAccess(true);
		wrapper.enableTileView(true);
		wrapper.mergeConfig(configInput);
		wrapper.enableDatasource(false);
		return wrapper;
	}
};

oFF.SuDataSourceInfo = function() {};
oFF.SuDataSourceInfo.prototype = new oFF.XObject();
oFF.SuDataSourceInfo.prototype._ff_c = "SuDataSourceInfo";

oFF.SuDataSourceInfo.create = function(systemName, dataSourceName, schemaName, objectType, packageName, description)
{
	var info = new oFF.SuDataSourceInfo();
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(systemName, "systemName name cannot be null");
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(dataSourceName, "dataSourceName cannot be null");
	info.m_systemName = systemName;
	info.m_dataSourceName = dataSourceName;
	info.m_schemaName = schemaName;
	info.m_packageName = packageName;
	info.m_objectType = objectType;
	info.m_description = description;
	return info;
};
oFF.SuDataSourceInfo.createFromString = function(jsonString)
{
	return oFF.SuDataSourceInfo.createFromJsonString(jsonString);
};
oFF.SuDataSourceInfo.createFromJsonString = function(jsonString)
{
	var recentDatasourceJson = oFF.JsonParserFactory.createFromString(jsonString);
	var recentDatasourceStruct = recentDatasourceJson.asStructure();
	return oFF.SuDataSourceInfo.createFromIPrStructure(recentDatasourceStruct);
};
oFF.SuDataSourceInfo.createFromIPrStructure = function(datasourceStruct)
{
	return oFF.SuDataSourceInfo.create(datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SYSTEM_NAME), datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DATASOURCE_NAME), datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SCHEMA_NAME), datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_OBJECT_TYPE), datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_PACKAGE_NAME), datasourceStruct.getStringByKey(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DESCRIPTION));
};
oFF.SuDataSourceInfo.prototype.m_systemName = null;
oFF.SuDataSourceInfo.prototype.m_systemType = null;
oFF.SuDataSourceInfo.prototype.m_dataSourceName = null;
oFF.SuDataSourceInfo.prototype.m_schemaName = null;
oFF.SuDataSourceInfo.prototype.m_packageName = null;
oFF.SuDataSourceInfo.prototype.m_objectType = null;
oFF.SuDataSourceInfo.prototype.m_description = null;
oFF.SuDataSourceInfo.prototype.generateIPrElement = function()
{
	var datasourceStruct = oFF.PrStructure.create();
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SYSTEM_NAME, this.getSystemName());
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DATASOURCE_NAME, this.getDataSourceName());
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SCHEMA_NAME, this.getSchemaName());
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_OBJECT_TYPE, this.getObjectType());
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_PACKAGE_NAME, this.getPackageName());
	datasourceStruct.putString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DESCRIPTION, this.getDescription());
	return datasourceStruct;
};
oFF.SuDataSourceInfo.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.SuDataSourceInfo.prototype.setSystemType = function(systemType)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(systemType, "systemType cannot be null");
	this.m_systemType = systemType;
};
oFF.SuDataSourceInfo.prototype.getSystemType = function()
{
	return this.m_systemType;
};
oFF.SuDataSourceInfo.prototype.getDataSourceName = function()
{
	return this.m_dataSourceName;
};
oFF.SuDataSourceInfo.prototype.getSchemaName = function()
{
	return this.m_schemaName;
};
oFF.SuDataSourceInfo.prototype.getPackageName = function()
{
	return this.m_packageName;
};
oFF.SuDataSourceInfo.prototype.getObjectType = function()
{
	return this.m_objectType;
};
oFF.SuDataSourceInfo.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.SuDataSourceInfo.prototype.toString = function()
{
	return this.generateIPrElement().getStringRepresentation();
};
oFF.SuDataSourceInfo.prototype.isEqualTo = function(other)
{
	if (this === other)
	{
		return true;
	}
	if (oFF.isNull(other))
	{
		return false;
	}
	var thisClassName = oFF.XStringValue.create(this.getClassName());
	var otherClassName = oFF.XStringValue.create(other.getClassName());
	if (!thisClassName.isEqualTo(otherClassName))
	{
		return false;
	}
	var otherDatasource = other;
	if (!oFF.XString.isEqual(this.getDataSourceName(), otherDatasource.getDataSourceName()))
	{
		return false;
	}
	if (!oFF.XString.isEqual(this.getSystemName(), otherDatasource.getSystemName()))
	{
		return false;
	}
	return true;
};

oFF.SuQuickAccessLink = function() {};
oFF.SuQuickAccessLink.prototype = new oFF.XObject();
oFF.SuQuickAccessLink.prototype._ff_c = "SuQuickAccessLink";

oFF.SuQuickAccessLink.createSimpleLink = function(link)
{
	var data = new oFF.SuQuickAccessLink();
	data.setupLink(link, null, null, true);
	return data;
};
oFF.SuQuickAccessLink.create = function(label, icon, link, enabled)
{
	var data = new oFF.SuQuickAccessLink();
	data.setupLink(link, label, icon, enabled);
	return data;
};
oFF.SuQuickAccessLink.createFromStructure = function(qaElement, defaultKey)
{
	var data = new oFF.SuQuickAccessLink();
	data.setupFromStructure(qaElement, defaultKey);
	return data;
};
oFF.SuQuickAccessLink.prototype.m_label = null;
oFF.SuQuickAccessLink.prototype.m_icon = null;
oFF.SuQuickAccessLink.prototype.m_link = null;
oFF.SuQuickAccessLink.prototype.m_enabled = false;
oFF.SuQuickAccessLink.prototype.m_resource = null;
oFF.SuQuickAccessLink.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuQuickAccessLink");
	this.appendCommon(buf);
	buf.append("]");
	return buf.toString();
};
oFF.SuQuickAccessLink.prototype.appendCommon = function(buf)
{
	buf.append("(link:");
	buf.append(this.m_link);
	buf.append(")");
	buf.append("(label:");
	buf.append(this.m_label);
	buf.append(")");
	buf.append("(icon:");
	buf.append(this.m_icon);
	buf.append(")");
	buf.append("(enabled:");
	buf.append(oFF.XBoolean.convertToString(this.m_enabled));
	buf.append(")");
	buf.append("(resource:");
	buf.append(this.m_resource.toString());
	buf.append(")");
};
oFF.SuQuickAccessLink.prototype.setupFromStructure = function(qaElement, defaultKey)
{
	var icon = null;
	if (qaElement.containsKey(oFF.SuQuickAccessConfig.ICON))
	{
		icon = qaElement.getStringByKey(oFF.SuQuickAccessConfig.ICON);
	}
	var link = qaElement.getStringByKey(oFF.SuQuickAccessConfig.LINK);
	var label = qaElement.getStringByKey(oFF.SuQuickAccessConfig.LABEL);
	var enabled = qaElement.getBooleanByKeyExt(oFF.SuQuickAccessConfig.ENABLED, true);
	this.setupLink(link, label, icon, enabled);
};
oFF.SuQuickAccessLink.prototype.setupLink = function(link, label, icon, enabled)
{
	this.m_label = label;
	this.m_icon = icon;
	this.m_link = link;
	this.m_enabled = enabled;
};
oFF.SuQuickAccessLink.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_icon = null;
	this.m_link = null;
	this.m_label = null;
};
oFF.SuQuickAccessLink.prototype.getLink = function()
{
	return this.m_link;
};
oFF.SuQuickAccessLink.prototype.getLabel = function()
{
	return this.m_label;
};
oFF.SuQuickAccessLink.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.SuQuickAccessLink.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.SuQuickAccessLink.prototype.getResource = function()
{
	return this.m_resource;
};
oFF.SuQuickAccessLink.prototype.setResource = function(resource)
{
	this.m_resource = resource;
};

oFF.SuReMessage = function() {};
oFF.SuReMessage.prototype = new oFF.XObject();
oFF.SuReMessage.prototype._ff_c = "SuReMessage";

oFF.SuReMessage.create = function(text, messageType)
{
	var newMessage = new oFF.SuReMessage();
	newMessage.m_text = text;
	newMessage.m_messageType = messageType;
	return newMessage;
};
oFF.SuReMessage.createError = function(message)
{
	return oFF.SuReMessage.create(message, oFF.UiMessageType.ERROR);
};
oFF.SuReMessage.createWarning = function(message)
{
	return oFF.SuReMessage.create(message, oFF.UiMessageType.WARNING);
};
oFF.SuReMessage.createInfo = function(message)
{
	return oFF.SuReMessage.create(message, oFF.UiMessageType.INFORMATION);
};
oFF.SuReMessage.createSuccess = function(message)
{
	return oFF.SuReMessage.create(message, oFF.UiMessageType.SUCCESS);
};
oFF.SuReMessage.prototype.m_text = null;
oFF.SuReMessage.prototype.m_messageType = null;
oFF.SuReMessage.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_text = null;
	this.m_messageType = null;
};
oFF.SuReMessage.prototype.getText = function()
{
	return this.m_text;
};
oFF.SuReMessage.prototype.getMessageType = function()
{
	return this.m_messageType;
};

oFF.SuResourceExplorerLocalStorageManager = function() {};
oFF.SuResourceExplorerLocalStorageManager.prototype = new oFF.XObject();
oFF.SuResourceExplorerLocalStorageManager.prototype._ff_c = "SuResourceExplorerLocalStorageManager";

oFF.SuResourceExplorerLocalStorageManager.DS_RECENTLY_USED_COLUMNS = "dsRecentlyUsedColumns";
oFF.SuResourceExplorerLocalStorageManager.RE_DETAILS_VIEW_COLUMNS = "reDetailsViewColumns";
oFF.SuResourceExplorerLocalStorageManager.DS_RECENTLY_USED_LIST = "dsRecentlyUsedList";
oFF.SuResourceExplorerLocalStorageManager.s_instance = null;
oFF.SuResourceExplorerLocalStorageManager.staticSetup = function(process)
{
	oFF.XObjectExt.assertNotNullExt(process, "process name cannot be null");
	oFF.SuResourceExplorerLocalStorageManager.s_instance = new oFF.SuResourceExplorerLocalStorageManager();
	oFF.SuResourceExplorerLocalStorageManager.s_instance.m_process = process;
};
oFF.SuResourceExplorerLocalStorageManager.save = function(storageKey, str)
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return;
	}
	oFF.SuResourceExplorerLocalStorageManager.s_instance._save(storageKey, str);
};
oFF.SuResourceExplorerLocalStorageManager.get = function(storageKey)
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return null;
	}
	return oFF.SuResourceExplorerLocalStorageManager.s_instance._get(storageKey);
};
oFF.SuResourceExplorerLocalStorageManager.clear = function(storageKey)
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return;
	}
	oFF.SuResourceExplorerLocalStorageManager.s_instance._clear(storageKey);
};
oFF.SuResourceExplorerLocalStorageManager.clearAll = function()
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return;
	}
	oFF.SuResourceExplorerLocalStorageManager.s_instance._clearAll();
};
oFF.SuResourceExplorerLocalStorageManager.saveIPrElement = function(storageKey, element)
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return;
	}
	oFF.SuResourceExplorerLocalStorageManager.s_instance._saveIPrElement(storageKey, element);
};
oFF.SuResourceExplorerLocalStorageManager.getIPrElement = function(storageKey)
{
	if (oFF.isNull(oFF.SuResourceExplorerLocalStorageManager.s_instance))
	{
		return oFF.PrStructure.create();
	}
	return oFF.SuResourceExplorerLocalStorageManager.s_instance._getIPrElement(storageKey);
};
oFF.SuResourceExplorerLocalStorageManager.prototype.m_process = null;
oFF.SuResourceExplorerLocalStorageManager.prototype._save = function(storageKey, str)
{
	this.m_process.getLocalStorage().putString(storageKey, str);
};
oFF.SuResourceExplorerLocalStorageManager.prototype._get = function(storageKey)
{
	return this.m_process.getLocalStorage().getStringByKey(storageKey);
};
oFF.SuResourceExplorerLocalStorageManager.prototype._clear = function(storageKey)
{
	this.m_process.getLocalStorage().removeKey(storageKey);
};
oFF.SuResourceExplorerLocalStorageManager.prototype._clearAll = function()
{
	this.m_process.getLocalStorage().clear();
};
oFF.SuResourceExplorerLocalStorageManager.prototype._saveIPrElement = function(storageKey, element)
{
	try
	{
		oFF.SuResourceExplorerLocalStorageManager.save(storageKey, element.getStringRepresentation());
	}
	catch (t)
	{
		oFF.SuResourceExplorerLocalStorageManager.save(storageKey, "");
	}
};
oFF.SuResourceExplorerLocalStorageManager.prototype._getIPrElement = function(storageKey)
{
	var element = oFF.PrStructure.create();
	try
	{
		var str = oFF.SuResourceExplorerLocalStorageManager.get(storageKey);
		if (oFF.notNull(str))
		{
			element = oFF.JsonParserFactory.createFromSafeString(oFF.SuResourceExplorerLocalStorageManager.get(storageKey));
		}
	}
	catch (t)
	{
		return element;
	}
	return element;
};

oFF.SuDataProviderConstants = {

	EVENT_ON_FETCH:"onFetch"
};

oFF.SuDataProviderFetchResult = function() {};
oFF.SuDataProviderFetchResult.prototype = new oFF.XObject();
oFF.SuDataProviderFetchResult.prototype._ff_c = "SuDataProviderFetchResult";

oFF.SuDataProviderFetchResult.create = function(list, totalItems, messages)
{
	var result = new oFF.SuDataProviderFetchResult();
	result.m_list = list;
	result.m_totalItems = totalItems;
	result.m_messages = messages;
	return result;
};
oFF.SuDataProviderFetchResult.createList = function(list)
{
	return oFF.SuDataProviderFetchResult.create(list, oFF.notNull(list) ? list.size() : -1, null);
};
oFF.SuDataProviderFetchResult.createByIXFileResultset = function(resultSet)
{
	return oFF.SuDataProviderFetchResult.create(resultSet.getChildFiles(), resultSet.getTotalItemCount(), null);
};
oFF.SuDataProviderFetchResult.prototype.m_list = null;
oFF.SuDataProviderFetchResult.prototype.m_totalItems = 0;
oFF.SuDataProviderFetchResult.prototype.m_messages = null;
oFF.SuDataProviderFetchResult.prototype.getList = function()
{
	return this.m_list;
};
oFF.SuDataProviderFetchResult.prototype.getTotalItems = function()
{
	return this.m_totalItems;
};
oFF.SuDataProviderFetchResult.prototype.getMessages = function()
{
	return this.m_messages;
};

oFF.SuDataProviderHelper = function() {};
oFF.SuDataProviderHelper.prototype = new oFF.XObject();
oFF.SuDataProviderHelper.prototype._ff_c = "SuDataProviderHelper";

oFF.SuDataProviderHelper.STATE_QUERY_NAME = "query";
oFF.SuDataProviderHelper.STATE_CUSTOM_FILTER_NAME = "customFilter";
oFF.SuDataProviderHelper.STATE_FETCH_PROMISE_NAME = "fetchPromise";
oFF.SuDataProviderHelper.STATE_COMPARATOR_NAME = "comparator";
oFF.SuDataProviderHelper.STATE_MAX_ITEMS_NAME = "maxItems";
oFF.SuDataProviderHelper.STATE_OFFSET_NAME = "offset";
oFF.SuDataProviderHelper.STATE_SORTING_ATTRIBUTE_NAME = "sortingAttribute";
oFF.SuDataProviderHelper.STATE_SORTING_ORDER_NAME = "sortingOrder";
oFF.SuDataProviderHelper.STATE_INIT = "init";
oFF.SuDataProviderHelper.isDataChanged = function(dataProvider)
{
	var stateChanged = dataProvider.getLastStateChanged();
	return stateChanged.containsKey(oFF.SuDataProviderHelper.STATE_INIT) || stateChanged.containsKey(oFF.SuDataProviderHelper.STATE_QUERY_NAME) || stateChanged.containsKey(oFF.SuDataProviderHelper.STATE_CUSTOM_FILTER_NAME) || stateChanged.containsKey(oFF.SuDataProviderHelper.STATE_FETCH_PROMISE_NAME);
};
oFF.SuDataProviderHelper.isPageInfoChanged = function(dataProvider)
{
	var stateChanged = dataProvider.getLastStateChanged();
	return oFF.SuDataProviderHelper.isDataChanged(dataProvider) || stateChanged.containsKey(oFF.SuDataProviderHelper.STATE_MAX_ITEMS_NAME);
};

oFF.SuEventConsumerHandler = function() {};
oFF.SuEventConsumerHandler.prototype = new oFF.XObject();
oFF.SuEventConsumerHandler.prototype._ff_c = "SuEventConsumerHandler";

oFF.SuEventConsumerHandler.create = function()
{
	var handler = new oFF.SuEventConsumerHandler();
	handler.m_consumers = oFF.XHashMapByString.create();
	return handler;
};
oFF.SuEventConsumerHandler.prototype.m_consumers = null;
oFF.SuEventConsumerHandler.prototype.releaseObject = function()
{
	this.m_consumers.clear();
	this.m_consumers = oFF.XObjectExt.release(this.m_consumers);
};
oFF.SuEventConsumerHandler.prototype.getEventConsumers = function(eventName)
{
	return this.getEventConsumersExt(eventName, false);
};
oFF.SuEventConsumerHandler.prototype.attachEventConsumer = function(eventName, consumer)
{
	this.validateEvent(eventName);
	this.validateConsumer(consumer);
	var consumers = this.getEventConsumersExt(eventName, true);
	consumers.add(oFF.XConsumerHolder.create(consumer));
};
oFF.SuEventConsumerHandler.prototype.detachEventConsumer = function(eventName, consumer)
{
	this.validateEvent(eventName);
	this.validateConsumer(consumer);
	var consumers = this.getEventConsumers(eventName);
	if (oFF.notNull(consumers))
	{
		consumers.removeElement(oFF.XConsumerHolder.create(consumer));
	}
};
oFF.SuEventConsumerHandler.prototype.fireEvent = function(eventName, data)
{
	var consumers = this.getEventConsumers(eventName);
	if (oFF.notNull(consumers))
	{
		for (var i = 0; i < consumers.size(); i++)
		{
			consumers.get(i).accept(data);
		}
	}
};
oFF.SuEventConsumerHandler.prototype.getEventConsumersExt = function(eventName, createIfNotExsist)
{
	this.validateConsumers();
	this.validateEvent(eventName);
	if (!this.m_consumers.containsKey(eventName) && createIfNotExsist)
	{
		var consumers = oFF.XList.create();
		this.m_consumers.put(eventName, consumers);
	}
	return this.m_consumers.getByKey(eventName);
};
oFF.SuEventConsumerHandler.prototype.validateEvent = function(eventName)
{
	if (oFF.isNull(eventName))
	{
		throw oFF.XException.createRuntimeException("Missing event definition. An event needs to be specified!");
	}
};
oFF.SuEventConsumerHandler.prototype.validateConsumer = function(consumer)
{
	if (oFF.isNull(consumer))
	{
		throw oFF.XException.createRuntimeException("Comsumer null. The comsumer must be specified!");
	}
};
oFF.SuEventConsumerHandler.prototype.validateConsumers = function()
{
	if (oFF.isNull(this.m_consumers))
	{
		throw oFF.XException.createRuntimeException("Comsumers null. You must call buildUI() before!");
	}
};

oFF.SuLocalDataProviderFactory = function() {};
oFF.SuLocalDataProviderFactory.prototype = new oFF.XObject();
oFF.SuLocalDataProviderFactory.prototype._ff_c = "SuLocalDataProviderFactory";

oFF.SuLocalDataProviderFactory.create = function(store, config, filterManager)
{
	var factory = new oFF.SuLocalDataProviderFactory();
	factory.m_store = store;
	factory.m_config = config;
	factory.m_filterManager = filterManager;
	return factory;
};
oFF.SuLocalDataProviderFactory.prototype.m_filterManager = null;
oFF.SuLocalDataProviderFactory.prototype.m_store = null;
oFF.SuLocalDataProviderFactory.prototype.m_config = null;
oFF.SuLocalDataProviderFactory.prototype.createProvider = function()
{
	var dataProvider = oFF.SuLocalDataProvider.createEmpty();
	dataProvider.setMaxItems(this.m_config.getPageSize());
	dataProvider.setComparator(oFF.SuResourceComparator.create(true, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, this.m_config.isGroupDirectoriesEnabled()));
	dataProvider.setFetchPromise( function(){
		return this.updateDataProvider(dataProvider);
	}.bind(this));
	return dataProvider;
};
oFF.SuLocalDataProviderFactory.prototype.updateDataProvider = function(dataProvider)
{
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		var browsedResource = this.m_store.getBrowsedResource();
		if (oFF.isNull(browsedResource))
		{
			resolve(null);
		}
		var filter = this.m_filterManager.buildFilterForState(this.m_store.getState());
		dataProvider.setCustomFilter( function(resource, queryString){
			return oFF.XBooleanValue.create(filter(resource));
		}.bind(this));
		var isRecursiveSearch = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_store.getSearchQuery()) && this.m_filterManager.isRecursiveSearchEnabled();
		var resourceWrapper = oFF.SuResourceWrapper.create(browsedResource);
		if (oFF.notNull(this.m_config))
		{
			this.m_config.enableBreadcrumbs(isRecursiveSearch || resourceWrapper.isVirtualFolder());
			this.m_config.setHighlightText(this.m_store.getSearchQuery());
			dataProvider.setQuery(this.m_store.getSearchQuery());
		}
		if (isRecursiveSearch)
		{
			resourceWrapper.processFetchChildrenRecursive(this.getResourceListConsumer(dataProvider, resolve), this.getErrorConsumer(reject));
		}
		else
		{
			resourceWrapper.processFetchChildren(this.getResourceListConsumer(dataProvider, resolve), this.getErrorConsumer(reject));
		}
	}.bind(this));
};
oFF.SuLocalDataProviderFactory.prototype.getResourceListConsumer = function(dataProvider, resolve)
{
	return  function(resourceList){
		if (this.isReleased())
		{
			resolve(null);
		}
		resolve(oFF.SuDataProviderFetchResult.createList(resourceList));
	}.bind(this);
};
oFF.SuLocalDataProviderFactory.prototype.getErrorConsumer = function(reject)
{
	return  function(messages){
		if (this.isReleased())
		{
			reject(oFF.XError.create("Already released!"));
		}
		this.printResourceRetrievalErrorMsg(messages.getSummary());
		reject(oFF.XError.createWithMessage(messages.getFirstError()));
	}.bind(this);
};
oFF.SuLocalDataProviderFactory.prototype.printResourceRetrievalErrorMsg = function(message)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var errMsg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.RESOURCE_RETRIEVAL_ERROR, message);
	var messageObject = oFF.SuReMessage.createError(errMsg);
	this.m_store.setMessage(messageObject);
};

oFF.SuLocalDatasourceProviderFactory = function() {};
oFF.SuLocalDatasourceProviderFactory.prototype = new oFF.XObject();
oFF.SuLocalDatasourceProviderFactory.prototype._ff_c = "SuLocalDatasourceProviderFactory";

oFF.SuLocalDatasourceProviderFactory.create = function(store, config, filterManager, view)
{
	var factory = new oFF.SuLocalDatasourceProviderFactory();
	factory.m_store = store;
	factory.m_filterManager = filterManager;
	factory.m_view = view;
	factory.m_config = config;
	return factory;
};
oFF.SuLocalDatasourceProviderFactory.prototype.m_filterManager = null;
oFF.SuLocalDatasourceProviderFactory.prototype.m_store = null;
oFF.SuLocalDatasourceProviderFactory.prototype.m_view = null;
oFF.SuLocalDatasourceProviderFactory.prototype.m_config = null;
oFF.SuLocalDatasourceProviderFactory.prototype.createProvider = function()
{
	var dataProvider = oFF.SuLocalDataProvider.createEmpty();
	dataProvider.setMaxItems(this.m_config.getPageSize());
	dataProvider.setComparator(oFF.SuResourceComparator.createDefault());
	dataProvider.setFetchPromise( function(){
		return this.updateDataProvider(dataProvider);
	}.bind(this));
	return dataProvider;
};
oFF.SuLocalDatasourceProviderFactory.prototype.updateDataProvider = function(dataProvider)
{
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		var connectionResource = this.m_store.getBrowsedResource();
		if (oFF.isNull(connectionResource) || !oFF.SuResourceWrapper.isResourceOlapSystem(connectionResource))
		{
			resolve(null);
		}
		dataProvider.setCustomFilter( function(resource, queryString){
			return oFF.XBooleanValue.create(this.filterTest(resource, queryString));
		}.bind(this));
		oFF.SuDataSourceNavigationHelper.processFetchAllDatasources(connectionResource, this.onFetchDatasourcesSuccess(resolve), this.onFetchDatasourcesError(reject));
	}.bind(this));
};
oFF.SuLocalDatasourceProviderFactory.prototype.filterTest = function(resource, text)
{
	var filterManagetTest = this.m_filterManager.getFilter()(resource);
	if (!filterManagetTest)
	{
		return false;
	}
	if (oFF.XStringUtils.isNullOrEmpty(text))
	{
		return true;
	}
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	var isIcluded = oFF.XStringUtils.containsString(resourceWrapper.getTranslatedDisplayName(), text, true);
	if (isIcluded)
	{
		return true;
	}
	var fileDescription = resourceWrapper.get(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, null);
	if (oFF.XStringUtils.isNullOrEmpty(fileDescription))
	{
		return false;
	}
	return oFF.XStringUtils.containsString(fileDescription, text, true);
};
oFF.SuLocalDatasourceProviderFactory.prototype.onFetchDatasourcesSuccess = function(resolve)
{
	return  function(resourceList){
		if (!this.isReleased())
		{
			resolve(oFF.SuDataProviderFetchResult.createList(resourceList));
		}
		else
		{
			resolve(null);
		}
	}.bind(this);
};
oFF.SuLocalDatasourceProviderFactory.prototype.onFetchDatasourcesError = function(reject)
{
	return  function(messages){
		oFF.SuDataSourceNavigationHelper.handleErrorMsgByView(this.m_view, messages);
		reject(oFF.XError.create(messages.getSummary()));
	}.bind(this);
};

oFF.SuRemoteDataProviderFactory = function() {};
oFF.SuRemoteDataProviderFactory.prototype = new oFF.XObject();
oFF.SuRemoteDataProviderFactory.prototype._ff_c = "SuRemoteDataProviderFactory";

oFF.SuRemoteDataProviderFactory.create = function(store, config, filterManager)
{
	var factory = new oFF.SuRemoteDataProviderFactory();
	factory.m_store = store;
	factory.m_config = config;
	factory.m_filterManager = filterManager;
	return factory;
};
oFF.SuRemoteDataProviderFactory.prototype.m_filterManager = null;
oFF.SuRemoteDataProviderFactory.prototype.m_store = null;
oFF.SuRemoteDataProviderFactory.prototype.m_config = null;
oFF.SuRemoteDataProviderFactory.prototype.createProvider = function()
{
	var dataProvider = oFF.SuRemoteDataProvider.createEmpty();
	dataProvider.setMaxItems(this.m_config.getPageSize());
	dataProvider.setFetchPromise( function(){
		return this.updateDataProvider(dataProvider);
	}.bind(this));
	return dataProvider;
};
oFF.SuRemoteDataProviderFactory.prototype.updateDataProvider = function(dataProvider)
{
	var browsedResource = this.m_store.getBrowsedResource();
	if (oFF.isNull(browsedResource))
	{
		return oFF.XPromise.resolve(null);
	}
	var isRecursiveSearch = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_store.getSearchQuery()) && this.m_filterManager.isRecursiveSearchEnabled();
	var resourceWrapper = oFF.SuResourceWrapper.create(browsedResource);
	if (oFF.notNull(this.m_config))
	{
		this.m_config.enableBreadcrumbs(isRecursiveSearch || resourceWrapper.isVirtualFolder());
		this.m_config.setHighlightText(this.m_store.getSearchQuery());
		dataProvider.setQuery(this.m_store.getSearchQuery());
	}
	dataProvider.clearFilters();
	oFF.XStream.of(this.m_filterManager.buildFilterElementListFromState(this.m_store.getState(), browsedResource)).forEach( function(filter){
		dataProvider.addFilter(filter);
	}.bind(this));
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		oFF.SuResourceWrapper.createQueryByDataProvider(browsedResource, dataProvider, false).then( function(query){
			if (oFF.notNull(query))
			{
				var customFilter = this.m_filterManager.createFilterFunctionForDataProvider(query);
				dataProvider.setCustomFilter(customFilter);
			}
			resourceWrapper.promiseFetchResult(query).then( function(result){
				resolve(result);
				return result;
			}.bind(this), reject);
			return query;
		}.bind(this), reject);
	}.bind(this));
};

oFF.SuRemoteDatasourceProviderFactory = function() {};
oFF.SuRemoteDatasourceProviderFactory.prototype = new oFF.XObject();
oFF.SuRemoteDatasourceProviderFactory.prototype._ff_c = "SuRemoteDatasourceProviderFactory";

oFF.SuRemoteDatasourceProviderFactory.create = function(store, config, filterManager, view)
{
	var factory = new oFF.SuRemoteDatasourceProviderFactory();
	factory.m_store = store;
	factory.m_filterManager = filterManager;
	factory.m_view = view;
	factory.m_config = config;
	return factory;
};
oFF.SuRemoteDatasourceProviderFactory.prototype.m_filterManager = null;
oFF.SuRemoteDatasourceProviderFactory.prototype.m_store = null;
oFF.SuRemoteDatasourceProviderFactory.prototype.m_view = null;
oFF.SuRemoteDatasourceProviderFactory.prototype.m_config = null;
oFF.SuRemoteDatasourceProviderFactory.prototype.createProvider = function()
{
	var dataProvider = oFF.SuRemoteDataProvider.createEmpty();
	dataProvider.setMaxItems(this.m_config.getPageSize());
	dataProvider.setFetchPromise( function(){
		return this.updateDataProvider(dataProvider);
	}.bind(this));
	return dataProvider;
};
oFF.SuRemoteDatasourceProviderFactory.prototype.updateDataProvider = function(dataProvider)
{
	var connectionResource = this.m_store.getBrowsedResource();
	if (oFF.isNull(connectionResource) || !oFF.SuResourceWrapper.isResourceOlapSystem(connectionResource))
	{
		return oFF.XPromise.resolve(null);
	}
	var connectionDatasourceDirectory = oFF.SuDataSourceNavigationHelper.getDatasourceDirectory(connectionResource);
	if (oFF.isNull(connectionDatasourceDirectory))
	{
		return oFF.XPromise.resolve(null);
	}
	dataProvider.clearFilters();
	var systemTypeAttribute = oFF.SuResourceWrapper.getFileAttributeString(connectionResource, oFF.XFileAttribute.SYSTEM_TYPE.getName(), "");
	oFF.XStream.of(this.m_filterManager.getConfigFilterElementList()).forEach( function(filter){
		if (oFF.XString.isEqual(filter.getTypeExt(), "datasource") && oFF.XString.isEqual(systemTypeAttribute, oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_HANA))
		{
			dataProvider.addFilter(filter);
		}
	}.bind(this));
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		oFF.SuResourceWrapper.createQueryByDataProvider(connectionDatasourceDirectory, dataProvider, true).then( function(query){
			if (oFF.notNull(query))
			{
				var customFilter = this.m_filterManager.createFilterFunctionForDataProvider(query);
				dataProvider.setCustomFilter(customFilter);
			}
			oFF.SuDataSourceNavigationHelper.promiseFetchAllDatasources(connectionResource, query).then( function(result){
				if (result.getMessages().isValid())
				{
					resolve(result);
				}
				else
				{
					oFF.SuDataSourceNavigationHelper.handleErrorMsgByView(this.m_view, result.getMessages());
					reject(oFF.XError.create(result.getMessages().getSummary()));
				}
				return result;
			}.bind(this), reject);
			return query;
		}.bind(this), reject);
	}.bind(this));
};

oFF.SuResourceExplorerDataProviderFactory = function() {};
oFF.SuResourceExplorerDataProviderFactory.prototype = new oFF.XObject();
oFF.SuResourceExplorerDataProviderFactory.prototype._ff_c = "SuResourceExplorerDataProviderFactory";

oFF.SuResourceExplorerDataProviderFactory.create = function(store, config, viewerConfig, filterManager, view)
{
	var factory = new oFF.SuResourceExplorerDataProviderFactory();
	factory.m_store = store;
	factory.m_viewerConfig = viewerConfig;
	factory.m_config = config;
	factory.m_filterManager = filterManager;
	factory.m_view = view;
	return factory;
};
oFF.SuResourceExplorerDataProviderFactory.prototype.m_filterManager = null;
oFF.SuResourceExplorerDataProviderFactory.prototype.m_store = null;
oFF.SuResourceExplorerDataProviderFactory.prototype.m_viewerConfig = null;
oFF.SuResourceExplorerDataProviderFactory.prototype.m_config = null;
oFF.SuResourceExplorerDataProviderFactory.prototype.m_view = null;
oFF.SuResourceExplorerDataProviderFactory.prototype.createProviderFactory = function()
{
	if (this.m_config.isVersion(oFF.SuResourceExplorerConfig.VERSION_1))
	{
		return null;
	}
	var isApiLocal = !this.m_config.isApiRemote();
	if (this.m_config.isDatasourceNavigationEnabled())
	{
		if (isApiLocal)
		{
			return oFF.SuLocalDatasourceProviderFactory.create(this.m_store, this.m_viewerConfig, this.m_filterManager, this.m_view);
		}
		else
		{
			return oFF.SuRemoteDatasourceProviderFactory.create(this.m_store, this.m_viewerConfig, this.m_filterManager, this.m_view);
		}
	}
	else
	{
		if (isApiLocal)
		{
			return oFF.SuLocalDataProviderFactory.create(this.m_store, this.m_viewerConfig, this.m_filterManager);
		}
		else
		{
			return oFF.SuRemoteDataProviderFactory.create(this.m_store, this.m_viewerConfig, this.m_filterManager);
		}
	}
};

oFF.SuRecentlyUsedDataProviderFactory = function() {};
oFF.SuRecentlyUsedDataProviderFactory.prototype = new oFF.XObject();
oFF.SuRecentlyUsedDataProviderFactory.prototype._ff_c = "SuRecentlyUsedDataProviderFactory";

oFF.SuRecentlyUsedDataProviderFactory.create = function(resourceExplorerProgram)
{
	var newProvider = new oFF.SuRecentlyUsedDataProviderFactory();
	newProvider.m_resourceExplorerProgram = resourceExplorerProgram;
	return newProvider;
};
oFF.SuRecentlyUsedDataProviderFactory.prototype.m_resourceExplorerProgram = null;
oFF.SuRecentlyUsedDataProviderFactory.prototype.createProvider = function()
{
	var provider = null;
	if (!this.m_resourceExplorerProgram.getConfig().isVersion(oFF.SuResourceExplorerConfig.VERSION_1))
	{
		if (this.m_resourceExplorerProgram.isRecentlyUsedCallbackSet())
		{
			provider = oFF.SuRecentlyUsedCallbackDataProvider.create(this.m_resourceExplorerProgram);
		}
		else if (this.m_resourceExplorerProgram.getConfig().getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED) !== null)
		{
			provider = oFF.SuRecentlyUsedConfigDataProvider.create(this.m_resourceExplorerProgram.getConfig());
		}
		else if (this.m_resourceExplorerProgram.getConfig().isVersion(oFF.SuResourceExplorerConfig.VERSION_3))
		{
			provider = oFF.SuRecentlyUsedLocalStoreDataProvider.create();
		}
	}
	return provider;
};

oFF.SuAPICapabilityHelper = function() {};
oFF.SuAPICapabilityHelper.prototype = new oFF.XObject();
oFF.SuAPICapabilityHelper.prototype._ff_c = "SuAPICapabilityHelper";

oFF.SuAPICapabilityHelper.create = function(isApiRemote)
{
	var helper = new oFF.SuAPICapabilityHelper();
	helper.m_isApiRemote = isApiRemote;
	return helper;
};
oFF.SuAPICapabilityHelper.prototype.m_isApiRemote = false;
oFF.SuAPICapabilityHelper.prototype.m_resource = null;
oFF.SuAPICapabilityHelper.prototype.m_query = null;
oFF.SuAPICapabilityHelper.prototype.setResource = function(resource)
{
	this.m_resource = resource;
	var metadata = null;
	if (oFF.notNull(this.m_resource) && this.isRemote())
	{
		oFF.XObjectExt.assertNotNullExt(this.m_resource.getCachedMetadata(), "resource metadata cannot be null");
		metadata = resource.getCachedMetadata();
	}
	this.m_query = oFF.XFileQuery.create(metadata);
	return this;
};
oFF.SuAPICapabilityHelper.prototype.supportsOffset = function()
{
	return !this.isRemote() || this.m_query.supportsOffset();
};
oFF.SuAPICapabilityHelper.prototype.supportsSingleSort = function()
{
	return !this.isRemote() || this.m_query.supportsSingleSort();
};
oFF.SuAPICapabilityHelper.prototype.supportsSearch = function()
{
	return !this.isRemote() || this.m_query.supportsSearch();
};
oFF.SuAPICapabilityHelper.prototype.supportsCartesianFilter = function(attribute)
{
	return !this.isRemote() || this.m_query.supportsCartesianFilter() && this.m_query.supportsFilterOnAttribute(attribute);
};
oFF.SuAPICapabilityHelper.prototype.isRemote = function()
{
	return this.m_isApiRemote;
};

oFF.SuQuickFilterHelper = {

	QUICK_FILTER_OWNED_BY_ME:"owned",
	QUICK_FILTER_SHARED_TO_ME:"shared",
	QUICK_FILTER_ALL:"all"
};

oFF.SuResourceCRUDManager = {

	MAX_NUM_OF_EXSISTING_RESOURCES_CHECK:5,
	create:function(genesis)
	{
			var manager = new oFF.SuResourceCRUDManager();
		return manager;
	},
	createNewDirectory:function(name, description, directory)
	{
			var newFile = directory.newChild(oFF.XString.trim(name));
		oFF.SuResourceWrapper.create(newFile).setAttributes(oFF.XFileAttribute.DESCRIPTION.getName(), description);
		newFile.mkdir();
		if (newFile.hasErrors())
		{
			return false;
		}
		return true;
	},
	resourceExistsInDirectory:function(directory, name, type)
	{
			return oFF.SuResourceCRUDManager.getResourceExistsInDirectory(directory, name, type) !== null;
	},
	getResourceExistsInDirectory:function(directory, name, type)
	{
			if (oFF.notNull(directory))
		{
			var newFile = directory.newChild(oFF.XString.trim(name));
			if (oFF.isNull(newFile) || newFile.hasErrors())
			{
				return null;
			}
			if (oFF.notNull(type))
			{
				oFF.SuResourceWrapper.create(newFile).setAttributes(oFF.XFileAttribute.NODE_TYPE.getName(), type);
			}
			return newFile.isExisting() ? newFile : null;
		}
		return null;
	},
	getNextFreeResourceName:function(directory, resourceName, type)
	{
			var freeItemName = resourceName;
		var name = oFF.SuResourceWrapper.extractResourceNameNoExt(resourceName);
		var ext = oFF.SuResourceWrapper.extractResourceExt(resourceName);
		var counter = 0;
		while (oFF.SuResourceCRUDManager.resourceExistsInDirectory(directory, freeItemName, type))
		{
			counter++;
			freeItemName = oFF.XStringUtils.concatenate5(name, "(", oFF.XInteger.convertToString(counter), ").", ext);
			if (counter >= oFF.SuResourceCRUDManager.MAX_NUM_OF_EXSISTING_RESOURCES_CHECK)
			{
				return resourceName;
			}
		}
		return freeItemName;
	}
};

oFF.SuResourceInfoFormHelper = function() {};
oFF.SuResourceInfoFormHelper.prototype = new oFF.XObject();
oFF.SuResourceInfoFormHelper.prototype._ff_c = "SuResourceInfoFormHelper";

oFF.SuResourceInfoFormHelper.MIN_LENGHT = 3;
oFF.SuResourceInfoFormHelper.MAX_LENGHT = 199;
oFF.SuResourceInfoFormHelper.s_instance = null;
oFF.SuResourceInfoFormHelper.getInstance = function()
{
	if (oFF.isNull(oFF.SuResourceInfoFormHelper.s_instance))
	{
		oFF.SuResourceInfoFormHelper.s_instance = new oFF.SuResourceInfoFormHelper();
		oFF.SuResourceInfoFormHelper.s_instance.TAB_CHARACTER = oFF.XStringValue.create("\t");
		oFF.SuResourceInfoFormHelper.s_instance.BACKSLASH_CHARACTER = oFF.XStringValue.create("\\");
		oFF.SuResourceInfoFormHelper.s_instance.SLASH_CHARACTER = oFF.XStringValue.create("/");
		oFF.SuResourceInfoFormHelper.s_instance.ASTERISK_CHARACTER = oFF.XStringValue.create("*");
		oFF.SuResourceInfoFormHelper.s_instance.NEWLINE_CHARACTER = oFF.XStringValue.create("\n");
		oFF.SuResourceInfoFormHelper.s_instance.CARRIAGE_RETURN_CHARACTER = oFF.XStringValue.create("\r");
		oFF.SuResourceInfoFormHelper.s_instance.COLON_CHARACTER = oFF.XStringValue.create(":");
		oFF.SuResourceInfoFormHelper.s_instance.setupClass();
	}
	return oFF.SuResourceInfoFormHelper.s_instance;
};
oFF.SuResourceInfoFormHelper.prototype.TAB_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.BACKSLASH_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.SLASH_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.ASTERISK_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.NEWLINE_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.CARRIAGE_RETURN_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.COLON_CHARACTER = null;
oFF.SuResourceInfoFormHelper.prototype.m_illegalChars = null;
oFF.SuResourceInfoFormHelper.prototype.setupClass = function()
{
	this.setupIllegalChars();
};
oFF.SuResourceInfoFormHelper.prototype.setupIllegalChars = function()
{
	this.m_illegalChars = oFF.XList.create();
	this.m_illegalChars.add(this.TAB_CHARACTER);
	this.m_illegalChars.add(this.SLASH_CHARACTER);
	this.m_illegalChars.add(this.BACKSLASH_CHARACTER);
	this.m_illegalChars.add(this.ASTERISK_CHARACTER);
	this.m_illegalChars.add(this.NEWLINE_CHARACTER);
	this.m_illegalChars.add(this.CARRIAGE_RETURN_CHARACTER);
	this.m_illegalChars.add(this.COLON_CHARACTER);
};
oFF.SuResourceInfoFormHelper.prototype.isDirNameValid = function(dirName)
{
	return this.isResourceNameValid(dirName);
};
oFF.SuResourceInfoFormHelper.prototype.isFileNameValid = function(fileName)
{
	return this.isResourceNameValid(fileName);
};
oFF.SuResourceInfoFormHelper.prototype.isFileNameMinLenghtValid = function(fileName)
{
	return oFF.XString.size(fileName) >= oFF.SuResourceInfoFormHelper.MIN_LENGHT;
};
oFF.SuResourceInfoFormHelper.prototype.isResourceNameValid = function(resourceName)
{
	return oFF.notNull(resourceName) && oFF.XStringUtils.isNotNullAndNotEmpty(oFF.XString.trim(resourceName)) && !oFF.XStream.of(this.m_illegalChars).anyMatch( function(illegalChar){
		return oFF.XString.indexOf(resourceName, illegalChar.getString()) !== -1;
	}.bind(this));
};

oFF.SuResourceNavigationHelper = function() {};
oFF.SuResourceNavigationHelper.prototype = new oFF.XObject();
oFF.SuResourceNavigationHelper.prototype._ff_c = "SuResourceNavigationHelper";

oFF.SuResourceNavigationHelper.create = function(root)
{
	var helper = new oFF.SuResourceNavigationHelper();
	helper.m_root = root;
	return helper;
};
oFF.SuResourceNavigationHelper.getFileSystemRoot = function(process)
{
	return oFF.XFile.createRoot(process);
};
oFF.SuResourceNavigationHelper.hasFileRootAncestor = function(root, file)
{
	var currentResource = file;
	while (oFF.notNull(currentResource))
	{
		if (oFF.SuResourceWrapper.areEquals(currentResource, root))
		{
			return true;
		}
		currentResource = currentResource.getParent();
	}
	return false;
};
oFF.SuResourceNavigationHelper.prototype.m_root = null;
oFF.SuResourceNavigationHelper.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_root = null;
};
oFF.SuResourceNavigationHelper.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.SuResourceNavigationHelper.prototype.getResourceByPath = function(path)
{
	if (oFF.isNull(path) || oFF.XString.isEqual(path, oFF.SuResourceWrapper.PATH_SEPARATOR))
	{
		return this.m_root;
	}
	var resource = oFF.XFile.createWithVars(this.m_root.getProcess(), path);
	if (oFF.notNull(resource) && resource.isExisting() && !resource.hasErrors())
	{
		return resource;
	}
	return null;
};
oFF.SuResourceNavigationHelper.prototype.getResourceByDatasource = function(datasource)
{
	var path = oFF.XStringBuffer.create();
	path.append(this.m_root.getUrl());
	path.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
	path.append(datasource.getSystemName());
	path.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
	path.append(datasource.getObjectType());
	path.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
	path.append(datasource.getDataSourceName());
	return this.getResourceByPath(path.toString());
};
oFF.SuResourceNavigationHelper.prototype.getPathByResource = function(resource)
{
	var path = "";
	var currentResource = resource;
	if (oFF.isNull(currentResource))
	{
		currentResource = this.m_root;
	}
	while (oFF.notNull(currentResource) && !this.isRoot(currentResource))
	{
		path = oFF.XStringUtils.concatenate2(oFF.XStringUtils.concatenate2(oFF.SuResourceWrapper.PATH_SEPARATOR, currentResource.getName()), path);
		currentResource = currentResource.getParent();
	}
	if (oFF.XString.startsWith(path, oFF.SuResourceWrapper.PATH_SEPARATOR) === false)
	{
		path = oFF.XStringUtils.concatenate2(oFF.SuResourceWrapper.PATH_SEPARATOR, path);
	}
	return path;
};
oFF.SuResourceNavigationHelper.prototype.isRoot = function(resource)
{
	return oFF.SuResourceWrapper.areEquals(resource, this.m_root);
};
oFF.SuResourceNavigationHelper.prototype.hasRootAncestor = function(file)
{
	var currentResource = file;
	while (oFF.notNull(currentResource))
	{
		if (this.isRoot(currentResource))
		{
			return true;
		}
		currentResource = currentResource.getParent();
	}
	return false;
};

oFF.SuResourceExplorerListener = function() {};
oFF.SuResourceExplorerListener.prototype = new oFF.XObject();
oFF.SuResourceExplorerListener.prototype._ff_c = "SuResourceExplorerListener";

oFF.SuResourceExplorerListener.createEmpty = function()
{
	var result = new oFF.SuResourceExplorerListener();
	result.m_closeProcedure = null;
	result.m_okConsumer = null;
	result.m_validationFunction = null;
	result.m_quickAccessChangeBiConsumer = null;
	return result;
};
oFF.SuResourceExplorerListener.createOK = function(onOk)
{
	return oFF.SuResourceExplorerListener.createOKAndFilter(onOk, null);
};
oFF.SuResourceExplorerListener.createOkAndCancel = function(onOk, onCancel)
{
	return oFF.SuResourceExplorerListener.create(onOk, onCancel, null, null, null);
};
oFF.SuResourceExplorerListener.createOKAndFilter = function(onOk, onFilter)
{
	return oFF.SuResourceExplorerListener.create(onOk, null, null, null, onFilter);
};
oFF.SuResourceExplorerListener.create = function(onOk, onClose, onValidation, onQAChange, onFilter)
{
	var listener = new oFF.SuResourceExplorerListener();
	listener.m_closeProcedure = onClose;
	listener.m_okConsumer = onOk;
	listener.m_validationFunction = onValidation;
	listener.m_quickAccessChangeBiConsumer = onQAChange;
	listener.m_filterFunction = onFilter;
	return listener;
};
oFF.SuResourceExplorerListener.prototype.m_closeProcedure = null;
oFF.SuResourceExplorerListener.prototype.m_okConsumer = null;
oFF.SuResourceExplorerListener.prototype.m_quickAccessChangeBiConsumer = null;
oFF.SuResourceExplorerListener.prototype.m_validationFunction = null;
oFF.SuResourceExplorerListener.prototype.m_filterFunction = null;
oFF.SuResourceExplorerListener.prototype.onSubmit = function(resourceInfo, explorer)
{
	if (oFF.notNull(this.m_okConsumer))
	{
		this.m_okConsumer(resourceInfo, explorer);
	}
};
oFF.SuResourceExplorerListener.prototype.onClose = function()
{
	if (oFF.notNull(this.m_closeProcedure))
	{
		this.m_closeProcedure();
	}
};
oFF.SuResourceExplorerListener.prototype.releaseObject = function()
{
	this.m_closeProcedure = null;
	this.m_okConsumer = null;
	this.m_validationFunction = null;
	this.m_quickAccessChangeBiConsumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SuResourceExplorerListener.prototype.onQuickAccessChange = function(category, list)
{
	if (oFF.notNull(this.m_quickAccessChangeBiConsumer))
	{
		this.m_quickAccessChangeBiConsumer(oFF.XStringValue.create(category), list);
		return true;
	}
	return false;
};
oFF.SuResourceExplorerListener.prototype.onValidation = function(file)
{
	if (oFF.notNull(this.m_validationFunction))
	{
		return oFF.XBooleanValue.create(this.m_validationFunction(file));
	}
	return null;
};
oFF.SuResourceExplorerListener.prototype.onFilter = function(file, ctx)
{
	if (oFF.notNull(this.m_filterFunction))
	{
		this.m_filterFunction(file, ctx);
	}
	return null;
};
oFF.SuResourceExplorerListener.prototype.getFilterFn = function()
{
	return this.m_filterFunction;
};
oFF.SuResourceExplorerListener.prototype.getQuickAccessChangeFn = function()
{
	return this.m_quickAccessChangeBiConsumer;
};

oFF.SuResourceExplorerAction = function() {};
oFF.SuResourceExplorerAction.prototype = new oFF.XObject();
oFF.SuResourceExplorerAction.prototype._ff_c = "SuResourceExplorerAction";

oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE = "resource/selected/set";
oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE = "resource/browsed/set";
oFF.SuResourceExplorerAction.SET_RESOURCE_VIEWER_MODE = "ui/resourceViewer/mode/set";
oFF.SuResourceExplorerAction.ADD_QUICK_ACCESS = "quickAccess/add";
oFF.SuResourceExplorerAction.ERASE_QUICK_ACCESS = "quickAccess/erase";
oFF.SuResourceExplorerAction.SET_RESOURCE_INFO = "resoureInfo/set";
oFF.SuResourceExplorerAction.SET_QUICK_FILTER = "quickFilter/set";
oFF.SuResourceExplorerAction.SET_SEARCH_QUERY = "searchQuery/set";
oFF.SuResourceExplorerAction.SET_RESOURCE_ROOT = "resource/root/set";
oFF.SuResourceExplorerAction.SET_MESSAGE = "message/text/set";
oFF.SuResourceExplorerAction.SET_STATUS = "app/status/set";
oFF.SuResourceExplorerAction.createEmpty = function()
{
	return oFF.SuResourceExplorerAction.create(null, null);
};
oFF.SuResourceExplorerAction.create = function(type, data)
{
	var action = new oFF.SuResourceExplorerAction();
	action.m_type = type;
	action.m_data = data;
	return action;
};
oFF.SuResourceExplorerAction.prototype.m_type = null;
oFF.SuResourceExplorerAction.prototype.m_data = null;
oFF.SuResourceExplorerAction.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append("[type:");
	buffer.append(this.m_type);
	buffer.append("- data:");
	buffer.append(this.m_data.toString());
	buffer.append("]");
	return buffer.toString();
};
oFF.SuResourceExplorerAction.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_type = null;
	this.m_data = null;
};
oFF.SuResourceExplorerAction.prototype.getType = function()
{
	return this.m_type;
};
oFF.SuResourceExplorerAction.prototype.getData = function()
{
	return this.m_data;
};
oFF.SuResourceExplorerAction.prototype.is = function(type)
{
	return oFF.isNull(this.m_type) ? false : oFF.XString.isEqual(type, this.m_type);
};

oFF.SuResourceExplorerReducer = {

	create:function()
	{
			var reducer =  function(action, state){
			var newState = state;
			switch (action.getType())
			{
				case oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE:
					newState = oFF.SuResourceExplorerReducer.cloneState(state);
					newState.setSelectedResource(action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE:
					newState = oFF.SuResourceExplorerReducer.setBrowsedResource(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_RESOURCE_VIEWER_MODE:
					newState = oFF.SuResourceExplorerReducer.cloneState(state);
					newState.setViewerMode(action.getData().toString());
					break;

				case oFF.SuResourceExplorerAction.SET_RESOURCE_INFO:
					newState = oFF.SuResourceExplorerReducer.setResourceInfo(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_QUICK_FILTER:
					newState = oFF.SuResourceExplorerReducer.setQuickFilter(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_SEARCH_QUERY:
					newState = oFF.SuResourceExplorerReducer.setSearchQuery(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_MESSAGE:
					newState = oFF.SuResourceExplorerReducer.setMessage(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_RESOURCE_ROOT:
					newState = oFF.SuResourceExplorerReducer.setResourceRoot(state, action.getData());
					break;

				case oFF.SuResourceExplorerAction.SET_STATUS:
					newState = oFF.SuResourceExplorerReducer.setStatus(state, action.getData());
					break;

				default:
					oFF.noSupport();
			}
			newState.setLastAction(action);
			return newState;
		}.bind(this);
		return reducer;
	},
	setBrowsedResource:function(oldState, resource)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setBrowsedResource(resource);
		newState.setSearchQuery(null);
		return newState;
	},
	setStatus:function(oldState, newStatus)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setStatus(newStatus.getString());
		return newState;
	},
	setResourceRoot:function(oldState, data)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setRootResource(data);
		return newState;
	},
	setQuickFilter:function(oldState, data)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setQuickFilter(oFF.notNull(data) ? data.getString() : null);
		return newState;
	},
	setSearchQuery:function(oldState, query)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setSearchQuery(query.getString());
		return newState;
	},
	setMessage:function(oldState, message)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setMessage(message);
		return newState;
	},
	cloneState:function(oldState)
	{
			return oldState.clone();
	},
	setResourceInfo:function(oldState, data)
	{
			var newState = oFF.SuResourceExplorerReducer.cloneState(oldState);
		newState.setResourceInfo(data);
		return newState;
	}
};

oFF.SuResourceSortingInfo = function() {};
oFF.SuResourceSortingInfo.prototype = new oFF.XObject();
oFF.SuResourceSortingInfo.prototype._ff_c = "SuResourceSortingInfo";

oFF.SuResourceSortingInfo.create = function(ascending, attribute)
{
	var comparator = new oFF.SuResourceSortingInfo();
	comparator.m_ascending = ascending;
	comparator.m_attribute = attribute;
	return comparator;
};
oFF.SuResourceSortingInfo.prototype.m_ascending = false;
oFF.SuResourceSortingInfo.prototype.m_attribute = null;
oFF.SuResourceSortingInfo.prototype.isAscending = function()
{
	return this.m_ascending;
};
oFF.SuResourceSortingInfo.prototype.getAttribure = function()
{
	return this.m_attribute;
};

oFF.SuBreadcrumbNavigationReduxConsumer = function() {};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype = new oFF.XObject();
oFF.SuBreadcrumbNavigationReduxConsumer.prototype._ff_c = "SuBreadcrumbNavigationReduxConsumer";

oFF.SuBreadcrumbNavigationReduxConsumer.create = function(store)
{
	return oFF.SuBreadcrumbNavigationReduxConsumer.createExt(store, false);
};
oFF.SuBreadcrumbNavigationReduxConsumer.createExt = function(store, isLastALink)
{
	var newBreadcrumbNav = new oFF.SuBreadcrumbNavigationReduxConsumer();
	newBreadcrumbNav.m_store = store;
	newBreadcrumbNav.m_breadcrumbNavigation = oFF.SuResourceBreadcrumbs.createEmpty(isLastALink, true);
	return newBreadcrumbNav;
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.m_store = null;
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.m_breadcrumbNavigation = null;
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_breadcrumbNavigation = oFF.XObjectExt.release(this.m_breadcrumbNavigation);
	this.m_store = null;
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.getUiView = function()
{
	return this.m_breadcrumbNavigation.getView();
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.buildUI = function(genesis)
{
	this.m_breadcrumbNavigation.renderView(genesis);
	this.m_store.subscribe(this);
	this.m_breadcrumbNavigation.attachOnClick( function(data){
		var dataTmp = data;
		this.onClick(dataTmp);
	}.bind(this));
	this.m_breadcrumbNavigation.setResources(this.m_store.getRootResource(), this.m_store.getBrowsedResource());
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.updateUI = function(browsedResource)
{
	this.m_breadcrumbNavigation.setResource(browsedResource);
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.accept = function(state)
{
	if (state.getLastAction() === null || state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE))
	{
		this.updateUI(state.getBrowsedResource());
	}
};
oFF.SuBreadcrumbNavigationReduxConsumer.prototype.onClick = function(resource)
{
	if (oFF.isNull(resource))
	{
		this.m_store.setBrowsedResource(this.m_store.getRootResource());
	}
	else if (!oFF.SuResourceWrapper.areEquals(resource, this.m_store.getBrowsedResource()))
	{
		this.m_store.setBrowsedResource(resource);
	}
};

oFF.SuReMessageAreaReduxConsumer = function() {};
oFF.SuReMessageAreaReduxConsumer.prototype = new oFF.XObject();
oFF.SuReMessageAreaReduxConsumer.prototype._ff_c = "SuReMessageAreaReduxConsumer";

oFF.SuReMessageAreaReduxConsumer.create = function(store)
{
	var messageArea = new oFF.SuReMessageAreaReduxConsumer();
	messageArea.m_store = store;
	return messageArea;
};
oFF.SuReMessageAreaReduxConsumer.prototype.m_messageStrip = null;
oFF.SuReMessageAreaReduxConsumer.prototype.m_store = null;
oFF.SuReMessageAreaReduxConsumer.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_messageStrip = oFF.XObjectExt.release(this.m_messageStrip);
	oFF.UiMessageCenter.getCenter();
	this.m_store = null;
};
oFF.SuReMessageAreaReduxConsumer.prototype.buildUI = function(genesis)
{
	this.m_messageStrip = genesis.newControl(oFF.UiType.MESSAGE_STRIP);
	this.m_messageStrip.setName("suReMessageArea");
	this.m_messageStrip.addCssClass("ffReMessageArea");
	this.m_messageStrip.setShowIcon(true);
	this.hideMessage();
	this.m_store.subscribe(this);
};
oFF.SuReMessageAreaReduxConsumer.prototype.getView = function()
{
	return this.m_messageStrip;
};
oFF.SuReMessageAreaReduxConsumer.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_MESSAGE))
	{
		if (state.getMessage() === null)
		{
			this.hideMessage();
		}
		else
		{
			this.showMessage(state.getMessage());
		}
	}
};
oFF.SuReMessageAreaReduxConsumer.prototype.showMessage = function(message)
{
	this.m_messageStrip.setText(message.getText());
	this.m_messageStrip.setMessageType(message.getMessageType());
	this.m_messageStrip.setVisible(true);
};
oFF.SuReMessageAreaReduxConsumer.prototype.hideMessage = function()
{
	this.m_messageStrip.setVisible(false);
};

oFF.SuResourceInfoFormReduxConsumer = function() {};
oFF.SuResourceInfoFormReduxConsumer.prototype = new oFF.XObject();
oFF.SuResourceInfoFormReduxConsumer.prototype._ff_c = "SuResourceInfoFormReduxConsumer";

oFF.SuResourceInfoFormReduxConsumer.create = function(store, config)
{
	var newInfoFormConsumer = new oFF.SuResourceInfoFormReduxConsumer();
	newInfoFormConsumer.m_store = store;
	newInfoFormConsumer.m_resourceInfoForm = oFF.SuResourceInfoForm.create(config);
	return newInfoFormConsumer;
};
oFF.SuResourceInfoFormReduxConsumer.prototype.m_store = null;
oFF.SuResourceInfoFormReduxConsumer.prototype.m_resourceInfoForm = null;
oFF.SuResourceInfoFormReduxConsumer.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_resourceInfoForm = oFF.XObjectExt.release(this.m_resourceInfoForm);
	this.m_store = null;
};
oFF.SuResourceInfoFormReduxConsumer.prototype.getUiView = function()
{
	return this.m_resourceInfoForm.getView();
};
oFF.SuResourceInfoFormReduxConsumer.prototype.attachOnEnter = function(consumer)
{
	this.m_resourceInfoForm.attachOnEnter(consumer);
};
oFF.SuResourceInfoFormReduxConsumer.prototype.detachOnEnter = function(consumer)
{
	this.detachOnEnter(consumer);
};
oFF.SuResourceInfoFormReduxConsumer.prototype.buildUI = function(genesis)
{
	this.m_resourceInfoForm.setResource(this.m_store.getBrowsedResource());
	this.m_resourceInfoForm.renderView(genesis);
	this.m_store.subscribe(this);
	this.m_store.setResourceInfo(this.m_resourceInfoForm.getInfo());
	this.m_resourceInfoForm.attachOnChange( function(data){
		var dataTmp = data;
		this.m_store.setResourceInfo(dataTmp);
	}.bind(this));
	this.m_store.getApp().setFocus(this.m_resourceInfoForm.getFileNameInput());
};
oFF.SuResourceInfoFormReduxConsumer.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE))
	{
		var selectedResource = state.getSelectedResource();
		var selectedResourceWrapper = oFF.SuResourceWrapper.create(selectedResource);
		if (oFF.notNull(selectedResource) && !selectedResourceWrapper.isResourceDirectory())
		{
			this.m_resourceInfoForm.setBaseInfo(selectedResourceWrapper.getTranslatedDisplayName(), selectedResourceWrapper.getAttributeStringByType(oFF.XFileAttribute.DESCRIPTION, ""));
			this.m_store.setResourceInfo(this.m_resourceInfoForm.getInfo());
		}
	}
	else if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_RESOURCE_INFO))
	{
		this.validateForm();
	}
};
oFF.SuResourceInfoFormReduxConsumer.prototype.validateForm = function()
{
	var fileName = this.m_resourceInfoForm.getInfo().getName();
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var warningMsg = null;
	if (!oFF.SuResourceInfoFormHelper.getInstance().isFileNameValid(fileName))
	{
		warningMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_CHARS);
	}
	else if (!oFF.SuResourceInfoFormHelper.getInstance().isFileNameMinLenghtValid(fileName))
	{
		warningMsg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_MIN_LENGTH, oFF.XInteger.convertToString(oFF.SuResourceInfoFormHelper.MIN_LENGHT));
	}
	if (oFF.notNull(warningMsg))
	{
		this.m_resourceInfoForm.setInvalidState("name", warningMsg);
	}
	else
	{
		this.m_resourceInfoForm.setValidState("name");
	}
};

oFF.SuResourceSearchTool = function() {};
oFF.SuResourceSearchTool.prototype = new oFF.XObject();
oFF.SuResourceSearchTool.prototype._ff_c = "SuResourceSearchTool";

oFF.SuResourceSearchTool.create = function(genesis, store)
{
	var newSearchTool = new oFF.SuResourceSearchTool();
	newSearchTool.m_store = store;
	newSearchTool.buildUI(genesis);
	return newSearchTool;
};
oFF.SuResourceSearchTool.prototype.m_searchInput = null;
oFF.SuResourceSearchTool.prototype.m_store = null;
oFF.SuResourceSearchTool.prototype.getUiView = function()
{
	return this.m_searchInput;
};
oFF.SuResourceSearchTool.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_searchInput = oFF.XObjectExt.release(this.m_searchInput);
	this.m_store = null;
};
oFF.SuResourceSearchTool.prototype.buildUI = function(genesis)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_searchInput = genesis.newControl(oFF.UiType.SEARCH_FIELD);
	this.m_searchInput.setName("searchField");
	this.m_searchInput.addCssClass("ffReSearchField");
	this.m_searchInput.setPlaceholder(i18nProvider.getText(oFF.SuResourceExplorerI18n.TOOLBAR_SEARCH_PLACEHOLDER));
	this.m_searchInput.registerOnSearch(oFF.UiLambdaSearchListener.create( function(eventSearch){
		this.updateSearchQuery(eventSearch.getControl().getText());
	}.bind(this)));
	this.m_searchInput.registerOnLiveChange(oFF.UiLambdaLiveChangeWithDebounceListener.create( function(eventLiveChange){
		this.updateSearchQuery(eventLiveChange.getControl().getText());
	}.bind(this), 1000));
};
oFF.SuResourceSearchTool.prototype.updateSearchQuery = function(searchQuery)
{
	this.m_store.setSearchQuery(searchQuery);
};
oFF.SuResourceSearchTool.prototype.setSearchQuery = function(searchQuery)
{
	this.m_searchInput.setText(searchQuery);
};
oFF.SuResourceSearchTool.prototype.setEnabled = function(enabled)
{
	this.m_searchInput.setEnabled(enabled);
};

oFF.SuDetailsResourceViewerHelper = function() {};
oFF.SuDetailsResourceViewerHelper.prototype = new oFF.XObject();
oFF.SuDetailsResourceViewerHelper.prototype._ff_c = "SuDetailsResourceViewerHelper";

oFF.SuDetailsResourceViewerHelper.EMPTY_VALUE = "-";
oFF.SuDetailsResourceViewerHelper.create = function(viewer, config)
{
	var helper = new oFF.SuDetailsResourceViewerHelper();
	helper.m_viewer = viewer;
	helper.m_config = config;
	return helper;
};
oFF.SuDetailsResourceViewerHelper.setSelectedResource = function(table, selectedResource)
{
	if (oFF.isNull(selectedResource))
	{
		table.clearSelectedItems();
	}
	var tableRows = table.getResponsiveTableRows();
	var tableRowsIterator = tableRows.getIterator();
	while (tableRowsIterator.hasNext())
	{
		var tableRow = tableRowsIterator.next();
		var rowResource = tableRow.getCustomObject();
		if (oFF.notNull(rowResource) && oFF.SuResourceWrapper.areEquals(selectedResource, rowResource))
		{
			table.setSelectedItem(tableRow);
		}
	}
};
oFF.SuDetailsResourceViewerHelper.isSelectedResource = function(table, resourceToCheck)
{
	var tableRow = table.getSelectedItem();
	var selectedResource = oFF.notNull(tableRow) ? tableRow.getCustomObject() : null;
	if (oFF.isNull(selectedResource) && oFF.isNull(resourceToCheck))
	{
		return true;
	}
	return oFF.SuResourceWrapper.areEquals(selectedResource, resourceToCheck);
};
oFF.SuDetailsResourceViewerHelper.prototype.m_viewer = null;
oFF.SuDetailsResourceViewerHelper.prototype.m_config = null;
oFF.SuDetailsResourceViewerHelper.prototype.getCellName = function(rowIndex, fieldName)
{
	return oFF.XStringUtils.concatenate4("reFileDetail-", oFF.XInteger.convertToString(rowIndex), "-", fieldName);
};
oFF.SuDetailsResourceViewerHelper.prototype.getCellClass = function(fieldName)
{
	return oFF.XStringUtils.concatenate2("reFileDetail-", fieldName);
};
oFF.SuDetailsResourceViewerHelper.prototype.getCellText = function(text)
{
	if (oFF.isNull(text) || !this.m_config.isHighlightText())
	{
		return text;
	}
	return this.createHighlightedText(text);
};
oFF.SuDetailsResourceViewerHelper.prototype.addNewCellTextControl = function(tableRow, resourceWrapper, fieldName)
{
	if (oFF.isNull(resourceWrapper))
	{
		return tableRow.addNewLabelCell();
	}
	var text = null;
	if (oFF.XString.isEqual(fieldName, oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME))
	{
		text = resourceWrapper.getOwnerDisplayName();
	}
	else
	{
		text = resourceWrapper.get(fieldName, null);
	}
	var normalizedText = oFF.XStringUtils.isNotNullAndNotEmpty(text) ? text : oFF.SuDetailsResourceViewerHelper.EMPTY_VALUE;
	if (oFF.isNull(text) || !this.m_config.isHighlightText())
	{
		return this.addNewLabelControl(tableRow, normalizedText);
	}
	return this.addNewFormattedTextControl(tableRow, normalizedText);
};
oFF.SuDetailsResourceViewerHelper.prototype.addNewLabelControl = function(tableRow, text)
{
	var tableCell = tableRow.addNewLabelCell();
	tableCell.setText(text);
	tableCell.setTooltip(text);
	return tableCell;
};
oFF.SuDetailsResourceViewerHelper.prototype.addNewFormattedTextControl = function(tableRow, text)
{
	var normalizedText = oFF.XStringUtils.isNotNullAndNotEmpty(text) ? text : oFF.SuDetailsResourceViewerHelper.EMPTY_VALUE;
	var formattedText = tableRow.addNewResponsiveTableCellOfType(oFF.UiType.FORMATTED_TEXT);
	var highlightedText = this.createHighlightedText(normalizedText);
	formattedText.setText(highlightedText);
	formattedText.setTooltip(normalizedText);
	return formattedText;
};
oFF.SuDetailsResourceViewerHelper.prototype.addNewNameTextControl = function(container, text)
{
	var normalizedText = oFF.XStringUtils.isNotNullAndNotEmpty(text) ? text : oFF.SuDetailsResourceViewerHelper.EMPTY_VALUE;
	if (oFF.isNull(text) || !this.m_config.isHighlightText())
	{
		var resourceName = container.addNewItemOfType(oFF.UiType.LABEL);
		resourceName.addCssClass("ffReResourceLabel");
		resourceName.setText(text);
		resourceName.setTooltip(text);
		return resourceName;
	}
	else
	{
		var formattedText = container.addNewItemOfType(oFF.UiType.FORMATTED_TEXT);
		formattedText.addCssClass("ffReDfvResourceNameFormattedText");
		var highlightedText = this.createHighlightedText(normalizedText);
		formattedText.setText(highlightedText);
		formattedText.setTooltip(normalizedText);
		return formattedText;
	}
};
oFF.SuDetailsResourceViewerHelper.prototype.createHighlightedText = function(text)
{
	return oFF.UtStringUtils.getHighlightedText(text, this.m_config.getHighlightText());
};
oFF.SuDetailsResourceViewerHelper.prototype.createBreadcrumbsForResource = function(resource, onClick, genesis)
{
	var realResource = oFF.SuResourceWrapper.create(resource).getRealResource();
	var breadcrumbs = oFF.SuResourceBreadcrumbs.create(realResource.getParent(), this.m_config.getRootResource(), true, false, false);
	breadcrumbs.renderView(genesis);
	breadcrumbs.attachOnClick(onClick);
	breadcrumbs.getView().addCssClass("ffReResourceBreadcrumbs");
	return breadcrumbs;
};
oFF.SuDetailsResourceViewerHelper.prototype.createUiLambdaColumnPressListener = function(table)
{
	return oFF.UiLambdaPressListener.create( function(event){
		var tableColumn = event.getControl();
		var sort = tableColumn.getSortIndicator();
		var tableColumnList = table.getResponsiveTableColumns();
		for (var i = 0; i < tableColumnList.size(); i++)
		{
			if (tableColumn !== tableColumnList.get(i))
			{
				tableColumnList.get(i).setSortIndicator(oFF.UiSortOrder.NONE);
			}
		}
		var isSortAscending;
		if (sort === oFF.UiSortOrder.ASCENDING)
		{
			isSortAscending = false;
			sort = oFF.UiSortOrder.DESCENDING;
		}
		else
		{
			isSortAscending = true;
			sort = oFF.UiSortOrder.ASCENDING;
		}
		tableColumn.setSortIndicator(sort);
		var sortingColumn = tableColumn.getTag();
		if (oFF.XString.isEqual(tableColumn.getTag(), oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME))
		{
			sortingColumn = oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER;
		}
		this.m_viewer.updateSortingInfo(isSortAscending, sortingColumn);
	}.bind(this));
};

oFF.SuResourceViewerReduxConsumer = function() {};
oFF.SuResourceViewerReduxConsumer.prototype = new oFF.XObject();
oFF.SuResourceViewerReduxConsumer.prototype._ff_c = "SuResourceViewerReduxConsumer";

oFF.SuResourceViewerReduxConsumer.prototype.m_view = null;
oFF.SuResourceViewerReduxConsumer.prototype.m_viewer = null;
oFF.SuResourceViewerReduxConsumer.prototype.m_config = null;
oFF.SuResourceViewerReduxConsumer.prototype.m_store = null;
oFF.SuResourceViewerReduxConsumer.prototype.m_filterManager = null;
oFF.SuResourceViewerReduxConsumer.prototype.setUp = function(store, config, filterManager)
{
	this.m_store = store;
	this.m_config = config;
	this.m_filterManager = filterManager;
};
oFF.SuResourceViewerReduxConsumer.prototype.setUpView = function(view, viewer)
{
	this.m_view = view;
	this.m_viewer = viewer;
};
oFF.SuResourceViewerReduxConsumer.prototype.buildUI = function(container)
{
	this.m_store.subscribe(this);
};
oFF.SuResourceViewerReduxConsumer.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_config = null;
	this.m_store = null;
	this.m_filterManager = null;
};
oFF.SuResourceViewerReduxConsumer.prototype.clear = function()
{
	this.m_viewer.clear();
};
oFF.SuResourceViewerReduxConsumer.prototype.setVisible = function(isVisible)
{
	this.m_view.setVisible(isVisible);
};
oFF.SuResourceViewerReduxConsumer.prototype.accept = function(state)
{
	var lastAction = state.getLastAction();
	if (lastAction.is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE) || lastAction.is(oFF.SuResourceExplorerAction.SET_SEARCH_QUERY) || lastAction.is(oFF.SuResourceExplorerAction.SET_QUICK_FILTER))
	{
		this.setResourceList(state);
	}
	else if (lastAction.is(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE))
	{
		this.m_viewer.setSelectedItem(state.getSelectedResource());
	}
};
oFF.SuResourceViewerReduxConsumer.prototype.setResourceList = function(state)
{
	var filter = this.m_filterManager.buildFilterForState(state);
	var browsedResource = this.m_store.getBrowsedResource();
	if (oFF.isNull(browsedResource))
	{
		return;
	}
	var isRecursiveSearch = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_store.getSearchQuery()) && this.m_filterManager.isRecursiveSearchEnabled();
	var resourceWrapper = oFF.SuResourceWrapper.createWithFilter(browsedResource, filter);
	this.m_viewer.setBusy(true);
	if (oFF.notNull(this.m_config))
	{
		this.m_config.enableBreadcrumbs(isRecursiveSearch || resourceWrapper.isVirtualFolder());
		this.m_config.setHighlightText(this.m_store.getSearchQuery());
	}
	if (isRecursiveSearch)
	{
		resourceWrapper.processFetchChildrenRecursive(this.getResourceListConsumer(), this.getErrorConsumer());
	}
	else
	{
		resourceWrapper.processFetchChildren(this.getResourceListConsumer(), this.getErrorConsumer());
	}
};
oFF.SuResourceViewerReduxConsumer.prototype.getResourceListConsumer = function()
{
	return  function(resourceList){
		if (this.isReleased())
		{
			return;
		}
		this.m_viewer.setResourceList(resourceList);
		this.m_viewer.setBrowsedResource(this.m_store.getBrowsedResource());
		this.m_viewer.setBusy(false);
	}.bind(this);
};
oFF.SuResourceViewerReduxConsumer.prototype.getErrorConsumer = function()
{
	return  function(messages){
		if (this.isReleased())
		{
			return;
		}
		this.m_viewer.setBusy(false);
		this.printResourceRetrievalErrorMsg(messages.getSummary());
	}.bind(this);
};
oFF.SuResourceViewerReduxConsumer.prototype.printResourceRetrievalErrorMsg = function(message)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var errMsg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.RESOURCE_RETRIEVAL_ERROR, message);
	var messageObject = oFF.SuReMessage.createError(errMsg);
	this.m_store.setMessage(messageObject);
};

oFF.SuResourceViewerReduxConsumer2 = function() {};
oFF.SuResourceViewerReduxConsumer2.prototype = new oFF.XObject();
oFF.SuResourceViewerReduxConsumer2.prototype._ff_c = "SuResourceViewerReduxConsumer2";

oFF.SuResourceViewerReduxConsumer2.prototype.m_view = null;
oFF.SuResourceViewerReduxConsumer2.prototype.m_viewer = null;
oFF.SuResourceViewerReduxConsumer2.prototype.m_config = null;
oFF.SuResourceViewerReduxConsumer2.prototype.m_store = null;
oFF.SuResourceViewerReduxConsumer2.prototype.m_dataProvider = null;
oFF.SuResourceViewerReduxConsumer2.prototype.m_APICapabilityHelper = null;
oFF.SuResourceViewerReduxConsumer2.prototype.setUp = function(store, config, dataProvider)
{
	this.m_store = store;
	this.m_config = config;
	this.m_dataProvider = dataProvider;
	this.m_APICapabilityHelper = oFF.SuAPICapabilityHelper.create(config.isApiRemote());
};
oFF.SuResourceViewerReduxConsumer2.prototype.setUpView = function(view, viewer)
{
	this.m_view = view;
	this.m_viewer = viewer;
};
oFF.SuResourceViewerReduxConsumer2.prototype.buildUI = function(container)
{
	this.m_store.subscribe(this);
};
oFF.SuResourceViewerReduxConsumer2.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_config = null;
	this.m_store = null;
	this.m_dataProvider = null;
};
oFF.SuResourceViewerReduxConsumer2.prototype.setVisible = function(isVisible)
{
	this.m_view.setVisible(isVisible);
};
oFF.SuResourceViewerReduxConsumer2.prototype.accept = function(state)
{
	var lastAction = state.getLastAction();
	if (lastAction.is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE) || lastAction.is(oFF.SuResourceExplorerAction.SET_SEARCH_QUERY) || lastAction.is(oFF.SuResourceExplorerAction.SET_QUICK_FILTER))
	{
		this.m_dataProvider.setOffset(0);
		this.m_dataProvider.forceInit();
		this.m_viewer.enableSorting(this.m_APICapabilityHelper.setResource(state.getBrowsedResource()).supportsSingleSort());
		this.m_viewer.clear();
		this.m_viewer.updateUI();
	}
	else if (lastAction.is(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE))
	{
		this.m_viewer.setSelectedItem(state.getSelectedResource());
	}
};

oFF.SleMetisSystemItem = function() {};
oFF.SleMetisSystemItem.prototype = new oFF.XObject();
oFF.SleMetisSystemItem.prototype._ff_c = "SleMetisSystemItem";

oFF.SleMetisSystemItem.DEFAULT_SYSTEM_ICON_NAME = "locked";
oFF.SleMetisSystemItem.USER_SPECIFIED_SYSTEM_ICON_NAME = "user-settings";
oFF.SleMetisSystemItem.EDIT_SYSTEM_ICON_NAME = "edit";
oFF.SleMetisSystemItem.createSystemItem = function(name, listItem, systemDescription, isUserSpecified)
{
	if (oFF.isNull(listItem))
	{
		throw oFF.XException.createRuntimeException("Missing list item ui control. Cannot create system item!");
	}
	var systemItem = new oFF.SleMetisSystemItem();
	systemItem.setupInternal(name, listItem, systemDescription, isUserSpecified);
	return systemItem;
};
oFF.SleMetisSystemItem.prototype.m_listItem = null;
oFF.SleMetisSystemItem.prototype.m_systemDescription = null;
oFF.SleMetisSystemItem.prototype.m_isUserSpecified = false;
oFF.SleMetisSystemItem.prototype.m_isInEdit = false;
oFF.SleMetisSystemItem.prototype.releaseObject = function()
{
	this.m_listItem = oFF.XObjectExt.release(this.m_listItem);
	this.m_systemDescription = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SleMetisSystemItem.prototype.setupInternal = function(name, listItem, systemDescription, isUserSpecified)
{
	this.m_listItem = listItem;
	this.m_systemDescription = systemDescription;
	this.m_isUserSpecified = isUserSpecified;
	this.m_isInEdit = false;
	this.m_listItem.setCustomObject(this);
	if (oFF.notNull(systemDescription))
	{
		this.setText(systemDescription.getSystemName());
	}
	else
	{
		this.setText(name);
	}
	if (isUserSpecified)
	{
		this.m_listItem.setIcon(oFF.SleMetisSystemItem.USER_SPECIFIED_SYSTEM_ICON_NAME);
	}
	else
	{
		this.m_listItem.setIcon(oFF.SleMetisSystemItem.DEFAULT_SYSTEM_ICON_NAME);
	}
};
oFF.SleMetisSystemItem.prototype.setText = function(text)
{
	var newText = text;
	if (this.isInEdit() && oFF.XString.endsWith(newText, "*") === false)
	{
		newText = oFF.XStringUtils.concatenate2(newText, "*");
	}
	if (this.isInEdit() === false && oFF.XString.endsWith(newText, "*"))
	{
		newText = oFF.XStringUtils.stripRight(text, 1);
	}
	this.m_listItem.setText(newText);
};
oFF.SleMetisSystemItem.prototype.getText = function()
{
	var text = this.m_listItem.getText();
	if (this.isInEdit() && oFF.XString.endsWith(text, "*"))
	{
		text = oFF.XStringUtils.stripRight(text, 1);
	}
	return text;
};
oFF.SleMetisSystemItem.prototype.setListItem = function(listItem)
{
	this.m_listItem = listItem;
};
oFF.SleMetisSystemItem.prototype.getListItem = function()
{
	return this.m_listItem;
};
oFF.SleMetisSystemItem.prototype.setSystemDescription = function(systemDescription)
{
	this.m_systemDescription = systemDescription;
};
oFF.SleMetisSystemItem.prototype.getSystemDescription = function()
{
	return this.m_systemDescription;
};
oFF.SleMetisSystemItem.prototype.setIsUserSpecified = function(isUserSpecified)
{
	this.m_isUserSpecified = isUserSpecified;
	this.updateListItemIcon();
};
oFF.SleMetisSystemItem.prototype.isUserSpecified = function()
{
	return this.m_isUserSpecified;
};
oFF.SleMetisSystemItem.prototype.setIsInEdit = function(isInEdit)
{
	this.m_isInEdit = isInEdit;
	this.updateEditStatus();
};
oFF.SleMetisSystemItem.prototype.isInEdit = function()
{
	return this.m_isInEdit;
};
oFF.SleMetisSystemItem.prototype.updateListItemIcon = function()
{
	if (oFF.notNull(this.m_listItem))
	{
		if (this.isUserSpecified())
		{
			this.m_listItem.setIcon(oFF.SleMetisSystemItem.USER_SPECIFIED_SYSTEM_ICON_NAME);
		}
		else
		{
			this.m_listItem.setIcon(oFF.SleMetisSystemItem.DEFAULT_SYSTEM_ICON_NAME);
		}
	}
};
oFF.SleMetisSystemItem.prototype.updateEditStatus = function()
{
	if (this.isInEdit())
	{
		this.m_listItem.setIcon(oFF.SleMetisSystemItem.EDIT_SYSTEM_ICON_NAME);
	}
	else
	{
		this.updateListItemIcon();
	}
	this.setText(this.m_listItem.getText());
};

oFF.FlexMonthView = function() {};
oFF.FlexMonthView.prototype = new oFF.XObject();
oFF.FlexMonthView.prototype._ff_c = "FlexMonthView";

oFF.FlexMonthView.create = function(uiGenesis, uiModel, displayHeader)
{
	var obj = new oFF.FlexMonthView();
	obj.m_uiGenesis = uiGenesis;
	obj.m_uiModel = uiModel;
	obj.m_displayHeader = displayHeader;
	obj.buildUi();
	return obj;
};
oFF.FlexMonthView.prototype.m_uiGenesis = null;
oFF.FlexMonthView.prototype.m_uiModel = null;
oFF.FlexMonthView.prototype.m_root = null;
oFF.FlexMonthView.prototype.m_yearButton = null;
oFF.FlexMonthView.prototype.m_monthButton = null;
oFF.FlexMonthView.prototype.m_previousMonthButton = null;
oFF.FlexMonthView.prototype.m_nextMonthButton = null;
oFF.FlexMonthView.prototype.m_monthLayout = null;
oFF.FlexMonthView.prototype.m_displayHeader = false;
oFF.FlexMonthView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_root.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	this.m_root.setPadding(oFF.UiCssBoxEdges.create("20px"));
	if (this.m_displayHeader)
	{
		var headerLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		headerLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
		headerLayout.setWidth(oFF.UiCssLength.create("100%"));
		headerLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
		this.m_previousMonthButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_previousMonthButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_previousMonthButton.setText("<");
		this.m_previousMonthButton.setFlex("1");
		this.m_monthButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_monthButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_monthButton.setFlex("3");
		this.m_yearButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_yearButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_yearButton.setFlex("2");
		this.m_nextMonthButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_nextMonthButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_nextMonthButton.setText(">");
		this.m_nextMonthButton.setFlex("1");
	}
	else
	{
		var monthHeaderLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		monthHeaderLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
		monthHeaderLayout.setWidth(oFF.UiCssLength.create("100%"));
		monthHeaderLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
		this.m_monthButton = monthHeaderLayout.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_monthButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_monthButton.setEnabled(false);
		this.m_monthButton.setFlex("1");
	}
	this.m_monthLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_monthLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_monthLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.addWeekdayHeader();
	this.refreshContent();
};
oFF.FlexMonthView.prototype.addWeekdayHeader = function()
{
	var weekHeaderLayout = this.m_monthLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	weekHeaderLayout.setDirection(oFF.UiFlexDirection.ROW);
	var emptyLabel = weekHeaderLayout.addNewItemOfType(oFF.UiType.LABEL);
	emptyLabel.setFlex("1");
	for (var i = 0; i < this.m_uiModel.getWeekdayNames().size(); i++)
	{
		var weekDayLabel = weekHeaderLayout.addNewItemOfType(oFF.UiType.LABEL);
		weekDayLabel.setFlex("1");
		weekDayLabel.setTextAlign(oFF.UiTextAlign.CENTER);
		weekDayLabel.setText(this.m_uiModel.getWeekdayNames().get(i));
	}
};
oFF.FlexMonthView.prototype.refreshContent = function()
{
	this.setContent();
};
oFF.FlexMonthView.prototype.setContent = function()
{
	if (this.m_displayHeader)
	{
		this.m_yearButton.setText(this.m_uiModel.getYearString());
	}
	this.m_monthButton.setText(this.m_uiModel.getMonthString());
	this.setMonthGrid();
};
oFF.FlexMonthView.prototype.setMonthGrid = function()
{
	for (var i = this.m_monthLayout.getItemCount(); i > 1; i--)
	{
		var item = this.m_monthLayout.getItem(i - 1);
		this.m_monthLayout.removeItem(item);
	}
	for (var j = 0; j < this.m_uiModel.getWeeks().size(); j++)
	{
		var weekUiModel = this.m_uiModel.getWeeks().get(j);
		var weekView = oFF.WeekView.create(this.m_uiGenesis, weekUiModel);
		this.m_monthLayout.addItem(weekView.getRoot());
	}
};
oFF.FlexMonthView.prototype.setUiModel = function(monthUiModel)
{
	this.m_uiModel = monthUiModel;
};
oFF.FlexMonthView.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.FlexMonthView.prototype.registerAddMonthListener = function(addMonthListener)
{
	this.m_nextMonthButton.registerOnPress(addMonthListener);
};
oFF.FlexMonthView.prototype.registerSubtractMonthListener = function(subtractMonthListener)
{
	this.m_previousMonthButton.registerOnPress(subtractMonthListener);
};
oFF.FlexMonthView.prototype.registerOpenMonthSelectionListener = function(openMonthSelectionListener)
{
	this.m_monthButton.registerOnPress(openMonthSelectionListener);
};
oFF.FlexMonthView.prototype.registerOpenYearSelectionListener = function(openYearSelectionListener)
{
	this.m_yearButton.registerOnPress(openYearSelectionListener);
};

oFF.SuDataConfigWrapper = function() {};
oFF.SuDataConfigWrapper.prototype = new oFF.SuConfigWrapperBase();
oFF.SuDataConfigWrapper.prototype._ff_c = "SuDataConfigWrapper";

oFF.SuDataConfigWrapper.API = "api";
oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE = "pageSize";
oFF.SuDataConfigWrapper.API_LOCAL = "local";
oFF.SuDataConfigWrapper.API_REMOTE = "remote";
oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE_DEFAULT = -1;
oFF.SuDataConfigWrapper.create = function()
{
	var wrapper = new oFF.SuDataConfigWrapper();
	wrapper.setupEmpty();
	return wrapper;
};
oFF.SuDataConfigWrapper.createDefault = function()
{
	var wrapper = new oFF.SuDataConfigWrapper();
	wrapper.setupEmpty();
	wrapper.setApi(oFF.SuDataConfigWrapper.API_LOCAL);
	wrapper.setPaginationDefault();
	return wrapper;
};
oFF.SuDataConfigWrapper.prototype.setApi = function(api)
{
	this.setStringToRoot(oFF.SuDataConfigWrapper.API, api);
	return this;
};
oFF.SuDataConfigWrapper.prototype.setPageSize = function(size)
{
	this.setIntegertToRoot(oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE, size);
	return this;
};
oFF.SuDataConfigWrapper.prototype.setPaginationDefault = function()
{
	this.setPageSize(oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE_DEFAULT);
	return this;
};
oFF.SuDataConfigWrapper.prototype.getPageSize = function()
{
	var pageSize = this.getIntegerFromRoot(oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE);
	if (oFF.notNull(pageSize))
	{
		return pageSize.getInteger();
	}
	return oFF.SuDataConfigWrapper.PAGINATION_PAGE_SIZE_DEFAULT;
};

oFF.SuDetailsViewConfigWrapper = function() {};
oFF.SuDetailsViewConfigWrapper.prototype = new oFF.SuConfigWrapperBase();
oFF.SuDetailsViewConfigWrapper.prototype._ff_c = "SuDetailsViewConfigWrapper";

oFF.SuDetailsViewConfigWrapper.PAGINATION_PATH = "pagination";
oFF.SuDetailsViewConfigWrapper.FIELDS_PATH = "fields";
oFF.SuDetailsViewConfigWrapper.FIELD_KEY = "key";
oFF.SuDetailsViewConfigWrapper.FIELD_LABEL = "label";
oFF.SuDetailsViewConfigWrapper.FIELD_SORTABLE = "sortable";
oFF.SuDetailsViewConfigWrapper.FIELD_SELECTABLE = "selectable";
oFF.SuDetailsViewConfigWrapper.PAGINATION_PAGE_SIZE = "pageSize";
oFF.SuDetailsViewConfigWrapper.FIELD_KEY_NAME_DEFAULT = "name";
oFF.SuDetailsViewConfigWrapper.FIELD_KEY_DESCR_DEFAULT = "description";
oFF.SuDetailsViewConfigWrapper.FIELD_KEY_OWNER_DISPLAY_NAME_DEFAULT = "ownerDisplayName";
oFF.SuDetailsViewConfigWrapper.PAGINATION_PAGE_SIZE_DEFAULT = 20;
oFF.SuDetailsViewConfigWrapper.create = function()
{
	var wrapper = new oFF.SuDetailsViewConfigWrapper();
	wrapper.setupEmpty();
	return wrapper;
};
oFF.SuDetailsViewConfigWrapper.createDefault = function()
{
	var wrapper = new oFF.SuDetailsViewConfigWrapper();
	wrapper.setupEmpty();
	wrapper.addField(oFF.SuDetailsViewConfigWrapper.FIELD_KEY_NAME_DEFAULT, null, oFF.XBooleanValue.create(true), null);
	wrapper.addField(oFF.SuDetailsViewConfigWrapper.FIELD_KEY_DESCR_DEFAULT, null, oFF.XBooleanValue.create(true), null);
	wrapper.addField(oFF.SuDetailsViewConfigWrapper.FIELD_KEY_OWNER_DISPLAY_NAME_DEFAULT, null, oFF.XBooleanValue.create(true), null);
	return wrapper;
};
oFF.SuDetailsViewConfigWrapper.prototype.addFieldName = function(name)
{
	return this.addField(name, null, null, null);
};
oFF.SuDetailsViewConfigWrapper.prototype.addField = function(name, label, isSortable, isSelectable)
{
	if (oFF.isNull(name))
	{
		throw oFF.XException.createIllegalArgumentException("'name' cannot be null.");
	}
	var field = oFF.PrStructure.create();
	field.putString(oFF.SuDetailsViewConfigWrapper.FIELD_KEY, name);
	if (oFF.notNull(label))
	{
		field.putString(oFF.SuDetailsViewConfigWrapper.FIELD_LABEL, label);
	}
	if (oFF.notNull(isSortable))
	{
		field.putBoolean(oFF.SuDetailsViewConfigWrapper.FIELD_SORTABLE, isSortable.getBoolean());
	}
	if (oFF.notNull(isSelectable))
	{
		field.putBoolean(oFF.SuDetailsViewConfigWrapper.FIELD_SELECTABLE, isSelectable.getBoolean());
	}
	this.addToListRoot(oFF.SuDetailsViewConfigWrapper.FIELDS_PATH, field);
	return this;
};
oFF.SuDetailsViewConfigWrapper.prototype.enablePagination = function(enable)
{
	if (enable)
	{
		this.setPaginationDefault();
	}
	else
	{
		this.setBooleanToRoot(oFF.SuDetailsViewConfigWrapper.PAGINATION_PATH, enable);
	}
	return this;
};
oFF.SuDetailsViewConfigWrapper.prototype.setPageSize = function(size)
{
	this.getStructure(oFF.SuDetailsViewConfigWrapper.PAGINATION_PATH).putInteger(oFF.SuDetailsViewConfigWrapper.PAGINATION_PAGE_SIZE, size);
	return this;
};
oFF.SuDetailsViewConfigWrapper.prototype.setPaginationDefault = function()
{
	this.setPageSize(oFF.SuDetailsViewConfigWrapper.PAGINATION_PAGE_SIZE_DEFAULT);
	return this;
};

oFF.SuDialogModeConfigWrapper = function() {};
oFF.SuDialogModeConfigWrapper.prototype = new oFF.SuConfigWrapperBase();
oFF.SuDialogModeConfigWrapper.prototype._ff_c = "SuDialogModeConfigWrapper";

oFF.SuDialogModeConfigWrapper.SAVE = "save";
oFF.SuDialogModeConfigWrapper.SAVE_NEW_RESOURCE_NAME = "newResourceName";
oFF.SuDialogModeConfigWrapper.SAVE_NEXT_FREE_RESOURCE_NAME = "nextFreeResourceName";
oFF.SuDialogModeConfigWrapper.SAVE_FIELDS = "fields";
oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_TYPE = "type";
oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_NAME = "name";
oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_LABEL = "label";
oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_INFO = "info";
oFF.SuDialogModeConfigWrapper.RESIZABLE = "resizable";
oFF.SuDialogModeConfigWrapper.SIZE = "size";
oFF.SuDialogModeConfigWrapper.SIZE_WIDTH = "width";
oFF.SuDialogModeConfigWrapper.SIZE_HEIGHT = "height";
oFF.SuDialogModeConfigWrapper.MODE = "mode";
oFF.SuDialogModeConfigWrapper.SELECTION = "selection";
oFF.SuDialogModeConfigWrapper.SELECTION_RESTYPE = "resType";
oFF.SuDialogModeConfigWrapper.SELECTION_MODE = "mode";
oFF.SuDialogModeConfigWrapper.OK_BTN_LABEL = "okButtonLabel";
oFF.SuDialogModeConfigWrapper.CANCEL_BTN_LABEL = "cancelButtonLabel";
oFF.SuDialogModeConfigWrapper.create = function()
{
	var wrapper = new oFF.SuDialogModeConfigWrapper();
	wrapper.setupEmpty();
	return wrapper;
};
oFF.SuDialogModeConfigWrapper.prototype.enableResizable = function(enabled)
{
	this.setBooleanToRoot(oFF.SuDialogModeConfigWrapper.RESIZABLE, enabled);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setMode = function(mode)
{
	this.setStringToRoot(oFF.SuDialogModeConfigWrapper.MODE, mode);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setSelectionType = function(resType)
{
	this.setString(oFF.SuDialogModeConfigWrapper.SELECTION, oFF.SuDialogModeConfigWrapper.SELECTION_RESTYPE, resType);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setSelectionMode = function(mode)
{
	this.setString(oFF.SuDialogModeConfigWrapper.SELECTION, oFF.SuDialogModeConfigWrapper.SELECTION_MODE, mode);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setOkButtonLabel = function(label)
{
	this.setStringToRoot(oFF.SuDialogModeConfigWrapper.OK_BTN_LABEL, label);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setCancelButtonLabel = function(label)
{
	this.setStringToRoot(oFF.SuDialogModeConfigWrapper.CANCEL_BTN_LABEL, label);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setSaveNewResourceName = function(name)
{
	this.setString(oFF.SuDialogModeConfigWrapper.SAVE, oFF.SuDialogModeConfigWrapper.SAVE_NEW_RESOURCE_NAME, name);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.enableNextFreeResourceName = function(enable)
{
	this.setBoolean(oFF.SuDialogModeConfigWrapper.SAVE, oFF.SuDialogModeConfigWrapper.SAVE_NEXT_FREE_RESOURCE_NAME, enable);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.addSaveField = function(name, type, label, info)
{
	if (oFF.isNull(name))
	{
		throw oFF.XException.createIllegalArgumentException("'name' cannot be null.");
	}
	var field = oFF.PrStructure.create();
	field.putString(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_NAME, name);
	if (oFF.notNull(type))
	{
		field.putString(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_TYPE, type);
	}
	if (oFF.notNull(label))
	{
		field.putString(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_LABEL, label);
	}
	if (oFF.notNull(info))
	{
		field.putString(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_INFO, info);
	}
	this.addToList(oFF.SuDialogModeConfigWrapper.SAVE, oFF.SuDialogModeConfigWrapper.SAVE_FIELDS, field);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.setSize = function(width, height)
{
	this.setString(oFF.SuDialogModeConfigWrapper.SIZE, oFF.SuDialogModeConfigWrapper.SIZE_WIDTH, width);
	this.setString(oFF.SuDialogModeConfigWrapper.SIZE, oFF.SuDialogModeConfigWrapper.SIZE_HEIGHT, height);
	return this;
};
oFF.SuDialogModeConfigWrapper.prototype.getWidth = function()
{
	return this.getSize(oFF.SuDialogModeConfigWrapper.SIZE_WIDTH);
};
oFF.SuDialogModeConfigWrapper.prototype.getHeight = function()
{
	return this.getSize(oFF.SuDialogModeConfigWrapper.SIZE_HEIGHT);
};
oFF.SuDialogModeConfigWrapper.prototype.getSize = function(sizeStr)
{
	var sizePath = oFF.XStringUtils.concatenate3(oFF.SuDialogModeConfigWrapper.SIZE, ".", sizeStr);
	var size = this.getElementByPath(sizePath, false);
	return oFF.notNull(size) && size.isString() ? size.asString().getString() : null;
};

oFF.SuResourceExplorerConfigWrapper = function() {};
oFF.SuResourceExplorerConfigWrapper.prototype = new oFF.SuConfigWrapperBase();
oFF.SuResourceExplorerConfigWrapper.prototype._ff_c = "SuResourceExplorerConfigWrapper";

oFF.SuResourceExplorerConfigWrapper.s_wrappersNames = null;
oFF.SuResourceExplorerConfigWrapper.create = function()
{
	return oFF.SuResourceExplorerConfigWrapper._createByJson(oFF.SuConfigWrapperBase.EMPTY_CONFIG);
};
oFF.SuResourceExplorerConfigWrapper.createByJson = function(configJson)
{
	return oFF.SuResourceExplorerConfigWrapper._createByJson(configJson);
};
oFF.SuResourceExplorerConfigWrapper._createByJson = function(json)
{
	var wrapper = new oFF.SuResourceExplorerConfigWrapper();
	wrapper.setupByJson(json);
	return wrapper;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setupStatic = function()
{
	if (oFF.isNull(oFF.SuResourceExplorerConfigWrapper.s_wrappersNames))
	{
		oFF.SuResourceExplorerConfigWrapper.s_wrappersNames = oFF.XListOfString.create();
		oFF.SuResourceExplorerConfigWrapper.s_wrappersNames.add(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER);
		oFF.SuResourceExplorerConfigWrapper.s_wrappersNames.add(oFF.SuResourceExplorerConfig.TOOLBAR);
		oFF.SuResourceExplorerConfigWrapper.s_wrappersNames.add(oFF.SuResourceExplorerConfig.DIALOG_MODE);
		oFF.SuResourceExplorerConfigWrapper.s_wrappersNames.add(oFF.SuResourceExplorerConfig.DATA);
	}
};
oFF.SuResourceExplorerConfigWrapper.prototype.updateWrappers = function()
{
	this.updateToolbarWrapper();
	this.updateDialogModeWrapper();
	this.updateDetailsViewWrapper();
	this.updateDataWrapper();
};
oFF.SuResourceExplorerConfigWrapper.prototype.updateDataWrapper = function()
{
	if (this.m_config.containsKey(oFF.SuResourceExplorerConfig.DATA))
	{
		var dataWrapper = this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DATA, true);
		if (oFF.notNull(dataWrapper))
		{
			dataWrapper.clear();
			var dataElement = this.m_config.getByKey(oFF.SuResourceExplorerConfig.DATA);
			if (dataElement.isStructure())
			{
				dataWrapper.setupByJson(dataElement.getStringRepresentation());
			}
			else
			{
				this.removeConfigWrapper(oFF.SuResourceExplorerConfig.DATA);
			}
		}
	}
};
oFF.SuResourceExplorerConfigWrapper.prototype.updateDetailsViewWrapper = function()
{
	if (this.m_config.containsKey(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER))
	{
		var detailsViewWrapper = this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER, true);
		if (oFF.notNull(detailsViewWrapper))
		{
			detailsViewWrapper.clear();
			var detailsViewElement = this.m_config.getByKey(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER);
			if (detailsViewElement.isStructure())
			{
				detailsViewWrapper.setupByJson(detailsViewElement.getStringRepresentation());
			}
			else
			{
				this.removeConfigWrapper(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER);
			}
		}
	}
};
oFF.SuResourceExplorerConfigWrapper.prototype.updateToolbarWrapper = function()
{
	if (this.m_config.containsKey(oFF.SuResourceExplorerConfig.TOOLBAR))
	{
		var toolbar = this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.TOOLBAR, true);
		if (oFF.notNull(toolbar))
		{
			toolbar.clear();
			var toolbarElement = this.m_config.getByKey(oFF.SuResourceExplorerConfig.TOOLBAR);
			if (toolbarElement.isStructure())
			{
				toolbar.setupByJson(toolbarElement.getStringRepresentation());
			}
			else
			{
				this.removeConfigWrapper(oFF.SuResourceExplorerConfig.TOOLBAR);
			}
		}
	}
};
oFF.SuResourceExplorerConfigWrapper.prototype.updateDialogModeWrapper = function()
{
	if (this.m_config.containsKey(oFF.SuResourceExplorerConfig.DIALOG_MODE))
	{
		var dialog = this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DIALOG_MODE, true);
		dialog.clear();
		dialog.setupByJson(this.m_config.getStructureByKey(oFF.SuResourceExplorerConfig.DIALOG_MODE).getStringRepresentation());
	}
};
oFF.SuResourceExplorerConfigWrapper.prototype.setVersion = function(version)
{
	this.setStringToRoot(oFF.SuResourceExplorerConfig.VERSION, version);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setTitle = function(title)
{
	this.setStringToRoot(oFF.SuResourceExplorerConfig.PROGRAM_TITLE, title);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setRoot = function(root)
{
	this.setStringToRoot(oFF.SuResourceExplorerConfig.ROOT, root);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setInitialPath = function(initialPath)
{
	this.setStringToRoot(oFF.SuResourceExplorerConfig.INITIAL_PATH, initialPath);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableTreeNav = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TREE_NAVIGATION, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableToolbar = function(enabled)
{
	this.enableWrapper(oFF.SuResourceExplorerConfig.TOOLBAR, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.getToolbar = function(createIfNotExsist)
{
	return this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.TOOLBAR, createIfNotExsist);
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableMessageArea = function(enabled)
{
	this.enableWrapper(oFF.SuResourceExplorerConfig.MESSAGE_AREA, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableGroupDirectories = function(enabled)
{
	this.enableWrapper(oFF.SuResourceExplorerConfig.GROUP_DIRECTORIES, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.getDialogMode = function(createIfNotExsist)
{
	return this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DIALOG_MODE, createIfNotExsist);
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableTileView = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TILES_FILE_VIEWER, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addFilter = function(key, value, type)
{
	if (oFF.isNull(key) || oFF.isNull(value))
	{
		throw oFF.XException.createIllegalArgumentException("'key' and 'value' cannot be null.");
	}
	var field = oFF.PrStructure.create();
	field.putString(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY, key);
	field.putString(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_VALUE, value);
	if (oFF.notNull(type))
	{
		field.putString(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE, type);
	}
	this.addToList(null, oFF.SuResourceExplorerConfig.RESOURCE_FILTER, field);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addExtensionFilter = function(extension)
{
	if (oFF.isNull(extension))
	{
		throw oFF.XException.createIllegalArgumentException("'extension' cannot be null.");
	}
	return this.addFilter(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY_EXT, extension, null);
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableData = function(enable)
{
	this.enableWrapper(oFF.SuResourceExplorerConfig.DATA, enable);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.getData = function(createIfNotExsist)
{
	return this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DATA, createIfNotExsist);
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableDetailsView = function(enable)
{
	this.enableWrapper(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER, enable);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.getDetailsView = function(createIfNotExsist)
{
	return this.getConfigWrapperExt(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER, createIfNotExsist);
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableDefaultDetailsView = function()
{
	var wrapper = oFF.SuDetailsViewConfigWrapper.createDefault();
	this.setConfigWrapper(oFF.SuResourceExplorerConfig.DETAILS_FILE_VIEWER, wrapper);
	return wrapper;
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableQuickAccess = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addQuickAccess = function(label, link, icon, key)
{
	if (oFF.isNull(label) && oFF.isNull(link) && oFF.isNull(key))
	{
		throw oFF.XException.createIllegalArgumentException("At least one of 'label', 'link' or 'key' must be defined.");
	}
	var quickAccess = this.createQuickAccessItem(key, label, link, icon, null);
	this.addToListRoot(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER, quickAccess);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addQuickAccessItemByIndex = function(quickAccessIndex, link, label, icon, enabled)
{
	if (oFF.isNull(link))
	{
		throw oFF.XException.createIllegalArgumentException("'link' cannot be null.");
	}
	var quickAccessItems = this.getQuickAccess(quickAccessIndex);
	var quickAccess = this.createQuickAccessItem(null, label, link, icon, enabled);
	quickAccessItems.add(quickAccess);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addQuickAccessLinksByIndex = function(quickAccessIndex, links)
{
	if (oFF.isNull(links) || links.size() === 0)
	{
		throw oFF.XException.createIllegalArgumentException("link list cannot be null or empty");
	}
	var quickAccessItems = this.getQuickAccess(quickAccessIndex);
	quickAccessItems.addAllStrings(links);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addQuickAccessLinkByIndex = function(quickAccessIndex, link)
{
	if (oFF.isNull(link))
	{
		throw oFF.XException.createIllegalArgumentException("'link' cannot be null.");
	}
	var quickAccessItems = this.getQuickAccess(quickAccessIndex);
	quickAccessItems.addString(link);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.enableDatasource = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, enabled);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setDatasourceRoot = function(root)
{
	return this.setDatasourceValue(oFF.SuResourceExplorerConfig.ROOT, root);
};
oFF.SuResourceExplorerConfigWrapper.prototype.setDatasourceInitialSystem = function(system)
{
	return this.setDatasourceValue(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM, system);
};
oFF.SuResourceExplorerConfigWrapper.prototype.setDatasourceInitialConnection = function(connection)
{
	return this.setDatasourceValue(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_CONNECTION, connection);
};
oFF.SuResourceExplorerConfigWrapper.prototype.addDatasourceSystemTypes = function(systemType)
{
	if (this.getBooleanFromRoot(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION) !== null)
	{
		this.removeStructureFromRoot(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION);
	}
	this.addStringToList(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM_TYPES, systemType);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.addDatasourceRecentlyUsed = function(systemName, dataSourceName, schemaName, objectType, packageName)
{
	if (oFF.isNull(dataSourceName) && oFF.isNull(systemName))
	{
		throw oFF.XException.createIllegalArgumentException("'dataSourceName' and 'systemName' must be defined.");
	}
	var recentlyUsed = this.createRecentlyUsedItem(systemName, dataSourceName, schemaName, objectType, packageName);
	this.addToList(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED, recentlyUsed);
	return this;
};
oFF.SuResourceExplorerConfigWrapper.prototype.getQuickAccess = function(quickAccessIndex)
{
	var quickAccessListElement = this.m_config.getByKey(oFF.SuResourceExplorerConfig.QUICK_ACCESS_VIEWER);
	if (oFF.isNull(quickAccessListElement))
	{
		throw oFF.XException.createIllegalArgumentException("Quick access null.");
	}
	if (!quickAccessListElement.isList())
	{
		throw oFF.XException.createIllegalArgumentException("Quick access is not a list.");
	}
	var quickAccessElement = quickAccessListElement.asList().get(quickAccessIndex);
	if (oFF.isNull(quickAccessElement))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("Quick access index '", oFF.XInteger.convertToString(quickAccessIndex), "' not found."));
	}
	var quickAccess = quickAccessElement.asStructure();
	var quickAccessItems;
	if (quickAccess.containsKey(oFF.SuQuickAccessConfig.ITEMS))
	{
		quickAccessItems = quickAccess.getByKey(oFF.SuQuickAccessConfig.ITEMS).asList();
	}
	else
	{
		quickAccessItems = quickAccess.putNewList(oFF.SuQuickAccessConfig.ITEMS);
	}
	return quickAccessItems;
};
oFF.SuResourceExplorerConfigWrapper.prototype.createQuickAccessItem = function(key, label, link, icon, enabled)
{
	var quickAccess = oFF.PrStructure.create();
	this.putStringIfNotNull(quickAccess, oFF.SuQuickAccessConfig.KEY, key);
	this.putStringIfNotNull(quickAccess, oFF.SuQuickAccessConfig.LABEL, label);
	this.putStringIfNotNull(quickAccess, oFF.SuQuickAccessConfig.LINK, link);
	this.putStringIfNotNull(quickAccess, oFF.SuQuickAccessConfig.ICON, icon);
	this.putBooleanIfNotNull(quickAccess, oFF.SuQuickAccessConfig.ENABLED, enabled);
	return quickAccess;
};
oFF.SuResourceExplorerConfigWrapper.prototype.createRecentlyUsedItem = function(systemName, dataSourceName, schemaName, objectType, packageName)
{
	var recentlyUsed = oFF.PrStructure.create();
	this.putStringIfNotNull(recentlyUsed, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SYSTEM_NAME, systemName);
	this.putStringIfNotNull(recentlyUsed, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_DATASOURCE_NAME, dataSourceName);
	this.putStringIfNotNull(recentlyUsed, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_SCHEMA_NAME, schemaName);
	this.putStringIfNotNull(recentlyUsed, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_OBJECT_TYPE, objectType);
	this.putStringIfNotNull(recentlyUsed, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED_PACKAGE_NAME, packageName);
	return recentlyUsed;
};
oFF.SuResourceExplorerConfigWrapper.prototype.setDatasourceValue = function(key, value)
{
	if (this.getBooleanFromRoot(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION) !== null)
	{
		this.removeStructureFromRoot(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION);
	}
	this.setString(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, key, value);
	return this;
};

oFF.SuToolbarConfigWrapper = function() {};
oFF.SuToolbarConfigWrapper.prototype = new oFF.SuConfigWrapperBase();
oFF.SuToolbarConfigWrapper.prototype._ff_c = "SuToolbarConfigWrapper";

oFF.SuToolbarConfigWrapper.create = function()
{
	var wrapper = new oFF.SuToolbarConfigWrapper();
	wrapper.setupEmpty();
	return wrapper;
};
oFF.SuToolbarConfigWrapper.prototype.enableNavigation = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_NAVIGATION, enabled);
	return this;
};
oFF.SuToolbarConfigWrapper.prototype.enableOperations = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_OPERATIONS, enabled);
	return this;
};
oFF.SuToolbarConfigWrapper.prototype.enableBreadcrumbs = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS, enabled);
	return this;
};
oFF.SuToolbarConfigWrapper.prototype.enableSearch = function(enabled)
{
	this.setBooleanToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH, enabled);
	return this;
};
oFF.SuToolbarConfigWrapper.prototype.setSearch = function(str)
{
	this.setStringToRoot(oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH, str);
	return this;
};

oFF.SuQuickAccessCategory = function() {};
oFF.SuQuickAccessCategory.prototype = new oFF.SuQuickAccessLink();
oFF.SuQuickAccessCategory.prototype._ff_c = "SuQuickAccessCategory";

oFF.SuQuickAccessCategory.createCategory = function(key, label, icon, link, enabled)
{
	var data = new oFF.SuQuickAccessCategory();
	data.setupCategory(key, label, icon, link, enabled);
	return data;
};
oFF.SuQuickAccessCategory.createCategoryFromStructure = function(qaElement, defaultKey)
{
	var data = new oFF.SuQuickAccessCategory();
	data.setupFromStructure(qaElement, defaultKey);
	data.m_key = oFF.SuQuickAccessCategory.getQuickAccessKey(qaElement, defaultKey);
	var label;
	if (qaElement.containsKey(oFF.SuQuickAccessConfig.LABEL))
	{
		label = qaElement.getStringByKey(oFF.SuQuickAccessConfig.LABEL);
	}
	else
	{
		var i18nProvider = oFF.UiLocalizationCenter.getCenter();
		var labelKey = qaElement.getStringByKey(oFF.SuQuickAccessConfig.KEY);
		label = i18nProvider.getText(labelKey);
	}
	data.m_label = label;
	if (!qaElement.containsKey(oFF.SuQuickAccessConfig.ITEMS))
	{
		return data;
	}
	data.m_links = oFF.XList.create();
	var items = qaElement.getListByKey(oFF.SuQuickAccessConfig.ITEMS);
	for (var i = 0; i < items.size(); i++)
	{
		var linkElement = items.get(i);
		if (linkElement.isString())
		{
			data.m_links.add(oFF.SuQuickAccessLink.createSimpleLink(linkElement.asString().getString()));
		}
		else if (linkElement.isStructure())
		{
			data.m_links.add(oFF.SuQuickAccessLink.createFromStructure(linkElement.asStructure(), i));
		}
	}
	return data;
};
oFF.SuQuickAccessCategory.getQuickAccessKey = function(qaElement, index)
{
	if (qaElement.containsKey(oFF.SuQuickAccessConfig.KEY))
	{
		return qaElement.getStringByKey(oFF.SuQuickAccessConfig.KEY);
	}
	else if (qaElement.containsKey(oFF.SuQuickAccessConfig.LABEL))
	{
		return qaElement.getStringByKey(oFF.SuQuickAccessConfig.LABEL);
	}
	return oFF.XInteger.convertToString(index);
};
oFF.SuQuickAccessCategory.prototype.m_key = null;
oFF.SuQuickAccessCategory.prototype.m_editable = false;
oFF.SuQuickAccessCategory.prototype.m_links = null;
oFF.SuQuickAccessCategory.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuQuickAccessCategory");
	buf.append("(key:");
	buf.append(this.m_key);
	buf.append(")");
	buf.append("(editable:");
	buf.append(oFF.XBooleanValue.create(this.m_editable).toString());
	buf.append(")");
	this.appendCommon(buf);
	buf.append("(Links:");
	buf.append(this.m_links.toString());
	buf.append(")");
	buf.append("]");
	return buf.toString();
};
oFF.SuQuickAccessCategory.prototype.setupCategory = function(key, label, icon, link, enabled)
{
	oFF.SuQuickAccessLink.prototype.setupLink.call( this , link, label, icon, enabled);
	this.m_key = key;
	this.m_links = oFF.XObjectExt.release(this.m_links);
	this.m_editable = false;
};
oFF.SuQuickAccessCategory.prototype.releaseObject = function()
{
	oFF.SuQuickAccessLink.prototype.releaseObject.call( this );
	this.m_links = oFF.XObjectExt.release(this.m_links);
};
oFF.SuQuickAccessCategory.prototype.isEmpty = function()
{
	return oFF.isNull(this.m_links) || this.m_links.size() === 0;
};
oFF.SuQuickAccessCategory.prototype.isEditable = function()
{
	return this.m_editable;
};
oFF.SuQuickAccessCategory.prototype.getLinks = function()
{
	return this.m_links;
};
oFF.SuQuickAccessCategory.prototype.clear = function()
{
	if (!this.isEmpty() && this.m_editable)
	{
		this.m_links.clear();
	}
};
oFF.SuQuickAccessCategory.prototype.getKey = function()
{
	return this.m_key;
};

oFF.SuDataProviderBase = function() {};
oFF.SuDataProviderBase.prototype = new oFF.XObject();
oFF.SuDataProviderBase.prototype._ff_c = "SuDataProviderBase";

oFF.SuDataProviderBase.prototype.m_fetchPromise = null;
oFF.SuDataProviderBase.prototype.m_fetchResult = null;
oFF.SuDataProviderBase.prototype.m_providedList = null;
oFF.SuDataProviderBase.prototype.m_query = null;
oFF.SuDataProviderBase.prototype.m_sortAscending = false;
oFF.SuDataProviderBase.prototype.m_sortingAttribute = null;
oFF.SuDataProviderBase.prototype.m_filters = null;
oFF.SuDataProviderBase.prototype.m_customFilterFn = null;
oFF.SuDataProviderBase.prototype.m_offset = 0;
oFF.SuDataProviderBase.prototype.m_maxItems = 0;
oFF.SuDataProviderBase.prototype.m_consumersHandler = null;
oFF.SuDataProviderBase.prototype.m_initialised = false;
oFF.SuDataProviderBase.prototype.m_dirty = false;
oFF.SuDataProviderBase.prototype.m_stateChanged = null;
oFF.SuDataProviderBase.prototype.m_lastStateChanged = null;
oFF.SuDataProviderBase.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_filters = oFF.XHashMapByString.create();
	this.m_consumersHandler = oFF.SuEventConsumerHandler.create();
	this.m_offset = 0;
	this.m_maxItems = -1;
	this.m_dirty = false;
	this.m_initialised = false;
	this.m_stateChanged = oFF.XLinkedHashMapOfStringByString.create();
	this.m_lastStateChanged = oFF.XLinkedHashMapOfStringByString.create();
};
oFF.SuDataProviderBase.prototype.releaseObject = function()
{
	this.m_consumersHandler = oFF.XObjectExt.release(this.m_consumersHandler);
	this.m_filters = oFF.XObjectExt.release(this.m_filters);
	this.m_providedList = oFF.XObjectExt.release(this.m_providedList);
	this.m_fetchResult = oFF.XObjectExt.release(this.m_fetchResult);
	this.m_fetchPromise = null;
	this.m_stateChanged = oFF.XObjectExt.release(this.m_stateChanged);
	this.m_lastStateChanged = oFF.XObjectExt.release(this.m_lastStateChanged);
};
oFF.SuDataProviderBase.prototype.get = function()
{
	return this.m_providedList;
};
oFF.SuDataProviderBase.prototype.forceInit = function()
{
	this.m_initialised = false;
	this.setDirty(oFF.SuDataProviderHelper.STATE_INIT, null);
};
oFF.SuDataProviderBase.prototype.isDirty = function()
{
	return this.m_dirty;
};
oFF.SuDataProviderBase.prototype.setQuery = function(query)
{
	if (!oFF.XString.isEqual(this.m_query, query))
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_QUERY_NAME, query);
		this.m_query = query;
	}
	return this;
};
oFF.SuDataProviderBase.prototype.getQuery = function()
{
	return this.m_query;
};
oFF.SuDataProviderBase.prototype.setSortingAttribute = function(attribute)
{
	if (!oFF.XString.isEqual(this.m_sortingAttribute, attribute))
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_SORTING_ATTRIBUTE_NAME, attribute);
		this.m_sortingAttribute = attribute;
	}
	return this;
};
oFF.SuDataProviderBase.prototype.setSortingOrder = function(isAscending)
{
	if (isAscending !== this.m_sortAscending)
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_SORTING_ORDER_NAME, oFF.XBoolean.convertToString(isAscending));
		this.m_sortAscending = isAscending;
	}
	return this;
};
oFF.SuDataProviderBase.prototype.setOffset = function(offset)
{
	var normalizedOffset = offset < 0 ? 0 : offset;
	if (normalizedOffset !== this.m_offset)
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_OFFSET_NAME, oFF.XInteger.convertToString(normalizedOffset));
		this.m_offset = normalizedOffset;
	}
	return this;
};
oFF.SuDataProviderBase.prototype.getOffset = function()
{
	return this.m_offset;
};
oFF.SuDataProviderBase.prototype.setPageNumber = function(pageNumber)
{
	var newOffset = pageNumber * this.m_maxItems;
	return this.setOffset(newOffset);
};
oFF.SuDataProviderBase.prototype.setMaxItems = function(maxItems)
{
	if (maxItems !== this.m_maxItems)
	{
		this.m_maxItems = maxItems;
		this.setDirty(oFF.SuDataProviderHelper.STATE_MAX_ITEMS_NAME, oFF.XInteger.convertToString(maxItems));
	}
	return this;
};
oFF.SuDataProviderBase.prototype.getMaxItems = function()
{
	return this.m_maxItems;
};
oFF.SuDataProviderBase.prototype.getSortingAttribute = function()
{
	return this.m_sortingAttribute;
};
oFF.SuDataProviderBase.prototype.isSortingAscending = function()
{
	return this.m_sortAscending;
};
oFF.SuDataProviderBase.prototype.setFetchFn = function(fn)
{
	this.setFetchPromise( function(){
		return oFF.XPromise.create( function(resolve, reject){
			var list = fn();
			resolve(list);
		}.bind(this));
	}.bind(this));
};
oFF.SuDataProviderBase.prototype.setFetchPromise = function(fetchPromise)
{
	this.forceInit();
	this.setDirty(oFF.SuDataProviderHelper.STATE_FETCH_PROMISE_NAME, null);
	this.m_fetchPromise = fetchPromise;
};
oFF.SuDataProviderBase.prototype.fetch = function()
{
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		if (!this.m_initialised && oFF.isNull(this.m_fetchPromise))
		{
			this.resetSublist();
			reject(oFF.XError.create("Provider state error: not initialized and fetch function not defined"));
		}
		else if (this.m_initialised)
		{
			if (!this.isDirty() && oFF.notNull(this.m_providedList))
			{
				this.endFetch(resolve);
			}
			else
			{
				this.setupProvidedList();
				this.endFetch(resolve);
			}
		}
		else
		{
			this.m_fetchPromise().then( function(list){
				this.setupFetchResult(list, resolve);
				return list;
			}.bind(this),  function(err){
				reject(err);
			}.bind(this));
		}
	}.bind(this));
};
oFF.SuDataProviderBase.prototype.getFilters = function()
{
	return this.m_filters.getValuesAsReadOnlyList();
};
oFF.SuDataProviderBase.prototype.addFilter = function(filter)
{
	if (oFF.notNull(filter))
	{
		this.m_filters.put(filter.getName(), filter);
	}
};
oFF.SuDataProviderBase.prototype.removeFilter = function(filterName)
{
	this.m_filters.remove(filterName);
};
oFF.SuDataProviderBase.prototype.clearFilters = function()
{
	this.m_filters.clear();
};
oFF.SuDataProviderBase.prototype.setCustomFilter = function(filterFn)
{
	if (oFF.notNull(filterFn) && oFF.isNull(this.m_customFilterFn) || oFF.isNull(filterFn) && oFF.notNull(this.m_customFilterFn))
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_CUSTOM_FILTER_NAME, null);
		this.m_customFilterFn = filterFn;
	}
};
oFF.SuDataProviderBase.prototype.getLastStateChanged = function()
{
	return this.m_lastStateChanged;
};
oFF.SuDataProviderBase.prototype.getFetchList = function()
{
	return oFF.notNull(this.m_fetchResult) ? this.m_fetchResult.getList() : null;
};
oFF.SuDataProviderBase.prototype.setDirty = function(field, value)
{
	this.m_stateChanged.put(field, value);
	this.m_dirty = true;
};
oFF.SuDataProviderBase.prototype.resetFetchResult = function()
{
	this.m_fetchResult = null;
};
oFF.SuDataProviderBase.prototype.setupFetchResult = function(result, resolve)
{
	this.m_fetchResult = result;
};
oFF.SuDataProviderBase.prototype.setupProvidedList = function()
{
	this.m_dirty = false;
};
oFF.SuDataProviderBase.prototype.storeLastStateChanged = function()
{
	this.m_lastStateChanged = this.m_stateChanged.createMapOfStringByStringCopy();
	this.m_stateChanged.clear();
};
oFF.SuDataProviderBase.prototype.endFetch = function(resolve)
{
	this.storeLastStateChanged();
	resolve(this.m_providedList);
	this.fireOnDataFetch(this.m_providedList);
};
oFF.SuDataProviderBase.prototype.resetSublist = function()
{
	this.m_providedList = null;
};
oFF.SuDataProviderBase.prototype.getFilterFn = function()
{
	return  function(item){
		return this.callFilterFn(item).getBoolean();
	}.bind(this);
};
oFF.SuDataProviderBase.prototype.callFilterFn = function(item)
{
	return this.m_customFilterFn(item, this.m_query);
};
oFF.SuDataProviderBase.prototype.attachOnDataFetch = function(consumer)
{
	this.m_consumersHandler.attachEventConsumer(oFF.SuDataProviderConstants.EVENT_ON_FETCH, consumer);
};
oFF.SuDataProviderBase.prototype.detachOnDataFetch = function(consumer)
{
	this.m_consumersHandler.detachEventConsumer(oFF.SuDataProviderConstants.EVENT_ON_FETCH, consumer);
};
oFF.SuDataProviderBase.prototype.getConsumersOnDataFetch = function()
{
	return this.m_consumersHandler.getEventConsumers(oFF.SuDataProviderConstants.EVENT_ON_FETCH);
};
oFF.SuDataProviderBase.prototype.fireOnDataFetch = function(data)
{
	this.m_consumersHandler.fireEvent(oFF.SuDataProviderConstants.EVENT_ON_FETCH, data);
};

oFF.SuFilterElement = function() {};
oFF.SuFilterElement.prototype = new oFF.XObject();
oFF.SuFilterElement.prototype._ff_c = "SuFilterElement";

oFF.SuFilterElement.create = function(name, value)
{
	return oFF.SuFilterElement.createWithType(name, value, null);
};
oFF.SuFilterElement.createWithType = function(name, value, type)
{
	var filter = new oFF.SuFilterElement();
	filter.m_name = name;
	filter.m_value = value;
	filter.m_type = oFF.isNull(type) ? oFF.SuFilterType.ASTERISK : type;
	return filter;
};
oFF.SuFilterElement.prototype.m_name = null;
oFF.SuFilterElement.prototype.m_value = null;
oFF.SuFilterElement.prototype.m_typeExt = null;
oFF.SuFilterElement.prototype.m_type = null;
oFF.SuFilterElement.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuFilterElement");
	this.appendField(buf, "name", this.m_name);
	this.appendField(buf, "value", this.m_value);
	this.appendField(buf, "type", this.m_type.toString());
	this.appendField(buf, "typeExt", this.m_typeExt);
	buf.append("]");
	return buf.toString();
};
oFF.SuFilterElement.prototype.getName = function()
{
	return this.m_name;
};
oFF.SuFilterElement.prototype.getValue = function()
{
	return this.m_value;
};
oFF.SuFilterElement.prototype.getType = function()
{
	return this.m_type;
};
oFF.SuFilterElement.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.SuFilterElement.prototype.getTypeExt = function()
{
	return this.m_typeExt;
};
oFF.SuFilterElement.prototype.setTypeExt = function(typeExt)
{
	this.m_typeExt = typeExt;
};
oFF.SuFilterElement.prototype.appendField = function(buf, name, str)
{
	buf.append("(");
	buf.append(name);
	buf.append(":");
	buf.append(str);
	buf.append(")");
};

oFF.SuDatasourceInfoComparator = function() {};
oFF.SuDatasourceInfoComparator.prototype = new oFF.XObject();
oFF.SuDatasourceInfoComparator.prototype._ff_c = "SuDatasourceInfoComparator";

oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_NAME = "name";
oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_SYS_NAME = "sys_name";
oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_SYS_TYPE = "sys_type";
oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_PACKAGE = "package";
oFF.SuDatasourceInfoComparator.create = function(ascending, attribute)
{
	var comparator = oFF.SuDatasourceInfoComparator.createDefault();
	comparator.m_orderAscending = ascending;
	comparator.m_attribute = attribute;
	return comparator;
};
oFF.SuDatasourceInfoComparator.createDefault = function()
{
	var comparator = new oFF.SuDatasourceInfoComparator();
	comparator.m_orderAscending = true;
	comparator.m_attribute = oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_NAME;
	return comparator;
};
oFF.SuDatasourceInfoComparator.prototype.m_orderAscending = false;
oFF.SuDatasourceInfoComparator.prototype.m_attribute = null;
oFF.SuDatasourceInfoComparator.prototype.compare = function(o1, o2)
{
	if (oFF.isNull(this.m_attribute))
	{
		return 0;
	}
	var value1 = "";
	var value2 = "";
	switch (this.m_attribute)
	{
		case oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_SYS_NAME:
			value1 = o1.getSystemName();
			value2 = o2.getSystemName();
			break;

		case oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_SYS_TYPE:
			value1 = o1.getSystemType();
			value2 = o2.getSystemType();
			break;

		case oFF.SuDatasourceInfoComparator.DATASOURCE_ATTRIBUTE_PACKAGE:
			value1 = o1.getPackageName();
			value2 = o2.getPackageName();
			break;

		default:
			value1 = o1.getDataSourceName();
			value2 = o2.getDataSourceName();
			break;
	}
	value1 = oFF.XString.toUpperCase(oFF.notNull(value1) ? value1 : "");
	value2 = oFF.XString.toUpperCase(oFF.notNull(value2) ? value2 : "");
	return this.m_orderAscending ? oFF.XString.compare(value1, value2) : oFF.XString.compare(value2, value1);
};
oFF.SuDatasourceInfoComparator.prototype.setOrder = function(isAscending)
{
	this.m_orderAscending = isAscending;
};
oFF.SuDatasourceInfoComparator.prototype.setAttribute = function(attribute)
{
	this.m_attribute = attribute;
};
oFF.SuDatasourceInfoComparator.prototype.isOrderAscending = function()
{
	return this.m_orderAscending;
};
oFF.SuDatasourceInfoComparator.prototype.getAttribute = function()
{
	return this.m_attribute;
};

oFF.SuResourceComparator = function() {};
oFF.SuResourceComparator.prototype = new oFF.XObject();
oFF.SuResourceComparator.prototype._ff_c = "SuResourceComparator";

oFF.SuResourceComparator.create = function(ascending, attribute, groupDirectories)
{
	var comparator = oFF.SuResourceComparator.createDefault();
	comparator.m_ascending = ascending;
	comparator.m_attribute = attribute;
	comparator.m_groupDirectories = groupDirectories;
	return comparator;
};
oFF.SuResourceComparator.createDefault = function()
{
	var comparator = new oFF.SuResourceComparator();
	comparator.m_ascending = true;
	comparator.m_attribute = oFF.SuResourceWrapper.RESOURCE_FIELD_NAME;
	return comparator;
};
oFF.SuResourceComparator.prototype.m_ascending = false;
oFF.SuResourceComparator.prototype.m_attribute = null;
oFF.SuResourceComparator.prototype.m_groupDirectories = false;
oFF.SuResourceComparator.prototype.compare = function(o1, o2)
{
	var o1Wrapper = oFF.SuResourceWrapper.create(o1);
	var o2Wrapper = oFF.SuResourceWrapper.create(o2);
	var isO1Dir = o1Wrapper.isResourceDirectory();
	var onlyOneDirectory = isO1Dir !== o2Wrapper.isResourceDirectory();
	if (this.m_groupDirectories && onlyOneDirectory)
	{
		return isO1Dir ? -1 : 1;
	}
	if (oFF.isNull(this.m_attribute))
	{
		return 1;
	}
	var value1 = this.getAttributeValue(o1, this.m_attribute);
	var value2 = this.getAttributeValue(o2, this.m_attribute);
	return this.m_ascending ? oFF.XString.compare(value1, value2) : oFF.XString.compare(value2, value1);
};
oFF.SuResourceComparator.prototype.getAttributeValue = function(file, attribute)
{
	var rw = oFF.SuResourceWrapper.create(file);
	var rawValue = oFF.XString.isEqual(attribute, oFF.XFileAttribute.DISPLAY_NAME.toString()) || oFF.XString.isEqual(attribute, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME) ? rw.getTranslatedDisplayName() : rw.get(this.m_attribute, null);
	return oFF.XString.toLowerCase(rawValue);
};
oFF.SuResourceComparator.prototype.setOrder = function(isAscending)
{
	this.m_ascending = isAscending;
};
oFF.SuResourceComparator.prototype.isOrderAscending = function()
{
	return this.m_ascending;
};
oFF.SuResourceComparator.prototype.setAttribute = function(attribute)
{
	this.m_attribute = attribute;
};
oFF.SuResourceComparator.prototype.getAttribute = function()
{
	return this.m_attribute;
};

oFF.SuResourceExplorerState = function() {};
oFF.SuResourceExplorerState.prototype = new oFF.XObject();
oFF.SuResourceExplorerState.prototype._ff_c = "SuResourceExplorerState";

oFF.SuResourceExplorerState.STATUS_READY = "ready";
oFF.SuResourceExplorerState.STATUS_INITING = "initing";
oFF.SuResourceExplorerState.STATUS_SUBMITTING = "submitting";
oFF.SuResourceExplorerState.STATUS_INIT_ERROR = "init_error";
oFF.SuResourceExplorerState.STATUS_SUBMIT = "submit";
oFF.SuResourceExplorerState.QUICK_ACCESS_UPDATE_RECENTLY_USED = "QUICK_ACCESS_UPDATE_RECENTLY_USED";
oFF.SuResourceExplorerState.QUICK_ACCESS_FETCH_RECENTLY_USED = "QUICK_ACCESS_FETCH_RECENTLY_USED";
oFF.SuResourceExplorerState.create = function()
{
	var newResourceExplorerState = new oFF.SuResourceExplorerState();
	newResourceExplorerState.m_status = oFF.SuResourceExplorerState.STATUS_INITING;
	newResourceExplorerState.m_lastAction = oFF.SuResourceExplorerAction.createEmpty();
	return newResourceExplorerState;
};
oFF.SuResourceExplorerState.prototype.m_lastAction = null;
oFF.SuResourceExplorerState.prototype.m_viewerMode = null;
oFF.SuResourceExplorerState.prototype.m_selectedResource = null;
oFF.SuResourceExplorerState.prototype.m_browsedResource = null;
oFF.SuResourceExplorerState.prototype.m_quickAccess = null;
oFF.SuResourceExplorerState.prototype.m_resourceInfo = null;
oFF.SuResourceExplorerState.prototype.m_resourceList = null;
oFF.SuResourceExplorerState.prototype.m_quickFilter = null;
oFF.SuResourceExplorerState.prototype.m_searchQuery = null;
oFF.SuResourceExplorerState.prototype.m_rootResource = null;
oFF.SuResourceExplorerState.prototype.m_message = null;
oFF.SuResourceExplorerState.prototype.m_status = null;
oFF.SuResourceExplorerState.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_quickAccess = oFF.XObjectExt.release(this.m_quickAccess);
	this.m_viewerMode = null;
	this.m_selectedResource = null;
	this.m_browsedResource = null;
	if (oFF.notNull(this.m_lastAction))
	{
		this.m_lastAction.releaseObject();
	}
	this.m_resourceInfo = oFF.XObjectExt.release(this.m_resourceInfo);
	this.m_resourceList = oFF.XObjectExt.release(this.m_resourceList);
	this.m_quickFilter = null;
	this.m_rootResource = null;
	this.m_searchQuery = null;
	this.m_message = null;
	this.m_status = null;
};
oFF.SuResourceExplorerState.prototype.cloneExt = function(flags)
{
	return this;
};
oFF.SuResourceExplorerState.prototype.isNew = function()
{
	return this.m_lastAction.getType() === null;
};
oFF.SuResourceExplorerState.prototype.getStatus = function()
{
	return this.m_status;
};
oFF.SuResourceExplorerState.prototype.setStatus = function(status)
{
	this.m_status = status;
};
oFF.SuResourceExplorerState.prototype.setLastAction = function(action)
{
	this.m_lastAction = action;
};
oFF.SuResourceExplorerState.prototype.getLastAction = function()
{
	return this.m_lastAction;
};
oFF.SuResourceExplorerState.prototype.getSelectedResource = function()
{
	return this.m_selectedResource;
};
oFF.SuResourceExplorerState.prototype.setSelectedResource = function(resource)
{
	this.m_selectedResource = resource;
};
oFF.SuResourceExplorerState.prototype.getBrowsedResource = function()
{
	return this.m_browsedResource;
};
oFF.SuResourceExplorerState.prototype.setBrowsedResource = function(resource)
{
	this.m_browsedResource = resource;
};
oFF.SuResourceExplorerState.prototype.getViewerMode = function()
{
	return this.m_viewerMode;
};
oFF.SuResourceExplorerState.prototype.setViewerMode = function(viewerMode)
{
	this.m_viewerMode = viewerMode;
};
oFF.SuResourceExplorerState.prototype.getResourceInfo = function()
{
	return this.m_resourceInfo;
};
oFF.SuResourceExplorerState.prototype.setResourceInfo = function(resourceInfo)
{
	this.m_resourceInfo = resourceInfo;
};
oFF.SuResourceExplorerState.prototype.setResourceList = function(resourceList)
{
	this.m_resourceList = resourceList;
};
oFF.SuResourceExplorerState.prototype.getResourceList = function()
{
	return this.m_resourceList;
};
oFF.SuResourceExplorerState.prototype.getQuickFilter = function()
{
	return this.m_quickFilter;
};
oFF.SuResourceExplorerState.prototype.setQuickFilter = function(quickFilter)
{
	this.m_quickFilter = quickFilter;
};
oFF.SuResourceExplorerState.prototype.getRootResource = function()
{
	return this.m_rootResource;
};
oFF.SuResourceExplorerState.prototype.setRootResource = function(resource)
{
	this.m_rootResource = resource;
};
oFF.SuResourceExplorerState.prototype.getSearchQuery = function()
{
	return this.m_searchQuery;
};
oFF.SuResourceExplorerState.prototype.setSearchQuery = function(query)
{
	this.m_searchQuery = query;
};
oFF.SuResourceExplorerState.prototype.getMessage = function()
{
	return this.m_message;
};
oFF.SuResourceExplorerState.prototype.setMessage = function(message)
{
	this.m_message = message;
};
oFF.SuResourceExplorerState.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuResourceExplorerState");
	this.appendField(buf, "status", this.m_status);
	this.appendFieldExt(buf, "lastAction", this.m_lastAction);
	this.appendField(buf, "viewerMode", this.m_viewerMode);
	this.appendFieldExt(buf, "selectedResource", this.m_selectedResource);
	this.appendFieldExt(buf, "browsedResource", this.m_browsedResource);
	this.appendFieldExt(buf, "quickAccess", this.m_quickAccess);
	this.appendFieldExt(buf, "resourceInfo", this.m_resourceInfo);
	this.appendField(buf, "quickFilter", this.m_quickFilter);
	this.appendField(buf, "searchQuery", this.m_searchQuery);
	this.appendFieldExt(buf, "rootResource", this.m_rootResource);
	this.appendFieldExt(buf, "message", this.m_message);
	buf.append("]");
	return buf.toString();
};
oFF.SuResourceExplorerState.prototype.appendField = function(buf, name, str)
{
	buf.append("(");
	buf.append(name);
	buf.append(":");
	buf.append(str);
	buf.append(")");
};
oFF.SuResourceExplorerState.prototype.appendFieldExt = function(buf, name, obj)
{
	this.appendField(buf, name, obj.toString());
};

oFF.SuResourceExplorerStore = function() {};
oFF.SuResourceExplorerStore.prototype = new oFF.XObject();
oFF.SuResourceExplorerStore.prototype._ff_c = "SuResourceExplorerStore";

oFF.SuResourceExplorerStore.RESOURCE_VIEWER_TILES = "tiles";
oFF.SuResourceExplorerStore.RESOURCE_VIEWER_DETAILS = "details";
oFF.SuResourceExplorerStore.DATASOURCE_VIEWER = "datasource";
oFF.SuResourceExplorerStore.RECENTLY_USED_VIEWER = "recentlyUsed";
oFF.SuResourceExplorerStore.create = function(app, initialState, rootResource)
{
	oFF.XObjectExt.assertNotNullExt(app, "app cannot be null");
	var newResourceExplorerStore = new oFF.SuResourceExplorerStore();
	newResourceExplorerStore.m_app = app;
	var state = oFF.notNull(initialState) ? initialState : oFF.SuResourceExplorerState.create();
	state.setRootResource(rootResource);
	newResourceExplorerStore.m_store = oFF.Store.create(state, oFF.SuResourceExplorerReducer.create());
	return newResourceExplorerStore;
};
oFF.SuResourceExplorerStore.prototype.m_store = null;
oFF.SuResourceExplorerStore.prototype.m_app = null;
oFF.SuResourceExplorerStore.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_store = oFF.XObjectExt.release(this.m_store);
};
oFF.SuResourceExplorerStore.prototype.getApp = function()
{
	return this.m_app;
};
oFF.SuResourceExplorerStore.prototype.getRootResource = function()
{
	return this.m_store.getState().getRootResource();
};
oFF.SuResourceExplorerStore.prototype.isRootResource = function(resource)
{
	return oFF.SuResourceWrapper.areEquals(resource, this.getRootResource());
};
oFF.SuResourceExplorerStore.prototype.getState = function()
{
	return this.m_store.getState();
};
oFF.SuResourceExplorerStore.prototype.getResourceViewerMode = function()
{
	return this.getState().getViewerMode() !== null ? this.getState().getViewerMode() : oFF.SuResourceExplorerStore.RESOURCE_VIEWER_TILES;
};
oFF.SuResourceExplorerStore.prototype.isResourceViewerMode = function(modeToCheck)
{
	var mode = this.getResourceViewerMode();
	return oFF.XString.isEqual(mode, modeToCheck);
};
oFF.SuResourceExplorerStore.prototype.getBrowsedResource = function()
{
	return this.m_store.getState().getBrowsedResource();
};
oFF.SuResourceExplorerStore.prototype.getSelectedResource = function()
{
	return this.m_store.getState().getSelectedResource();
};
oFF.SuResourceExplorerStore.prototype.getResourceInfo = function()
{
	return this.m_store.getState().getResourceInfo();
};
oFF.SuResourceExplorerStore.prototype.getQuickFilter = function()
{
	return this.m_store.getState().getQuickFilter();
};
oFF.SuResourceExplorerStore.prototype.getSearchQuery = function()
{
	return this.m_store.getState().getSearchQuery();
};
oFF.SuResourceExplorerStore.prototype.getMessage = function()
{
	return this.m_store.getState().getMessage();
};
oFF.SuResourceExplorerStore.prototype.getResourceListToRender = function()
{
	if (this.getState().getResourceList() !== null)
	{
		return this.getState().getResourceList();
	}
	else
	{
		var itemToBrowse = this.getState().getBrowsedResource() !== null ? this.getState().getBrowsedResource() : this.getRootResource();
		if (oFF.notNull(itemToBrowse))
		{
			return itemToBrowse.getChildren();
		}
	}
	return null;
};
oFF.SuResourceExplorerStore.prototype.isStatus = function(status)
{
	return oFF.XString.isEqual(this.m_store.getState().getStatus(), status);
};
oFF.SuResourceExplorerStore.prototype.setResourceViewerMode = function(mode)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_RESOURCE_VIEWER_MODE, oFF.XStringValue.create(mode)));
};
oFF.SuResourceExplorerStore.prototype.setBrowsedResource = function(resource)
{
	if (!oFF.SuResourceNavigationHelper.hasFileRootAncestor(this.getRootResource(), resource))
	{
		this.setRootResource(resource);
	}
	var selectedResource = this.m_store.getState().getSelectedResource();
	if (oFF.notNull(selectedResource) && !oFF.SuResourceWrapper.areEquals(resource, selectedResource.getParent()))
	{
		this._setSelectedResource(null);
	}
	this._setBrowsedResource(resource);
};
oFF.SuResourceExplorerStore.prototype.setSelectedResource = function(resource)
{
	var browsedResource = this.m_store.getState().getBrowsedResource();
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	if (!this.m_app.isDatasourcePicker() && oFF.notNull(browsedResource) && oFF.notNull(resource))
	{
		var isDirectory = resourceWrapper.isResourceDirectory();
		if (isDirectory && !oFF.SuResourceWrapper.areEquals(browsedResource, resource) || !isDirectory && !oFF.SuResourceWrapper.areEquals(browsedResource, resource.getParent()))
		{
			this._setBrowsedResource(resource.getParent());
		}
	}
	this._setSelectedResource(resource);
};
oFF.SuResourceExplorerStore.prototype.setResourceInfo = function(resourceInfo)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_RESOURCE_INFO, resourceInfo));
};
oFF.SuResourceExplorerStore.prototype.setQuickFilter = function(quickFilterName)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_QUICK_FILTER, oFF.XStringValue.create(quickFilterName)));
};
oFF.SuResourceExplorerStore.prototype.setSearchQuery = function(query)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_SEARCH_QUERY, oFF.XStringValue.create(query)));
};
oFF.SuResourceExplorerStore.prototype.setMessage = function(message)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_MESSAGE, message));
};
oFF.SuResourceExplorerStore.prototype.setRootResource = function(resource)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_RESOURCE_ROOT, resource));
};
oFF.SuResourceExplorerStore.prototype.setBrowsedResourceRoot = function()
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE, this.getRootResource()));
};
oFF.SuResourceExplorerStore.prototype.setStatus = function(status)
{
	if (!this.isStatus(status))
	{
		this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_STATUS, oFF.XStringValue.create(status)));
		return true;
	}
	return false;
};
oFF.SuResourceExplorerStore.prototype.subscribe = function(consumer)
{
	return this.m_store.subscribe(consumer);
};
oFF.SuResourceExplorerStore.prototype.unsubscribe = function(consumer)
{
	this.m_store.unsubscribe(consumer);
};
oFF.SuResourceExplorerStore.prototype._setBrowsedResource = function(resource)
{
	if (!resource.isMetadataLoaded())
	{
		oFF.SuResourceWrapper.create(resource).promiseFetchMetadata().onFinally( function(){
			this.dispatchSetBrowsedResourceAction(resource);
		}.bind(this));
	}
	else
	{
		this.dispatchSetBrowsedResourceAction(resource);
	}
};
oFF.SuResourceExplorerStore.prototype.dispatchSetBrowsedResourceAction = function(resource)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE, resource));
};
oFF.SuResourceExplorerStore.prototype._setSelectedResource = function(resource)
{
	this.m_store.dispatch(oFF.SuResourceExplorerAction.create(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE, resource));
};

oFF.SuDetailsFileViewerReduxConsumer = function() {};
oFF.SuDetailsFileViewerReduxConsumer.prototype = new oFF.SuResourceViewerReduxConsumer();
oFF.SuDetailsFileViewerReduxConsumer.prototype._ff_c = "SuDetailsFileViewerReduxConsumer";

oFF.SuDetailsFileViewerReduxConsumer.create = function(store, config, filterManager)
{
	var newContentViewer = new oFF.SuDetailsFileViewerReduxConsumer();
	newContentViewer.setUp(store, config, filterManager);
	newContentViewer.m_storeSubcriptionEnabled = true;
	newContentViewer.m_fileViewer = oFF.SuDetailsFileViewer.create(config);
	return newContentViewer;
};
oFF.SuDetailsFileViewerReduxConsumer.prototype.m_fileViewer = null;
oFF.SuDetailsFileViewerReduxConsumer.prototype.m_storeSubcriptionEnabled = false;
oFF.SuDetailsFileViewerReduxConsumer.prototype.buildUI = function(container)
{
	this.m_fileViewer.renderView(container.getUiManager().getGenesis());
	this.m_fileViewer.getView().setHeight(oFF.UiCssLength.AUTO);
	this.m_fileViewer.attachOnClick(this.createClickCallback());
	this.setUpView(this.m_fileViewer.getView(), this.m_fileViewer);
	container.addItem(this.m_fileViewer.getView());
	this.storeSubscription();
	if (this.m_storeSubcriptionEnabled)
	{
		this.setResourceList(this.m_store.getState());
	}
};
oFF.SuDetailsFileViewerReduxConsumer.prototype.releaseObject = function()
{
	oFF.SuResourceViewerReduxConsumer.prototype.releaseObject.call( this );
	this.m_fileViewer = oFF.XObjectExt.release(this.m_fileViewer);
	this.m_store = null;
	this.m_config = null;
};
oFF.SuDetailsFileViewerReduxConsumer.prototype.enableStoreSubscription = function(enable)
{
	if (enable && this.m_storeSubcriptionEnabled || !enable && !this.m_storeSubcriptionEnabled)
	{
		return;
	}
	this.m_storeSubcriptionEnabled = enable;
	this.storeSubscription();
};
oFF.SuDetailsFileViewerReduxConsumer.prototype.createClickCallback = function()
{
	return  function(data){
		var dataTmp = data;
		var resource = dataTmp;
		if (oFF.notNull(resource))
		{
			var isDirectory = oFF.SuResourceWrapper.create(resource).isResourceDirectory();
			if (isDirectory && this.m_config.isNavigationEnabled())
			{
				this.m_store.setBrowsedResource(resource);
			}
			else if (!isDirectory)
			{
				this.m_store.setSelectedResource(resource);
			}
		}
	}.bind(this);
};
oFF.SuDetailsFileViewerReduxConsumer.prototype.storeSubscription = function()
{
	if (oFF.isNull(this.m_store))
	{
		return;
	}
	if (this.m_storeSubcriptionEnabled)
	{
		this.m_store.subscribe(this);
	}
	else
	{
		this.m_store.unsubscribe(this);
	}
};

oFF.SuDetailsResourceViewerReduxConsumer = function() {};
oFF.SuDetailsResourceViewerReduxConsumer.prototype = new oFF.SuResourceViewerReduxConsumer2();
oFF.SuDetailsResourceViewerReduxConsumer.prototype._ff_c = "SuDetailsResourceViewerReduxConsumer";

oFF.SuDetailsResourceViewerReduxConsumer.create = function(store, config, dataProvider)
{
	var newContentViewer = new oFF.SuDetailsResourceViewerReduxConsumer();
	newContentViewer.setUp(store, config, dataProvider);
	newContentViewer.m_storeSubcriptionEnabled = true;
	newContentViewer.m_fileViewer = oFF.SuDetailsResourceViewer.create(config, dataProvider);
	return newContentViewer;
};
oFF.SuDetailsResourceViewerReduxConsumer.prototype.m_fileViewer = null;
oFF.SuDetailsResourceViewerReduxConsumer.prototype.m_storeSubcriptionEnabled = false;
oFF.SuDetailsResourceViewerReduxConsumer.prototype.buildUI = function(container)
{
	this.m_fileViewer.renderView(container.getUiManager().getGenesis());
	this.m_fileViewer.attachOnSelect(this.createSelectCallback());
	this.setUpView(this.m_fileViewer.getView(), this.m_fileViewer);
	container.addItem(this.m_fileViewer.getView());
	this.storeSubscription();
};
oFF.SuDetailsResourceViewerReduxConsumer.prototype.releaseObject = function()
{
	oFF.SuResourceViewerReduxConsumer2.prototype.releaseObject.call( this );
	this.m_fileViewer = oFF.XObjectExt.release(this.m_fileViewer);
	this.m_store = null;
	this.m_config = null;
};
oFF.SuDetailsResourceViewerReduxConsumer.prototype.enableStoreSubscription = function(enable)
{
	if (enable && this.m_storeSubcriptionEnabled || !enable && !this.m_storeSubcriptionEnabled)
	{
		return;
	}
	this.m_storeSubcriptionEnabled = enable;
	this.storeSubscription();
};
oFF.SuDetailsResourceViewerReduxConsumer.prototype.createSelectCallback = function()
{
	return  function(data){
		var dataTmp = data;
		var resource = dataTmp;
		if (oFF.notNull(resource))
		{
			var isDirectory = oFF.SuResourceWrapper.create(resource).isResourceDirectory();
			if (isDirectory && this.m_config.isNavigationEnabled())
			{
				this.m_store.setBrowsedResource(resource);
			}
			else if (!isDirectory)
			{
				this.m_store.setSelectedResource(resource);
			}
		}
		else
		{
			this.m_store.setSelectedResource(null);
		}
	}.bind(this);
};
oFF.SuDetailsResourceViewerReduxConsumer.prototype.storeSubscription = function()
{
	if (oFF.isNull(this.m_store))
	{
		return;
	}
	if (this.m_storeSubcriptionEnabled)
	{
		this.m_store.subscribe(this);
	}
	else
	{
		this.m_store.unsubscribe(this);
	}
};

oFF.SuTileFileViewerReduxConsumer = function() {};
oFF.SuTileFileViewerReduxConsumer.prototype = new oFF.SuResourceViewerReduxConsumer();
oFF.SuTileFileViewerReduxConsumer.prototype._ff_c = "SuTileFileViewerReduxConsumer";

oFF.SuTileFileViewerReduxConsumer.create = function(container, store, fileHandler, filterManager)
{
	var newContentViewer = new oFF.SuTileFileViewerReduxConsumer();
	newContentViewer.setUp(store, null, filterManager);
	newContentViewer.m_fileHandler = fileHandler;
	newContentViewer.m_tileFileViewer = oFF.SuTileFileViewer.create();
	return newContentViewer;
};
oFF.SuTileFileViewerReduxConsumer.prototype.m_UIContainer = null;
oFF.SuTileFileViewerReduxConsumer.prototype.m_tileFileViewer = null;
oFF.SuTileFileViewerReduxConsumer.prototype.m_fileHandler = null;
oFF.SuTileFileViewerReduxConsumer.prototype.buildUI = function(container)
{
	this.m_UIContainer = container.addNewItemOfType(oFF.UiType.PAGE);
	this.m_UIContainer.setName("reTileResourceViewerContainer");
	this.m_UIContainer.setShowHeader(false);
	this.m_UIContainer.setShowNavButton(false);
	this.m_tileFileViewer.renderView(container.getUiManager().getGenesis());
	this.m_UIContainer.setContent(this.m_tileFileViewer.getView());
	this.setUpView(this.m_UIContainer, this.m_tileFileViewer);
	this.setResourceList(this.m_store.getState());
	this.m_tileFileViewer.setSelectedItem(this.m_store.getSelectedResource());
	this.m_tileFileViewer.attachOnClick( function(clickedResource){
		this.handleResourceClick(clickedResource);
	}.bind(this));
	this.m_tileFileViewer.attachOnDoubleClick( function(dblClickedResource){
		this.handleResourceDblClick(dblClickedResource);
	}.bind(this));
	this.m_tileFileViewer.attachOnContextMenu( function(ctxResource){
		this.handleResourceContextMenu(ctxResource);
	}.bind(this));
	oFF.SuResourceViewerReduxConsumer.prototype.buildUI.call( this , container);
};
oFF.SuTileFileViewerReduxConsumer.prototype.releaseObject = function()
{
	oFF.SuResourceViewerReduxConsumer.prototype.releaseObject.call( this );
	this.m_tileFileViewer = oFF.XObjectExt.release(this.m_tileFileViewer);
	this.m_fileHandler = null;
	this.m_store = null;
};
oFF.SuTileFileViewerReduxConsumer.prototype.handleResourceContextMenu = function(resource)
{
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	this.m_UIContainer.getUiManager().getGenesis().showAlert("Info", oFF.XStringUtils.concatenate2("Context menu clicked on ", resourceWrapper.getTranslatedDisplayName()), oFF.UiValueState.INFORMATION);
};
oFF.SuTileFileViewerReduxConsumer.prototype.handleResourceDblClick = function(resource)
{
	if (oFF.notNull(resource))
	{
		if (oFF.SuResourceWrapper.create(resource).isResourceDirectory())
		{
			this.m_store.setBrowsedResource(resource);
		}
		else
		{
			this.handleResource(resource);
		}
	}
};
oFF.SuTileFileViewerReduxConsumer.prototype.handleResourceClick = function(resource)
{
	if (oFF.notNull(resource))
	{
		this.m_store.setSelectedResource(resource);
	}
};
oFF.SuTileFileViewerReduxConsumer.prototype.handleResource = function(resource)
{
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	var didSuccess = false;
	var fileName = "N/A";
	if (oFF.notNull(this.m_fileHandler) && oFF.notNull(resource))
	{
		var feaExtension = oFF.FeApolloFileExtension.getApolloExtensionForFile(resource);
		didSuccess = this.m_fileHandler.handleFile(resource, resourceWrapper.extractNameNoExt(), feaExtension);
		fileName = resourceWrapper.getTranslatedDisplayName();
	}
	if (didSuccess === false)
	{
		this.m_UIContainer.getUiManager().getGenesis().showAlert("Error", oFF.XStringUtils.concatenate3("There was an error launching the file.", fileName, "Please try again!"), oFF.UiValueState.ERROR);
	}
};

oFF.AddMonthListener = function() {};
oFF.AddMonthListener.prototype = new oFF.XObject();
oFF.AddMonthListener.prototype._ff_c = "AddMonthListener";

oFF.AddMonthListener.create = function(calendarDialog)
{
	var obj = new oFF.AddMonthListener();
	obj.m_calendarDialog = calendarDialog;
	return obj;
};
oFF.AddMonthListener.prototype.m_calendarDialog = null;
oFF.AddMonthListener.prototype.onPress = function(event)
{
	this.m_calendarDialog.addOneMonth();
};

oFF.OpenMonthSelectionViewListener = function() {};
oFF.OpenMonthSelectionViewListener.prototype = new oFF.XObject();
oFF.OpenMonthSelectionViewListener.prototype._ff_c = "OpenMonthSelectionViewListener";

oFF.OpenMonthSelectionViewListener.create = function(uiGenesis, calendarDialog)
{
	var obj = new oFF.OpenMonthSelectionViewListener();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	return obj;
};
oFF.OpenMonthSelectionViewListener.prototype.m_uiGenesis = null;
oFF.OpenMonthSelectionViewListener.prototype.m_calendarDialog = null;
oFF.OpenMonthSelectionViewListener.prototype.onPress = function(event)
{
	var selectionView = oFF.MonthSelectionView.create(this.m_uiGenesis, this.m_calendarDialog);
	this.m_calendarDialog.replaceCalendarDialogContent(selectionView);
};

oFF.OpenMultiYearSelectionViewListener = function() {};
oFF.OpenMultiYearSelectionViewListener.prototype = new oFF.XObject();
oFF.OpenMultiYearSelectionViewListener.prototype._ff_c = "OpenMultiYearSelectionViewListener";

oFF.OpenMultiYearSelectionViewListener.create = function(uiGenesis, calendarDialog, uiModel)
{
	var obj = new oFF.OpenMultiYearSelectionViewListener();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	obj.m_uiModel = uiModel;
	return obj;
};
oFF.OpenMultiYearSelectionViewListener.prototype.m_uiGenesis = null;
oFF.OpenMultiYearSelectionViewListener.prototype.m_calendarDialog = null;
oFF.OpenMultiYearSelectionViewListener.prototype.m_uiModel = null;
oFF.OpenMultiYearSelectionViewListener.prototype.onPress = function(event)
{
	var selectionView = oFF.MultiYearSelectionView.create(this.m_uiGenesis, this.m_calendarDialog, this.m_uiModel);
	this.m_calendarDialog.replaceCalendarDialogContent(selectionView);
};

oFF.OpenYearSelectionViewListener = function() {};
oFF.OpenYearSelectionViewListener.prototype = new oFF.XObject();
oFF.OpenYearSelectionViewListener.prototype._ff_c = "OpenYearSelectionViewListener";

oFF.OpenYearSelectionViewListener.create = function(uiGenesis, calendarDialog, uiModel)
{
	var obj = new oFF.OpenYearSelectionViewListener();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	obj.m_uiModel = uiModel;
	return obj;
};
oFF.OpenYearSelectionViewListener.prototype.m_uiGenesis = null;
oFF.OpenYearSelectionViewListener.prototype.m_calendarDialog = null;
oFF.OpenYearSelectionViewListener.prototype.m_uiModel = null;
oFF.OpenYearSelectionViewListener.prototype.onPress = function(event)
{
	var selectionView = oFF.YearSelectionView.create(this.m_uiGenesis, this.m_calendarDialog, this.m_uiModel);
	this.m_calendarDialog.replaceCalendarDialogContent(selectionView);
};

oFF.SelectMonthListener = function() {};
oFF.SelectMonthListener.prototype = new oFF.XObject();
oFF.SelectMonthListener.prototype._ff_c = "SelectMonthListener";

oFF.SelectMonthListener.create = function(monthSelectionView, month)
{
	var obj = new oFF.SelectMonthListener();
	obj.m_month = month;
	obj.m_monthSelectionView = monthSelectionView;
	return obj;
};
oFF.SelectMonthListener.prototype.m_month = 0;
oFF.SelectMonthListener.prototype.m_monthSelectionView = null;
oFF.SelectMonthListener.prototype.onPress = function(event)
{
	this.m_monthSelectionView.selectMonth(this.m_month);
};

oFF.SelectYearListener = function() {};
oFF.SelectYearListener.prototype = new oFF.XObjectExt();
oFF.SelectYearListener.prototype._ff_c = "SelectYearListener";

oFF.SelectYearListener.create = function(yearSelectionView, year)
{
	var obj = new oFF.SelectYearListener();
	obj.m_year = year;
	obj.m_yearSelectionView = yearSelectionView;
	return obj;
};
oFF.SelectYearListener.prototype.m_year = 0;
oFF.SelectYearListener.prototype.m_yearSelectionView = null;
oFF.SelectYearListener.prototype.onPress = function(event)
{
	this.m_yearSelectionView.selectYear(this.m_year);
};

oFF.SubtractMonthListener = function() {};
oFF.SubtractMonthListener.prototype = new oFF.XObject();
oFF.SubtractMonthListener.prototype._ff_c = "SubtractMonthListener";

oFF.SubtractMonthListener.create = function(calendarDialog)
{
	var obj = new oFF.SubtractMonthListener();
	obj.m_calendarDialog = calendarDialog;
	return obj;
};
oFF.SubtractMonthListener.prototype.m_calendarDialog = null;
oFF.SubtractMonthListener.prototype.onPress = function(event)
{
	this.m_calendarDialog.subtractOneMonth();
};

oFF.MonthSelectionView = function() {};
oFF.MonthSelectionView.prototype = new oFF.XObject();
oFF.MonthSelectionView.prototype._ff_c = "MonthSelectionView";

oFF.MonthSelectionView.create = function(uiGenesis, calendarDialog)
{
	var obj = new oFF.MonthSelectionView();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	obj.m_year = calendarDialog.getYear();
	obj.initMonthNames();
	obj.buildUi();
	return obj;
};
oFF.MonthSelectionView.prototype.m_monthNames = null;
oFF.MonthSelectionView.prototype.m_uiGenesis = null;
oFF.MonthSelectionView.prototype.m_year = 0;
oFF.MonthSelectionView.prototype.m_calendarDialog = null;
oFF.MonthSelectionView.prototype.m_root = null;
oFF.MonthSelectionView.prototype.m_previousYearButton = null;
oFF.MonthSelectionView.prototype.m_yearButton = null;
oFF.MonthSelectionView.prototype.m_nextYearButton = null;
oFF.MonthSelectionView.prototype.m_monthsLayout = null;
oFF.MonthSelectionView.prototype.initMonthNames = function()
{
	this.m_monthNames = oFF.XArrayOfString.create(12);
	this.m_monthNames.set(0, "January");
	this.m_monthNames.set(1, "February");
	this.m_monthNames.set(2, "March");
	this.m_monthNames.set(3, "April");
	this.m_monthNames.set(4, "May");
	this.m_monthNames.set(5, "June");
	this.m_monthNames.set(6, "July");
	this.m_monthNames.set(7, "August");
	this.m_monthNames.set(8, "September");
	this.m_monthNames.set(9, "October");
	this.m_monthNames.set(10, "November");
	this.m_monthNames.set(11, "December");
};
oFF.MonthSelectionView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_root.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	var headerLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	headerLayout.setWidth(oFF.UiCssLength.create("100%"));
	headerLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.m_previousYearButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_previousYearButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_previousYearButton.setText("<");
	this.m_previousYearButton.setFlex("1");
	this.m_previousYearButton.registerOnPress(this);
	this.m_yearButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_yearButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_yearButton.setFlex("5");
	this.m_yearButton.setText(oFF.XInteger.convertToString(this.m_year));
	this.m_nextYearButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_nextYearButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_nextYearButton.setText(">");
	this.m_nextYearButton.setFlex("1");
	this.m_nextYearButton.registerOnPress(this);
	this.m_monthsLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_monthsLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_monthsLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	var i = 0;
	while (i < this.m_monthNames.size())
	{
		var rowLayout = this.m_monthsLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		rowLayout.setWidth(oFF.UiCssLength.create("100%"));
		for (var j = 0; j < 3; j++)
		{
			var selectMonthButton = rowLayout.addNewItemOfType(oFF.UiType.BUTTON);
			selectMonthButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
			selectMonthButton.setFlex("1");
			selectMonthButton.setText(this.m_monthNames.get(i));
			var selectMonthListener = oFF.SelectMonthListener.create(this, i + 1);
			selectMonthButton.registerOnPress(selectMonthListener);
			i++;
		}
	}
};
oFF.MonthSelectionView.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.MonthSelectionView.prototype.selectMonth = function(month)
{
	this.m_calendarDialog.selectMonth(this.m_year, month);
};
oFF.MonthSelectionView.prototype.onPress = function(event)
{
	if (event.getControl() === this.m_nextYearButton)
	{
		this.m_year = this.m_year + 1;
	}
	else if (event.getControl() === this.m_previousYearButton)
	{
		this.m_year = this.m_year - 1;
	}
	this.m_yearButton.setText(oFF.XInteger.convertToString(this.m_year));
};

oFF.MultiYearSelectionView = function() {};
oFF.MultiYearSelectionView.prototype = new oFF.XObject();
oFF.MultiYearSelectionView.prototype._ff_c = "MultiYearSelectionView";

oFF.MultiYearSelectionView.create = function(uiGenesis, calendarDialog, yearSelectionUiModel)
{
	var obj = new oFF.MultiYearSelectionView();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	obj.m_startingYear = yearSelectionUiModel.getYear();
	obj.buildMonthSelectionModels();
	obj.buildUi();
	return obj;
};
oFF.MultiYearSelectionView.prototype.m_uiGenesis = null;
oFF.MultiYearSelectionView.prototype.m_calendarDialog = null;
oFF.MultiYearSelectionView.prototype.m_monthSelectionModels = null;
oFF.MultiYearSelectionView.prototype.m_root = null;
oFF.MultiYearSelectionView.prototype.m_previousYearsButton = null;
oFF.MultiYearSelectionView.prototype.m_headerSpacer = null;
oFF.MultiYearSelectionView.prototype.m_nextYearsButton = null;
oFF.MultiYearSelectionView.prototype.m_yearsLayout = null;
oFF.MultiYearSelectionView.prototype.m_startingYear = 0;
oFF.MultiYearSelectionView.prototype.buildMonthSelectionModels = function()
{
	this.m_monthSelectionModels = oFF.XList.create();
	var year = this.m_startingYear - 20 * 4;
	for (var i = 0; i < 9; i++)
	{
		this.m_monthSelectionModels.add(oFF.YearSelectionUiModel.create(year));
		year = year + 20;
	}
};
oFF.MultiYearSelectionView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_root.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	var headerLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	headerLayout.setWidth(oFF.UiCssLength.create("100%"));
	headerLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.m_previousYearsButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_previousYearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_previousYearsButton.setText("<");
	this.m_previousYearsButton.setFlex("1");
	this.m_previousYearsButton.registerOnPress(this);
	this.m_headerSpacer = headerLayout.addNewItemOfType(oFF.UiType.SPACER);
	this.m_headerSpacer.setFlex("5");
	this.m_nextYearsButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_nextYearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_nextYearsButton.setText(">");
	this.m_nextYearsButton.setFlex("1");
	this.m_nextYearsButton.registerOnPress(this);
	this.m_yearsLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_yearsLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_yearsLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.refreshContent();
};
oFF.MultiYearSelectionView.prototype.refreshContent = function()
{
	var rows = this.m_yearsLayout.getItems();
	var rowsSize = rows.size();
	for (var i = rowsSize - 1; i >= 0; i--)
	{
		var row = rows.get(i);
		this.m_yearsLayout.removeItem(row);
		oFF.XObjectExt.release(row);
	}
	var index = 0;
	for (var rowIdx = 0; rowIdx < 3; rowIdx++)
	{
		var rowLayout = this.m_yearsLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		rowLayout.setWidth(oFF.UiCssLength.create("100%"));
		rowLayout.setDirection(oFF.UiFlexDirection.ROW);
		for (var columnIdx = 0; columnIdx < 3; columnIdx++)
		{
			var selectYearsButton = rowLayout.addNewItemOfType(oFF.UiType.BUTTON);
			selectYearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
			selectYearsButton.setFlex("1");
			selectYearsButton.setText(this.m_monthSelectionModels.get(index).toString());
			selectYearsButton.registerOnPress(oFF.OpenYearSelectionViewListener.create(this.m_uiGenesis, this.m_calendarDialog, this.m_monthSelectionModels.get(index)));
			index++;
		}
	}
};
oFF.MultiYearSelectionView.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.MultiYearSelectionView.prototype.onPress = function(event)
{
	if (event.getControl() === this.m_previousYearsButton)
	{
		this.m_startingYear = this.m_startingYear - 180;
	}
	else if (event.getControl() === this.m_nextYearsButton)
	{
		this.m_startingYear = this.m_startingYear + 180;
	}
	this.buildMonthSelectionModels();
	this.refreshContent();
};

oFF.YearSelectionView = function() {};
oFF.YearSelectionView.prototype = new oFF.XObject();
oFF.YearSelectionView.prototype._ff_c = "YearSelectionView";

oFF.YearSelectionView.create = function(uiGenesis, calendarDialog, uiModel)
{
	var obj = new oFF.YearSelectionView();
	obj.m_uiGenesis = uiGenesis;
	obj.m_calendarDialog = calendarDialog;
	obj.m_uiModel = uiModel;
	obj.buildUi();
	return obj;
};
oFF.YearSelectionView.prototype.m_uiGenesis = null;
oFF.YearSelectionView.prototype.m_calendarDialog = null;
oFF.YearSelectionView.prototype.m_uiModel = null;
oFF.YearSelectionView.prototype.m_root = null;
oFF.YearSelectionView.prototype.m_previousYearsButton = null;
oFF.YearSelectionView.prototype.m_yearsButton = null;
oFF.YearSelectionView.prototype.m_nextYearsButton = null;
oFF.YearSelectionView.prototype.m_yearsLayout = null;
oFF.YearSelectionView.prototype.buildUi = function()
{
	this.m_root = this.m_uiGenesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_root.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	var headerLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	headerLayout.setWidth(oFF.UiCssLength.create("100%"));
	headerLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.m_previousYearsButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_previousYearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_previousYearsButton.setText("<");
	this.m_previousYearsButton.setFlex("1");
	this.m_previousYearsButton.registerOnPress(this);
	this.m_yearsButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_yearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_yearsButton.setFlex("5");
	this.m_yearsButton.registerOnPress(oFF.OpenMultiYearSelectionViewListener.create(this.m_uiGenesis, this.m_calendarDialog, this.m_uiModel));
	this.m_nextYearsButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_nextYearsButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_nextYearsButton.setText(">");
	this.m_nextYearsButton.setFlex("1");
	this.m_nextYearsButton.registerOnPress(this);
	this.m_yearsLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_yearsLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_yearsLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.refreshContent();
};
oFF.YearSelectionView.prototype.refreshContent = function()
{
	var rows = this.m_yearsLayout.getItems();
	var rowsSize = rows.size();
	for (var i = rowsSize - 1; i >= 0; i--)
	{
		var row = rows.get(i);
		this.m_yearsLayout.removeItem(row);
		oFF.XObjectExt.release(row);
	}
	this.m_yearsButton.setText(this.m_uiModel.toString());
	var year = this.m_uiModel.getFirstYear();
	for (var rowIdx = 0; rowIdx < 5; rowIdx++)
	{
		var rowLayout = this.m_yearsLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		rowLayout.setWidth(oFF.UiCssLength.create("100%"));
		rowLayout.setDirection(oFF.UiFlexDirection.ROW);
		for (var columnIdx = 0; columnIdx < 4; columnIdx++)
		{
			var selectYearButton = rowLayout.addNewItemOfType(oFF.UiType.BUTTON);
			selectYearButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
			selectYearButton.setFlex("1");
			selectYearButton.setText(oFF.XInteger.convertToString(year));
			var selectYearListener = oFF.SelectYearListener.create(this, year);
			selectYearButton.registerOnPress(selectYearListener);
			year++;
		}
	}
};
oFF.YearSelectionView.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.YearSelectionView.prototype.selectYear = function(year)
{
	this.m_calendarDialog.selectYear(year);
};
oFF.YearSelectionView.prototype.onPress = function(event)
{
	if (event.getControl() === this.m_previousYearsButton)
	{
		this.m_uiModel.subtractYears();
	}
	else if (event.getControl() === this.m_nextYearsButton)
	{
		this.m_uiModel.addYears();
	}
	this.refreshContent();
};

oFF.UiCredentialsProviderHelper = function() {};
oFF.UiCredentialsProviderHelper.prototype = new oFF.XObjectExt();
oFF.UiCredentialsProviderHelper.prototype._ff_c = "UiCredentialsProviderHelper";

oFF.UiCredentialsProviderHelper.hasAuthenticationFailed = function(messages)
{
	return oFF.XStream.of(messages).anyMatch( function(message){
		return message.getCode() === oFF.ErrorCodes.BASIC_AUTHENTICATION_CANCELED || message.getCode() === oFF.HttpErrorCode.HTTP_SAML_AUTHENTICATION_FAILED || message.getCode() === oFF.HttpErrorCode.HTTP_SAML_TIMEOUT || message.getCode() === oFF.HttpErrorCode.HTTP_SAML_POPUP_BLOCKED;
	}.bind(this));
};
oFF.UiCredentialsProviderHelper.handleAuthenticationErrors = function(genesis, messages)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	oFF.XStream.of(messages).forEach( function(message){
		if (message.getCode() === oFF.HttpErrorCode.HTTP_SAML_TIMEOUT)
		{
			genesis.showErrorToast(i18nProvider.getText(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_TIMEOUT_REACHED));
		}
		else if (message.getCode() === oFF.HttpErrorCode.HTTP_SAML_POPUP_BLOCKED)
		{
			genesis.showErrorToast(i18nProvider.getText(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_BLOCKED));
		}
	}.bind(this));
};

oFF.FeApolloView = function() {};
oFF.FeApolloView.prototype = new oFF.XObject();
oFF.FeApolloView.prototype._ff_c = "FeApolloView";

oFF.FeApolloView.TREE_FOLDER_ICON_NAME = "folder-full";
oFF.FeApolloView.TOOLBAR_ITEM_SPACING = "10px";
oFF.FeApolloView.APOLLO_SHOW_HIDDEN_ITEMS_KEY = "showHiddenItems";
oFF.FeApolloView.APOLLO_ITEMS_SORT_DIRECTION_KEY = "itemsSortDirection";
oFF.FeApolloView.create = function(directoryManager, fileHandler, genesis, apolloPrg)
{
	var newView = new oFF.FeApolloView();
	if (oFF.isNull(directoryManager))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Apollo View instance without a directoryManager. Please sepcify a directoryManager!");
	}
	if (oFF.isNull(fileHandler))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Apollo View instance without a fileHandler. Please sepcify a fileHandler!");
	}
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Apollo View instance without a genesis. Please sepcify a genesis!");
	}
	if (oFF.isNull(apolloPrg))
	{
		throw oFF.XException.createRuntimeException("Apollo program instance is requiried to create an Apollo View. Please sepcify an Apollo Program instance!");
	}
	newView.setupView(directoryManager, fileHandler, genesis, apolloPrg);
	return newView;
};
oFF.FeApolloView.prototype.m_directoryManager = null;
oFF.FeApolloView.prototype.m_fileHandler = null;
oFF.FeApolloView.prototype.m_genesis = null;
oFF.FeApolloView.prototype.m_application = null;
oFF.FeApolloView.prototype.m_mainLayout = null;
oFF.FeApolloView.prototype.m_tileContainerWrapper = null;
oFF.FeApolloView.prototype.m_hierrarchyTree = null;
oFF.FeApolloView.prototype.m_activeHierrarchyTreeItem = null;
oFF.FeApolloView.prototype.m_statusBarWrapper = null;
oFF.FeApolloView.prototype.m_statusLabel = null;
oFF.FeApolloView.prototype.m_homeToolbarBtn = null;
oFF.FeApolloView.prototype.m_previousToolbarBtn = null;
oFF.FeApolloView.prototype.m_nextToolbarBtn = null;
oFF.FeApolloView.prototype.m_upOneLevelToolbarBtn = null;
oFF.FeApolloView.prototype.m_refreshToolbarBtn = null;
oFF.FeApolloView.prototype.m_subHeaderBreadcrumbPathLbl = null;
oFF.FeApolloView.prototype.m_apolloListener = null;
oFF.FeApolloView.prototype.m_directoryHistory = null;
oFF.FeApolloView.prototype.m_folderIconSrc = null;
oFF.FeApolloView.prototype.m_fileIconSrc = null;
oFF.FeApolloView.prototype.m_showHiddenItems = true;
oFF.FeApolloView.prototype.m_itemsSortDirection = null;
oFF.FeApolloView.prototype.m_itemToCopy = null;
oFF.FeApolloView.prototype.m_itemToCut = null;
oFF.FeApolloView.prototype.releaseObject = function()
{
	this.m_itemToCopy = null;
	this.m_itemToCut = null;
	this.m_directoryManager = null;
	this.m_fileHandler = null;
	this.m_genesis = null;
	this.m_application = null;
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	this.m_tileContainerWrapper = oFF.XObjectExt.release(this.m_tileContainerWrapper);
	this.m_hierrarchyTree = oFF.XObjectExt.release(this.m_hierrarchyTree);
	this.m_activeHierrarchyTreeItem = oFF.XObjectExt.release(this.m_activeHierrarchyTreeItem);
	this.m_statusBarWrapper = oFF.XObjectExt.release(this.m_statusBarWrapper);
	this.m_statusLabel = oFF.XObjectExt.release(this.m_statusLabel);
	this.m_homeToolbarBtn = oFF.XObjectExt.release(this.m_homeToolbarBtn);
	this.m_previousToolbarBtn = oFF.XObjectExt.release(this.m_previousToolbarBtn);
	this.m_nextToolbarBtn = oFF.XObjectExt.release(this.m_nextToolbarBtn);
	this.m_upOneLevelToolbarBtn = oFF.XObjectExt.release(this.m_upOneLevelToolbarBtn);
	this.m_refreshToolbarBtn = oFF.XObjectExt.release(this.m_refreshToolbarBtn);
	this.m_subHeaderBreadcrumbPathLbl = oFF.XObjectExt.release(this.m_subHeaderBreadcrumbPathLbl);
	this.m_directoryHistory = oFF.XObjectExt.release(this.m_directoryHistory);
	this.m_apolloListener = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.FeApolloView.prototype.getMainLayout = function()
{
	return this.m_mainLayout;
};
oFF.FeApolloView.prototype.setApolloListener = function(listener)
{
	this.m_apolloListener = listener;
};
oFF.FeApolloView.prototype.handleFileMenu = function(fileMenuBtn)
{
	this.createFileMenu(fileMenuBtn);
};
oFF.FeApolloView.prototype.handleViewMenu = function(viewMenuBtn)
{
	this.createViewMenu(viewMenuBtn);
};
oFF.FeApolloView.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.FeApolloView.prototype.setupView = function(directoryManager, fileHandler, genesis, apolloPrg)
{
	this.m_directoryManager = directoryManager;
	this.m_fileHandler = fileHandler;
	this.m_genesis = genesis;
	this.m_application = apolloPrg.getApplication();
	this.m_directoryHistory = oFF.FeApolloDirectoryNavigationHistory.createDirectoryHistory();
	if (apolloPrg.getProcess().getEnvironment().hasVariable(oFF.XEnvironmentConstants.FIREFLY_MIMES))
	{
		this.m_folderIconSrc = apolloPrg.getSession().resolvePath("${ff_mimes}/images/apolloFileExplorer/folder.png");
		this.m_fileIconSrc = apolloPrg.getSession().resolvePath("${ff_mimes}/images/apolloFileExplorer/file.png");
	}
	this.m_itemsSortDirection = oFF.XSortDirection.ASCENDING;
	this.m_showHiddenItems = true;
	this.initSettings();
	if (oFF.notNull(this.m_genesis))
	{
		this.buildView(this.m_genesis);
	}
};
oFF.FeApolloView.prototype.buildView = function(genesis)
{
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.setName("feMainLayout");
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.m_mainLayout.setBackgroundColor(oFF.UiColor.create("#f9fafc"));
	if (this.m_directoryManager.getActiveDirectory() === null)
	{
		this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		var noActiveFileSystemLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		noActiveFileSystemLbl.setText("No active file system found!");
		noActiveFileSystemLbl.setFontSize(oFF.UiCssLength.create("19px"));
		noActiveFileSystemLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		return;
	}
	this.createHeaderToolbar(this.m_mainLayout);
	var viewLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	viewLayout.setName("feViewLayout");
	viewLayout.useMaxWidth();
	viewLayout.setHeight(oFF.UiCssLength.create("calc(100% - 40px - 25px)"));
	viewLayout.setDirection(oFF.UiFlexDirection.ROW);
	viewLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	viewLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	viewLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	viewLayout.registerOnFileDrop(this);
	this.m_hierrarchyTree = viewLayout.addNewItemOfType(oFF.UiType.TREE);
	this.m_hierrarchyTree.setName("feNavView");
	this.m_hierrarchyTree.setHeight(oFF.UiCssLength.create("100%"));
	this.m_hierrarchyTree.setWidth(oFF.UiCssLength.create("200px"));
	this.m_hierrarchyTree.setFlex("200px 0 0");
	this.m_hierrarchyTree.registerOnSelect(this);
	this.m_hierrarchyTree.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.m_hierrarchyTree.setBorderColor(oFF.UiColor.create("rgb(204, 204, 204)"));
	this.m_hierrarchyTree.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_hierrarchyTree.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	var rootItem = this.m_hierrarchyTree.addNewItem();
	rootItem.setText("/");
	rootItem.setIcon("folder-full");
	rootItem.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create( function(controlEvent){
		this.presentTreeItemContextMenu(controlEvent);
	}.bind(this)));
	this.m_activeHierrarchyTreeItem = rootItem;
	this.m_directoryManager.getRootDirectory().setAssociatedTreeItem(rootItem);
	this.m_activeHierrarchyTreeItem.setCustomObject(this.m_directoryManager.getRootDirectory());
	this.m_activeHierrarchyTreeItem.setSelected(true);
	this.m_tileContainerWrapper = viewLayout.addNewItemOfType(oFF.UiType.PAGE);
	this.m_tileContainerWrapper.setName("feDirViewArea");
	this.m_tileContainerWrapper.setShowHeader(false);
	this.m_tileContainerWrapper.setShowNavButton(false);
	var tileView = this.m_tileContainerWrapper.setNewContent(oFF.UiType.TILE_CONTAINER);
	tileView.setName("apolloTileContainer");
	tileView.registerOnClick(this);
	tileView.registerOnContextMenu(this);
	tileView.useMaxSpace();
	this.m_statusBarWrapper = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_statusBarWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_statusBarWrapper.addCssClass("apolloStatusBarWrapper");
	this.m_statusBarWrapper.setFlex("0 0 25px");
	this.m_statusBarWrapper.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	this.m_statusBarWrapper.setPadding(oFF.UiCssBoxEdges.create("5px"));
	this.m_statusBarWrapper.setMaxHeight(oFF.UiCssLength.create("25px"));
	this.m_statusBarWrapper.setBorderColor(oFF.UiColor.create("rgb(204, 204, 204)"));
	this.m_statusBarWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_statusBarWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("1px 0px 0px 0px"));
	this.m_statusLabel = this.m_statusBarWrapper.addNewItemOfType(oFF.UiType.LABEL);
	this.m_statusLabel.setFlex("auto");
	this.setBusy(true);
	this.renderActiveDirectoryContent();
	this.renderInitialHierarchyTree();
	this.handleDirectoryHistoryUpdate();
	this.setBusy(false);
};
oFF.FeApolloView.prototype.createHeaderToolbar = function(mainLayout)
{
	var headerToolbar = mainLayout.addNewItemOfType(oFF.UiType.OVERFLOW_TOOLBAR);
	headerToolbar.setName("headerToolbar");
	headerToolbar.setWidth(oFF.UiCssLength.create("100%"));
	headerToolbar.setHeight(oFF.UiCssLength.create("40px"));
	headerToolbar.setPadding(oFF.UiCssBoxEdges.create("0px"));
	headerToolbar.setFlex("0 0 40px");
	var headerToolbarLayout = headerToolbar.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerToolbarLayout.setName("headerToolbarLayout");
	headerToolbarLayout.useMaxSpace();
	headerToolbarLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	headerToolbarLayout.setBackgroundColor(oFF.UiColor.WHITE);
	this.m_homeToolbarBtn = headerToolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_homeToolbarBtn.setName("homeToolbarBtn");
	this.m_homeToolbarBtn.setIcon("home");
	this.m_homeToolbarBtn.registerOnPress(this);
	var homePrevSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	homePrevSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	this.m_previousToolbarBtn = headerToolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_previousToolbarBtn.setName("previousToolbarBtn");
	this.m_previousToolbarBtn.setIcon("arrow-left");
	this.m_previousToolbarBtn.setEnabled(false);
	this.m_previousToolbarBtn.registerOnPress(this);
	var prevNextSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	prevNextSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	this.m_nextToolbarBtn = headerToolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_nextToolbarBtn.setName("nextToolbarBtn");
	this.m_nextToolbarBtn.setIcon("arrow-right");
	this.m_nextToolbarBtn.setEnabled(false);
	this.m_nextToolbarBtn.registerOnPress(this);
	var nextUpSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	nextUpSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	this.m_upOneLevelToolbarBtn = headerToolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_upOneLevelToolbarBtn.setName("upOneLevelToolbarBtn");
	this.m_upOneLevelToolbarBtn.setIcon("arrow-top");
	this.m_upOneLevelToolbarBtn.registerOnPress(this);
	var upSeparatorSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	upSeparatorSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	var addtitionalActionSectionSeparator = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	addtitionalActionSectionSeparator.setWidth(oFF.UiCssLength.create("1px"));
	addtitionalActionSectionSeparator.setHeight(oFF.UiCssLength.create("60%"));
	addtitionalActionSectionSeparator.setBackgroundColor(oFF.UiColor.create("#999999"));
	var separatorRefreshSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	separatorRefreshSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	this.m_refreshToolbarBtn = headerToolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_refreshToolbarBtn.setName("refreshToolbarBtn");
	this.m_refreshToolbarBtn.setIcon("refresh");
	this.m_refreshToolbarBtn.setTooltip("Refresh active directory");
	this.m_refreshToolbarBtn.registerOnPress(this);
	var refreshSeparatorSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	refreshSeparatorSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	var buttonBreadcrumpSectionSeparator = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	buttonBreadcrumpSectionSeparator.setWidth(oFF.UiCssLength.create("1px"));
	buttonBreadcrumpSectionSeparator.setHeight(oFF.UiCssLength.create("60%"));
	buttonBreadcrumpSectionSeparator.setBackgroundColor(oFF.UiColor.create("#999999"));
	var separatorPathSpacer = headerToolbarLayout.addNewItemOfType(oFF.UiType.SPACER);
	separatorPathSpacer.setWidth(oFF.UiCssLength.create(oFF.FeApolloView.TOOLBAR_ITEM_SPACING));
	this.m_subHeaderBreadcrumbPathLbl = headerToolbarLayout.addNewItemOfType(oFF.UiType.LABEL);
	this.m_subHeaderBreadcrumbPathLbl.setName("breadcrumbPathLbl");
	this.m_subHeaderBreadcrumbPathLbl.setWidth(oFF.UiCssLength.create("100%"));
	this.m_subHeaderBreadcrumbPathLbl.setFontSize(oFF.UiCssLength.create("15px"));
	this.m_subHeaderBreadcrumbPathLbl.setText("/");
};
oFF.FeApolloView.prototype.getTileContainer = function()
{
	return this.m_tileContainerWrapper.getContent();
};
oFF.FeApolloView.prototype.setBusy = function(busy)
{
	if (oFF.notNull(this.m_mainLayout))
	{
		this.m_mainLayout.setBusy(busy);
	}
};
oFF.FeApolloView.prototype.showActionErrorToast = function(message, error)
{
	var finalMessage = message;
	if (oFF.notNull(error))
	{
		finalMessage = oFF.XStringUtils.concatenate3(finalMessage, " ", error.getText());
	}
	this.showWarningToastWithMessage(finalMessage);
};
oFF.FeApolloView.prototype.renderActiveDirectoryContent = function()
{
	var tileView = this.getTileContainer();
	tileView.clearItems();
	var activeDir = this.m_directoryManager.getActiveDirectory();
	var childItems = activeDir.getChildItems();
	childItems.sortByDirection(this.m_itemsSortDirection);
	var childIterator = childItems.getIterator();
	var renderedItems = 0;
	while (childIterator.hasNext())
	{
		var apolloItem = childIterator.next();
		if (this.m_showHiddenItems === false && apolloItem.isHidden())
		{
			continue;
		}
		var name = apolloItem.getName();
		var extension = null;
		var iconSrc = apolloItem.isDirectory() ? this.m_folderIconSrc : this.m_fileIconSrc;
		if (apolloItem.isDirectory() === false)
		{
			var tmpfile = apolloItem;
			extension = tmpfile.getApolloFileExtension().getExtension();
			if (tmpfile.isExecutable())
			{
				var tmpFileIconSrc = tmpfile.getResolvedFileIconPath(this.m_application.getSession());
				if (oFF.XStringUtils.isNotNullAndNotEmpty(tmpFileIconSrc))
				{
					iconSrc = tmpFileIconSrc;
					extension = null;
				}
			}
		}
		var newFileIcon = tileView.addNewItemOfType(oFF.UiType.FILE_ICON);
		newFileIcon.setText(name);
		newFileIcon.setTooltip(name);
		newFileIcon.setDescription(extension);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(iconSrc))
		{
			newFileIcon.setSrc(iconSrc);
		}
		else
		{
			newFileIcon.addCssClass(apolloItem.isDirectory() ? "ff-folder" : "ff-icon");
		}
		newFileIcon.registerOnContextMenu(this);
		newFileIcon.registerOnDoubleClick(this);
		newFileIcon.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
			this.selectFileIcon(controlEvent.getControl());
		}.bind(this)));
		newFileIcon.setCustomObject(apolloItem);
		if (apolloItem.isHidden())
		{
			newFileIcon.setOpacity(0.75);
		}
		renderedItems++;
	}
	var itemsStr = " items";
	if (renderedItems === 1)
	{
		itemsStr = " item";
	}
	this.setStatusMessage(oFF.XStringUtils.concatenate2(oFF.XInteger.convertToString(renderedItems), itemsStr));
	this.updateToolbarItems();
};
oFF.FeApolloView.prototype.recursiveRenderDirectoryHierarchyTree = function(dirToRender)
{
	this.m_activeHierrarchyTreeItem = dirToRender.getAssociatedTreeItem();
	if (oFF.notNull(this.m_activeHierrarchyTreeItem))
	{
		if (this.m_activeHierrarchyTreeItem.hasItems() === false)
		{
			var childItems = dirToRender.getChildItems();
			var childIterator = childItems.getIterator();
			while (childIterator.hasNext())
			{
				var apolloItem = childIterator.next();
				if (apolloItem.isDirectory())
				{
					var apolloDir = apolloItem;
					this.addNewHierarchyTreeDirectory(apolloDir, dirToRender);
				}
			}
		}
		this.m_activeHierrarchyTreeItem.setSelected(true);
		this.m_activeHierrarchyTreeItem.expand();
	}
};
oFF.FeApolloView.prototype.addNewHierarchyTreeDirectory = function(apolloDir, activeDir)
{
	if (oFF.notNull(apolloDir) && oFF.notNull(activeDir))
	{
		var name = apolloDir.getName();
		var newTreeItem = this.m_activeHierrarchyTreeItem.addNewItem().setText(name).setIcon(oFF.FeApolloView.TREE_FOLDER_ICON_NAME).registerOnClick(this).setCustomObject(apolloDir);
		newTreeItem.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create( function(controlEvent){
			this.presentTreeItemContextMenu(controlEvent);
		}.bind(this)));
		apolloDir.setAssociatedTreeItem(newTreeItem);
		if (apolloDir.isContentLoaded() && activeDir !== this.m_directoryManager.getActiveDirectory())
		{
			this.recursiveRenderDirectoryHierarchyTree(apolloDir);
			this.m_activeHierrarchyTreeItem.setSelected(true);
		}
	}
};
oFF.FeApolloView.prototype.renderInitialHierarchyTree = function()
{
	var rootDir = this.m_directoryManager.getRootDirectory();
	this.recursiveRenderDirectoryHierarchyTree(rootDir);
};
oFF.FeApolloView.prototype.renderActiveDirectoryHierarchyTree = function()
{
	var activeDir = this.m_directoryManager.getActiveDirectory();
	this.recursiveRenderDirectoryHierarchyTree(activeDir);
};
oFF.FeApolloView.prototype.updateActiveDirectoryHierarchyTree = function(apolloItem)
{
	var activeDir = this.m_directoryManager.getActiveDirectory();
	if (oFF.isNull(apolloItem))
	{
		var lastApolloItem = activeDir.getChildItems().get(activeDir.getChildItems().size() - 1);
		if (lastApolloItem.isDirectory() && lastApolloItem.getAssociatedTreeItem() === null)
		{
			var apolloDir = lastApolloItem;
			this.addNewHierarchyTreeDirectory(apolloDir, activeDir);
		}
	}
	else if (apolloItem.isDirectory() === true)
	{
		if (apolloItem.getAssociatedTreeItem() !== null)
		{
			var treeItem = apolloItem.getAssociatedTreeItem();
			if (treeItem.getParent() !== null)
			{
				treeItem.getParent().removeItem(treeItem);
			}
		}
		else
		{
			var newDir = apolloItem;
			this.addNewHierarchyTreeDirectory(newDir, activeDir);
		}
	}
};
oFF.FeApolloView.prototype.createNewDirectoryItem = function(name, isFile)
{
	this.setBusy(true);
	return this.m_directoryManager.createNewItemInActiveDirectory(name, isFile).then( function(result){
		this.renderActiveDirectoryContent();
		if (isFile === false)
		{
			this.updateActiveDirectoryHierarchyTree(null);
		}
		return result;
	}.bind(this),  function(err){
		var warningMsg = "Failed to create folder!";
		if (isFile === true)
		{
			warningMsg = "Failed to create file!";
		}
		this.showActionErrorToast(warningMsg, err);
	}.bind(this)).onFinally( function(){
		this.setBusy(false);
	}.bind(this));
};
oFF.FeApolloView.prototype.deleteApolloItem = function(apolloItem)
{
	this.setBusy(true);
	return this.m_directoryManager.deleteApolloItemFromActiveDirectory(apolloItem).then( function(result){
		this.renderActiveDirectoryContent();
		if (apolloItem.isDirectory() === true)
		{
			this.updateActiveDirectoryHierarchyTree(apolloItem);
		}
		return result;
	}.bind(this),  function(err){
		var warningMsg = oFF.XStringUtils.concatenate2("Failed to delete the file with name ", apolloItem.getName());
		if (apolloItem.isDirectory() === true)
		{
			warningMsg = oFF.XStringUtils.concatenate2("Failed to delete the folder with name ", apolloItem.getName());
		}
		this.showActionErrorToast(warningMsg, err);
	}.bind(this)).onFinally( function(){
		this.setBusy(false);
	}.bind(this));
};
oFF.FeApolloView.prototype.renameDirectoryItem = function(apolloItem, newName)
{
	this.setBusy(true);
	return this.m_directoryManager.renameApolloItemInActiveDirectory(apolloItem, newName).then( function(result){
		this.renderActiveDirectoryContent();
		if (apolloItem.isDirectory() === true)
		{
			this.updateActiveDirectoryHierarchyTree(apolloItem);
			this.updateActiveDirectoryHierarchyTree(null);
		}
		return result;
	}.bind(this),  function(err){
		this.showActionErrorToast("Failed to rename item!", err);
	}.bind(this)).onFinally( function(){
		this.setBusy(false);
	}.bind(this));
};
oFF.FeApolloView.prototype.duplicateApolloItem = function(apolloItem)
{
	this.setBusy(true);
	this.m_directoryManager.duplicateApolloItem(apolloItem).then( function(newApolloItem){
		this.renderActiveDirectoryContent();
		if (apolloItem.isDirectory() === true)
		{
			this.updateActiveDirectoryHierarchyTree(apolloItem);
		}
		return newApolloItem;
	}.bind(this),  function(err){
		this.showActionErrorToast("Failed to duplicate item!", err);
	}.bind(this)).onFinally( function(){
		this.setBusy(false);
	}.bind(this));
};
oFF.FeApolloView.prototype.copyApolloItemIntoDir = function(destinationDir)
{
	if (oFF.notNull(destinationDir) && oFF.notNull(this.m_itemToCopy))
	{
		this.setBusy(true);
		this.m_directoryManager.copyApolloItemToDir(this.m_itemToCopy, destinationDir).then( function(newApolloItem){
			this.renderActiveDirectoryContent();
			return newApolloItem;
		}.bind(this),  function(err){
			this.showActionErrorToast("Failed to copy file!", err);
		}.bind(this)).onFinally( function(){
			this.setBusy(false);
		}.bind(this));
	}
};
oFF.FeApolloView.prototype.moveApolloItemIntoDir = function(destinationDir)
{
	if (oFF.notNull(destinationDir) && oFF.notNull(this.m_itemToCut) && destinationDir !== this.m_itemToCut.getParentDir())
	{
		this.setBusy(true);
		this.m_directoryManager.moveApolloItemToDir(this.m_itemToCut, destinationDir).then( function(movedApolloItem){
			this.renderActiveDirectoryContent();
			this.m_itemToCut = null;
			return movedApolloItem;
		}.bind(this),  function(err){
			this.showActionErrorToast("Failed to move file!", err);
		}.bind(this)).onFinally( function(){
			this.setBusy(false);
		}.bind(this));
	}
};
oFF.FeApolloView.prototype.handleApolloItemPasteIntoDir = function(destinationDir)
{
	if (oFF.notNull(destinationDir))
	{
		if (oFF.notNull(this.m_itemToCopy))
		{
			this.copyApolloItemIntoDir(destinationDir);
		}
		else if (oFF.notNull(this.m_itemToCut))
		{
			this.moveApolloItemIntoDir(destinationDir);
		}
	}
};
oFF.FeApolloView.prototype.openCreateNewItemDialog = function(isFile)
{
	var title = "New folder";
	var placeholder = "Enter the new folder name";
	if (isFile)
	{
		title = "New file";
		placeholder = "Enter the new file name";
	}
	var newItemName = this.m_directoryManager.getNextFreeItemNameForActiveDir(title);
	var createNewPopup = oFF.UtInputPopup.create(this.getGenesis(), title, null);
	createNewPopup.setOkButtonText("Create");
	createNewPopup.setOkButtonType(oFF.UiButtonType.PRIMARY);
	createNewPopup.setInputPlaceholder(placeholder);
	createNewPopup.setInputValue(newItemName);
	createNewPopup.setInputConsumer( function(inputStr){
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inputStr))
		{
			this.createNewDirectoryItem(inputStr, isFile);
		}
		else
		{
			var warningMsg2 = "Please specify a folder name";
			if (isFile)
			{
				warningMsg2 = "Please specify a file name";
			}
			this.showWarningToastWithMessage(warningMsg2);
		}
	}.bind(this));
	createNewPopup.open();
	createNewPopup.selectText(0, oFF.XString.size(newItemName));
};
oFF.FeApolloView.prototype.openDeleteItemDialog = function(apolloItem)
{
	var title = "Delete folder";
	var text = oFF.XStringUtils.concatenate3("Are you sure that you want to delete the folder ", apolloItem.getName(), " and its content? This cannot be undone!");
	if (apolloItem.isDirectory() === false)
	{
		title = "Delete file";
		text = oFF.XStringUtils.concatenate3("Are you sure that you want to delete the file ", apolloItem.getName(), "? This cannot be undone!");
	}
	var confirmDeletePopup = oFF.UtConfirmPopup.create(this.getGenesis(), title, text);
	confirmDeletePopup.setConfirmButtonText("Delete");
	confirmDeletePopup.setConfirmButtonIcon("delete");
	confirmDeletePopup.setConfirmButtonType(oFF.UiButtonType.DESTRUCTIVE);
	confirmDeletePopup.setConfirmProcedure( function(){
		this.deleteApolloItem(apolloItem);
	}.bind(this));
	confirmDeletePopup.open();
};
oFF.FeApolloView.prototype.openRenameItemDialog = function(apolloItem)
{
	var title = "Rename folder";
	if (apolloItem.isDirectory() === false)
	{
		title = "Rename file";
	}
	var renameItemPopup = oFF.UtInputPopup.create(this.getGenesis(), title, null);
	renameItemPopup.setOkButtonText("Rename");
	renameItemPopup.setOkButtonType(oFF.UiButtonType.PRIMARY);
	renameItemPopup.setInputPlaceholder("Please enter a new name");
	renameItemPopup.setInputValue(apolloItem.getName());
	renameItemPopup.setInputConsumer( function(inputStr){
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inputStr))
		{
			this.renameDirectoryItem(apolloItem, inputStr);
		}
		else
		{
			this.showWarningToastWithMessage("Please specify a new name!");
		}
	}.bind(this));
	renameItemPopup.open();
	var lastDotIndex = oFF.XString.lastIndexOf(apolloItem.getName(), ".");
	if (lastDotIndex > 0)
	{
		renameItemPopup.selectText(0, lastDotIndex);
	}
	else
	{
		renameItemPopup.selectText(0, oFF.XString.size(apolloItem.getName()));
	}
};
oFF.FeApolloView.prototype.createTileItemContextMenu = function(fileIcon)
{
	var apolloItem = fileIcon.getCustomObject();
	var contextMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	contextMenu.setName("tileContextMenu");
	contextMenu.addNewItem().setName("contextMenuOpen").setText("Open").setIcon(apolloItem.isDirectory() ? "open-folder" : "show").registerOnPress(this).setCustomObject(fileIcon);
	if (apolloItem.isDirectory() === false)
	{
		var apolloFile = apolloItem;
		var openWithMenuItem = contextMenu.addNewItem().setName("contextMenuOpenWith");
		openWithMenuItem.setText("Open with...");
		openWithMenuItem.setIcon("action");
		openWithMenuItem.setCustomObject(fileIcon);
		var defaultApolloExtension = apolloFile.getApolloFileExtension();
		var defaultFriendlyName = oFF.XStringUtils.concatenate2(defaultApolloExtension.getFriendlyName(), " (Default)");
		openWithMenuItem.addNewItem().setText(defaultFriendlyName).registerOnPress(this).setCustomObject(defaultApolloExtension);
		var additionalProgramsIterator = defaultApolloExtension.getAdditionalApolloExtensions().getIterator();
		while (additionalProgramsIterator.hasNext())
		{
			var tmpApolloExtension = additionalProgramsIterator.next();
			var friendlyName = tmpApolloExtension.getFriendlyName();
			openWithMenuItem.addNewItem().setText(friendlyName).registerOnPress(this).setCustomObject(tmpApolloExtension);
		}
		if (openWithMenuItem.getItemCount() > 1)
		{
			var tmpMenuItem = openWithMenuItem.getItem(1);
			tmpMenuItem.setSectionStart(true);
		}
	}
	contextMenu.addNewItem().setText(this.getPasteContextMenuText()).setIcon("paste").setEnabled(apolloItem.isDirectory() && (oFF.notNull(this.m_itemToCopy) || oFF.notNull(this.m_itemToCut))).setCustomObject(fileIcon).setSectionStart(true).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		var apolloDir = apolloItem;
		this.handleApolloItemPasteIntoDir(apolloDir);
	}.bind(this)));
	contextMenu.addNewItem().setText("Copy").setIcon("copy").setEnabled(!apolloItem.isDirectory()).setCustomObject(fileIcon).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.m_itemToCopy = apolloItem;
		this.m_itemToCut = null;
	}.bind(this)));
	contextMenu.addNewItem().setText("Cut").setIcon("scissors").setEnabled(!apolloItem.isDirectory()).setCustomObject(fileIcon).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
		this.m_itemToCopy = null;
		this.m_itemToCut = apolloItem;
	}.bind(this)));
	contextMenu.addNewItem().setName("contextMenuRename").setText("Rename").setIcon("edit").setEnabled(true).registerOnPress(this).setCustomObject(fileIcon).setSectionStart(true);
	contextMenu.addNewItem().setName("contextMenuDuplicate").setText("Duplicate").setIcon("duplicate").setEnabled(true).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent5){
		this.duplicateApolloItem(apolloItem);
	}.bind(this))).setCustomObject(fileIcon);
	contextMenu.addNewItem().setName("contextMenuDelete").setText("Delete").setIcon("delete").setEnabled(true).registerOnPress(this).setCustomObject(fileIcon);
	contextMenu.addNewItem().setName("contextMenuInfo").setText("Info").setIcon("hint").registerOnPress(this).setCustomObject(fileIcon).setSectionStart(true);
	return contextMenu;
};
oFF.FeApolloView.prototype.createTileContainerContextMenu = function(tileContainer)
{
	var contextMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	contextMenu.setName("tileContainerContextMenu");
	contextMenu.addNewItem().setText(this.getPasteContextMenuText()).setIcon("paste").setEnabled(oFF.notNull(this.m_itemToCopy) || oFF.notNull(this.m_itemToCut)).setSectionStart(true).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.handleApolloItemPasteIntoDir(this.m_directoryManager.getActiveDirectory());
	}.bind(this)));
	contextMenu.addNewItem().setName("tileContainerMenuNewFile").setText("New file").setIcon("add-document").setSectionStart(true).setCustomObject(tileContainer).registerOnPress(this);
	contextMenu.addNewItem().setName("tileContainerMenuNewFolder").setText("New folder").setIcon("add-folder").setCustomObject(tileContainer).registerOnPress(this);
	return contextMenu;
};
oFF.FeApolloView.prototype.presentTreeItemContextMenu = function(controlEvent)
{
	if (oFF.notNull(controlEvent))
	{
		var treeItem = controlEvent.getControl();
		var posX = controlEvent.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_X, 0);
		var posY = controlEvent.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_Y, 0);
		var contextMenu = this.m_genesis.newControl(oFF.UiType.MENU);
		contextMenu.addNewItem().setText("Expand").setIcon("expand").setCustomObject(treeItem).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
			treeItem.expand();
		}.bind(this)));
		contextMenu.addNewItem().setText("Collapse").setIcon("collapse").setCustomObject(treeItem).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
			treeItem.collapse();
		}.bind(this)));
		contextMenu.openAtPosition(posX, posY);
	}
};
oFF.FeApolloView.prototype.createViewMenu = function(viewBtn)
{
	var viewToolbarMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	viewToolbarMenu.setName("viewToolbarMenu");
	var hiddenItemsMenu = viewToolbarMenu.addNewItem().setName("viewToolbarSubMenuHiddenItems").setText("Hidden Items");
	var showHiddenItem = hiddenItemsMenu.addNewItem().setName("viewToolbarSubMenuShowHiddenItems").setText("Show").registerOnPress(this);
	var hideHiddenItem = hiddenItemsMenu.addNewItem().setName("viewToolbarSubMenuHideHiddenItems").setText("Hide").registerOnPress(this);
	if (this.m_showHiddenItems === true)
	{
		showHiddenItem.setIcon("accept");
		hideHiddenItem.setIcon("");
	}
	else
	{
		showHiddenItem.setIcon("");
		hideHiddenItem.setIcon("accept");
	}
	var sortingMenu = viewToolbarMenu.addNewItem().setName("viewToolbarSubMenuSorting").setText("Sorting");
	var ascendingItem = sortingMenu.addNewItem().setName("viewToolbarSubMenuSortingAscending").setText("Ascending").registerOnPress(this);
	var descendingItem = sortingMenu.addNewItem().setName("viewToolbarSubMenuSortingDescending").setText("Descending").registerOnPress(this);
	if (this.m_itemsSortDirection === oFF.XSortDirection.ASCENDING)
	{
		ascendingItem.setIcon("accept");
		descendingItem.setIcon("");
	}
	else
	{
		ascendingItem.setIcon("");
		descendingItem.setIcon("accept");
	}
	viewToolbarMenu.openAt(viewBtn);
};
oFF.FeApolloView.prototype.createFileMenu = function(fileBtn)
{
	var fileToolbarMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	fileToolbarMenu.setName("fileToolbarMenu");
	fileToolbarMenu.addNewItem().setName("fileToolbarMenuNewFile").setText("New file").registerOnPress(this);
	fileToolbarMenu.addNewItem().setName("fileToolbarMenuNewFolder").setText("New folder").registerOnPress(this);
	fileToolbarMenu.openAt(fileBtn);
};
oFF.FeApolloView.prototype.getPasteContextMenuText = function()
{
	var pasteString = "Paste";
	if (oFF.notNull(this.m_itemToCopy))
	{
		pasteString = "Paste (Copy)";
	}
	else if (oFF.notNull(this.m_itemToCut))
	{
		pasteString = "Paste (Move)";
	}
	return pasteString;
};
oFF.FeApolloView.prototype.showTileInfo = function(fileIcon)
{
	var apolloItem = fileIcon.getCustomObject();
	var isFolder = apolloItem.isDirectory();
	var isExecutable = apolloItem.isExecutable();
	var hasAtributes = apolloItem.getAttributes() !== null && apolloItem.getAttributes().hasElements();
	var itemType = "File";
	if (isFolder)
	{
		itemType = "Folder";
	}
	else if (isExecutable)
	{
		itemType = "Program";
	}
	var tileInfoPopover = this.m_genesis.newControl(oFF.UiType.POPOVER);
	tileInfoPopover.setName(oFF.XStringUtils.concatenate2("tileInfoPopover_", fileIcon.getName()));
	tileInfoPopover.setSize(oFF.UiSize.createByCss("250px", "220px"));
	var popoverMainLayout = tileInfoPopover.setNewContent(oFF.UiType.FLEX_LAYOUT);
	popoverMainLayout.useMaxSpace();
	popoverMainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	popoverMainLayout.setAlignContent(oFF.UiFlexAlignContent.CENTER);
	popoverMainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	popoverMainLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_AROUND);
	popoverMainLayout.setPadding(oFF.UiCssBoxEdges.create("10px"));
	var popoverTileImage = popoverMainLayout.addNewItemOfType(oFF.UiType.IMAGE);
	popoverTileImage.setName("popoverTileImage");
	popoverTileImage.setSrc(fileIcon.getSrc());
	popoverTileImage.setSize(oFF.UiSize.createByCss("70px", "70px"));
	popoverTileImage.setFlex("0 0 70px");
	var popoverTileNameLbl = popoverMainLayout.addNewItemOfType(oFF.UiType.TITLE);
	popoverTileNameLbl.setName("popoverTileNameTitle");
	popoverTileNameLbl.setWidth(oFF.UiCssLength.create("230px"));
	popoverTileNameLbl.setWrapping(true);
	popoverTileNameLbl.setText(fileIcon.getText());
	popoverTileNameLbl.setTextAlign(oFF.UiTextAlign.CENTER);
	popoverTileNameLbl.setTitleLevel(oFF.UiTitleLevel.H_4);
	popoverTileNameLbl.setTitleStyle(oFF.UiTitleLevel.H_4);
	popoverTileNameLbl.setFlex("0 0 24px");
	var popoverTileTypeLbl = popoverMainLayout.addNewItemOfType(oFF.UiType.LABEL);
	popoverTileTypeLbl.setName("popoverTileTypeLbl");
	popoverTileTypeLbl.setWidth(oFF.UiCssLength.create("230px"));
	popoverTileTypeLbl.setWrapping(true);
	popoverTileTypeLbl.setText(oFF.XStringUtils.concatenate2("Type: ", itemType));
	popoverTileTypeLbl.setTextAlign(oFF.UiTextAlign.CENTER);
	popoverTileTypeLbl.setFlex("0 0 18px");
	if (isFolder === false && isExecutable === false)
	{
		var apolloFile = apolloItem;
		var popoverProgramNameLbl = popoverMainLayout.addNewItemOfType(oFF.UiType.LABEL);
		popoverProgramNameLbl.setName("popoverProgramNameLbl");
		popoverProgramNameLbl.setWidth(oFF.UiCssLength.create("230px"));
		popoverProgramNameLbl.setWrapping(true);
		popoverProgramNameLbl.setText(oFF.XStringUtils.concatenate2("Default program: ", apolloFile.getApolloFileExtension().getFriendlyName()));
		popoverProgramNameLbl.setTextAlign(oFF.UiTextAlign.CENTER);
		popoverProgramNameLbl.setFlex("0 0 18px");
	}
	if (hasAtributes)
	{
		tileInfoPopover.setWidth(oFF.UiCssLength.create("650px"));
		tileInfoPopover.setHeight(oFF.UiCssLength.create("440px"));
		var attributesTable = popoverMainLayout.addNewItemOfType(oFF.UiType.RESPONSIVE_TABLE);
		attributesTable.useMaxSpace();
		attributesTable.setMaxHeight(oFF.UiCssLength.create("220px"));
		attributesTable.setOverflow(oFF.UiOverflow.AUTO);
		var attributesLbl = attributesTable.setNewHeader(oFF.UiType.LABEL);
		attributesLbl.setWrapping(true);
		attributesLbl.setText("Attributes:");
		var keyCol = attributesTable.addNewResponsiveTableColumn();
		keyCol.setTitle("Key");
		var valCol = attributesTable.addNewResponsiveTableColumn();
		valCol.setTitle("Value");
		oFF.XCollectionUtils.forEachString(apolloItem.getAttributes().getKeysAsReadOnlyListOfString(),  function(attrKey){
			var tmpVal = apolloItem.getAttributes().getByKey(attrKey);
			var tmpRow = attributesTable.addNewResponsiveTableRow();
			var keyLbl = tmpRow.addNewLabelCell();
			keyLbl.setText(attrKey);
			var valLbl = tmpRow.addNewLabelCell();
			if (oFF.notNull(tmpVal))
			{
				valLbl.setText(tmpVal.toString());
			}
			else
			{
				valLbl.setText("");
			}
		}.bind(this));
	}
	tileInfoPopover.openAt(fileIcon);
};
oFF.FeApolloView.prototype.openApolloItem = function(apolloItem)
{
	if (oFF.notNull(apolloItem))
	{
		if (apolloItem.isDirectory())
		{
			this.openFolderAndAddToHistory(apolloItem);
		}
		else
		{
			this.openFile(apolloItem);
		}
	}
};
oFF.FeApolloView.prototype.openFile = function(apolloFile)
{
	var didSuccess = false;
	if (oFF.notNull(this.m_fileHandler) && oFF.notNull(apolloFile))
	{
		didSuccess = this.m_fileHandler.openFile(apolloFile);
		if (oFF.notNull(this.m_apolloListener))
		{
			this.m_apolloListener.onApolloFileOpen(apolloFile);
		}
	}
	if (didSuccess === false)
	{
		this.m_genesis.showAlert("Error", "There was an error launching the file. Please try again!", oFF.UiValueState.ERROR);
	}
};
oFF.FeApolloView.prototype.openFileWithApolloExtension = function(apolloFile, apolloExtension)
{
	var didSuccess = false;
	if (oFF.notNull(this.m_fileHandler) && oFF.notNull(apolloFile) && oFF.notNull(apolloExtension))
	{
		didSuccess = this.m_fileHandler.openFileWithApolloExtension(apolloFile, apolloExtension);
		if (oFF.notNull(this.m_apolloListener))
		{
			this.m_apolloListener.onApolloFileOpen(apolloFile);
		}
	}
	if (didSuccess === false)
	{
		this.getGenesis().showAlert("Error", "There was an error launching the file. Please try again!", oFF.UiValueState.ERROR);
	}
};
oFF.FeApolloView.prototype.openFolder = function(apolloDir)
{
	if (oFF.notNull(this.m_directoryManager) && oFF.notNull(apolloDir))
	{
		if (oFF.notNull(this.m_apolloListener))
		{
			this.m_apolloListener.onApolloDirectoryOpen(apolloDir);
		}
		this.setBusy(true);
		this.m_directoryManager.openDirectory(apolloDir).then( function(result){
			this.renderActiveDirectoryContent();
			this.renderActiveDirectoryHierarchyTree();
			return result;
		}.bind(this),  function(err){
			this.getGenesis().showErrorToast(err.getText());
		}.bind(this)).onFinally( function(){
			this.setBusy(false);
		}.bind(this));
	}
};
oFF.FeApolloView.prototype.openFolderAndAddToHistory = function(apolloDir)
{
	this.openFolder(apolloDir);
	this.handleDirectoryHistoryUpdate();
};
oFF.FeApolloView.prototype.menuBarItemClick = function(menuItem)
{
	if (oFF.notNull(this.m_apolloListener) && oFF.notNull(menuItem))
	{
		this.m_apolloListener.onApolloMenuBarItemClick(menuItem.getName());
	}
};
oFF.FeApolloView.prototype.showWarningToastWithMessage = function(msg)
{
	if (oFF.notNull(this.m_genesis))
	{
		this.m_genesis.showWarningToast(msg);
	}
};
oFF.FeApolloView.prototype.handleDirectoryHistoryUpdate = function()
{
	this.m_directoryHistory.addHistoryEntry(this.m_directoryManager.getActiveDirectory());
	this.updateToolbarItems();
};
oFF.FeApolloView.prototype.updateToolbarItems = function()
{
	if (oFF.notNull(this.m_previousToolbarBtn))
	{
		if (this.m_directoryHistory.canGoToPrevious())
		{
			this.m_previousToolbarBtn.setEnabled(true);
		}
		else
		{
			this.m_previousToolbarBtn.setEnabled(false);
		}
	}
	if (oFF.notNull(this.m_nextToolbarBtn))
	{
		if (this.m_directoryHistory.canGoToNext())
		{
			this.m_nextToolbarBtn.setEnabled(true);
		}
		else
		{
			this.m_nextToolbarBtn.setEnabled(false);
		}
	}
	if (oFF.notNull(this.m_upOneLevelToolbarBtn))
	{
		this.m_upOneLevelToolbarBtn.setEnabled(this.m_directoryManager.isTopLevel() === false);
	}
	if (oFF.notNull(this.m_subHeaderBreadcrumbPathLbl))
	{
		this.m_subHeaderBreadcrumbPathLbl.setText(this.m_directoryManager.getCurrentPath());
	}
};
oFF.FeApolloView.prototype.goToHome = function()
{
	if (!this.m_directoryManager.isTopLevel())
	{
		this.openFolderAndAddToHistory(this.m_directoryManager.getRootDirectory());
	}
};
oFF.FeApolloView.prototype.goToPreviousHistDir = function()
{
	if (this.m_directoryHistory.canGoToPrevious())
	{
		var previousDir = this.m_directoryHistory.goToPrevious();
		this.openFolder(previousDir);
	}
};
oFF.FeApolloView.prototype.goToNextHistDir = function()
{
	if (this.m_directoryHistory.canGoToNext())
	{
		var nextDir = this.m_directoryHistory.goToNext();
		this.openFolder(nextDir);
	}
};
oFF.FeApolloView.prototype.upOneLevel = function()
{
	if (oFF.notNull(this.m_directoryManager) && this.m_directoryManager.getActiveDirectory().getParentDir() !== null)
	{
		this.openFolderAndAddToHistory(this.m_directoryManager.getActiveDirectory().getParentDir());
	}
};
oFF.FeApolloView.prototype.refreshCurrentDirectory = function()
{
	if (oFF.notNull(this.m_directoryManager))
	{
		this.setBusy(true);
		this.m_directoryManager.refreshActiveDirectory().then( function(result){
			this.renderActiveDirectoryContent();
			return result;
		}.bind(this),  function(err){
			this.getGenesis().showErrorToast(err.getText());
		}.bind(this)).onFinally( function(){
			this.setBusy(false);
		}.bind(this));
	}
};
oFF.FeApolloView.prototype.selectFileIcon = function(fileIcon)
{
	var tileContainer = this.getTileContainer();
	if (oFF.notNull(tileContainer))
	{
		oFF.XCollectionUtils.forEach(tileContainer.getItems(),  function(childItem){
			var tmpFileIcon = childItem;
			tmpFileIcon.setSelected(false);
		}.bind(this));
		if (oFF.notNull(fileIcon))
		{
			fileIcon.setSelected(true);
		}
	}
};
oFF.FeApolloView.prototype.setStatusMessage = function(message)
{
	if (oFF.notNull(this.m_statusLabel))
	{
		this.m_statusLabel.setText(message);
	}
};
oFF.FeApolloView.prototype.initSettings = function()
{
	if (oFF.notNull(this.m_application))
	{
		this.m_showHiddenItems = this.m_application.getProcess().getLocalStorage().getBooleanByKeyExt(oFF.FeApolloView.APOLLO_SHOW_HIDDEN_ITEMS_KEY, true);
		var sortDirection = this.m_application.getProcess().getLocalStorage().getIntegerByKeyExt(oFF.FeApolloView.APOLLO_ITEMS_SORT_DIRECTION_KEY, 0);
		this.m_itemsSortDirection = sortDirection === 0 ? oFF.XSortDirection.ASCENDING : oFF.XSortDirection.DESCENDING;
	}
};
oFF.FeApolloView.prototype.updateShowHiddenItemsSetting = function(newValue)
{
	this.m_showHiddenItems = newValue;
	if (oFF.notNull(this.m_application))
	{
		this.m_application.getProcess().getLocalStorage().putBoolean(oFF.FeApolloView.APOLLO_SHOW_HIDDEN_ITEMS_KEY, newValue);
	}
};
oFF.FeApolloView.prototype.updateItemSortDirectionSetting = function(newDirection)
{
	this.m_itemsSortDirection = newDirection;
	if (oFF.notNull(this.m_application))
	{
		var sortDirection = newDirection === oFF.XSortDirection.ASCENDING ? 0 : 1;
		this.m_application.getProcess().getLocalStorage().putInteger(oFF.FeApolloView.APOLLO_ITEMS_SORT_DIRECTION_KEY, sortDirection);
	}
};
oFF.FeApolloView.prototype.onPress = function(event)
{
	var control = event.getControl();
	var controlParent = control.getParent();
	if (event.getControl() === this.m_homeToolbarBtn)
	{
		this.goToHome();
	}
	if (event.getControl() === this.m_previousToolbarBtn)
	{
		this.goToPreviousHistDir();
	}
	if (event.getControl() === this.m_nextToolbarBtn)
	{
		this.goToNextHistDir();
	}
	if (event.getControl() === this.m_upOneLevelToolbarBtn)
	{
		this.upOneLevel();
	}
	if (event.getControl() === this.m_refreshToolbarBtn)
	{
		this.refreshCurrentDirectory();
	}
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU)
	{
		if (oFF.XString.isEqual(controlParent.getName(), "tileContextMenu"))
		{
			var tmpFileIcon = control.getCustomObject();
			var apolloItem = tmpFileIcon.getCustomObject();
			switch (control.getName())
			{
				case "contextMenuOpen":
					this.openApolloItem(apolloItem);
					break;

				case "contextMenuOpenWith":
					break;

				case "contextMenuPaste":
					break;

				case "contextMenuCopy":
					break;

				case "contextMenuCut":
					break;

				case "contextMenuRename":
					this.openRenameItemDialog(apolloItem);
					break;

				case "contextMenuDelete":
					this.openDeleteItemDialog(apolloItem);
					break;

				case "contextMenuInfo":
					this.showTileInfo(tmpFileIcon);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "fileToolbarMenu"))
		{
			switch (control.getName())
			{
				case "fileToolbarMenuNewFile":
					this.menuBarItemClick(control);
					this.openCreateNewItemDialog(true);
					break;

				case "fileToolbarMenuNewFolder":
					this.menuBarItemClick(control);
					this.openCreateNewItemDialog(false);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "tileContainerContextMenu"))
		{
			switch (control.getName())
			{
				case "tileContainerMenuNewFile":
					this.openCreateNewItemDialog(true);
					break;

				case "tileContainerMenuNewFolder":
					this.openCreateNewItemDialog(false);
					break;

				default:
			}
		}
	}
	else if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU_ITEM)
	{
		if (oFF.XString.isEqual(controlParent.getName(), "contextMenuOpenWith"))
		{
			var fileIcon = controlParent.getCustomObject();
			var apolloFile = fileIcon.getCustomObject();
			var tmpApolloExtension = event.getControl().getCustomObject();
			this.openFileWithApolloExtension(apolloFile, tmpApolloExtension);
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "viewToolbarSubMenuHiddenItems"))
		{
			switch (control.getName())
			{
				case "viewToolbarSubMenuShowHiddenItems":
					this.menuBarItemClick(control);
					this.updateShowHiddenItemsSetting(true);
					this.renderActiveDirectoryContent();
					break;

				case "viewToolbarSubMenuHideHiddenItems":
					this.menuBarItemClick(control);
					this.updateShowHiddenItemsSetting(false);
					this.renderActiveDirectoryContent();
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "viewToolbarSubMenuSorting"))
		{
			switch (control.getName())
			{
				case "viewToolbarSubMenuSortingAscending":
					this.menuBarItemClick(control);
					this.updateItemSortDirectionSetting(oFF.XSortDirection.ASCENDING);
					this.renderActiveDirectoryContent();
					break;

				case "viewToolbarSubMenuSortingDescending":
					this.menuBarItemClick(control);
					this.updateItemSortDirectionSetting(oFF.XSortDirection.DESCENDING);
					this.renderActiveDirectoryContent();
					break;

				default:
			}
		}
	}
};
oFF.FeApolloView.prototype.onContextMenu = function(event)
{
	var control = event.getControl();
	var posX = event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_X, 0);
	var posY = event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_Y, 0);
	var contextMenu = null;
	if (control.getUiType() === oFF.UiType.FILE_ICON)
	{
		this.selectFileIcon(control);
		contextMenu = this.createTileItemContextMenu(event.getControl());
	}
	else if (control.getUiType() === oFF.UiType.TILE_CONTAINER)
	{
		this.selectFileIcon(null);
		contextMenu = this.createTileContainerContextMenu(event.getControl());
	}
	if (oFF.notNull(contextMenu))
	{
		if (posX === 0 && posY === 0)
		{
			contextMenu.openAt(event.getControl());
		}
		else
		{
			contextMenu.openAtPosition(posX, posY);
		}
	}
};
oFF.FeApolloView.prototype.onDoubleClick = function(event)
{
	var apolloItem = event.getControl().getCustomObject();
	this.openApolloItem(apolloItem);
};
oFF.FeApolloView.prototype.onClick = function(event)
{
	var control = event.getControl();
	if (control.getUiType() === oFF.UiType.TILE_CONTAINER)
	{
		this.selectFileIcon(null);
	}
};
oFF.FeApolloView.prototype.onSelect = function(event)
{
	var selectedTreeItem = event.getSelectedItem();
	var apolloDir = selectedTreeItem.getCustomObject();
	if (oFF.notNull(apolloDir))
	{
		this.openApolloItem(apolloDir);
	}
};
oFF.FeApolloView.prototype.onAfterOpen = function(event)
{
	var control = event.getControl();
	if (oFF.XString.isEqual(control.getName(), "newDirectoryItemDialog"))
	{
		var itemNameInput = control.getCustomObject();
		if (oFF.notNull(itemNameInput))
		{
			itemNameInput.focus();
			itemNameInput.selectText(0, -1);
		}
	}
	if (oFF.XString.isEqual(control.getName(), "deleteDirectoryItemDialog"))
	{
		var deleteItemDialog = control;
		var deleteDialogCancelBtn = deleteItemDialog.getDialogButtonByName("deleteDirectoryItemDialogCancelBtn");
		if (oFF.notNull(deleteDialogCancelBtn))
		{
			deleteDialogCancelBtn.focus();
		}
	}
	if (oFF.XString.isEqual(control.getName(), "renameDirectoryItemDialog"))
	{
		var renameItemNameInput = control.getContent();
		if (oFF.notNull(renameItemNameInput))
		{
			renameItemNameInput.focus();
			renameItemNameInput.selectText(0, -1);
		}
	}
};
oFF.FeApolloView.prototype.onFileDrop = function(event)
{
	var fileContent = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_FILE_CONTENT, null);
	var fileName = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_FILE_NAME, null);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fileName) && oFF.XStringUtils.isNotNullAndNotEmpty(fileContent))
	{
		var fileContentToSave = oFF.XContent.createStringContent(oFF.ContentType.TEXT, fileContent);
		var fileToSave = this.m_directoryManager.getActiveDirectory().getAssociatedFileObj().newChild(fileName);
		if (oFF.notNull(fileToSave) && oFF.notNull(fileContentToSave))
		{
			fileToSave.processSave(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileSavedListener.create( function(extResult){
				if (extResult.hasErrors())
				{
					this.m_genesis.showErrorToast(extResult.getSummary());
				}
				else
				{
					var msg = oFF.XStringUtils.concatenate3("File ", fileToSave.getUri().getPathContainer().getFileName(), " saved successfully in the file system!");
					this.m_genesis.showSuccessToast(msg);
					this.refreshCurrentDirectory();
				}
			}.bind(this)), null, fileContentToSave, oFF.CompressionType.NONE);
		}
	}
};

oFF.FeApolloItemBase = function() {};
oFF.FeApolloItemBase.prototype = new oFF.XObjectExt();
oFF.FeApolloItemBase.prototype._ff_c = "FeApolloItemBase";

oFF.FeApolloItemBase.prototype.m_associatedFile = null;
oFF.FeApolloItemBase.prototype.m_parent = null;
oFF.FeApolloItemBase.prototype.m_associatedTreeItem = null;
oFF.FeApolloItemBase.prototype.compareTo = function(objectToCompare)
{
	var fileToComapre = objectToCompare;
	return oFF.XString.compare(oFF.XString.toLowerCase(this.getName()), oFF.XString.toLowerCase(fileToComapre.getName()));
};
oFF.FeApolloItemBase.prototype.getAssociatedFileObj = function()
{
	return this.m_associatedFile;
};
oFF.FeApolloItemBase.prototype.getParentDir = function()
{
	return this.m_parent;
};
oFF.FeApolloItemBase.prototype.isDirectory = function()
{
	return this.m_associatedFile.isDirectory();
};
oFF.FeApolloItemBase.prototype.isHidden = function()
{
	return this.m_associatedFile.isHidden();
};
oFF.FeApolloItemBase.prototype.isExecutable = function()
{
	return this.m_associatedFile.getFileType() === oFF.XFileType.PRG;
};
oFF.FeApolloItemBase.prototype.getAttributes = function()
{
	if (oFF.notNull(this.m_associatedFile))
	{
		return this.m_associatedFile.getAttributes();
	}
	return null;
};
oFF.FeApolloItemBase.prototype.getName = function()
{
	var fileName = this.getAssociatedFileObj().getName();
	if (this.getAssociatedFileObj().getAttributes() !== null && this.getAssociatedFileObj().getAttributes().containsKey(oFF.XFileAttribute.DISPLAY_NAME.getName()))
	{
		fileName = this.getAssociatedFileObj().getAttributes().getStringByKeyExt(oFF.XFileAttribute.DISPLAY_NAME.getName(), fileName);
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fileName))
	{
		return fileName;
	}
	return this.getAssociatedFileObj().getUri().getPath();
};
oFF.FeApolloItemBase.prototype.setAssociatedTreeItem = function(treeItem)
{
	this.m_associatedTreeItem = treeItem;
};
oFF.FeApolloItemBase.prototype.getAssociatedTreeItem = function()
{
	return this.m_associatedTreeItem;
};
oFF.FeApolloItemBase.prototype.setParent = function(parent)
{
	var curParent = this.getParentDir();
	if (oFF.notNull(curParent))
	{
		curParent.removeChildItem(this);
	}
	this.m_parent = parent;
	if (oFF.notNull(parent))
	{
		parent.addChildItem(this);
	}
};
oFF.FeApolloItemBase.prototype.setupApolloItem = function(file, parent)
{
	this.m_associatedFile = file;
	this.setParent(parent);
};

oFF.FeApolloDirectoryManager = function() {};
oFF.FeApolloDirectoryManager.prototype = new oFF.XObjectExt();
oFF.FeApolloDirectoryManager.prototype._ff_c = "FeApolloDirectoryManager";

oFF.FeApolloDirectoryManager.create = function()
{
	var newDirectoryManager = new oFF.FeApolloDirectoryManager();
	return newDirectoryManager;
};
oFF.FeApolloDirectoryManager.prototype.m_process = null;
oFF.FeApolloDirectoryManager.prototype.m_rootDirectory = null;
oFF.FeApolloDirectoryManager.prototype.m_activeDirectory = null;
oFF.FeApolloDirectoryManager.prototype.releaseObject = function()
{
	this.m_process = null;
	this.m_rootDirectory = oFF.XObjectExt.release(this.m_rootDirectory);
	this.m_activeDirectory = oFF.XObjectExt.release(this.m_activeDirectory);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.FeApolloDirectoryManager.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.FeApolloDirectoryManager.prototype.setupDirectoryManager = function(process, startingPath)
{
	if (oFF.isNull(process))
	{
		oFF.XPromise.reject(oFF.XError.create("Missing process! Cannot create a directory manager!"));
	}
	this.m_process = process;
	var fileSystemManager = this.m_process.getFileSystemManager();
	var activeFileSystem = fileSystemManager.getActiveFileSystem();
	if (oFF.notNull(activeFileSystem))
	{
		var rootFile = this.m_process.newRootDirectoryFile();
		if (oFF.notNull(rootFile))
		{
			this.m_rootDirectory = oFF.FeApolloDir.createNewDir(rootFile, null);
			return this.setActiveDirectory(this.m_rootDirectory);
		}
	}
	return oFF.XPromise.reject(oFF.XError.create("No active file system found!"));
};
oFF.FeApolloDirectoryManager.prototype.initializeWithProcess = function(process, startingPath)
{
	return this.setupDirectoryManager(process, startingPath);
};
oFF.FeApolloDirectoryManager.prototype.getActiveDirectory = function()
{
	return this.m_activeDirectory;
};
oFF.FeApolloDirectoryManager.prototype.getRootDirectory = function()
{
	return this.m_rootDirectory;
};
oFF.FeApolloDirectoryManager.prototype.openDirectory = function(directory)
{
	return this.setActiveDirectory(directory);
};
oFF.FeApolloDirectoryManager.prototype.refreshActiveDirectory = function()
{
	if (this.getActiveDirectory() !== null)
	{
		this.getActiveDirectory().setContentLoaded(false);
		this.getActiveDirectory().clearChildItems();
	}
	return this.loadActiveDirectoryContent();
};
oFF.FeApolloDirectoryManager.prototype.upOneLevel = function()
{
	if (this.m_activeDirectory.getParentDir() !== null)
	{
		return this.setActiveDirectory(this.m_activeDirectory.getParentDir());
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(false));
};
oFF.FeApolloDirectoryManager.prototype.isTopLevel = function()
{
	if (this.m_activeDirectory.getParentDir() === null)
	{
		return true;
	}
	return false;
};
oFF.FeApolloDirectoryManager.prototype.getCurrentPath = function()
{
	var path = "";
	var directory = this.m_activeDirectory;
	while (oFF.notNull(directory))
	{
		if (directory !== this.m_rootDirectory)
		{
			path = oFF.XStringUtils.concatenate2(oFF.XStringUtils.concatenate2("/", directory.getName()), path);
		}
		directory = directory.getParentDir();
	}
	if (oFF.XString.startsWith(path, "/") === false)
	{
		path = oFF.XStringUtils.concatenate2("/", path);
	}
	return path;
};
oFF.FeApolloDirectoryManager.prototype.itemExistsInActiveDirectory = function(name)
{
	var activeDirFile = this.getActiveDirectory().getAssociatedFileObj();
	var newFile = activeDirFile.newChild(oFF.XString.trim(name));
	if (oFF.isNull(newFile) || newFile.hasErrors())
	{
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(false));
	}
	return oFF.UtFilePromise.isExisting(newFile);
};
oFF.FeApolloDirectoryManager.prototype.createNewItemInActiveDirectory = function(name, isFile)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing directory or file name!"));
	}
	if (this.getApolloItemInActiveDirectoryForName(name) !== null)
	{
		return oFF.XPromise.reject(oFF.XError.create("Directory or file with the specified name already exists!"));
	}
	var activeDirFile = this.getActiveDirectory().getAssociatedFileObj();
	var newFile = activeDirFile.newChild(oFF.XString.trim(name));
	var returnPromise = oFF.XPromise.create( function(resolve, reject){
		var reject2 = reject;
		if (isFile === true)
		{
			oFF.UtFilePromise.saveContent(newFile, oFF.XContent.createStringContent(oFF.ContentType.TEXT, "")).then( function(createdFile){
				oFF.UtFilePromise.fetchMetadata(createdFile, false).then( function(metadata){
					this.addNewItemToActiveDirectory(createdFile);
					resolve(oFF.XBooleanValue.create(true));
					return metadata;
				}.bind(this), reject2);
				return createdFile;
			}.bind(this), reject2);
		}
		else
		{
			oFF.UtFilePromise.mkdir(newFile, true).then( function(createdFile2){
				oFF.UtFilePromise.fetchMetadata(createdFile2, false).then( function(metadata2){
					this.addNewItemToActiveDirectory(createdFile2);
					resolve(oFF.XBooleanValue.create(true));
					return metadata2;
				}.bind(this), reject2);
				return createdFile2;
			}.bind(this), reject2);
		}
	}.bind(this));
	return returnPromise;
};
oFF.FeApolloDirectoryManager.prototype.getNextFreeItemNameForActiveDir = function(itemName)
{
	var freeItemName = itemName;
	var counter = 0;
	var foundItem = this.getApolloItemInActiveDirectoryForName(freeItemName);
	while (oFF.notNull(foundItem))
	{
		counter++;
		freeItemName = oFF.XStringUtils.concatenate4(itemName, " (", oFF.XInteger.convertToString(counter), ")");
		foundItem = this.getApolloItemInActiveDirectoryForName(freeItemName);
	}
	return freeItemName;
};
oFF.FeApolloDirectoryManager.prototype.deleteApolloItemFromActiveDirectory = function(apolloItem)
{
	if (oFF.isNull(apolloItem))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file! Cannot remove!"));
	}
	var fileToDelete = apolloItem.getAssociatedFileObj();
	return oFF.UtFilePromise._delete(fileToDelete, true).then( function(deletedFile){
		this.removeItemFromActiveDirectory(apolloItem);
		return oFF.XBooleanValue.create(true);
	}.bind(this), null);
};
oFF.FeApolloDirectoryManager.prototype.renameApolloItemInActiveDirectory = function(apolloItem, newName)
{
	if (oFF.isNull(apolloItem))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file! Cannot rename!"));
	}
	var fileToRename = apolloItem.getAssociatedFileObj();
	return oFF.UtFilePromise.rename(fileToRename, newName).then( function(newFile){
		this.removeItemFromActiveDirectory(apolloItem);
		this.addNewItemToActiveDirectory(newFile);
		return oFF.XBooleanValue.create(true);
	}.bind(this), null);
};
oFF.FeApolloDirectoryManager.prototype.duplicateApolloItem = function(apolloItem)
{
	if (oFF.isNull(apolloItem))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file! Cannot duplicate!"));
	}
	var fileToDuplicate = apolloItem.getAssociatedFileObj();
	return oFF.UtFilePromise.duplicateFile(fileToDuplicate).then( function(newFile){
		var newApolloItem = this.addNewItemToActiveDirectory(newFile);
		return newApolloItem;
	}.bind(this), null);
};
oFF.FeApolloDirectoryManager.prototype.copyApolloItemToDir = function(apolloItem, destination)
{
	if (oFF.isNull(apolloItem))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file! Cannot copy!"));
	}
	if (oFF.isNull(destination))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing destination directory! Cannot copy!"));
	}
	var fileToCopy = apolloItem.getAssociatedFileObj();
	var destinationDir = destination.getAssociatedFileObj();
	return oFF.UtFilePromise.copyFile(fileToCopy, destinationDir).then( function(newFile){
		var newApolloItem = this.addNewItemToDirectory(destination, newFile);
		return newApolloItem;
	}.bind(this), null);
};
oFF.FeApolloDirectoryManager.prototype.moveApolloItemToDir = function(apolloItem, destination)
{
	if (oFF.isNull(apolloItem))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file! Cannot move!"));
	}
	if (oFF.isNull(destination))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing destination directory! Cannot move!"));
	}
	var parentDirectory = apolloItem.getParentDir();
	if (destination === parentDirectory)
	{
		return oFF.XPromise.resolve(apolloItem);
	}
	var fileToMove = apolloItem.getAssociatedFileObj();
	var destinationDir = destination.getAssociatedFileObj();
	return oFF.UtFilePromise.moveFile(fileToMove, destinationDir).then( function(movedFile){
		parentDirectory.removeChildItem(apolloItem);
		var newApolloItem = this.addNewItemToDirectory(destination, movedFile);
		return newApolloItem;
	}.bind(this), null);
};
oFF.FeApolloDirectoryManager.prototype.addNewItemToDirectory = function(apolloDir, newChildFile)
{
	if (oFF.notNull(apolloDir) && oFF.notNull(newChildFile))
	{
		if (newChildFile.isDirectory())
		{
			return oFF.FeApolloDir.createNewDir(newChildFile, apolloDir);
		}
		else
		{
			return oFF.FeApolloFile.createNewFile(newChildFile, apolloDir);
		}
	}
	return null;
};
oFF.FeApolloDirectoryManager.prototype.setActiveDirectory = function(directory)
{
	if (oFF.notNull(directory))
	{
		this.m_activeDirectory = directory;
		return this.loadActiveDirectoryContent();
	}
	return oFF.XPromise.reject(oFF.XError.create("Missing directory!"));
};
oFF.FeApolloDirectoryManager.prototype.loadActiveDirectoryContent = function()
{
	var currentDir = this.m_activeDirectory;
	if (oFF.isNull(currentDir))
	{
		return oFF.XPromise.reject(oFF.XError.create("Error while getting the current active directory!"));
	}
	var activeDirFile = currentDir.getAssociatedFileObj();
	if (oFF.isNull(activeDirFile))
	{
		return oFF.XPromise.reject(oFF.XError.create("Missing file object for the current active directory!"));
	}
	if (currentDir.isContentLoaded())
	{
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
	}
	var directoryLoadPromise = oFF.UtFilePromise.fetchChildren(activeDirFile).then( function(childList){
		oFF.XCollectionUtils.forEach(childList,  function(childFile){
			if (childFile.isExisting())
			{
				this.addNewItemToActiveDirectory(childFile);
			}
		}.bind(this));
		currentDir.setContentLoaded(true);
		return oFF.XBooleanValue.create(true);
	}.bind(this),  function(err){
		throw oFF.XException.createRuntimeException(err.getText());
	}.bind(this));
	return directoryLoadPromise;
};
oFF.FeApolloDirectoryManager.prototype.addNewItemToActiveDirectory = function(newChildFile)
{
	return this.addNewItemToDirectory(this.getActiveDirectory(), newChildFile);
};
oFF.FeApolloDirectoryManager.prototype.removeItemFromActiveDirectory = function(apolloItem)
{
	if (oFF.notNull(apolloItem))
	{
		var currentDir = this.m_activeDirectory;
		currentDir.removeChildItem(apolloItem);
	}
};
oFF.FeApolloDirectoryManager.prototype.getApolloItemInActiveDirectoryForName = function(itemName)
{
	var foundItem = null;
	if (this.getActiveDirectory() !== null && this.getActiveDirectory().isContentLoaded())
	{
		foundItem = oFF.XCollectionUtils.findFirst(this.getActiveDirectory().getChildItems(),  function(apolloItem){
			return oFF.XString.isEqual(itemName, apolloItem.getName());
		}.bind(this));
	}
	return foundItem;
};

oFF.FeApolloFileHandler = function() {};
oFF.FeApolloFileHandler.prototype = new oFF.XObjectExt();
oFF.FeApolloFileHandler.prototype._ff_c = "FeApolloFileHandler";

oFF.FeApolloFileHandler.createFileHandler = function(program)
{
	var fileHandler = new oFF.FeApolloFileHandler();
	if (oFF.isNull(program))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Apollo File Handler instance without a parent program instance.");
	}
	fileHandler.setupFileHandler(program);
	return fileHandler;
};
oFF.FeApolloFileHandler.prototype.m_parentProgram = null;
oFF.FeApolloFileHandler.prototype.releaseObject = function()
{
	this.m_parentProgram = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.FeApolloFileHandler.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.FeApolloFileHandler.prototype.openFile = function(apolloFile)
{
	return this.handleFileWithApolloExtension(apolloFile, null);
};
oFF.FeApolloFileHandler.prototype.openFileWithApolloExtension = function(apolloFile, apolloExtension)
{
	return this.handleFileWithApolloExtension(apolloFile, apolloExtension);
};
oFF.FeApolloFileHandler.prototype.handleFile = function(file, fileNameWithoutExtension, openFileExtension)
{
	var prgManifest = null;
	var prgTitle = null;
	var prgArgs = null;
	var fileName = file.getName();
	if (oFF.notNull(openFileExtension))
	{
		if (openFileExtension.isExecutable())
		{
			var programName = fileNameWithoutExtension;
			if (oFF.ProgramRegistration.getAllEntries().containsKey(programName))
			{
				var kernel = file.getProcess().getKernel();
				prgManifest = kernel.getProgramManifest(programName);
			}
		}
		else
		{
			prgManifest = openFileExtension.getProgramManifest(file.getProcess());
			prgTitle = fileName;
			prgArgs = openFileExtension.getDefaultArguments();
			prgArgs.getArgumentStructure().putString(oFF.DfProgram.PARAM_FILE, file.getUrl());
		}
	}
	if (oFF.notNull(prgManifest))
	{
		if (this.getApolloProcess() !== null)
		{
			var tmpRunner = oFF.ProgramRunner.createRunner(this.getApolloProcess(), prgManifest.getProgramName());
			tmpRunner.getCurrentStartConfig().setArguments(prgArgs);
			tmpRunner.getCurrentStartConfig().setStartTitle(prgTitle);
			tmpRunner.runProgram().onCatch( function(errorMsg){
				this.showErrorToast(errorMsg.getText());
			}.bind(this));
			return true;
		}
	}
	return false;
};
oFF.FeApolloFileHandler.prototype.setupFileHandler = function(program)
{
	this.m_parentProgram = program;
};
oFF.FeApolloFileHandler.prototype.handleFileWithApolloExtension = function(apolloFile, apolloExtension)
{
	var openFileExtension = apolloFile.getApolloFileExtension();
	if (oFF.notNull(apolloExtension))
	{
		openFileExtension = apolloExtension;
	}
	return this.handleFile(apolloFile.getAssociatedFileObj(), apolloFile.getFileNameWithoutExtension(), openFileExtension);
};
oFF.FeApolloFileHandler.prototype.showErrorToast = function(message)
{
	if (oFF.notNull(this.m_parentProgram) && this.m_parentProgram.getGenesis() !== null)
	{
		this.m_parentProgram.getGenesis().showErrorToast(message);
	}
};
oFF.FeApolloFileHandler.prototype.getApolloProcess = function()
{
	if (oFF.notNull(this.m_parentProgram))
	{
		return this.m_parentProgram.getProcess();
	}
	return null;
};

oFF.FeApolloDirectoryNavigationHistory = function() {};
oFF.FeApolloDirectoryNavigationHistory.prototype = new oFF.XObjectExt();
oFF.FeApolloDirectoryNavigationHistory.prototype._ff_c = "FeApolloDirectoryNavigationHistory";

oFF.FeApolloDirectoryNavigationHistory.createDirectoryHistory = function()
{
	var newHist = new oFF.FeApolloDirectoryNavigationHistory();
	newHist.setup();
	newHist.setupInternal();
	return newHist;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.m_directoryHistory = null;
oFF.FeApolloDirectoryNavigationHistory.prototype.m_curHistoryIndex = 0;
oFF.FeApolloDirectoryNavigationHistory.prototype.releaseObject = function()
{
	this.m_directoryHistory.clear();
	this.m_directoryHistory = oFF.XObjectExt.release(this.m_directoryHistory);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.FeApolloDirectoryNavigationHistory.prototype.addHistoryEntry = function(apolloDir)
{
	if (this.canGoToNext())
	{
		var newHistList = oFF.XListUtils.sublist(this.m_directoryHistory, oFF.XList.create(), 0, this.m_curHistoryIndex);
		this.m_directoryHistory.clear();
		this.m_directoryHistory.addAll(newHistList);
		newHistList.clear();
	}
	this.m_directoryHistory.add(apolloDir);
	this.m_curHistoryIndex = this.m_directoryHistory.size() - 1;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.canGoToPrevious = function()
{
	if (this.m_directoryHistory.size() > 1 && this.m_curHistoryIndex > 0)
	{
		return true;
	}
	return false;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.goToPrevious = function()
{
	if (this.canGoToPrevious())
	{
		this.m_curHistoryIndex--;
		return this.m_directoryHistory.get(this.m_curHistoryIndex);
	}
	return null;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.canGoToNext = function()
{
	if (this.m_directoryHistory.size() > 1 && this.m_directoryHistory.size() - 1 > this.m_curHistoryIndex)
	{
		return true;
	}
	return false;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.goToNext = function()
{
	if (this.canGoToNext())
	{
		this.m_curHistoryIndex++;
		return this.m_directoryHistory.get(this.m_curHistoryIndex);
	}
	return null;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.clearHistory = function()
{
	this.m_directoryHistory.clear();
	this.m_curHistoryIndex = -1;
};
oFF.FeApolloDirectoryNavigationHistory.prototype.setupInternal = function()
{
	this.m_directoryHistory = oFF.XList.create();
	this.m_curHistoryIndex = -1;
};

oFF.SuDatasourceNavigationConfig = function() {};
oFF.SuDatasourceNavigationConfig.prototype = new oFF.XObjectExt();
oFF.SuDatasourceNavigationConfig.prototype._ff_c = "SuDatasourceNavigationConfig";

oFF.SuDatasourceNavigationConfig.createFromConfig = function(config, resourceNavigationHelper, recentlyUsedDataProvider)
{
	var rootElement = config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.ROOT);
	var rootResource = null;
	if (oFF.notNull(rootElement))
	{
		rootResource = resourceNavigationHelper.getResourceByPath(rootElement.asString().getString());
	}
	else
	{
		rootResource = resourceNavigationHelper.getRoot();
	}
	var rootFile = oFF.SuDatasourceNavigationConfig.getResourceByConfig(config, oFF.SuResourceExplorerConfig.ROOT, resourceNavigationHelper);
	if (oFF.notNull(rootFile))
	{
		rootFile = rootResource;
	}
	var initialSystemElement = config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM);
	var initialSystem = oFF.notNull(initialSystemElement) ? initialSystemElement.asString().getString() : null;
	var initialConnection = oFF.SuDatasourceNavigationConfig.getResourceByConfig(config, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_CONNECTION, resourceNavigationHelper);
	var systemTypesElement = config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_SYSTEM_TYPES);
	var systemTypes = null;
	if (oFF.notNull(systemTypesElement))
	{
		systemTypes = oFF.XList.create();
		var list = systemTypesElement.asList();
		for (var i = 0; i < list.size(); i++)
		{
			var type = list.get(i).asString();
			if (oFF.notNull(type))
			{
				var typeStr = oFF.XStringValue.create(type.getString());
				systemTypes.add(typeStr);
			}
		}
	}
	return oFF.SuDatasourceNavigationConfig.create(rootFile, initialSystem, initialConnection, systemTypes, recentlyUsedDataProvider);
};
oFF.SuDatasourceNavigationConfig.createEmpty = function()
{
	return oFF.SuDatasourceNavigationConfig.create(null, null, null, null, null);
};
oFF.SuDatasourceNavigationConfig.create = function(rootResource, initialSystem, initialConnection, systemTypes, recentlyUsedDataProvider)
{
	var newConfig = new oFF.SuDatasourceNavigationConfig();
	newConfig.m_rootResource = rootResource;
	newConfig.m_initialSystem = initialSystem;
	newConfig.m_initialConnection = initialConnection;
	newConfig.m_systemTypes = systemTypes;
	newConfig.m_recentlyUsedDataProvider = recentlyUsedDataProvider;
	return newConfig;
};
oFF.SuDatasourceNavigationConfig.getSysRootPath = function(config)
{
	return config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.ROOT).asString().getString();
};
oFF.SuDatasourceNavigationConfig.getResourceByConfig = function(config, path, resourceNavigationHelper)
{
	var resourceElement = config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, path);
	var resource = null;
	if (oFF.notNull(resourceElement))
	{
		var sysRootPath = oFF.SuDatasourceNavigationConfig.getSysRootPath(config);
		var resourcePath = resourceElement.asString().getString();
		if (!oFF.XString.startsWith(resourcePath, sysRootPath))
		{
			resourcePath = oFF.XStringUtils.concatenate3(sysRootPath, oFF.SuResourceWrapper.PATH_SEPARATOR, resourcePath);
		}
		resource = resourceNavigationHelper.getResourceByPath(resourcePath);
	}
	return resource;
};
oFF.SuDatasourceNavigationConfig.prototype.m_rootResource = null;
oFF.SuDatasourceNavigationConfig.prototype.m_initialSystem = null;
oFF.SuDatasourceNavigationConfig.prototype.m_initialConnection = null;
oFF.SuDatasourceNavigationConfig.prototype.m_systemTypes = null;
oFF.SuDatasourceNavigationConfig.prototype.m_recentlyUsedDataProvider = null;
oFF.SuDatasourceNavigationConfig.prototype.toString = function()
{
	var buf = oFF.XStringBuffer.create();
	buf.append("[SuDatasourceNavigationConfig");
	buf.append("(rootFile:");
	buf.append(this.m_rootResource.toString());
	buf.append(")");
	buf.append("(initialSystem:");
	buf.append(this.m_initialSystem);
	buf.append(")");
	buf.append("(initialConnection:");
	buf.append(this.m_initialConnection.toString());
	buf.append(")");
	buf.append("(systemTypes:");
	buf.append(this.m_systemTypes.toString());
	buf.append(")");
	buf.append("(recentlyUsed:");
	buf.append(")");
	buf.append("]");
	return buf.toString();
};
oFF.SuDatasourceNavigationConfig.prototype.getRootResource = function()
{
	return this.m_rootResource;
};
oFF.SuDatasourceNavigationConfig.prototype.getInitialSystem = function()
{
	return this.m_initialSystem;
};
oFF.SuDatasourceNavigationConfig.prototype.getInitialConnection = function()
{
	return this.m_initialConnection;
};
oFF.SuDatasourceNavigationConfig.prototype.getRecentlyUsedDataProvider = function()
{
	return this.m_recentlyUsedDataProvider;
};
oFF.SuDatasourceNavigationConfig.prototype.isRecentlyUsedSet = function()
{
	return oFF.notNull(this.m_recentlyUsedDataProvider);
};
oFF.SuDatasourceNavigationConfig.prototype.isSystemTypeSupported = function(type)
{
	if (oFF.isNull(this.m_systemTypes) || this.m_systemTypes.size() === 0)
	{
		return true;
	}
	return oFF.XStream.of(this.m_systemTypes).anyMatch( function(stype){
		return oFF.XString.isEqual(type, stype.toString());
	}.bind(this));
};

oFF.SuLocalDataProvider = function() {};
oFF.SuLocalDataProvider.prototype = new oFF.SuDataProviderBase();
oFF.SuLocalDataProvider.prototype._ff_c = "SuLocalDataProvider";

oFF.SuLocalDataProvider.createEmpty = function()
{
	var provider = new oFF.SuLocalDataProvider();
	provider.setup();
	provider.m_filteredListSize = -1;
	return provider;
};
oFF.SuLocalDataProvider.create = function(list, comparator, filterFn)
{
	var provider = new oFF.SuLocalDataProvider();
	provider.setup();
	provider.m_comparator = comparator;
	provider.m_fetchResult = oFF.SuDataProviderFetchResult.createList(list);
	provider.m_filteredListSize = -1;
	provider.m_initialised = true;
	provider.m_customFilterFn = filterFn;
	return provider;
};
oFF.SuLocalDataProvider.prototype.m_filteredListSize = 0;
oFF.SuLocalDataProvider.prototype.m_comparator = null;
oFF.SuLocalDataProvider.prototype.isRemote = function()
{
	return false;
};
oFF.SuLocalDataProvider.prototype.setComparator = function(comparator)
{
	if (comparator !== this.m_comparator)
	{
		this.setDirty(oFF.SuDataProviderHelper.STATE_COMPARATOR_NAME, comparator.toString());
		this.m_comparator = comparator;
	}
	return this;
};
oFF.SuLocalDataProvider.prototype.getTotalItems = function()
{
	if (this.m_filteredListSize !== -1)
	{
		return this.m_filteredListSize;
	}
	else if (this.getFetchList() !== null)
	{
		return this.getFetchList().size();
	}
	return -1;
};
oFF.SuLocalDataProvider.prototype.forceInit = function()
{
	oFF.SuDataProviderBase.prototype.forceInit.call( this );
	this.resetFetchResult();
};
oFF.SuLocalDataProvider.prototype.setSortingAttribute = function(attribute)
{
	oFF.SuDataProviderBase.prototype.setSortingAttribute.call( this , attribute);
	this.m_comparator.setAttribute(attribute);
	return this;
};
oFF.SuLocalDataProvider.prototype.setSortingOrder = function(isAscending)
{
	oFF.SuDataProviderBase.prototype.setSortingOrder.call( this , isAscending);
	this.m_comparator.setOrder(isAscending);
	return this;
};
oFF.SuLocalDataProvider.prototype.getSortingAttribute = function()
{
	return oFF.notNull(this.m_comparator) ? this.m_comparator.getAttribute() : null;
};
oFF.SuLocalDataProvider.prototype.isSortingAscending = function()
{
	return oFF.notNull(this.m_comparator) ? this.m_comparator.isOrderAscending() : true;
};
oFF.SuLocalDataProvider.prototype.setupFetchResult = function(result, resolve)
{
	oFF.SuDataProviderBase.prototype.setupFetchResult.call( this , result, resolve);
	this.m_initialised = true;
	if (this.getFetchList() !== null)
	{
		this.setupProvidedList();
	}
	else
	{
		this.m_providedList = null;
	}
	this.m_dirty = false;
	this.endFetch(resolve);
};
oFF.SuLocalDataProvider.prototype.setupProvidedList = function()
{
	oFF.SuDataProviderBase.prototype.setupProvidedList.call( this );
	this.m_providedList = this.createFilteredSortedAndPagedList(this.getFetchList());
};
oFF.SuLocalDataProvider.prototype.createFilteredSortedAndPagedList = function(list)
{
	if (oFF.isNull(list))
	{
		return null;
	}
	var subList = oFF.XList.create();
	subList.addAll(list);
	if (oFF.notNull(this.m_customFilterFn))
	{
		subList = oFF.XStream.of(subList).filter( function(item){
			var result = this.callFilterFn(item);
			if (oFF.isNull(result))
			{
				return true;
			}
			return result.getBoolean();
		}.bind(this)).collect(oFF.XStreamCollector.toList());
		this.m_filteredListSize = subList.size();
	}
	else
	{
		this.m_filteredListSize = -1;
	}
	if (oFF.notNull(this.m_comparator))
	{
		subList.sortByComparator(this.m_comparator);
	}
	if (this.m_maxItems >= 0)
	{
		var fromIndex = this.m_offset;
		if (fromIndex > subList.size())
		{
			return oFF.XList.create();
		}
		else
		{
			var toIndex = fromIndex + this.m_maxItems;
			toIndex = toIndex < subList.size() ? toIndex : subList.size();
			return subList.sublist(fromIndex, toIndex);
		}
	}
	else
	{
		return subList;
	}
};

oFF.SuRemoteDataProvider = function() {};
oFF.SuRemoteDataProvider.prototype = new oFF.SuDataProviderBase();
oFF.SuRemoteDataProvider.prototype._ff_c = "SuRemoteDataProvider";

oFF.SuRemoteDataProvider.createEmpty = function()
{
	var provider = new oFF.SuRemoteDataProvider();
	provider.setup();
	var comparator = oFF.SuResourceComparator.createDefault();
	provider.m_sortAscending = comparator.isOrderAscending();
	provider.m_sortingAttribute = comparator.getAttribute();
	return provider;
};
oFF.SuRemoteDataProvider.prototype.m_totalItems = 0;
oFF.SuRemoteDataProvider.prototype.isRemote = function()
{
	return true;
};
oFF.SuRemoteDataProvider.prototype.getTotalItems = function()
{
	return this.m_totalItems;
};
oFF.SuRemoteDataProvider.prototype.setupFetchResult = function(result, resolve)
{
	oFF.SuDataProviderBase.prototype.setupFetchResult.call( this , result, resolve);
	this.m_totalItems = oFF.notNull(result) ? result.getTotalItems() : -1;
	this.setupProvidedList();
	this.endFetch(resolve);
};
oFF.SuRemoteDataProvider.prototype.setupProvidedList = function()
{
	oFF.SuDataProviderBase.prototype.setupProvidedList.call( this );
	var fetchedList = this.getFetchList();
	if (oFF.notNull(this.m_customFilterFn))
	{
		var filteredList = oFF.XStream.of(fetchedList).filter(this.getFilterFn()).collect(oFF.XStreamCollector.toList());
		this.m_providedList = filteredList;
	}
	else
	{
		this.m_providedList = fetchedList;
	}
};

oFF.SuRecentlyUsedCallbackDataProvider = function() {};
oFF.SuRecentlyUsedCallbackDataProvider.prototype = new oFF.XObjectExt();
oFF.SuRecentlyUsedCallbackDataProvider.prototype._ff_c = "SuRecentlyUsedCallbackDataProvider";

oFF.SuRecentlyUsedCallbackDataProvider.create = function(resourceExplorerRecentlyUsedCallback)
{
	var newProvider = new oFF.SuRecentlyUsedCallbackDataProvider();
	newProvider.m_resourceExplorerRecentlyUsedCallback = resourceExplorerRecentlyUsedCallback;
	return newProvider;
};
oFF.SuRecentlyUsedCallbackDataProvider.prototype.m_resourceExplorerRecentlyUsedCallback = null;
oFF.SuRecentlyUsedCallbackDataProvider.prototype.get = function()
{
	var list = oFF.XList.create();
	if (!this.m_resourceExplorerRecentlyUsedCallback.getRecentlyUsedDatasources(list))
	{
		this.log("Error during the datasource recently used initialization");
	}
	return list;
};
oFF.SuRecentlyUsedCallbackDataProvider.prototype.update = function(list)
{
	this.m_resourceExplorerRecentlyUsedCallback.onUpdateRecentlyUsedList(list);
};
oFF.SuRecentlyUsedCallbackDataProvider.prototype.add = function(datasource)
{
	this.m_resourceExplorerRecentlyUsedCallback.onAddToRecentlyUsed(datasource);
};

oFF.SuRecentlyUsedDataProviderBase = function() {};
oFF.SuRecentlyUsedDataProviderBase.prototype = new oFF.XObjectExt();
oFF.SuRecentlyUsedDataProviderBase.prototype._ff_c = "SuRecentlyUsedDataProviderBase";

oFF.SuRecentlyUsedDataProviderBase.prototype.m_recentlyUsed = null;
oFF.SuRecentlyUsedDataProviderBase.prototype.initRecentlyUsedByList = function(recentlyUsedList)
{
	this.setup();
	if (oFF.notNull(recentlyUsedList) && recentlyUsedList.size() > 0)
	{
		for (var j = 0; j < recentlyUsedList.size(); j++)
		{
			var recentlyUsedItem = recentlyUsedList.get(j).asStructure();
			if (oFF.notNull(recentlyUsedItem))
			{
				try
				{
					this.m_recentlyUsed.add(oFF.SuDataSourceInfo.createFromIPrStructure(recentlyUsedItem));
				}
				catch (t)
				{
					this.logWarning4("WARNING Error during the creation of SuDataSourceInfo (", recentlyUsedItem.toString(), "): ", oFF.XException.getStackTrace(t, 0));
				}
			}
		}
	}
};
oFF.SuRecentlyUsedDataProviderBase.prototype.setup = function()
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_recentlyUsed = oFF.XList.create();
};
oFF.SuRecentlyUsedDataProviderBase.prototype.get = function()
{
	return this.m_recentlyUsed;
};

oFF.SuNavigationHistory = function() {};
oFF.SuNavigationHistory.prototype = new oFF.XObjectExt();
oFF.SuNavigationHistory.prototype._ff_c = "SuNavigationHistory";

oFF.SuNavigationHistory.create = function()
{
	var newHist = new oFF.SuNavigationHistory();
	newHist.setup();
	newHist.setupInternal();
	return newHist;
};
oFF.SuNavigationHistory.prototype.m_history = null;
oFF.SuNavigationHistory.prototype.m_curHistoryIndex = 0;
oFF.SuNavigationHistory.prototype.releaseObject = function()
{
	this.m_history.clear();
	this.m_history = oFF.XObjectExt.release(this.m_history);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.SuNavigationHistory.prototype.addHistoryEntry = function(element)
{
	if (this.canGoToNext())
	{
		var newHistList = oFF.XListUtils.sublist(this.m_history, oFF.XList.create(), 0, this.m_curHistoryIndex);
		this.m_history.clear();
		this.m_history.addAll(newHistList);
		newHistList.clear();
	}
	this.m_history.add(element);
	this.m_curHistoryIndex = this.m_history.size() - 1;
};
oFF.SuNavigationHistory.prototype.getCurrent = function()
{
	if (this.m_history.size() > 1 && this.m_curHistoryIndex >= 0)
	{
		return this.m_history.get(this.m_curHistoryIndex);
	}
	return null;
};
oFF.SuNavigationHistory.prototype.canGoToPrevious = function()
{
	if (this.m_history.size() > 1 && this.m_curHistoryIndex > 0)
	{
		return true;
	}
	return false;
};
oFF.SuNavigationHistory.prototype.goToPrevious = function()
{
	if (this.canGoToPrevious())
	{
		this.m_curHistoryIndex--;
		return this.m_history.get(this.m_curHistoryIndex);
	}
	return null;
};
oFF.SuNavigationHistory.prototype.canGoToNext = function()
{
	if (this.m_history.size() > 1 && this.m_history.size() - 1 > this.m_curHistoryIndex)
	{
		return true;
	}
	return false;
};
oFF.SuNavigationHistory.prototype.goToNext = function()
{
	if (this.canGoToNext())
	{
		this.m_curHistoryIndex++;
		return this.m_history.get(this.m_curHistoryIndex);
	}
	return null;
};
oFF.SuNavigationHistory.prototype.clearHistory = function()
{
	this.m_history.clear();
	this.m_curHistoryIndex = -1;
};
oFF.SuNavigationHistory.prototype.setupInternal = function()
{
	this.m_history = oFF.XList.create();
	this.m_curHistoryIndex = -1;
};

oFF.SuResourceFilterManager = function() {};
oFF.SuResourceFilterManager.prototype = new oFF.XObjectExt();
oFF.SuResourceFilterManager.prototype._ff_c = "SuResourceFilterManager";

oFF.SuResourceFilterManager.create = function(config, listenerFilterFn, ctx)
{
	var filterMng = new oFF.SuResourceFilterManager();
	filterMng.m_configFilter = oFF.SuResourceFilterManager.createConfigFilterFunction(config);
	filterMng.m_configFilterElementList = oFF.SuResourceFilterManager.createConfigFilterElementList(config);
	filterMng.m_listenerFilterFn = listenerFilterFn;
	filterMng.m_config = config;
	filterMng.m_ctx = ctx;
	return filterMng;
};
oFF.SuResourceFilterManager.createConfigFilterFunction = function(config)
{
	if (oFF.isNull(config))
	{
		return oFF.SuResourceFilterManager.createTrueFilter();
	}
	var filterConfigElement = config.getByPath(oFF.SuResourceExplorerConfig.RESOURCE_FILTER);
	if (oFF.isNull(filterConfigElement))
	{
		return oFF.SuResourceFilterManager.createTrueFilter();
	}
	var filterConfigList = filterConfigElement.asList();
	return oFF.SuResourceFilterManager.createConfigFilterFunctionByPrList(config, filterConfigList);
};
oFF.SuResourceFilterManager.createConfigFilterFunctionByPrList = function(config, filterConfigList)
{
	if (oFF.isNull(filterConfigList))
	{
		return oFF.SuResourceFilterManager.createTrueFilter();
	}
	var extensionToFilter = oFF.XStringValue.create("");
	var filtersFileByAttribute = oFF.XHashMapOfStringByString.create();
	var filtersDirByAttribute = oFF.XHashMapOfStringByString.create();
	for (var i = 0; i < filterConfigList.size(); i++)
	{
		var filterConfig = filterConfigList.get(i).asStructure();
		var attributeKey = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY);
		var attributeValue = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_VALUE);
		var attributeType = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE);
		if (oFF.isNull(attributeKey) || oFF.isNull(attributeValue))
		{
			continue;
		}
		if (oFF.XString.isEqual(attributeKey, oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY_EXT))
		{
			extensionToFilter.setString(attributeValue);
		}
		else
		{
			if (config.isDatasourceNavigationEnabled())
			{
				if (oFF.isNull(attributeType) || oFF.XString.isEqual(attributeType, oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE_DATASOURCE))
				{
					filtersFileByAttribute.put(attributeKey, attributeValue);
				}
				else
				{
					filtersDirByAttribute.put(attributeKey, attributeValue);
				}
			}
			else
			{
				if (oFF.isNull(attributeType) || oFF.XString.isEqual(attributeType, oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE_FILE))
				{
					filtersFileByAttribute.put(attributeKey, attributeValue);
				}
				else
				{
					filtersDirByAttribute.put(attributeKey, attributeValue);
				}
			}
		}
	}
	if (oFF.XStringUtils.isNullOrEmpty(extensionToFilter.getString()) && filtersFileByAttribute.size() === 0 && filtersDirByAttribute.size() === 0)
	{
		return oFF.SuResourceFilterManager.createTrueFilter();
	}
	return  function(resource){
		var resourceWrapper = oFF.SuResourceWrapper.create(resource);
		var isDirectory = resourceWrapper.isResourceDirectory();
		var filtersByAttribute = !isDirectory ? filtersFileByAttribute : filtersDirByAttribute;
		var attributeKeys = filtersByAttribute.getKeysAsIteratorOfString();
		while (attributeKeys.hasNext())
		{
			var attributeToFilterKey = attributeKeys.next();
			var attributeToFilterValue = filtersByAttribute.getByKey(attributeToFilterKey);
			if (!oFF.SuResourceFilterManager.evaluateFilterAttribute(resourceWrapper, attributeToFilterKey, attributeToFilterValue))
			{
				return false;
			}
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(extensionToFilter.getString()) && !isDirectory)
		{
			var feaExtension = oFF.FeApolloFileExtension.getApolloExtensionForFile(resource);
			var fileExtension = feaExtension.getExtension();
			return oFF.XString.isEqual(fileExtension, extensionToFilter.getString());
		}
		return true;
	}.bind(this);
};
oFF.SuResourceFilterManager.evaluateFilterAttribute = function(resWrapper, attributeKey, attributeValue)
{
	var attributeIsNotNodeTypeLink = !(oFF.XString.isEqual(attributeKey, oFF.XFileAttribute.NODE_TYPE.getName()) && oFF.XString.isEqual(attributeValue, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_LINK));
	var resourceAttribute;
	if (attributeIsNotNodeTypeLink && resWrapper.isResourceLink())
	{
		resourceAttribute = resWrapper.getLinkedResourceAttribute(attributeKey);
	}
	else
	{
		resourceAttribute = resWrapper.getAttributeString(attributeKey, null);
	}
	if (oFF.isNull(resourceAttribute) || !oFF.XString.isEqual(attributeValue, resourceAttribute))
	{
		return false;
	}
	return true;
};
oFF.SuResourceFilterManager.createTrueFilter = function()
{
	return  function(file){
		return true;
	}.bind(this);
};
oFF.SuResourceFilterManager.newFilterElement = function(attrName, value)
{
	var fileAttr = oFF.SuResourceWrapper.getAttributeTypeMap(attrName);
	if (oFF.isNull(fileAttr))
	{
		return null;
	}
	return oFF.SuFilterElement.createWithType(fileAttr.getName(), value, oFF.SuFilterType.EXACT);
};
oFF.SuResourceFilterManager.createConfigFilterElementList = function(config)
{
	var filters = oFF.XList.create();
	if (oFF.isNull(config))
	{
		return filters;
	}
	var filterConfigElement = config.getByPath(oFF.SuResourceExplorerConfig.RESOURCE_FILTER);
	if (oFF.isNull(filterConfigElement))
	{
		return filters;
	}
	var filterConfigList = filterConfigElement.asList();
	if (oFF.isNull(filterConfigList))
	{
		return filters;
	}
	for (var i = 0; i < filterConfigList.size(); i++)
	{
		var filterConfig = filterConfigList.get(i).asStructure();
		var attributeKey = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY);
		var attributeValue = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_VALUE);
		var attributeType = filterConfig.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_TYPE);
		if (oFF.isNull(attributeKey) || oFF.isNull(attributeValue))
		{
			continue;
		}
		if (oFF.XString.isEqual(attributeKey, oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY_EXT))
		{
			var filterExt = oFF.SuResourceFilterManager.newFilterElement(oFF.XFileAttribute.NAME.getName(), attributeValue);
			filterExt.setType(oFF.SuFilterType.ENDS);
			filters.add(filterExt);
		}
		else
		{
			var filterAttr = oFF.SuResourceFilterManager.newFilterElement(attributeKey, attributeValue);
			filterAttr.setTypeExt(attributeType);
			filters.add(filterAttr);
		}
	}
	return filters;
};
oFF.SuResourceFilterManager.prototype.m_configFilter = null;
oFF.SuResourceFilterManager.prototype.m_configFilterElementList = null;
oFF.SuResourceFilterManager.prototype.m_listenerFilterFn = null;
oFF.SuResourceFilterManager.prototype.m_ctx = null;
oFF.SuResourceFilterManager.prototype.m_config = null;
oFF.SuResourceFilterManager.prototype.createFilterFunctionForDataProvider = function(query)
{
	var listenerFn = this.isListenerFilterSet() ? this.getListenerFilter() : null;
	var unsupportedFn = this.getUnsupportedFilterFunction(query);
	if (oFF.isNull(listenerFn) && oFF.isNull(unsupportedFn))
	{
		return null;
	}
	return  function(resource, queryStr){
		var result = (oFF.isNull(unsupportedFn) ? true : unsupportedFn(resource)) && (oFF.isNull(listenerFn) ? true : listenerFn(resource));
		return oFF.XBooleanValue.create(result);
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.getUnsupportedFilterFunction = function(query)
{
	var ff =  function(xFileFilterElement){
		var attributeToFilter = oFF.SuResourceWrapper.getAttributeTypeMap(xFileFilterElement.getName());
		return !query.supportsFilterOnAttribute(attributeToFilter);
	}.bind(this);
	var unsupportedFilterList = oFF.XStream.of(query.getCartesianFilter()).filter(ff).collect(oFF.XStreamCollector.toList());
	if (unsupportedFilterList.size() > 0)
	{
		var filterToFnlist = oFF.PrList.create();
		var sharedToMeFnPresent = oFF.XBooleanValue.create(false);
		oFF.XStream.of(unsupportedFilterList).forEach( function(unsupportedFilter){
			if (oFF.XString.isEqual(unsupportedFilter.getName(), oFF.XFileAttribute.IS_SHARED.getName()))
			{
				sharedToMeFnPresent.setBoolean(true);
			}
			else
			{
				var filterStructure = filterToFnlist.addNewStructure();
				filterStructure.putString(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_KEY, unsupportedFilter.getName());
				filterStructure.putString(oFF.SuResourceExplorerConfig.RESOURCE_FILTER_VALUE, unsupportedFilter.getValue());
			}
		}.bind(this));
		return this.buildUnsupportedFilterFunction(sharedToMeFnPresent.getBoolean(), filterToFnlist);
	}
	return null;
};
oFF.SuResourceFilterManager.prototype.buildUnsupportedFilterFunction = function(isSharedToMeFnPresent, list)
{
	return  function(resource){
		var shareToMeEvaluated = isSharedToMeFnPresent ? this.isSharedToMe(oFF.SuResourceWrapper.create(resource)) : true;
		return shareToMeEvaluated && oFF.SuResourceFilterManager.createConfigFilterFunctionByPrList(this.m_config, list)(resource);
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.isRecursiveSearchEnabled = function()
{
	if (!this.m_config.isToolbarEnabled())
	{
		return false;
	}
	var searchConfig = this.m_config.getByPath2(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH);
	if (oFF.isNull(searchConfig))
	{
		return false;
	}
	if (searchConfig.isBoolean())
	{
		return searchConfig.asBoolean().getBoolean();
	}
	if (searchConfig.isString())
	{
		return !oFF.XString.isEqual(searchConfig.asString().getString(), oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH_FOLDER);
	}
	return false;
};
oFF.SuResourceFilterManager.prototype.getFilter = function()
{
	return  function(resource){
		var listenerFilter = this.getListenerFilter()(resource);
		var configFilter = this.m_configFilter(resource);
		return listenerFilter && configFilter;
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.isListenerFilterSet = function()
{
	return oFF.notNull(this.m_listenerFilterFn);
};
oFF.SuResourceFilterManager.prototype.getListenerFilter = function()
{
	return  function(resource){
		try
		{
			return oFF.isNull(this.m_listenerFilterFn) ? true : this.m_listenerFilterFn(resource, this.m_ctx).getBoolean();
		}
		catch (e)
		{
			this.logWarning2("WARNING Error during the evaluation of the filter callback: ", oFF.XException.getStackTrace(e, 0));
		}
		return true;
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.buildFilterForState = function(state)
{
	return  function(file){
		if (!this.getFilter()(file))
		{
			return false;
		}
		if (!this.createQuickFilterFunction(state)(file))
		{
			return false;
		}
		return this.createSearchFilterFunction(state)(file);
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.buildFilterElementListFromState = function(state, resource)
{
	var filters = oFF.XList.create();
	filters.addAll(this.getConfigFilterElementList());
	var quickFilter = this.buildQuickFilterElement(state, resource);
	if (oFF.notNull(quickFilter))
	{
		filters.add(quickFilter);
	}
	return filters;
};
oFF.SuResourceFilterManager.prototype.getConfigFilterElementList = function()
{
	return this.m_configFilterElementList.getValuesAsReadOnlyList();
};
oFF.SuResourceFilterManager.prototype.createQuickFilterFunction = function(state)
{
	return  function(resource){
		if (state.getQuickFilter() === null)
		{
			return true;
		}
		var resourceWrapper = oFF.SuResourceWrapper.create(resource);
		if (this.ignoreQuickfilter(resourceWrapper))
		{
			return true;
		}
		switch (state.getQuickFilter())
		{
			case oFF.SuQuickFilterHelper.QUICK_FILTER_OWNED_BY_ME:
				return this.isOwnedByMeFn(resourceWrapper);

			case oFF.SuQuickFilterHelper.QUICK_FILTER_SHARED_TO_ME:
				return this.isSharedToMe(resourceWrapper);

			default:
				return true;
		}
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.isSharedToMe = function(resourceWrapper)
{
	return this.m_config.isSharedBasedOnUsernameEnabled() ? !this.isOwnedByMeFn(resourceWrapper) : resourceWrapper.isSharedToMe();
};
oFF.SuResourceFilterManager.prototype.isOwnedByMeFn = function(resourceWrapper)
{
	var fileOwner = resourceWrapper.get(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER, "");
	return oFF.XString.isEqual(fileOwner, this.getUsername());
};
oFF.SuResourceFilterManager.prototype.createSearchFilterFunction = function(state)
{
	return  function(resource){
		var searchQuery = state.getSearchQuery();
		if (oFF.XStringUtils.isNullOrEmpty(searchQuery))
		{
			return true;
		}
		var nameContainsSearchQuery = oFF.XStringUtils.containsString(resource.getName(), searchQuery, true);
		var descriptionContainsSearchQuery = this.attributeContainsQuery(resource, oFF.XFileAttribute.DESCRIPTION, searchQuery);
		var translatedDisplayName = oFF.SuResourceWrapper.create(resource).getTranslatedDisplayName();
		var displayNameContainsSearchQuery = this.attributeValueContainsQuery(translatedDisplayName, searchQuery);
		var ownerNameContainsSearchQuery = this.attributeContainsQuery(resource, oFF.XFileAttribute.CREATED_BY_DISPLAY_NAME, searchQuery);
		return nameContainsSearchQuery || descriptionContainsSearchQuery || displayNameContainsSearchQuery || ownerNameContainsSearchQuery;
	}.bind(this);
};
oFF.SuResourceFilterManager.prototype.buildQuickFilterElement = function(state, resource)
{
	if (state.getQuickFilter() === null)
	{
		return null;
	}
	switch (state.getQuickFilter())
	{
		case oFF.SuQuickFilterHelper.QUICK_FILTER_OWNED_BY_ME:
			return this.isOwnedByMeFilterElement();

		case oFF.SuQuickFilterHelper.QUICK_FILTER_SHARED_TO_ME:
			return this.isSharedToMeFilterElement();

		default:
			return null;
	}
};
oFF.SuResourceFilterManager.prototype.isSharedToMeFilterElement = function()
{
	var filter = this.isOwnedByMeFilterElement();
	filter.setType(oFF.SuFilterType.NOT);
	return filter;
};
oFF.SuResourceFilterManager.prototype.isOwnedByMeFilterElement = function()
{
	return oFF.SuResourceFilterManager.newFilterElement(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER, this.getUsername());
};
oFF.SuResourceFilterManager.prototype.ignoreQuickfilter = function(resourceWrapper)
{
	var isAllowedByConfig = this.m_config.isAllowIgnoreQuickFilterEnabled();
	var isSetOnFile = resourceWrapper.getAttributeBoolean(oFF.XFileAttribute.IGNORE_QUICKFILTERS.getName(), false);
	return isAllowedByConfig && isSetOnFile;
};
oFF.SuResourceFilterManager.prototype.attributeContainsQuery = function(file, attributeKey, searchQuery)
{
	var attribute = file.getAttributes().getByKey(attributeKey.getName());
	var attributeValue = oFF.notNull(attribute) ? attribute.asString().getString() : "";
	return this.attributeValueContainsQuery(attributeValue, searchQuery);
};
oFF.SuResourceFilterManager.prototype.attributeValueContainsQuery = function(attributeValue, searchQuery)
{
	return oFF.XStringUtils.containsString(attributeValue, searchQuery, true);
};
oFF.SuResourceFilterManager.prototype.getUsername = function()
{
	if (oFF.isNull(this.m_config))
	{
		return "";
	}
	var profile = this.m_config.getUserProfile();
	var sapName = profile.getSAPName();
	return sapName;
};

oFF.SuResourceWrapper = function() {};
oFF.SuResourceWrapper.prototype = new oFF.XObjectExt();
oFF.SuResourceWrapper.prototype._ff_c = "SuResourceWrapper";

oFF.SuResourceWrapper.PATH_SEPARATOR = "/";
oFF.SuResourceWrapper.SAPUI5_ICON_PREFIX_ATTRIBUTE = "sap-icon://";
oFF.SuResourceWrapper.SAPUI5_ICON_DEFAULT_DIRECTORY = "folder-blank";
oFF.SuResourceWrapper.SAPUI5_ICON_DEFAULT_RESOURCE = "document";
oFF.SuResourceWrapper.RESOURCE_FIELD_NAME = "name";
oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION = "description";
oFF.SuResourceWrapper.RESOURCE_FIELD_PACKAGE = "package";
oFF.SuResourceWrapper.RESOURCE_FIELD_TYPE = "type";
oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER = "owner";
oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME = "ownerDisplayName";
oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED = "created";
oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED = "modified";
oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED_FORMATTED = "createdFormatted";
oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED_FORMATTED = "modifiedFormatted";
oFF.SuResourceWrapper.RESOURCE_FIELD_SHARED = "shared";
oFF.SuResourceWrapper.RESOURCE_IGNORE_QUICKFILTERS = "ignoreQuickfilters";
oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_BW = "BW";
oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_ORCA = "ORCA";
oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_HANA = "HANA";
oFF.SuResourceWrapper.DATASOURCE_OLAP_DRIVER = "olap";
oFF.SuResourceWrapper.DATASOURCE_TYPE_BW = "query";
oFF.SuResourceWrapper.DATASOURCE_TYPE_HANA = "view";
oFF.SuResourceWrapper.DATASOURCE_TYPE_ORCA = "view";
oFF.SuResourceWrapper.DATASOURCE_SEMANTIC_TYPE_SYSTEM = "system";
oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_MODEL = "CUBE";
oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_STORY = "STORY";
oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_LINK = "LINK";
oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_FOLDER = "FOLDER";
oFF.SuResourceWrapper.RESOURCE_NODE_SUBTYPE_STORY = "INSIGHT";
oFF.SuResourceWrapper.s_resourceNameMap = null;
oFF.SuResourceWrapper.s_resourceAliasMap = null;
oFF.SuResourceWrapper.setupStatic = function(resourceNameMap)
{
	oFF.SuResourceWrapper.s_resourceNameMap = resourceNameMap;
};
oFF.SuResourceWrapper.setupStaticByConfig = function(config)
{
	var resourceMappingElement = config.getByPath(oFF.SuResourceExplorerConfig.RESOURCE_MAPPING);
	if (oFF.notNull(resourceMappingElement) && resourceMappingElement.isList())
	{
		var resMapList = resourceMappingElement.asList();
		if (resMapList.hasElements())
		{
			var aliasMap = oFF.XHashMapOfStringByString.create();
			var nameMap = oFF.XHashMapOfStringByString.create();
			for (var i = 0; i < resMapList.size(); i++)
			{
				var resMapElement = resMapList.get(i);
				if (oFF.notNull(resMapElement) && resMapElement.isStructure())
				{
					var resMapStructure = resMapElement.asStructure();
					var resPath = resMapStructure.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_PATH);
					var resAlias = resMapStructure.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_ALIAS);
					var resName = resMapStructure.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_NAME);
					var resDisplay = resMapStructure.getStringByKey(oFF.SuResourceExplorerConfig.RESOURCE_MAPPING_DISPLAY);
					if (oFF.notNull(resPath) && oFF.notNull(resAlias))
					{
						aliasMap.put(resPath, resAlias);
					}
					if (oFF.notNull(resDisplay))
					{
						var resNameMapKey = oFF.notNull(resPath) ? resPath : resName;
						if (oFF.notNull(resNameMapKey))
						{
							nameMap.put(resNameMapKey, resDisplay);
						}
					}
				}
			}
			if (aliasMap.size() > 0)
			{
				oFF.SuResourceWrapper.s_resourceAliasMap = aliasMap;
			}
			if (nameMap.size() > 0)
			{
				oFF.SuResourceWrapper.s_resourceNameMap = nameMap;
			}
		}
	}
};
oFF.SuResourceWrapper.createByPath = function(process, path, type)
{
	var resource = oFF.XFile.createWithVars(process, path);
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	if (oFF.notNull(type) && resourceWrapper.getAttributes() !== null)
	{
		resourceWrapper.setAttributes(oFF.XFileAttribute.NODE_TYPE.getName(), type);
	}
	return resourceWrapper;
};
oFF.SuResourceWrapper.create = function(file)
{
	return oFF.SuResourceWrapper.createWithFilter(file, null);
};
oFF.SuResourceWrapper.createWithFilter = function(file, filterFn)
{
	var helper = new oFF.SuResourceWrapper();
	helper.m_file = file;
	helper.m_filterFn = filterFn;
	return helper;
};
oFF.SuResourceWrapper.isResourceOlapSystem = function(resource)
{
	return oFF.XString.isEqual(oFF.SuResourceWrapper.DATASOURCE_SEMANTIC_TYPE_SYSTEM, oFF.SuResourceWrapper.create(resource).getAttributeStringByType(oFF.XFileAttribute.SEMANTIC_TYPE, ""));
};
oFF.SuResourceWrapper.isResourceOlapDatasource = function(resource)
{
	return !oFF.SuResourceWrapper.isResourceOlapSystem(resource) && oFF.SuResourceWrapper.create(resource).getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_TYPE, null) !== null;
};
oFF.SuResourceWrapper.getResourceOlapSystem = function(resource)
{
	var tmpResource = resource;
	while (oFF.notNull(tmpResource))
	{
		if (oFF.SuResourceWrapper.isResourceOlapSystem(tmpResource))
		{
			return tmpResource;
		}
		tmpResource = tmpResource.getParent();
	}
	return null;
};
oFF.SuResourceWrapper.isAncestor = function(resourceA, resourceB)
{
	var result = false;
	if (oFF.notNull(resourceA) && oFF.notNull(resourceB))
	{
		var urlB = resourceB.getUrl();
		var urlA = resourceA.getUrl();
		result = oFF.XString.startsWith(urlB, urlA);
	}
	return result;
};
oFF.SuResourceWrapper.isFileIncluded = function(resource, filterFn)
{
	if (oFF.isNull(filterFn))
	{
		return true;
	}
	return filterFn(resource);
};
oFF.SuResourceWrapper.getFileAttributeStringByType = function(file, attrType, defaultValue)
{
	return oFF.SuResourceWrapper.getFileAttributeString(file, attrType.getName(), defaultValue);
};
oFF.SuResourceWrapper.getFileAttributeString = function(resource, attrName, defaultValue)
{
	var wrapper = oFF.SuResourceWrapper.create(resource);
	return wrapper.getAttributeString(attrName, defaultValue);
};
oFF.SuResourceWrapper.areEquals = function(resourceA, resourceB)
{
	if (resourceA === resourceB)
	{
		return true;
	}
	if (oFF.isNull(resourceA) && oFF.notNull(resourceB) || oFF.notNull(resourceA) && oFF.isNull(resourceB))
	{
		return false;
	}
	var filePathA = oFF.SuResourceWrapper.getResourceUrlWithoutFinalSlash(resourceA);
	var filePathB = oFF.SuResourceWrapper.getResourceUrlWithoutFinalSlash(resourceB);
	var areEquals = oFF.XString.isEqual(filePathA, filePathB);
	if (!areEquals)
	{
		return false;
	}
	if (!oFF.SuResourceWrapper.isResourceOlapDatasource(resourceA) && !oFF.SuResourceWrapper.isResourceOlapDatasource(resourceB))
	{
		return true;
	}
	else if (oFF.SuResourceWrapper.isResourceOlapDatasource(resourceA) && oFF.SuResourceWrapper.isResourceOlapDatasource(resourceB))
	{
		var packageA = oFF.SuResourceWrapper.create(resourceA).getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE, "");
		var packageB = oFF.SuResourceWrapper.create(resourceB).getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE, "");
		return oFF.XString.isEqual(packageA, packageB);
	}
	else
	{
		return false;
	}
};
oFF.SuResourceWrapper.getFileName = function(resource)
{
	var fileName = oFF.XStringUtils.isNotNullAndNotEmpty(resource.getName()) ? resource.getName() : resource.getUri().getPath();
	return oFF.XPath.decodePath(fileName);
};
oFF.SuResourceWrapper.getAlias = function(resource)
{
	if (oFF.isNull(oFF.SuResourceWrapper.s_resourceAliasMap))
	{
		return null;
	}
	var path = oFF.SuResourceWrapper.getResourceUrlEncodedPath(resource);
	return oFF.SuResourceWrapper.s_resourceAliasMap.getByKey(path);
};
oFF.SuResourceWrapper.getResourceUrlEncodedPath = function(resource)
{
	var normalizedURI = oFF.XUri.createFromOther(resource.getUri());
	if (resource.isDirectory())
	{
		normalizedURI.getPathContainerBase().addChildDir(null);
	}
	var path = normalizedURI.getPathContainerBase().getUrlEncodedPath();
	return path;
};
oFF.SuResourceWrapper.getResourceChildByName = function(resource, name)
{
	var children = oFF.SuResourceWrapper.getCachedChildrenFiles(resource);
	return oFF.SuResourceWrapper.findChildByName(children, name);
};
oFF.SuResourceWrapper.getCachedChildrenFiles = function(file)
{
	var children = file.getCachedChildFiles();
	return oFF.notNull(children) ? children : file.getChildren();
};
oFF.SuResourceWrapper.supportRemoteQuery = function(resource)
{
	return true;
};
oFF.SuResourceWrapper.createQueryByDataProvider = function(resource, dataProvider, isStaticMetadata)
{
	return oFF.XPromise.create( function(resolve, rej){
		var fillQueryFromDataProvider =  function(query){
			var filledQuery = oFF.SuResourceWrapper.fillQueryFromDataProvider(query, dataProvider);
			resolve(filledQuery);
			return query;
		}.bind(this);
		oFF.SuResourceWrapper.getQuery(resource, isStaticMetadata).then(fillQueryFromDataProvider,  function(err){
			resolve(null);
		}.bind(this));
	}.bind(this));
};
oFF.SuResourceWrapper.getQuery = function(resource, isStaticMetadata)
{
	if (isStaticMetadata)
	{
		var metadata = oFF.JsonParserFactory.createFromString("{}").asStructure();
		metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SEARCH.getName(), true);
		metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_MAX_ITEMS.getName(), true);
		metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_OFFSET.getName(), true);
		metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SINGLE_SORT.getName(), false);
		metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER.getName(), true);
		var filterStructure = metadata.putNewStructure(oFF.XFileAttribute.SUPPORTED_FILTERS.getName());
		var dataSourcePackageFilterTypes = filterStructure.putNewStructure(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE.getName()).putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		dataSourcePackageFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
		dataSourcePackageFilterTypes.addString(oFF.XFileFilterType.ASTERISK.getName());
		var dataSourceSchemaFilterTypes = filterStructure.putNewStructure(oFF.XFileAttribute.OLAP_DATASOURCE_SCHEMA.getName()).putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		dataSourceSchemaFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
		dataSourceSchemaFilterTypes.addString(oFF.XFileFilterType.ASTERISK.getName());
		var nodeSubTypeFilterTypes = filterStructure.putNewStructure(oFF.XFileAttribute.NODE_SUB_TYPE.getName()).putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		nodeSubTypeFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
		nodeSubTypeFilterTypes.addString(oFF.XFileFilterType.ASTERISK.getName());
		var nodeTypeFilterTypes = filterStructure.putNewStructure(oFF.XFileAttribute.NODE_TYPE.getName()).putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		nodeTypeFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
		nodeTypeFilterTypes.addString(oFF.XFileFilterType.ASTERISK.getName());
		var olapDataCategoryFilterTypes = filterStructure.putNewStructure(oFF.XFileAttribute.OLAP_DATA_CATEGORY.getName()).putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		olapDataCategoryFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
		olapDataCategoryFilterTypes.addString(oFF.XFileFilterType.ASTERISK.getName());
		var queryFromStatic = oFF.XFileQuery.create(metadata);
		return oFF.XPromise.resolve(queryFromStatic);
	}
	if (resource.isMetadataLoaded())
	{
		var quickQuery = oFF.XFileQuery.create(resource.getCachedMetadata());
		return oFF.XPromise.resolve(quickQuery);
	}
	if (resource.getParent() === null)
	{
		return oFF.XPromise.resolve(null);
	}
	return oFF.XPromise.create( function(resolve, rej){
		oFF.SuResourceWrapper.create(resource).promiseFetchMetadata().then( function(resourceMd){
			var query = oFF.XFileQuery.create(resource.getCachedMetadata());
			resolve(query);
			return resourceMd;
		}.bind(this),  function(err){
			resolve(null);
		}.bind(this));
	}.bind(this));
};
oFF.SuResourceWrapper.fillQueryFromDataProvider = function(query, dataProvider)
{
	if (oFF.notNull(query))
	{
		if (query.supportsMaxItems() && dataProvider.getMaxItems() !== -1)
		{
			query.setMaxItems(dataProvider.getMaxItems());
		}
		if (query.supportsOffset())
		{
			query.setOffset(dataProvider.getOffset());
		}
		if (query.supportsSingleSort() && dataProvider.getSortingAttribute() !== null)
		{
			var sort = query.newSortDef();
			var fileAttribute = oFF.SuResourceWrapper.getAttributeTypeMap(dataProvider.getSortingAttribute());
			sort.setAttributeName(fileAttribute.getName());
			sort.setDirection(dataProvider.isSortingAscending() ? oFF.XSortDirection.ASCENDING : oFF.XSortDirection.DESCENDING);
			query.setSingleSortDef(sort);
		}
		if (query.supportsSearch() && dataProvider.getQuery() !== null)
		{
			query.setSearchValue(dataProvider.getQuery());
		}
		if (query.supportsCartesianFilter() && dataProvider.getFilters().size() > 0)
		{
			var filters = dataProvider.getFilters();
			oFF.XStream.of(filters).forEach( function(filter){
				var attribute = oFF.XFileAttribute.lookup(filter.getName());
				if (oFF.isNull(attribute))
				{
					return;
				}
				else
				{
					var newFileFilterType = oFF.XFileFilterType.EXACT;
					if (filter.getType() !== null)
					{
						if (filter.getType().is(oFF.XFileFilterType.ASTERISK))
						{
							newFileFilterType = oFF.XFileFilterType.ASTERISK;
						}
						else if (filter.getType().is(oFF.XFileFilterType.NOT))
						{
							newFileFilterType = oFF.XFileFilterType.NOT;
						}
					}
					var newFileFilter = query.newFilterElement(attribute);
					newFileFilter.setType(newFileFilterType);
					newFileFilter.setValue(filter.getValue());
					query.addCartesianFilter(newFileFilter);
				}
			}.bind(this));
		}
	}
	return query;
};
oFF.SuResourceWrapper.promiseFetchResourceChildren = function(resource, query)
{
	return oFF.XPromise.create( function(resolve, reject){
		resource.processFetchChildren(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileFetchChildrenListener.create( function(result, list){
			var resultTmp = result;
			if (oFF.notNull(resultTmp))
			{
				resolve(resultTmp);
			}
			else
			{
				reject(oFF.XError.create("null result"));
			}
		}.bind(this)), null, query);
	}.bind(this));
};
oFF.SuResourceWrapper.processFetchResourceChildren = function(resource, successConsumer, errorConsumer)
{
	resource.processFetchChildren(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileFetchChildrenListener.create( function(result, list){
		var resultTmp = result;
		if (oFF.notNull(resultTmp) && !resultTmp.hasErrors() && resultTmp.getData() !== null)
		{
			successConsumer(oFF.SuResourceWrapper.getCachedChildrenFiles(resultTmp.getData()));
		}
		else
		{
			if (oFF.notNull(errorConsumer))
			{
				errorConsumer(resultTmp);
			}
		}
	}.bind(this)), null, null);
};
oFF.SuResourceWrapper.processFetchResourceChildByName = function(resource, name, successConsumer, errorConsumer)
{
	oFF.SuResourceWrapper.processFetchResourceChildren(resource,  function(resourceList){
		var child = oFF.SuResourceWrapper.findChildByName(resourceList, name);
		successConsumer(child);
	}.bind(this), errorConsumer);
};
oFF.SuResourceWrapper.getAttributeTypeMap = function(attrName)
{
	switch (attrName)
	{
		case oFF.SuResourceWrapper.RESOURCE_FIELD_NAME:
			return oFF.XFileAttribute.NAME;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION:
			return oFF.XFileAttribute.DESCRIPTION;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_TYPE:
			return oFF.XFileAttribute.FILE_TYPE;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER:
			return oFF.XFileAttribute.CREATED_BY;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME:
			return oFF.XFileAttribute.CREATED_BY_DISPLAY_NAME;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED:
			return oFF.XFileAttribute.CREATED_AT;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED:
			return oFF.XFileAttribute.CHANGED_AT;

		default:
			return oFF.XFileAttribute.lookup(attrName);
	}
};
oFF.SuResourceWrapper.extractResourceNameNoExt = function(fileName)
{
	var extPoint = oFF.XString.lastIndexOf(fileName, ".");
	if (extPoint !== -1)
	{
		return oFF.XString.substring(fileName, 0, extPoint);
	}
	else
	{
		return fileName;
	}
};
oFF.SuResourceWrapper.extractResourceExt = function(fileName)
{
	var extPoint = oFF.XString.lastIndexOf(fileName, ".");
	if (extPoint !== -1)
	{
		return oFF.XString.substring(fileName, extPoint + 1, -1);
	}
	else
	{
		return "";
	}
};
oFF.SuResourceWrapper.findChildByName = function(children, name)
{
	if (oFF.isNull(children))
	{
		return null;
	}
	var childrenIterator = children.getIterator();
	while (childrenIterator.hasNext())
	{
		var childFile = childrenIterator.next();
		if (oFF.XString.isEqual(childFile.getName(), name))
		{
			return childFile;
		}
		var attributes = oFF.SuResourceWrapper.create(childFile).getAttributes();
		if (oFF.notNull(attributes))
		{
			var childDisplayName = childFile.getAttributes().getStringByKey(oFF.XFileAttribute.DISPLAY_NAME.getName());
			if (oFF.XString.isEqual(childDisplayName, name))
			{
				return childFile;
			}
		}
	}
	return null;
};
oFF.SuResourceWrapper.getResourceUrlWithoutFinalSlash = function(resource)
{
	var wrapper = oFF.SuResourceWrapper.create(resource);
	var uniqueId = wrapper.getAttributeStringByType(oFF.XFileAttribute.UNIQUE_ID, null);
	if (oFF.isNull(uniqueId) || oFF.XString.isEqual(uniqueId, wrapper.getTranslatedDisplayName()))
	{
		return oFF.SuResourceWrapper.getPathWithoutFinalSlash(resource.getUrl());
	}
	var parentPath = oFF.SuResourceWrapper.getPathWithoutFinalSlash(resource.getParent().getUrl());
	return oFF.XStringUtils.concatenate3(parentPath, oFF.SuResourceWrapper.PATH_SEPARATOR, uniqueId);
};
oFF.SuResourceWrapper.getPathWithoutFinalSlash = function(path)
{
	var newPath = path;
	var endsWithSlash = oFF.XString.endsWith(newPath, oFF.SuResourceWrapper.PATH_SEPARATOR);
	if (endsWithSlash)
	{
		newPath = oFF.XStringUtils.stripRight(newPath, 1);
	}
	return newPath;
};
oFF.SuResourceWrapper.filterResources = function(resourceList, filterFn)
{
	if (oFF.isNull(filterFn) || oFF.isNull(resourceList))
	{
		return resourceList;
	}
	var filteredResources = oFF.XList.create();
	var resourceIterator = resourceList.getIterator();
	while (resourceIterator.hasNext())
	{
		var resource = resourceIterator.next();
		if (oFF.SuResourceWrapper.isFileIncluded(resource, filterFn))
		{
			filteredResources.add(resource);
		}
	}
	return filteredResources;
};
oFF.SuResourceWrapper.prototype.m_file = null;
oFF.SuResourceWrapper.prototype.m_filterFn = null;
oFF.SuResourceWrapper.prototype.releaseObject = function()
{
	oFF.XObjectExt.prototype.releaseObject.call( this );
	this.m_file = null;
};
oFF.SuResourceWrapper.prototype.getUrlEncodedPath = function()
{
	return oFF.SuResourceWrapper.getResourceUrlEncodedPath(this.m_file);
};
oFF.SuResourceWrapper.prototype.getOwnerDisplayName = function()
{
	var value = this.get(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME, null);
	if (oFF.isNull(value))
	{
		value = this.get(oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER, null);
	}
	return value;
};
oFF.SuResourceWrapper.prototype.isVirtualFolder = function()
{
	return this.isResourceDirectory() && oFF.XString.isEqual(this.getDisplayName(), "Catalog");
};
oFF.SuResourceWrapper.prototype.promiseFetchResult = function(query)
{
	return oFF.XPromise.create( function(res, rej){
		var resolve = res;
		var reject = rej;
		this.promiseFetchChildren(query).then( function(result){
			var resultTmp = result;
			var resultset = resultTmp.getData().getCachedChildrenResultset();
			resolve(oFF.SuDataProviderFetchResult.create(resultset.getChildFiles(), resultset.getTotalItemCount(), resultTmp));
			return result;
		}.bind(this), reject);
	}.bind(this));
};
oFF.SuResourceWrapper.prototype.promiseFetchChildren = function(query)
{
	return oFF.SuResourceWrapper.promiseFetchResourceChildren(this.getFile(), query);
};
oFF.SuResourceWrapper.prototype.promiseFetchMetadata = function()
{
	return oFF.XPromise.create( function(resolve, reject){
		this.m_file.processFetchMetadata(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileFetchMetadataListener.create( function(extResult, metadata){
			var resultTmp = extResult;
			if (oFF.notNull(resultTmp) && !resultTmp.hasErrors())
			{
				resolve(resultTmp.getData());
			}
			else
			{
				reject(oFF.XError.create(oFF.notNull(resultTmp) ? resultTmp.getSummary() : "null result"));
			}
		}.bind(this)), null);
	}.bind(this));
};
oFF.SuResourceWrapper.prototype.processFetchMetadata = function(successConsumer, errorConsumer)
{
	this.m_file.processFetchMetadata(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileFetchMetadataListener.create( function(extResult, metadata){
		var resultTmp = extResult;
		if (oFF.notNull(resultTmp) && !resultTmp.hasErrors())
		{
			successConsumer(resultTmp.getData(), metadata);
		}
		else
		{
			if (oFF.notNull(errorConsumer))
			{
				errorConsumer(resultTmp);
			}
		}
	}.bind(this)), null);
};
oFF.SuResourceWrapper.prototype.processIsExisting = function(successConsumer, errorConsumer)
{
	this.m_file.processIsExisting(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileIsExistingListener.create( function(extResult, isExisting){
		var resultTmp = extResult;
		if (oFF.notNull(resultTmp) && !resultTmp.hasErrors())
		{
			successConsumer(extResult.getData(), isExisting);
		}
		else
		{
			if (oFF.notNull(errorConsumer))
			{
				errorConsumer(resultTmp);
			}
		}
	}.bind(this)), null);
};
oFF.SuResourceWrapper.prototype.processFetchChildren = function(successConsumer, errorConsumer)
{
	oFF.SuResourceWrapper.processFetchResourceChildren(this.getFile(),  function(resourceList){
		successConsumer(this.prepareChildren(resourceList));
	}.bind(this), errorConsumer);
};
oFF.SuResourceWrapper.prototype.processFetchChildrenRecursive = function(successConsumer, errorConsumer)
{
	var result = oFF.ExtResult.create(oFF.XList.create(), null);
	var consumerWrapper =  function(childrenRecursiveResult){
		var childrenRecursiveResultTmp = childrenRecursiveResult;
		if (childrenRecursiveResultTmp.hasErrors())
		{
			if (oFF.notNull(errorConsumer))
			{
				errorConsumer(childrenRecursiveResultTmp);
			}
		}
		else
		{
			var resultSuccess = childrenRecursiveResultTmp.getData();
			if (oFF.isNull(resultSuccess))
			{
				resultSuccess = oFF.XList.create();
			}
			successConsumer(resultSuccess.getValuesAsReadOnlyList());
		}
	}.bind(this);
	this.processFetchChildrenOfFileRecursive(this.getFile(), consumerWrapper, result, oFF.XIntegerValue.create(1));
};
oFF.SuResourceWrapper.prototype.getRealResource = function()
{
	var isLink = this.getAttributeByType(oFF.XFileAttribute.IS_LINK);
	if (oFF.notNull(isLink) && isLink.isBoolean() && isLink.asBoolean().getBoolean())
	{
		var linkUrl = this.getAttributeByType(oFF.XFileAttribute.LINK_URL);
		var metadataLinkUrl = this.m_file.getCachedMetadata().getByKey(oFF.XFileAttribute.LINK_URL.getName());
		var url = null;
		if (oFF.notNull(linkUrl) && linkUrl.isString())
		{
			url = linkUrl.asString().getString();
		}
		else if (oFF.notNull(metadataLinkUrl) && metadataLinkUrl.isString())
		{
			url = metadataLinkUrl.asString().getString();
		}
		if (oFF.notNull(url))
		{
			return oFF.XFile.createWithVars(this.m_file.getProcess(), url);
		}
		else
		{
			var msg = oFF.XStringBuffer.create();
			msg.append("Invalid '");
			msg.append(oFF.XFileAttribute.LINK_URL.getName());
			msg.append("' value '");
			if (oFF.notNull(linkUrl))
			{
				msg.append(linkUrl.getStringRepresentation());
			}
			else if (oFF.notNull(metadataLinkUrl))
			{
				msg.append(metadataLinkUrl.getStringRepresentation());
			}
			else
			{
				msg.append("null");
			}
			msg.append("' for a link resource: ");
			msg.append(this.m_file.toString());
			this.logWarning(msg.toString());
			return this.getResourceFromAnchestors();
		}
	}
	return this.m_file;
};
oFF.SuResourceWrapper.prototype.getResourceFromAnchestors = function()
{
	var ancestorList = this.getAnchestorsList();
	if (oFF.notNull(ancestorList))
	{
		var path = oFF.XStringBuffer.create();
		oFF.XCollectionUtils.forEach(ancestorList,  function(ancestor){
			if (ancestor.isStructure())
			{
				var ancestorStruct = ancestor.asStructure();
				if (ancestorStruct.hasElements())
				{
					var name = ancestorStruct.getStringByKey(oFF.XFileAttribute.UNIQUE_ID.getName());
					path.append(name);
					path.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
				}
			}
		}.bind(this));
		path.append(this.m_file.getName());
		return oFF.XFile.createWithVars(this.m_file.getProcess(), path.toString());
	}
	return this.m_file;
};
oFF.SuResourceWrapper.prototype.getAnchestorsList = function()
{
	var ancestorListElement = this.getAttributeByType(oFF.XFileAttribute.ANCESTOR_RESOURCE);
	if (oFF.notNull(ancestorListElement) && ancestorListElement.isList())
	{
		var ancestorList = ancestorListElement.asList();
		if (oFF.notNull(ancestorList) && ancestorList.hasElements())
		{
			return ancestorList;
		}
	}
	return null;
};
oFF.SuResourceWrapper.prototype.getOlapSystem = function()
{
	return oFF.SuResourceWrapper.getResourceOlapSystem(this.m_file);
};
oFF.SuResourceWrapper.prototype.getName = function()
{
	return oFF.SuResourceWrapper.getFileName(this.m_file);
};
oFF.SuResourceWrapper.prototype.getDisplayName = function()
{
	var displayName = oFF.SuResourceWrapper.getFileAttributeStringByType(this.m_file, oFF.XFileAttribute.DISPLAY_NAME, null);
	return oFF.notNull(displayName) ? displayName : oFF.SuResourceWrapper.getFileName(this.m_file);
};
oFF.SuResourceWrapper.prototype.getTranslatedDisplayName = function()
{
	return this._getDisplayName(false);
};
oFF.SuResourceWrapper.prototype.getAliasOrTranslatedDisplayName = function()
{
	return this._getDisplayName(true);
};
oFF.SuResourceWrapper.prototype._getDisplayName = function(checkAlias)
{
	if (checkAlias)
	{
		var alias = oFF.SuResourceWrapper.getAlias(this.m_file);
		if (oFF.notNull(alias))
		{
			return alias;
		}
	}
	if (oFF.notNull(oFF.SuResourceWrapper.s_resourceNameMap))
	{
		var resPath = this.getUrlEncodedPath();
		if (oFF.SuResourceWrapper.s_resourceNameMap.containsKey(resPath))
		{
			return oFF.SuResourceWrapper.s_resourceNameMap.getByKey(resPath);
		}
		if (oFF.SuResourceWrapper.s_resourceNameMap.containsKey(this.m_file.getName()))
		{
			return oFF.SuResourceWrapper.s_resourceNameMap.getByKey(this.m_file.getName());
		}
	}
	return this.getDisplayName();
};
oFF.SuResourceWrapper.prototype.getChildren = function()
{
	return this.prepareChildren(oFF.SuResourceWrapper.getCachedChildrenFiles(this.getFile()));
};
oFF.SuResourceWrapper.prototype.getChildByName = function(name)
{
	return oFF.SuResourceWrapper.getResourceChildByName(this.m_file, name);
};
oFF.SuResourceWrapper.prototype.processFetchChildByName = function(name, successConsumer, errorConsumer)
{
	oFF.SuResourceWrapper.processFetchResourceChildByName(this.m_file, name, successConsumer, errorConsumer);
};
oFF.SuResourceWrapper.prototype.getChildrenRecursive = function()
{
	var file = this.getFile();
	return this.getChildrenOfFileRecursive(file);
};
oFF.SuResourceWrapper.prototype.isResourceLink = function()
{
	var nodeType = this.getAttributeStringByType(oFF.XFileAttribute.NODE_TYPE, null);
	return oFF.XString.isEqual(nodeType, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_LINK);
};
oFF.SuResourceWrapper.prototype.isResourceDirectory = function()
{
	if (this.m_file.isDirectory())
	{
		return true;
	}
	if (this.isResourceLink())
	{
		var nodeType = this.getLinkedResourceAttributeByType(oFF.XFileAttribute.NODE_TYPE);
		return oFF.XString.isEqual(nodeType, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_FOLDER);
	}
	return false;
};
oFF.SuResourceWrapper.prototype.getLinkedResource = function()
{
	if (this.isResourceLink())
	{
		return this.getAttributeByType(oFF.XFileAttribute.SOURCE_RESOURCE);
	}
	return null;
};
oFF.SuResourceWrapper.prototype.isIncluded = function()
{
	return oFF.SuResourceWrapper.isFileIncluded(this.m_file, this.m_filterFn);
};
oFF.SuResourceWrapper.prototype.getIconControl = function(container)
{
	if (oFF.isNull(container))
	{
		return null;
	}
	var iconAttribute = null;
	if (this.isResourceLink())
	{
		iconAttribute = this.getLinkedResourceAttributeByType(oFF.XFileAttribute.ICON);
	}
	if (oFF.isNull(iconAttribute))
	{
		iconAttribute = this.getAttributeStringByType(oFF.XFileAttribute.ICON, null);
	}
	var sapIconName = null;
	var sapIconDefaultName = this.isResourceDirectory() ? oFF.SuResourceWrapper.SAPUI5_ICON_DEFAULT_DIRECTORY : oFF.SuResourceWrapper.SAPUI5_ICON_DEFAULT_RESOURCE;
	if (oFF.isNull(iconAttribute))
	{
		sapIconName = sapIconDefaultName;
	}
	else if (oFF.XString.startsWith(iconAttribute, oFF.SuResourceWrapper.SAPUI5_ICON_PREFIX_ATTRIBUTE))
	{
		sapIconName = oFF.XString.substring(iconAttribute, oFF.XString.size(oFF.SuResourceWrapper.SAPUI5_ICON_PREFIX_ATTRIBUTE), -1);
	}
	return this.getSAPUI5Icon(container, oFF.notNull(sapIconName) ? sapIconName : sapIconDefaultName);
};
oFF.SuResourceWrapper.prototype.getCreatedFormattedDate = function()
{
	if (oFF.notNull(this.m_file) && this.m_file.getAttributes() !== null)
	{
		return this.getFormatedDate(this.m_file.getAttributes().getLongByKey(oFF.XFileAttribute.CREATED_AT.getName()));
	}
	return null;
};
oFF.SuResourceWrapper.prototype.getModifiedFormattedDate = function()
{
	if (oFF.notNull(this.m_file) && this.m_file.getAttributes() !== null)
	{
		return this.getFormatedDate(this.m_file.getAttributes().getLongByKey(oFF.XFileAttribute.CHANGED_AT.getName()));
	}
	return null;
};
oFF.SuResourceWrapper.prototype.getFormatedDate = function(timeInMillis)
{
	var formattedString = "";
	try
	{
		var isoDateTime = oFF.XDateTime.createWithMillis(timeInMillis);
		if (oFF.notNull(isoDateTime))
		{
			var dateForamt = "MMM dd, yyyy";
			var timeFormat = "HH:mm:ss";
			var userProfile = this.m_file.getProcess().getUserProfile();
			if (oFF.notNull(userProfile))
			{
				if (oFF.XStringUtils.isNotNullAndNotEmpty(userProfile.getDateFormatting()))
				{
					dateForamt = userProfile.getDateFormatting();
				}
				if (oFF.XStringUtils.isNotNullAndNotEmpty(userProfile.getTimeFormatting()))
				{
					timeFormat = userProfile.getTimeFormatting();
				}
				if (userProfile.getTimeZone() !== null)
				{
					isoDateTime.setTimeZone(userProfile.getTimeZone());
				}
			}
			var dateFormatter2 = oFF.XDateTimeFormatter.create(oFF.XStringUtils.concatenate3(dateForamt, " ", timeFormat));
			formattedString = dateFormatter2.formatDateTime(isoDateTime);
		}
	}
	catch (e)
	{
		formattedString = "";
	}
	return formattedString;
};
oFF.SuResourceWrapper.prototype.getAttributeStringByType = function(attrType, defaultValue)
{
	return this.getAttributeString(attrType.getName(), defaultValue);
};
oFF.SuResourceWrapper.prototype.get = function(attrName, defaultValue)
{
	switch (attrName)
	{
		case oFF.SuResourceWrapper.RESOURCE_FIELD_NAME:
			return this.getFile().getName();

		case oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION:
			return this.getAttributeStringByType(oFF.XFileAttribute.DESCRIPTION, defaultValue);

		case oFF.SuResourceWrapper.RESOURCE_FIELD_TYPE:
			return this.getFile().getFileType() !== null ? this.getFile().getFileType().toString() : null;

		case oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER:
			return this.getAttributeStringByType(oFF.XFileAttribute.CREATED_BY, defaultValue);

		case oFF.SuResourceWrapper.RESOURCE_FIELD_OWNER_DISPLAY_NAME:
			return this.getAttributeStringByType(oFF.XFileAttribute.CREATED_BY_DISPLAY_NAME, defaultValue);

		case oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED:
			return this.getAttributeStringByType(oFF.XFileAttribute.CREATED_AT, defaultValue);

		case oFF.SuResourceWrapper.RESOURCE_FIELD_CREATED_FORMATTED:
			return this.getCreatedFormattedDate();

		case oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED:
			return this.getAttributeStringByType(oFF.XFileAttribute.CHANGED_AT, defaultValue);

		case oFF.SuResourceWrapper.RESOURCE_FIELD_MODIFIED_FORMATTED:
			return this.getModifiedFormattedDate();

		default:
			return this.getAttributeString(attrName, defaultValue);
	}
};
oFF.SuResourceWrapper.prototype.getAttributeString = function(attrName, defaultValue)
{
	var attribute = this.getAttribute(attrName);
	if (oFF.isNull(attribute))
	{
		return defaultValue;
	}
	var value = defaultValue;
	if (!attribute.isString())
	{
		value = attribute.getStringRepresentation();
	}
	else
	{
		value = attribute.asString().getString();
	}
	return oFF.XStringUtils.isNotNullAndNotEmpty(value) ? value : defaultValue;
};
oFF.SuResourceWrapper.prototype.getAttributeBoolean = function(attrName, defaultValue)
{
	var attribute = this.getAttribute(attrName);
	if (oFF.isNull(attribute))
	{
		return defaultValue;
	}
	if (!attribute.isBoolean())
	{
		this.logWarning3("The attribute '", attrName, "' is not a Boolean!");
	}
	return attribute.asBoolean().getBoolean();
};
oFF.SuResourceWrapper.prototype.getLinkedResourceAttributeByType = function(type)
{
	return this.getLinkedResourceAttribute(type.getName());
};
oFF.SuResourceWrapper.prototype.getLinkedResourceAttribute = function(attrName)
{
	var linkedResource = this.getLinkedResource();
	if (oFF.notNull(linkedResource))
	{
		return linkedResource.asStructure().getStringByKey(attrName);
	}
	return null;
};
oFF.SuResourceWrapper.prototype.getAttributeByType = function(type)
{
	return this.getAttribute(type.getName());
};
oFF.SuResourceWrapper.prototype.getAttribute = function(attrName)
{
	var attributes = this.getAttributes();
	if (oFF.notNull(attributes) && attributes.containsKey(attrName))
	{
		return attributes.getByKey(attrName);
	}
	return null;
};
oFF.SuResourceWrapper.prototype.setAttributes = function(attrName, attrValue)
{
	var attributes = this.getAttributes();
	if (oFF.notNull(attributes))
	{
		attributes.putString(attrName, attrValue);
	}
};
oFF.SuResourceWrapper.prototype.getAttributes = function()
{
	try
	{
		return this.m_file.getAttributes();
	}
	catch (t)
	{
		this.logWarning4("WARNING Error during the retrieval of resource (", this.m_file.toString(), ") attributes: ", oFF.XException.getStackTrace(t, 0));
	}
	return null;
};
oFF.SuResourceWrapper.prototype.extractNameNoExt = function()
{
	return oFF.SuResourceWrapper.extractResourceNameNoExt(this.m_file.getName());
};
oFF.SuResourceWrapper.prototype.getNameOrPath = function()
{
	return oFF.SuResourceWrapper.getFileName(this.m_file);
};
oFF.SuResourceWrapper.prototype.isEquals = function(resource)
{
	return oFF.SuResourceWrapper.areEquals(this.m_file, resource);
};
oFF.SuResourceWrapper.prototype.isAnchestorOf = function(resourceB)
{
	return oFF.SuResourceWrapper.isAncestor(resourceB, this.m_file);
};
oFF.SuResourceWrapper.prototype.isAnchestorFile = function(resourceB)
{
	return oFF.SuResourceWrapper.isAncestor(this.m_file, resourceB);
};
oFF.SuResourceWrapper.prototype.getFile = function()
{
	return this.m_file;
};
oFF.SuResourceWrapper.prototype.isShared = function()
{
	return this.getAttributeBoolean(oFF.XFileAttribute.SHARED.getName(), false);
};
oFF.SuResourceWrapper.prototype.isSharedToMe = function()
{
	return this.getAttributeBoolean(oFF.XFileAttribute.IS_SHARED.getName(), false);
};
oFF.SuResourceWrapper.prototype.prepareChildren = function(children)
{
	return oFF.SuResourceWrapper.filterResources(children, this.m_filterFn);
};
oFF.SuResourceWrapper.prototype.getSAPUI5Icon = function(container, iconName)
{
	var icon = container.addNewItemOfType(oFF.UiType.ICON);
	icon.setIcon(iconName);
	return icon;
};
oFF.SuResourceWrapper.prototype.getChildrenOfFileRecursive = function(file)
{
	var toProcess = file.getChildren();
	var resourceIterator = toProcess.getIterator();
	var filteredChildren = oFF.XList.create();
	var child;
	while (resourceIterator.hasNext())
	{
		child = resourceIterator.next();
		var childWrapper = oFF.SuResourceWrapper.createWithFilter(child, this.m_filterFn);
		if (childWrapper.isIncluded())
		{
			filteredChildren.add(child);
		}
		if (childWrapper.isResourceDirectory())
		{
			filteredChildren.addAll(this.getChildrenOfFileRecursive(child));
		}
	}
	return filteredChildren;
};
oFF.SuResourceWrapper.prototype.processFetchChildrenOfFileRecursive = function(file, consumerCaller, result, remainingDirectories)
{
	if (result.hasErrors())
	{
		consumerCaller(result);
	}
	var logStringHeader = oFF.XStringUtils.concatenate2("[processFetchChildrenOfFileRecursive]", file.getUrl());
	var successConsumerLocal =  function(toProcess){
		var logStringConsumerHeader = oFF.XStringUtils.concatenate2(logStringHeader, "[consumer]");
		var resourceIterator = toProcess.getIterator();
		while (resourceIterator.hasNext())
		{
			var child = resourceIterator.next();
			var childWrapper = oFF.SuResourceWrapper.createWithFilter(child, this.m_filterFn);
			var buf = oFF.XStringBuffer.create();
			buf.append(logStringConsumerHeader);
			buf.append("[child:");
			buf.append(child.getName());
			buf.append("][included:");
			if (childWrapper.isIncluded())
			{
				result.getData().add(child);
				buf.append("true]");
			}
			else
			{
				buf.append("false]");
			}
			buf.append("[type:");
			if (childWrapper.isResourceDirectory())
			{
				buf.append("dir]");
				remainingDirectories.setInteger(remainingDirectories.getInteger() + 1);
				this.processFetchChildrenOfFileRecursive(child, consumerCaller, result, remainingDirectories);
			}
			else
			{
				buf.append("file]");
			}
			buf.append("[dirsLeft:");
			buf.append(remainingDirectories.toString());
			buf.append("]");
		}
		remainingDirectories.setInteger(remainingDirectories.getInteger() - 1);
		if (remainingDirectories.getInteger() === 0)
		{
			consumerCaller(result);
		}
	}.bind(this);
	oFF.SuResourceWrapper.processFetchResourceChildren(file, successConsumerLocal,  function(messages){
		var nullResult = null;
		consumerCaller(oFF.ExtResult.create(nullResult, messages));
	}.bind(this));
};

oFF.SuResourceInfo = function() {};
oFF.SuResourceInfo.prototype = new oFF.XObject();
oFF.SuResourceInfo.prototype._ff_c = "SuResourceInfo";

oFF.SuResourceInfo.SYSTEM_NAME = "systemName";
oFF.SuResourceInfo.TYPE = "type";
oFF.SuResourceInfo.ENVIRONMENT_NAME = "environmentName";
oFF.SuResourceInfo.SCHEMA_NAME = "schemaName";
oFF.SuResourceInfo.PACKAGE_NAME = "packageName";
oFF.SuResourceInfo.OBJECT_NAME = "objectName";
oFF.SuResourceInfo.create = function(name, description)
{
	var info = oFF.SuResourceInfo.createEmpty();
	return info.setUp(name, description, null, true);
};
oFF.SuResourceInfo.createByDatasource = function(datasource)
{
	var info = oFF.SuResourceInfo.createEmpty();
	info.setUp(datasource.getDataSourceName(), null, null, false);
	info.setString(oFF.SuResourceInfo.SYSTEM_NAME, datasource.getSystemName());
	info.setString(oFF.SuResourceInfo.TYPE, datasource.getObjectType());
	info.setString(oFF.SuResourceInfo.ENVIRONMENT_NAME, "");
	info.setString(oFF.SuResourceInfo.SCHEMA_NAME, datasource.getSchemaName());
	info.setString(oFF.SuResourceInfo.PACKAGE_NAME, datasource.getPackageName());
	info.setString(oFF.SuResourceInfo.OBJECT_NAME, datasource.getDataSourceName());
	return info;
};
oFF.SuResourceInfo.createByResource = function(resource)
{
	var wrapper = oFF.SuResourceWrapper.create(resource);
	var info = oFF.SuResourceInfo.createEmpty();
	return info.setUp(wrapper.getTranslatedDisplayName(), wrapper.getAttributeStringByType(oFF.XFileAttribute.DESCRIPTION, null), resource.getUrl(), wrapper.isResourceDirectory());
};
oFF.SuResourceInfo.createEmpty = function()
{
	var newInfoState = new oFF.SuResourceInfo();
	newInfoState.m_attributes = oFF.XHashMapByString.create();
	return newInfoState;
};
oFF.SuResourceInfo.createClone = function(resourceInfo)
{
	if (oFF.isNull(resourceInfo))
	{
		return oFF.SuResourceInfo.createEmpty();
	}
	var clonedInfo = oFF.SuResourceInfo.createEmpty();
	clonedInfo.setUp(resourceInfo.getName(), resourceInfo.getDescription(), resourceInfo.getUrl(), resourceInfo.isDirectory());
	var attributes = resourceInfo.getAttributeNames();
	for (var i = 0; i < attributes.size(); i++)
	{
		var attribute = attributes.get(i);
		clonedInfo.m_attributes.put(attribute, resourceInfo.get(attribute));
	}
	return clonedInfo;
};
oFF.SuResourceInfo.prototype.m_name = null;
oFF.SuResourceInfo.prototype.m_description = null;
oFF.SuResourceInfo.prototype.m_url = null;
oFF.SuResourceInfo.prototype.m_isDirectory = false;
oFF.SuResourceInfo.prototype.m_attributes = null;
oFF.SuResourceInfo.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append("url:[");
	buffer.append(this.m_url);
	buffer.append("]-");
	buffer.append("name:[");
	buffer.append(this.m_name);
	buffer.append("]-");
	buffer.append("description:[");
	buffer.append(this.m_description);
	buffer.append("]-");
	buffer.append("isDirectory:[");
	buffer.append(oFF.XBoolean.convertToString(this.m_isDirectory));
	buffer.append("]-attributes:[");
	var attributeNames = this.m_attributes.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < attributeNames.size(); i++)
	{
		var attributeName = attributeNames.get(i);
		buffer.append(attributeName);
		buffer.append(":");
		buffer.append(this.m_attributes.getByKey(attributeName).toString());
		if (i < attributeNames.size() - 1)
		{
			buffer.append(",");
		}
	}
	buffer.append("]");
	return buffer.toString();
};
oFF.SuResourceInfo.prototype.set = function(attributeName, value)
{
	this.m_attributes.put(attributeName, value);
	return this;
};
oFF.SuResourceInfo.prototype.setString = function(attributeName, value)
{
	this.m_attributes.put(attributeName, oFF.XStringValue.create(value));
	return this;
};
oFF.SuResourceInfo.prototype.getName = function()
{
	return this.m_name;
};
oFF.SuResourceInfo.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.SuResourceInfo.prototype.getUrl = function()
{
	return this.m_url;
};
oFF.SuResourceInfo.prototype.isValid = function()
{
	return oFF.SuResourceInfoFormHelper.getInstance().isFileNameValid(this.m_name) && oFF.SuResourceInfoFormHelper.getInstance().isFileNameMinLenghtValid(this.m_name);
};
oFF.SuResourceInfo.prototype.getAttributeNames = function()
{
	return this.m_attributes.getKeysAsReadOnlyListOfString();
};
oFF.SuResourceInfo.prototype.get = function(attributeName)
{
	return this.m_attributes.getByKey(attributeName);
};
oFF.SuResourceInfo.prototype.getString = function(attributeName)
{
	var attrValue = this.m_attributes.getByKey(attributeName);
	if (oFF.notNull(attrValue))
	{
		return attrValue.toString();
	}
	return null;
};
oFF.SuResourceInfo.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.SuResourceInfo.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.SuResourceInfo.prototype.setUrl = function(url)
{
	this.m_url = url;
	return this;
};
oFF.SuResourceInfo.prototype.isDirectory = function()
{
	return this.m_isDirectory;
};
oFF.SuResourceInfo.prototype.setIsDirectory = function(isDirectory)
{
	this.m_isDirectory = isDirectory;
	return this;
};
oFF.SuResourceInfo.prototype.setUp = function(name, description, url, isDirectory)
{
	this.m_name = name;
	this.m_description = description;
	this.m_url = url;
	this.m_isDirectory = isDirectory;
	this.m_attributes = oFF.XHashMapByString.create();
	return this;
};

oFF.SuQuickFilter = function() {};
oFF.SuQuickFilter.prototype = new oFF.XObject();
oFF.SuQuickFilter.prototype._ff_c = "SuQuickFilter";

oFF.SuQuickFilter.create = function(genesis, store)
{
	var newQuickFilter = new oFF.SuQuickFilter();
	newQuickFilter.m_store = store;
	newQuickFilter.buildUI(genesis);
	return newQuickFilter;
};
oFF.SuQuickFilter.prototype.m_store = null;
oFF.SuQuickFilter.prototype.m_filters = null;
oFF.SuQuickFilter.prototype.getUiView = function()
{
	return this.m_filters;
};
oFF.SuQuickFilter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_filters = oFF.XObjectExt.release(this.m_filters);
	this.m_store = null;
};
oFF.SuQuickFilter.prototype.buildUI = function(genesis)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_filters = genesis.newControl(oFF.UiType.DROPDOWN);
	this.m_filters.setName("reQuickFilter");
	this.m_filters.addCssClass("ffReQuickFilter");
	this.addDropdownItem(oFF.SuQuickFilterHelper.QUICK_FILTER_ALL, i18nProvider.getText(oFF.SuResourceExplorerI18n.QUICK_FILTER_ALL));
	this.addDropdownItem(oFF.SuQuickFilterHelper.QUICK_FILTER_OWNED_BY_ME, i18nProvider.getText(oFF.SuResourceExplorerI18n.QUICK_FILTER_OWNED));
	this.addDropdownItem(oFF.SuQuickFilterHelper.QUICK_FILTER_SHARED_TO_ME, i18nProvider.getText(oFF.SuResourceExplorerI18n.QUICK_FILTER_SHARED_WITH_ME));
	this.m_filters.setTooltip(i18nProvider.getText(oFF.SuResourceExplorerI18n.QUICK_FILTER_TOOLTIP));
	this.m_filters.setSelectedItemByIndex(0);
	this.m_filters.registerOnSelect(this);
	this.m_store.getApp().setFocus(this.m_filters);
	this.updateUI();
};
oFF.SuQuickFilter.prototype.addDropdownItem = function(name, text)
{
	this.m_filters.addNewItem().setName(name).setText(text).setTooltip(text);
};
oFF.SuQuickFilter.prototype.updateUI = function()
{
	var quickFilter = this.m_store.getQuickFilter();
	this.m_filters.setSelectedName(quickFilter);
};
oFF.SuQuickFilter.prototype.onSelect = function(event)
{
	this.m_store.setQuickFilter(this.m_filters.getSelectedName());
};

oFF.SuToolbar = function() {};
oFF.SuToolbar.prototype = new oFF.XObject();
oFF.SuToolbar.prototype._ff_c = "SuToolbar";

oFF.SuToolbar.TOOLBAR_ITEM_SPACING = "10px";
oFF.SuToolbar.NEW_FOLDER_ICON = "suREToolbarNewFolderIcon";
oFF.SuToolbar.LIST_ICON = "list";
oFF.SuToolbar.GRID_ICON = "grid";
oFF.SuToolbar.create = function(container, store, config, navigationHelper)
{
	var newToolbar = new oFF.SuToolbar();
	newToolbar.m_store = store;
	newToolbar.m_history = oFF.SuNavigationHistory.create();
	newToolbar.m_navigationHelper = navigationHelper;
	newToolbar.m_config = config;
	newToolbar.m_APICapability = oFF.SuAPICapabilityHelper.create(config.isApiRemote());
	newToolbar.buildUI(container);
	return newToolbar;
};
oFF.SuToolbar.prototype.m_toolbar = null;
oFF.SuToolbar.prototype.m_homeBtn = null;
oFF.SuToolbar.prototype.m_previousBtn = null;
oFF.SuToolbar.prototype.m_nextBtn = null;
oFF.SuToolbar.prototype.m_upOneLevelBtn = null;
oFF.SuToolbar.prototype.m_refreshBtn = null;
oFF.SuToolbar.prototype.m_switchViewBtn = null;
oFF.SuToolbar.prototype.m_breadcrumbPathLbl = null;
oFF.SuToolbar.prototype.m_breadcrumbNav = null;
oFF.SuToolbar.prototype.m_newFolderIcon = null;
oFF.SuToolbar.prototype.m_quickFilter = null;
oFF.SuToolbar.prototype.m_searchTool = null;
oFF.SuToolbar.prototype.m_store = null;
oFF.SuToolbar.prototype.m_history = null;
oFF.SuToolbar.prototype.m_config = null;
oFF.SuToolbar.prototype.m_navigationHelper = null;
oFF.SuToolbar.prototype.m_APICapability = null;
oFF.SuToolbar.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_homeBtn = oFF.XObjectExt.release(this.m_homeBtn);
	this.m_previousBtn = oFF.XObjectExt.release(this.m_previousBtn);
	this.m_nextBtn = oFF.XObjectExt.release(this.m_nextBtn);
	this.m_upOneLevelBtn = oFF.XObjectExt.release(this.m_upOneLevelBtn);
	this.m_refreshBtn = oFF.XObjectExt.release(this.m_refreshBtn);
	this.m_switchViewBtn = oFF.XObjectExt.release(this.m_switchViewBtn);
	this.m_breadcrumbPathLbl = oFF.XObjectExt.release(this.m_breadcrumbPathLbl);
	this.m_searchTool = oFF.XObjectExt.release(this.m_searchTool);
	this.m_breadcrumbNav = oFF.XObjectExt.release(this.m_breadcrumbNav);
	this.m_quickFilter = oFF.XObjectExt.release(this.m_quickFilter);
	this.m_store = null;
};
oFF.SuToolbar.prototype.buildUI = function(container)
{
	var separator = false;
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_toolbar = container.addNewItemOfType(oFF.UiType.TOOLBAR);
	this.m_toolbar.setName("reToolbarContainer");
	this.m_toolbar.addCssClass("ffReToolbarContainer");
	if (this.isNavigationEnabled())
	{
		if (!this.isNavigationalBreadcrumb())
		{
			this.m_homeBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
			this.m_homeBtn.setName("homeToolbarBtn");
			this.m_homeBtn.setIcon("home");
			this.m_homeBtn.registerOnPress(this);
		}
		separator = true;
		var homePrevSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		homePrevSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		this.m_previousBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_previousBtn.setName("previousToolbarBtn");
		this.m_previousBtn.setIcon("arrow-left");
		this.m_previousBtn.registerOnPress(this);
		var prevNextSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		prevNextSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		this.m_nextBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_nextBtn.setName("nextToolbarBtn");
		this.m_nextBtn.setIcon("arrow-right");
		this.m_nextBtn.registerOnPress(this);
		var nextUpSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		nextUpSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		this.m_upOneLevelBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_upOneLevelBtn.setName("upOneLevelToolbarBtn");
		this.m_upOneLevelBtn.setIcon("arrow-top");
		this.m_upOneLevelBtn.registerOnPress(this);
		var upSeparatorSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		upSeparatorSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		var addtitionalActionSectionSeparator = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		addtitionalActionSectionSeparator.setWidth(oFF.UiCssLength.create("1px"));
		addtitionalActionSectionSeparator.setHeight(oFF.UiCssLength.create("60%"));
		addtitionalActionSectionSeparator.setBackgroundColor(oFF.UiColor.create("#999999"));
		var separatorRefreshSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		separatorRefreshSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		this.m_refreshBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_refreshBtn.setName("refreshToolbarBtn");
		this.m_refreshBtn.setIcon("refresh");
		this.m_refreshBtn.setTooltip(i18nProvider.getText(oFF.SuResourceExplorerI18n.TOOLBAR_REFRESH));
		this.m_refreshBtn.registerOnPress(this);
		var refreshSeparatorSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
		refreshSeparatorSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
	}
	if (this.isSwitchEnabled())
	{
		this.m_switchViewBtn = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_switchViewBtn.setName("reSwitchViewBtn");
		this.m_switchViewBtn.setTooltip(i18nProvider.getText(oFF.SuResourceExplorerI18n.TOOLBAR_SWITCH_VIEWER));
		this.m_switchViewBtn.registerOnPress(this);
	}
	if (this.isBreadcrumbEnabled())
	{
		if (separator)
		{
			var buttonBreadcrumpSectionSeparator = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
			buttonBreadcrumpSectionSeparator.setWidth(oFF.UiCssLength.create("1px"));
			buttonBreadcrumpSectionSeparator.setHeight(oFF.UiCssLength.create("60%"));
			buttonBreadcrumpSectionSeparator.setBackgroundColor(oFF.UiColor.create("#999999"));
			var separatorPathSpacer = this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
			separatorPathSpacer.setWidth(oFF.UiCssLength.create(oFF.SuToolbar.TOOLBAR_ITEM_SPACING));
		}
		separator = true;
		if (this.isNavigationalBreadcrumb())
		{
			this.m_breadcrumbNav = oFF.SuBreadcrumbNavigationReduxConsumer.create(this.m_store);
			this.m_breadcrumbNav.buildUI(container.getUiManager().getGenesis());
			this.m_breadcrumbNav.getUiView().addCssClass("ffReNavigationBreadcrumbs");
			this.m_breadcrumbNav.getUiView().setFlex("5");
			this.m_toolbar.addItem(this.m_breadcrumbNav.getUiView());
		}
		else
		{
			this.m_breadcrumbPathLbl = this.m_toolbar.addNewItemOfType(oFF.UiType.LABEL);
			this.m_breadcrumbPathLbl.setName("breadcrumbPathLbl");
			this.m_breadcrumbPathLbl.setFlex("5");
			this.m_breadcrumbPathLbl.setFontSize(oFF.SuResourceExplorerStyle.createLinkFontSize());
			this.m_breadcrumbPathLbl.setText(oFF.SuResourceWrapper.PATH_SEPARATOR);
		}
	}
	if (this.isOperationsEnabled())
	{
		this.m_newFolderIcon = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_newFolderIcon.setName(oFF.SuToolbar.NEW_FOLDER_ICON);
		this.m_newFolderIcon.setIcon("folder-blank");
		this.m_newFolderIcon.setTooltip(i18nProvider.getText(oFF.SuResourceExplorerI18n.TOOLBAR_NEW_FOLDER));
		this.m_newFolderIcon.setButtonType(oFF.UiButtonType.TRANSPARENT);
		this.m_newFolderIcon.registerOnPress(this);
	}
	if (this.isSearchEnabled())
	{
		this.m_quickFilter = oFF.SuQuickFilter.create(container.getUiManager().getGenesis(), this.m_store);
		this.m_quickFilter.getUiView().setFlex("2");
		this.m_toolbar.addItem(this.m_quickFilter.getUiView());
		this.m_searchTool = oFF.SuResourceSearchTool.create(container.getUiManager().getGenesis(), this.m_store);
		this.m_searchTool.getUiView().setFlex("3");
		this.m_toolbar.addItem(this.m_searchTool.getUiView());
	}
	this.m_APICapability.setResource(this.getBrowsedResource());
	this.updateUI();
	this.m_store.subscribe(this);
};
oFF.SuToolbar.prototype.isFullToolbarEnabled = function()
{
	if (oFF.isNull(this.m_config))
	{
		return oFF.XBooleanValue.create(true);
	}
	var toolbar = this.m_config.getByPath(oFF.SuResourceExplorerConfig.TOOLBAR);
	if (toolbar.isBoolean())
	{
		return oFF.XBooleanValue.create(toolbar.asBoolean().getBoolean());
	}
	else
	{
		return null;
	}
};
oFF.SuToolbar.prototype.isNavigationEnabled = function()
{
	var isFulloolbarEnabled = this.isFullToolbarEnabled();
	if (oFF.notNull(isFulloolbarEnabled))
	{
		return isFulloolbarEnabled.getBoolean();
	}
	return this.m_config.isEnabledByPath(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_NAVIGATION);
};
oFF.SuToolbar.prototype.isOperationsEnabled = function()
{
	if (!this.m_config.getDialogMode().isMode(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE))
	{
		return false;
	}
	var isFullToolbarEnabled = this.isFullToolbarEnabled();
	if (oFF.notNull(isFullToolbarEnabled))
	{
		return isFullToolbarEnabled.getBoolean();
	}
	return this.m_config.isEnabledByPath(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_OPERATIONS);
};
oFF.SuToolbar.prototype.isNavigationalBreadcrumb = function()
{
	var isFulloolbarEnabled = this.isFullToolbarEnabled();
	if (oFF.notNull(isFulloolbarEnabled))
	{
		return isFulloolbarEnabled.getBoolean();
	}
	var breadcrumbElement = this.m_config.getByPath2(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS);
	if (breadcrumbElement.isBoolean())
	{
		return breadcrumbElement.asBoolean().getBoolean();
	}
	else
	{
		return oFF.XString.isEqual(breadcrumbElement.asString().getString(), oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS_NAV);
	}
};
oFF.SuToolbar.prototype.isSwitchEnabled = function()
{
	return oFF.isNull(this.m_config) || this.m_config.isDetailsFileViewerEnabled() && this.m_config.isTilesFileViewerEnabled();
};
oFF.SuToolbar.prototype.isBreadcrumbEnabled = function()
{
	var isFulloolbarEnabled = this.isFullToolbarEnabled();
	if (oFF.notNull(isFulloolbarEnabled))
	{
		return isFulloolbarEnabled.getBoolean();
	}
	return this.m_config.isEnabledByPath(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_BREADCRUMBS);
};
oFF.SuToolbar.prototype.isSearchEnabled = function()
{
	var isFulloolbarEnabled = this.isFullToolbarEnabled();
	if (oFF.notNull(isFulloolbarEnabled))
	{
		return isFulloolbarEnabled.getBoolean();
	}
	return this.m_config.isEnabledByPath(oFF.SuResourceExplorerConfig.TOOLBAR, oFF.SuResourceExplorerConfig.TOOLBAR_SEARCH);
};
oFF.SuToolbar.prototype.home = function()
{
	this.m_store.setBrowsedResourceRoot();
};
oFF.SuToolbar.prototype.goToPreviousHistory = function()
{
	if (this.m_history.canGoToPrevious())
	{
		var previous = this.m_history.goToPrevious();
		this.m_store.setBrowsedResource(previous);
	}
};
oFF.SuToolbar.prototype.goToNextHistory = function()
{
	if (this.m_history.canGoToNext())
	{
		var next = this.m_history.goToNext();
		this.m_store.setBrowsedResource(next);
	}
};
oFF.SuToolbar.prototype.switchView = function()
{
	if (this.m_store.isResourceViewerMode(oFF.SuResourceExplorerStore.RESOURCE_VIEWER_TILES))
	{
		this.m_store.setResourceViewerMode(oFF.SuResourceExplorerStore.RESOURCE_VIEWER_DETAILS);
	}
	else
	{
		this.m_store.setResourceViewerMode(oFF.SuResourceExplorerStore.RESOURCE_VIEWER_TILES);
	}
};
oFF.SuToolbar.prototype.upOneLevel = function()
{
	var browsedResource = this.m_store.getBrowsedResource();
	if (oFF.notNull(browsedResource) && !this.m_store.isRootResource(browsedResource))
	{
		var parent = browsedResource.getParent();
		if (oFF.isNull(parent))
		{
			this.m_store.setBrowsedResourceRoot();
		}
		else
		{
			this.m_store.setBrowsedResource(parent);
		}
	}
};
oFF.SuToolbar.prototype.updateUI = function()
{
	this.updateFilterVisibility();
	this.updateToolbarItems();
	this.updateBreadcrumbPath();
	this.updateViewModeBtn();
};
oFF.SuToolbar.prototype.updateToolbarItems = function()
{
	this.setEnabledBtn(this.m_previousBtn, this.m_history.canGoToPrevious());
	this.setEnabledBtn(this.m_nextBtn, this.m_history.canGoToNext());
	var browsedResource = this.m_store.getBrowsedResource();
	this.setEnabledBtn(this.m_upOneLevelBtn, !this.m_store.isRootResource(browsedResource));
};
oFF.SuToolbar.prototype.setEnabledBtn = function(btn, enabled)
{
	if (oFF.notNull(btn))
	{
		btn.setEnabled(enabled);
	}
};
oFF.SuToolbar.prototype.updateBreadcrumbPath = function()
{
	if (oFF.notNull(this.m_breadcrumbPathLbl))
	{
		var currentPath = this.m_navigationHelper.getPathByResource(this.m_store.getBrowsedResource());
		this.m_breadcrumbPathLbl.setText(currentPath);
	}
};
oFF.SuToolbar.prototype.updateViewModeBtn = function()
{
	if (oFF.notNull(this.m_switchViewBtn))
	{
		if (this.m_store.isResourceViewerMode(oFF.SuResourceExplorerStore.RESOURCE_VIEWER_TILES))
		{
			this.m_switchViewBtn.setIcon(oFF.SuToolbar.LIST_ICON);
		}
		else
		{
			this.m_switchViewBtn.setIcon(oFF.SuToolbar.GRID_ICON);
		}
	}
};
oFF.SuToolbar.prototype.onPress = function(event)
{
	var control = event.getControl();
	if (control === this.m_homeBtn)
	{
		this.home();
	}
	else if (control === this.m_upOneLevelBtn)
	{
		this.upOneLevel();
	}
	else if (control === this.m_switchViewBtn)
	{
		this.switchView();
	}
	else if (event.getControl() === this.m_previousBtn)
	{
		this.goToPreviousHistory();
	}
	else if (event.getControl() === this.m_nextBtn)
	{
		this.goToNextHistory();
	}
	else if (event.getControl() === this.m_newFolderIcon)
	{
		var browsedResource = this.m_store.getBrowsedResource();
		var genesis = this.m_toolbar.getUiManager().getGenesis();
		oFF.SuFolderResourceDialog.create(genesis, browsedResource, this.m_store).open();
	}
};
oFF.SuToolbar.prototype.accept = function(state)
{
	if (this.isReleased())
	{
		return;
	}
	if (this.isHistoryToBeUpdated(state))
	{
		this.m_history.addHistoryEntry(state.getBrowsedResource());
	}
	if (this.isSearchEnabled() && this.isSearchToBeUpdated(state))
	{
		this.m_searchTool.setSearchQuery(state.getSearchQuery());
	}
	if (this.isFilterVisibilityToBeUpdated(this.m_store.getState()))
	{
		this.m_APICapability.setResource(this.getBrowsedResource());
	}
	this.updateUI();
};
oFF.SuToolbar.prototype.updateFilterVisibility = function()
{
	if (oFF.notNull(this.m_quickFilter))
	{
		this.m_quickFilter.getUiView().setVisible(this.m_APICapability.supportsCartesianFilter(oFF.XFileAttribute.CREATED_BY));
	}
	if (oFF.notNull(this.m_searchTool))
	{
		this.m_searchTool.getUiView().setVisible(this.m_APICapability.supportsSearch());
	}
};
oFF.SuToolbar.prototype.getBrowsedResource = function()
{
	var resource = this.m_store.getBrowsedResource();
	if (oFF.isNull(resource))
	{
		resource = this.m_store.getRootResource();
	}
	return resource;
};
oFF.SuToolbar.prototype.isSearchToBeUpdated = function(state)
{
	return state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE) || state.getLastAction().is(oFF.SuResourceExplorerAction.SET_SEARCH_QUERY);
};
oFF.SuToolbar.prototype.isFilterVisibilityToBeUpdated = function(state)
{
	return (state.isNew() || state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE)) && this.m_config.isApiRemote();
};
oFF.SuToolbar.prototype.isHistoryToBeUpdated = function(state)
{
	if (!state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE))
	{
		return false;
	}
	var browsedFile = state.getBrowsedResource();
	var currentFileinHistory = this.m_history.getCurrent();
	return oFF.isNull(currentFileinHistory) || !oFF.SuResourceWrapper.areEquals(browsedFile, currentFileinHistory);
};

oFF.SuTreeNavigation = function() {};
oFF.SuTreeNavigation.prototype = new oFF.XObject();
oFF.SuTreeNavigation.prototype._ff_c = "SuTreeNavigation";

oFF.SuTreeNavigation.create = function(container, rootResource, store, filterManager)
{
	var newTreeNavigation = new oFF.SuTreeNavigation();
	newTreeNavigation.m_rootResource = rootResource;
	newTreeNavigation.m_store = store;
	newTreeNavigation.m_filterManager = filterManager;
	newTreeNavigation.buildUI(container);
	return newTreeNavigation;
};
oFF.SuTreeNavigation.prototype.m_UIHierarchyTree = null;
oFF.SuTreeNavigation.prototype.m_rootTreeItem = null;
oFF.SuTreeNavigation.prototype.m_selectedTreeItem = null;
oFF.SuTreeNavigation.prototype.m_store = null;
oFF.SuTreeNavigation.prototype.m_filterManager = null;
oFF.SuTreeNavigation.prototype.m_rootResource = null;
oFF.SuTreeNavigation.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_UIHierarchyTree = oFF.XObjectExt.release(this.m_UIHierarchyTree);
	this.m_rootTreeItem = oFF.XObjectExt.release(this.m_rootTreeItem);
	this.m_selectedTreeItem = oFF.XObjectExt.release(this.m_selectedTreeItem);
	this.m_store = null;
	this.m_filterManager = null;
	this.m_rootResource = null;
};
oFF.SuTreeNavigation.prototype.buildUI = function(container)
{
	this.m_UIHierarchyTree = container.addNewItemOfType(oFF.UiType.TREE);
	this.m_UIHierarchyTree.setName("reTreeNavigationContainer");
	this.m_UIHierarchyTree.setHeight(oFF.UiCssLength.create("100%"));
	this.m_UIHierarchyTree.setWidth(oFF.UiCssLength.create("200px"));
	this.m_UIHierarchyTree.setFlex("200px 0 0");
	this.m_UIHierarchyTree.registerOnSelect(this);
	this.m_UIHierarchyTree.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.initTree();
	this.m_selectedTreeItem = this.m_rootTreeItem;
	this.updateUI(this.m_store.getBrowsedResource());
	this.m_store.subscribe(this);
};
oFF.SuTreeNavigation.prototype.initTree = function()
{
	var rootResource = this.m_rootResource;
	this.m_rootTreeItem = this.addItemWithResource(rootResource, null);
};
oFF.SuTreeNavigation.prototype.addItemWithResource = function(resource, parentItem)
{
	var newItem = oFF.isNull(parentItem) ? parentItem : this.getTreeItemChildByResource(parentItem, resource);
	if (oFF.notNull(newItem))
	{
		return newItem;
	}
	var filter = this.m_filterManager.getFilter();
	var resourceWrapper = oFF.SuResourceWrapper.createWithFilter(resource, filter);
	newItem = this.addItem(resource.getName(), parentItem);
	newItem.setCustomObject(resourceWrapper);
	this.addDummyItem(newItem);
	return newItem;
};
oFF.SuTreeNavigation.prototype.getTreeItemChildByResource = function(parentItem, resource)
{
	for (var i = 0; i < parentItem.getItemCount(); i++)
	{
		var child = parentItem.getItem(i);
		if (this.hasResource(child, resource))
		{
			return child;
		}
	}
	return null;
};
oFF.SuTreeNavigation.prototype.hasResource = function(treeItem, resource)
{
	return oFF.XString.isEqual(treeItem.getText(), resource.getName());
};
oFF.SuTreeNavigation.prototype.addItem = function(text, parentItem)
{
	var newItem;
	if (oFF.isNull(parentItem))
	{
		newItem = this.m_UIHierarchyTree.addNewItem();
	}
	else
	{
		newItem = parentItem.addNewItem();
	}
	newItem.setText(text);
	newItem.setIcon("folder-full");
	newItem.registerOnClick(this);
	newItem.registerOnCollapse(this);
	newItem.registerOnExpand(this);
	newItem.registerOnPress(this);
	newItem.registerOnDetailPress(this);
	return newItem;
};
oFF.SuTreeNavigation.prototype.onSelect = function(event)
{
	var selectedTreeItem = event.getSelectedItem();
	this.onSelectedTreeItem(selectedTreeItem);
};
oFF.SuTreeNavigation.prototype.onClick = function(event) {};
oFF.SuTreeNavigation.prototype.onSelectedTreeItem = function(selectedTreeItem)
{
	this.m_selectedTreeItem = selectedTreeItem;
	if (this.m_rootTreeItem === selectedTreeItem)
	{
		this.m_store.setBrowsedResource(this.m_rootResource);
	}
	else
	{
		var resource = selectedTreeItem.getCustomObject();
		this.m_store.setBrowsedResource(resource.getFile());
	}
};
oFF.SuTreeNavigation.prototype.selectItem = function(selectedTreeItem)
{
	if (oFF.isNull(selectedTreeItem))
	{
		return;
	}
	this.m_selectedTreeItem = selectedTreeItem;
	this.m_selectedTreeItem.expand();
	this.m_selectedTreeItem.focus();
	this.m_selectedTreeItem.setSelected(true);
};
oFF.SuTreeNavigation.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE))
	{
		this.updateUI(state.getBrowsedResource());
	}
};
oFF.SuTreeNavigation.prototype.updateUI = function(resource)
{
	var selectedTreeItem = this.searchTreeItemByResource(resource);
	if (oFF.notNull(selectedTreeItem))
	{
		this.populateChildren(selectedTreeItem);
		this.selectItem(selectedTreeItem);
	}
};
oFF.SuTreeNavigation.prototype.searchTreeItemByResource = function(resource)
{
	if (oFF.isNull(resource))
	{
		return this.m_rootTreeItem;
	}
	if (oFF.isNull(this.m_selectedTreeItem))
	{
		return null;
	}
	if (this.m_selectedTreeItem.getCustomObject().getFile() === resource)
	{
		return this.m_selectedTreeItem;
	}
	var selectedChild = this.getTreeItemChildByResource(this.m_selectedTreeItem, resource);
	if (oFF.notNull(selectedChild))
	{
		return selectedChild;
	}
	if (this.m_selectedTreeItem.getParent() !== null && this.hasResource(this.m_selectedTreeItem.getParent(), resource))
	{
		return this.m_selectedTreeItem.getParent();
	}
	var currentTreeItem = this.m_rootTreeItem;
	while (oFF.notNull(currentTreeItem))
	{
		var currentResource = currentTreeItem.getCustomObject();
		if (currentResource.isEquals(resource))
		{
			return currentTreeItem;
		}
		currentTreeItem = this.chooseChild(currentTreeItem, resource);
	}
	return null;
};
oFF.SuTreeNavigation.prototype.chooseChild = function(currentTreeItem, resource)
{
	var treeItemChildren = currentTreeItem.getItems();
	var treeItemChildrenIterator = treeItemChildren.getIterator();
	while (treeItemChildrenIterator.hasNext())
	{
		var treeItem = treeItemChildrenIterator.next();
		var treeItemResource = treeItem.getCustomObject();
		if (oFF.notNull(treeItemResource) && treeItemResource.isAnchestorFile(resource))
		{
			return treeItem;
		}
	}
	return null;
};
oFF.SuTreeNavigation.prototype.populateChildren = function(parentItem)
{
	if (!this.removeDummy(parentItem))
	{
		return;
	}
	var resourceWrapper = parentItem.getCustomObject();
	var resourceIterator = resourceWrapper.getChildren().getIterator();
	while (resourceIterator.hasNext())
	{
		var resourceChild = resourceIterator.next();
		if (oFF.SuResourceWrapper.create(resourceChild).isResourceDirectory())
		{
			this.addItemWithResource(resourceChild, parentItem);
		}
	}
};
oFF.SuTreeNavigation.prototype.addDummyItem = function(parentItem)
{
	var newItem = parentItem.insertNewItem(0);
	newItem.setTag("DUMMY");
	return newItem;
};
oFF.SuTreeNavigation.prototype.removeDummy = function(parentItem)
{
	var newItem = parentItem.getItem(0);
	if (oFF.notNull(newItem) && oFF.XString.isEqual(newItem.getTag(), "DUMMY"))
	{
		parentItem.removeItem(newItem);
		return true;
	}
	return false;
};
oFF.SuTreeNavigation.prototype.onPress = function(event) {};
oFF.SuTreeNavigation.prototype.onExpand = function(event)
{
	this.populateChildren(event.getControl());
};
oFF.SuTreeNavigation.prototype.onCollapse = function(event) {};
oFF.SuTreeNavigation.prototype.onDetailPress = function(event) {};

oFF.SuDataSourceNavigationHelper = function() {};
oFF.SuDataSourceNavigationHelper.prototype = new oFF.XObjectExt();
oFF.SuDataSourceNavigationHelper.prototype._ff_c = "SuDataSourceNavigationHelper";

oFF.SuDataSourceNavigationHelper.SYSTEM_BW = "BW";
oFF.SuDataSourceNavigationHelper.SYSTEM_HANA = "HANA";
oFF.SuDataSourceNavigationHelper.create = function(datasourceNav, config, filterManager)
{
	var helper = new oFF.SuDataSourceNavigationHelper();
	helper.m_config = config;
	helper.m_filterManager = filterManager;
	helper.m_datasourceNav = datasourceNav;
	helper.m_systemi18Keys = oFF.XHashMapOfStringByString.create();
	helper.m_systemi18Keys.put(oFF.SuDataSourceNavigationHelper.SYSTEM_HANA, oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_HANA_NAME);
	helper.m_systemi18Keys.put(oFF.SuDataSourceNavigationHelper.SYSTEM_BW, oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_BW_NAME);
	return helper;
};
oFF.SuDataSourceNavigationHelper.createLabel = function(comboFlexContainer, label)
{
	var comboLabel = comboFlexContainer.addNewItemOfType(oFF.UiType.LABEL);
	comboLabel.addCssClass("ffReDsnLabel");
	comboLabel.setWrapping(true);
	comboLabel.setFlex("0 0 auto");
	comboLabel.setText(oFF.XStringUtils.concatenate2(label, ":"));
	return comboLabel;
};
oFF.SuDataSourceNavigationHelper.isConnectionVisibleByConfig = function(resource, systemTypeFilter, filterManager, config)
{
	if (!filterManager.getFilter()(resource))
	{
		return false;
	}
	var systemTypeAttribute = oFF.SuResourceWrapper.getFileAttributeString(resource, oFF.XFileAttribute.SYSTEM_TYPE.getName(), "");
	if (oFF.XStringUtils.isNullOrEmpty(systemTypeAttribute))
	{
		return false;
	}
	if (oFF.isNull(systemTypeFilter))
	{
		return config.isSystemTypeSupported(systemTypeAttribute);
	}
	return oFF.XString.isEqual(systemTypeAttribute, systemTypeFilter);
};
oFF.SuDataSourceNavigationHelper.getConnectionByName = function(connectionList, connectionName)
{
	return oFF.XStream.of(connectionList).find( function(conn){
		return oFF.XString.isEqual(connectionName, conn.getName());
	}.bind(this));
};
oFF.SuDataSourceNavigationHelper.processFetchAllDatasources = function(connectionResource, successConsumer, errorConsumer)
{
	var datasourcesDir = oFF.SuDataSourceNavigationHelper.getDatasourceDirectory(connectionResource);
	if (oFF.isNull(datasourcesDir))
	{
		successConsumer(null);
		return;
	}
	oFF.SuResourceWrapper.create(datasourcesDir).processFetchChildren(successConsumer, errorConsumer);
};
oFF.SuDataSourceNavigationHelper.promiseFetchAllDatasources = function(connectionResource, query)
{
	var datasourcesDir = oFF.SuDataSourceNavigationHelper.getDatasourceDirectory(connectionResource);
	if (oFF.isNull(datasourcesDir))
	{
		return oFF.XPromise.reject(oFF.XError.create("Invalid Conncetion: datasource null!"));
	}
	return oFF.SuResourceWrapper.create(datasourcesDir).promiseFetchResult(query);
};
oFF.SuDataSourceNavigationHelper.processFetchDatasource = function(connectionResource, name, successConsumer, errorConsumer)
{
	var datasourcesDir = oFF.SuDataSourceNavigationHelper.getDatasourceDirectory(connectionResource);
	if (oFF.isNull(datasourcesDir))
	{
		successConsumer(null);
		return;
	}
	oFF.SuResourceWrapper.create(datasourcesDir).processFetchChildByName(name, successConsumer, errorConsumer);
};
oFF.SuDataSourceNavigationHelper.getDatasourceDirectory = function(connectionResource)
{
	if (oFF.isNull(connectionResource))
	{
		return null;
	}
	var datasourcesDir = oFF.SuDataSourceNavigationHelper.createDatasourceDirectory(connectionResource);
	if (oFF.isNull(datasourcesDir) || !datasourcesDir.isExisting())
	{
		return null;
	}
	return datasourcesDir;
};
oFF.SuDataSourceNavigationHelper.createDatasourceDirectory = function(connectionResource)
{
	var connectionFileWrapper = oFF.SuResourceWrapper.create(connectionResource);
	var systemTypeAttribute = connectionFileWrapper.getAttributeStringByType(oFF.XFileAttribute.SYSTEM_TYPE, null);
	var datasourcesDirUrl = oFF.XStringBuffer.create();
	datasourcesDirUrl.append(connectionResource.getUrl());
	datasourcesDirUrl.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
	datasourcesDirUrl.append(oFF.SuResourceWrapper.DATASOURCE_OLAP_DRIVER);
	var datasourcesFolderName = null;
	switch (systemTypeAttribute)
	{
		case oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_BW:
			datasourcesFolderName = oFF.SuResourceWrapper.DATASOURCE_TYPE_BW;
			break;

		case oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_HANA:
			datasourcesFolderName = oFF.SuResourceWrapper.DATASOURCE_TYPE_HANA;
			break;

		case oFF.SuResourceWrapper.DATASOURCE_SYSTEM_TYPE_ORCA:
			datasourcesFolderName = oFF.SuResourceWrapper.DATASOURCE_TYPE_ORCA;
			break;

		default:
			return null;
	}
	datasourcesDirUrl.append(oFF.SuResourceWrapper.PATH_SEPARATOR);
	datasourcesDirUrl.append(datasourcesFolderName);
	return oFF.XFile.createByUrl(connectionResource.getProcess(), datasourcesDirUrl.toString());
};
oFF.SuDataSourceNavigationHelper.createSearchField = function(genesis, consumer)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var searchInput = genesis.newControl(oFF.UiType.SEARCH_FIELD);
	searchInput.setName("reSearchField");
	searchInput.addCssClass("ffReSearchField");
	searchInput.setPlaceholder(i18nProvider.getText(oFF.SuResourceExplorerI18n.TOOLBAR_SEARCH_PLACEHOLDER));
	searchInput.registerOnSearch(oFF.UiLambdaSearchListener.create(consumer));
	searchInput.registerOnLiveChange(oFF.UiLambdaLiveChangeWithDebounceListener.create(consumer, 1000));
	return searchInput;
};
oFF.SuDataSourceNavigationHelper.showNotFoundErrorMsg = function(genesis, datasourceName)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var msg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_NOT_FOUND_ERROR, datasourceName);
	oFF.SuDataSourceNavigationHelper.showErrorMsg(genesis, msg);
	return msg;
};
oFF.SuDataSourceNavigationHelper.handleErrorMsgByView = function(view, messages)
{
	if (!view.isReleased())
	{
		view.getView().setBusy(false);
		oFF.SuDataSourceNavigationHelper.handleErrorMsg(view.getGenesis(), messages);
	}
};
oFF.SuDataSourceNavigationHelper.handleErrorMsg = function(genesis, messages)
{
	if (oFF.notNull(messages))
	{
		if (!oFF.UiCredentialsProviderHelper.hasAuthenticationFailed(messages.getErrors().getValuesAsReadOnlyList()))
		{
			var i18nProvider = oFF.UiLocalizationCenter.getCenter();
			var errMsg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_ERROR, messages.getSummary());
			oFF.SuDataSourceNavigationHelper.showErrorMsg(genesis, errMsg);
		}
		else
		{
			oFF.UiCredentialsProviderHelper.handleAuthenticationErrors(genesis, messages.getErrors());
		}
	}
};
oFF.SuDataSourceNavigationHelper.showErrorMsg = function(genesis, errMsg)
{
	if (oFF.notNull(errMsg))
	{
		genesis.showErrorToast(errMsg);
	}
};
oFF.SuDataSourceNavigationHelper.prototype.m_datasourceNav = null;
oFF.SuDataSourceNavigationHelper.prototype.m_config = null;
oFF.SuDataSourceNavigationHelper.prototype.m_filterManager = null;
oFF.SuDataSourceNavigationHelper.prototype.m_systemi18Keys = null;
oFF.SuDataSourceNavigationHelper.prototype.addDropdown = function(container, name, label, flex)
{
	var dropdownContainer = container.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	dropdownContainer.setName(oFF.XStringUtils.concatenate2("re", name));
	dropdownContainer.addCssClass(oFF.XStringUtils.concatenate2("ffRe", name));
	dropdownContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	dropdownContainer.setFlex(flex);
	var labelControl = oFF.SuDataSourceNavigationHelper.createLabel(dropdownContainer, label);
	var dropdown = dropdownContainer.addNewItemOfType(oFF.UiType.DROPDOWN);
	labelControl.setLabelFor(dropdown);
	dropdown.setEnabled(false);
	dropdown.registerOnSelect(oFF.UiLambdaSelectListener.create( function(event){
		this.m_datasourceNav.onChange(event);
	}.bind(this)));
	return dropdown;
};
oFF.SuDataSourceNavigationHelper.prototype.addComboBox = function(container, name, label, flex)
{
	var comboFlexContainer = container.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	comboFlexContainer.setName(oFF.XStringUtils.concatenate2("re", name));
	comboFlexContainer.addCssClass(oFF.XStringUtils.concatenate2("ffRe", name));
	comboFlexContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	comboFlexContainer.setFlex(flex);
	var labelControl = oFF.SuDataSourceNavigationHelper.createLabel(comboFlexContainer, label);
	var comboBox = comboFlexContainer.addNewItemOfType(oFF.UiType.COMBO_BOX);
	labelControl.setLabelFor(comboBox);
	comboBox.setEnabled(false);
	comboBox.registerOnChange(oFF.UiLambdaChangeListener.create( function(event){
		this.m_datasourceNav.onChange(event);
	}.bind(this)));
	return comboBox;
};
oFF.SuDataSourceNavigationHelper.prototype.getSystemText = function(systemName)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var i18nKey = this.m_systemi18Keys.getByKey(systemName);
	if (oFF.isNull(i18nKey))
	{
		return systemName;
	}
	var name = i18nProvider.getText(i18nKey);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(name))
	{
		return name;
	}
	return systemName;
};
oFF.SuDataSourceNavigationHelper.prototype.getSystemTypeList = function(connectionList)
{
	var systemTypeList = oFF.XHashMapByString.create();
	oFF.XStream.of(connectionList).forEach( function(connection){
		var resourceWrapper = oFF.SuResourceWrapper.create(connection);
		var systemType = resourceWrapper.getAttributeStringByType(oFF.XFileAttribute.SYSTEM_TYPE, null);
		systemTypeList.put(systemType, null);
	}.bind(this));
	return systemTypeList.getKeysAsReadOnlyListOfString();
};
oFF.SuDataSourceNavigationHelper.prototype.isConnectionVisible = function(resource, systemTypeFilter)
{
	return oFF.SuDataSourceNavigationHelper.isConnectionVisibleByConfig(resource, systemTypeFilter, this.m_filterManager, this.m_config);
};
oFF.SuDataSourceNavigationHelper.prototype.clearComboBoxElement = function(comboBox)
{
	comboBox.clearItems();
	comboBox.setValue(null);
	comboBox.setEnabled(false);
};
oFF.SuDataSourceNavigationHelper.prototype.addConnectionItem = function(connectionCB, connection)
{
	var item = connectionCB.addNewItem();
	item.setName(connection.getName()).setText(connection.getName()).setCustomObject(connection);
	try
	{
		item.setAdditionalText(connection.getDescription());
	}
	catch (t)
	{
		this.logWarning4("WARNING Error during the retrieval of resource description (", connection.toString(), "): ", oFF.XException.getStackTrace(t, 0));
	}
	return item;
};
oFF.SuDataSourceNavigationHelper.prototype.createDatasourceFilter = function(filterFn)
{
	return  function(file){
		var filterManagetTest = this.m_filterManager.getFilter()(file);
		if (!filterManagetTest)
		{
			return false;
		}
		if (oFF.isNull(filterFn))
		{
			return true;
		}
		return filterFn(file);
	}.bind(this);
};
oFF.SuDataSourceNavigationHelper.prototype.createDatasourceTextSearchFilter = function(text)
{
	if (oFF.XStringUtils.isNullOrEmpty(text))
	{
		return null;
	}
	return  function(file){
		if (oFF.XStringUtils.isNullOrEmpty(text))
		{
			return true;
		}
		var resourceWrapper = oFF.SuResourceWrapper.create(file);
		var isIcluded = oFF.XStringUtils.containsString(resourceWrapper.getTranslatedDisplayName(), text, true);
		if (isIcluded)
		{
			return true;
		}
		var fileDescription = resourceWrapper.get(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, null);
		if (oFF.XStringUtils.isNullOrEmpty(fileDescription))
		{
			return false;
		}
		return oFF.XStringUtils.containsString(fileDescription, text, true);
	}.bind(this);
};
oFF.SuDataSourceNavigationHelper.prototype.setDatasourceProperitesToResourceInfo = function(state)
{
	var selectedResource = state.getSelectedResource();
	var resourceInfo = null;
	if (oFF.notNull(selectedResource))
	{
		resourceInfo = oFF.SuResourceInfo.createClone(state.getResourceInfo());
		var datasourceWrapper = oFF.SuResourceWrapper.create(selectedResource);
		var systemResource = datasourceWrapper.getOlapSystem();
		var systemResourceWrapper = oFF.SuResourceWrapper.create(systemResource);
		resourceInfo.setString(oFF.SuResourceInfo.SYSTEM_NAME, systemResourceWrapper.getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_SYSTEM, ""));
		resourceInfo.setString(oFF.SuResourceInfo.TYPE, datasourceWrapper.getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_TYPE, ""));
		resourceInfo.setString(oFF.SuResourceInfo.ENVIRONMENT_NAME, "");
		resourceInfo.setString(oFF.SuResourceInfo.SCHEMA_NAME, datasourceWrapper.getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_SCHEMA, ""));
		resourceInfo.setString(oFF.SuResourceInfo.PACKAGE_NAME, datasourceWrapper.getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE, ""));
		resourceInfo.setString(oFF.SuResourceInfo.OBJECT_NAME, datasourceWrapper.getAttributeStringByType(oFF.XFileAttribute.OLAP_DATASOURCE_NAME, ""));
	}
	return resourceInfo;
};

oFF.SuFolderResourceDialog = function() {};
oFF.SuFolderResourceDialog.prototype = new oFF.XObject();
oFF.SuFolderResourceDialog.prototype._ff_c = "SuFolderResourceDialog";

oFF.SuFolderResourceDialog.CREATE_RESOURCE_DIALOG_NAME = "newResourceItemDialog";
oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_OK_NAME = "newResourceDirectoryOkBtn";
oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_CANCEL_NAME = "newResourceDirectoryCancelBtn";
oFF.SuFolderResourceDialog.DIR_NAME_INPUT_NAME = "newResourceDirectoryNameInput";
oFF.SuFolderResourceDialog.DIR_INPUT_MAX_LENGTH = 1024;
oFF.SuFolderResourceDialog.create = function(genesis, directory, store)
{
	var manager = new oFF.SuFolderResourceDialog();
	manager.m_genesis = genesis;
	manager.m_directory = directory;
	manager.m_store = store;
	return manager;
};
oFF.SuFolderResourceDialog.prototype.m_genesis = null;
oFF.SuFolderResourceDialog.prototype.m_dialog = null;
oFF.SuFolderResourceDialog.prototype.m_directory = null;
oFF.SuFolderResourceDialog.prototype.m_store = null;
oFF.SuFolderResourceDialog.prototype.m_dirNameInput = null;
oFF.SuFolderResourceDialog.prototype.m_dirDescriptionInput = null;
oFF.SuFolderResourceDialog.prototype.newDirectoryItemDialogCreateBtn = null;
oFF.SuFolderResourceDialog.prototype.open = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var title = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_TITLE);
	var namePlaceholder = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_NAME_PLACEHOLDER);
	var newDirectoryItemDialog = this.m_genesis.newControl(oFF.UiType.DIALOG);
	newDirectoryItemDialog.setName(oFF.SuFolderResourceDialog.CREATE_RESOURCE_DIALOG_NAME);
	newDirectoryItemDialog.addCssClass("ffReFolderResourceDialog");
	newDirectoryItemDialog.setWidth(oFF.UiCssLength.create("31.25em"));
	newDirectoryItemDialog.setPadding(oFF.UiCssBoxEdges.create("1.25em"));
	newDirectoryItemDialog.setTitle(title);
	newDirectoryItemDialog.registerOnAfterOpen(this);
	this.newDirectoryItemDialogCreateBtn = newDirectoryItemDialog.addNewDialogButton();
	this.newDirectoryItemDialogCreateBtn.setName(oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_OK_NAME);
	this.newDirectoryItemDialogCreateBtn.setText(i18nProvider.getText(oFF.UiCommonI18n.OK));
	this.newDirectoryItemDialogCreateBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	this.newDirectoryItemDialogCreateBtn.registerOnPress(this);
	this.newDirectoryItemDialogCreateBtn.setEnabled(false);
	var newDirectoryItemDialogCancelBtn = newDirectoryItemDialog.addNewDialogButton();
	newDirectoryItemDialogCancelBtn.setName(oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_CANCEL_NAME);
	newDirectoryItemDialogCancelBtn.setText(i18nProvider.getText(oFF.UiCommonI18n.CANCEL));
	newDirectoryItemDialogCancelBtn.registerOnPress(this);
	var formContainer = newDirectoryItemDialog.setNewContent(oFF.UiType.FLEX_LAYOUT);
	formContainer.setName("reResourceInfoFormContainer");
	formContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	formContainer.useMaxWidth();
	var infoContainer = formContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	infoContainer.setName("reResourceInfoFormInfoContainer");
	infoContainer.addCssClass("ffReResourceInfoFormInfoContainer");
	infoContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	infoContainer.useMaxWidth();
	var labelName = infoContainer.addNewItemOfType(oFF.UiType.LABEL);
	labelName.setWrapping(true);
	labelName.setText(i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME));
	labelName.setRequired(true);
	this.m_dirNameInput = infoContainer.addNewItemOfType(oFF.UiType.INPUT);
	this.m_dirNameInput.setName(oFF.SuFolderResourceDialog.DIR_NAME_INPUT_NAME);
	this.m_dirNameInput.addCssClass("ffReFieldName");
	this.m_dirNameInput.setWidth(oFF.UiCssLength.create("100%"));
	this.m_dirNameInput.setPlaceholder(namePlaceholder);
	this.m_dirNameInput.setMaxLength(oFF.SuFolderResourceDialog.DIR_INPUT_MAX_LENGTH);
	this.m_dirNameInput.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create( function(controlEvent){
		var nameIsValid = this.isDirectoryNameValid();
		this.updateUiAfterDirNameValidation(nameIsValid);
	}.bind(this)));
	labelName.setLabelFor(this.m_dirNameInput);
	var labelDescription = infoContainer.addNewItemOfType(oFF.UiType.LABEL);
	labelDescription.setWrapping(true);
	labelDescription.setText(i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION));
	this.m_dirDescriptionInput = infoContainer.addNewItemOfType(oFF.UiType.INPUT);
	this.m_dirDescriptionInput.addCssClass("ffReFieldDescription");
	this.m_dirDescriptionInput.setWidth(oFF.UiCssLength.create("100%"));
	this.m_dirDescriptionInput.setPlaceholder(i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION_PLACEHOLDER));
	this.m_dirDescriptionInput.setMaxLength(oFF.SuFolderResourceDialog.DIR_INPUT_MAX_LENGTH);
	labelDescription.setLabelFor(this.m_dirDescriptionInput);
	this.newDirectoryItemDialogCreateBtn.setCustomObject(newDirectoryItemDialog);
	newDirectoryItemDialogCancelBtn.setCustomObject(newDirectoryItemDialog);
	newDirectoryItemDialog.setCustomObject(formContainer);
	newDirectoryItemDialog.open();
	this.m_dialog = newDirectoryItemDialog;
};
oFF.SuFolderResourceDialog.prototype.onEnter = function(event) {};
oFF.SuFolderResourceDialog.prototype.onPress = function(event)
{
	var control = event.getControl();
	switch (control.getName())
	{
		case oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_OK_NAME:
			this.handleNewDirectoryItemAction();
			break;

		case oFF.SuFolderResourceDialog.CREATE_FOLDER_BUTTON_CANCEL_NAME:
			this.closeDialog();
			break;

		default:
	}
};
oFF.SuFolderResourceDialog.prototype.onAfterOpen = function(event)
{
	this.m_dirNameInput.focus();
};
oFF.SuFolderResourceDialog.prototype.handleNewDirectoryItemAction = function()
{
	if (oFF.isNull(this.m_dirNameInput) || oFF.XStringUtils.isNullOrEmpty(this.m_dirNameInput.getText()))
	{
		var i18nProvider = oFF.UiLocalizationCenter.getCenter();
		var warningMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_INVALID_FOLDER_NAME);
		this.m_dirNameInput.setValueState(oFF.UiValueState.ERROR);
		this.m_dirNameInput.setValueStateText(warningMsg);
		this.newDirectoryItemDialogCreateBtn.setEnabled(false);
	}
	else
	{
		var success = this.createNewDirectoryItem(this.m_dirNameInput.getText(), this.m_dirDescriptionInput.getText());
		if (success)
		{
			this.closeDialog();
		}
	}
};
oFF.SuFolderResourceDialog.prototype.createNewDirectoryItem = function(name, description)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var success = false;
	var warningMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL);
	if (oFF.SuResourceCRUDManager.resourceExistsInDirectory(this.m_directory, name, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_FOLDER))
	{
		success = false;
		warningMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_FOLDER_EXIST);
	}
	else
	{
		success = oFF.SuResourceCRUDManager.createNewDirectory(name, description, this.m_directory);
	}
	if (success && oFF.SuResourceCRUDManager.resourceExistsInDirectory(this.m_directory, name, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_FOLDER))
	{
		this.m_store.setBrowsedResource(this.m_directory);
	}
	else
	{
		this.showWarningToastWithMessage(warningMsg);
	}
	return success;
};
oFF.SuFolderResourceDialog.prototype.showWarningToastWithMessage = function(msg)
{
	if (oFF.notNull(this.m_genesis))
	{
		this.m_genesis.showWarningToast(msg);
	}
};
oFF.SuFolderResourceDialog.prototype.closeDialog = function()
{
	this.m_dialog.close();
};
oFF.SuFolderResourceDialog.prototype.isDirectoryNameValid = function()
{
	var isValid = false;
	if (oFF.notNull(this.m_dirNameInput) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_dirNameInput.getText()))
	{
		var dirName = this.m_dirNameInput.getText();
		isValid = oFF.SuResourceInfoFormHelper.getInstance().isDirNameValid(dirName);
	}
	return isValid;
};
oFF.SuFolderResourceDialog.prototype.updateUiAfterDirNameValidation = function(isValid)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	if (isValid)
	{
		this.m_dirNameInput.setValueState(oFF.UiValueState.NONE);
		this.m_dirNameInput.setValueStateText("");
		this.newDirectoryItemDialogCreateBtn.setEnabled(true);
	}
	else
	{
		var warningMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_INVALID_FOLDER_NAME);
		this.m_dirNameInput.setValueState(oFF.UiValueState.ERROR);
		this.m_dirNameInput.setValueStateText(warningMsg);
		this.newDirectoryItemDialogCreateBtn.setEnabled(false);
	}
};

oFF.SqlSchemaNode = function() {};
oFF.SqlSchemaNode.prototype = new oFF.XObject();
oFF.SqlSchemaNode.prototype._ff_c = "SqlSchemaNode";

oFF.SqlSchemaNode.prototype.catalog = null;
oFF.SqlSchemaNode.prototype.schema = null;
oFF.SqlSchemaNode.prototype.onDoubleClick = function(event)
{
	event.getControl().getCustomObject().processGetTables(oFF.SyncType.NON_BLOCKING, this, event.getControl(), this.catalog, this.schema, null);
};
oFF.SqlSchemaNode.prototype.onQueryResult = function(extResult, data, customIdentifier)
{
	customIdentifier.clearItems();
	while (data.next())
	{
		var other = customIdentifier.addNewItem();
		other.setText(data.getStringAt(2));
		var node = new oFF.SqlTableNode();
		node.catalog = this.catalog;
		node.schema = this.schema;
		node.tablename = data.getStringAt(2);
		other.registerOnDoubleClick(node);
		other.setCustomObject(customIdentifier.getCustomObject());
	}
};

oFF.SqlTableNode = function() {};
oFF.SqlTableNode.prototype = new oFF.XObject();
oFF.SqlTableNode.prototype._ff_c = "SqlTableNode";

oFF.SqlTableNode.prototype.catalog = null;
oFF.SqlTableNode.prototype.schema = null;
oFF.SqlTableNode.prototype.tablename = null;
oFF.SqlTableNode.prototype.onDoubleClick = function(event)
{
	event.getControl().getCustomObject().processGetColumns(oFF.SyncType.NON_BLOCKING, this, event.getControl(), this.catalog, this.schema, this.tablename, null).getData();
};
oFF.SqlTableNode.prototype.onQueryResult = function(extResult, data, customIdentifier)
{
	customIdentifier.clearItems();
	while (data.next())
	{
		var other2 = customIdentifier.addNewItem();
		other2.setText(oFF.XStringUtils.concatenate3(data.getStringAt(3), " : ", data.getStringAt(5)));
	}
};

oFF.SleMetisFormItem = function() {};
oFF.SleMetisFormItem.prototype = new oFF.XObject();
oFF.SleMetisFormItem.prototype._ff_c = "SleMetisFormItem";

oFF.SleMetisFormItem.createFormItem = function(formLayout, text, inputType, cssWidth, liveChangeListener)
{
	if (oFF.isNull(formLayout))
	{
		throw oFF.XException.createRuntimeException("Missing parent form layout. Cannot create form item!");
	}
	var formItem = new oFF.SleMetisFormItem();
	formItem.setupInternal(formLayout, text, inputType, cssWidth, liveChangeListener);
	return formItem;
};
oFF.SleMetisFormItem.prototype.m_itemWrapper = null;
oFF.SleMetisFormItem.prototype.m_itemLabel = null;
oFF.SleMetisFormItem.prototype.m_itemInput = null;
oFF.SleMetisFormItem.prototype.m_liveChangeListener = null;
oFF.SleMetisFormItem.prototype.releaseObject = function()
{
	this.m_itemWrapper = oFF.XObjectExt.release(this.m_itemWrapper);
	this.m_itemLabel = oFF.XObjectExt.release(this.m_itemLabel);
	this.m_itemInput = oFF.XObjectExt.release(this.m_itemInput);
	this.m_liveChangeListener = oFF.XObjectExt.release(this.m_liveChangeListener);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SleMetisFormItem.prototype.setupInternal = function(formLayout, text, inputType, cssWidth, liveChangeListener)
{
	var itemName = oFF.XString.replace(text, " ", "");
	itemName = oFF.XString.toLowerCase(itemName);
	this.m_itemWrapper = formLayout.addNewItemOfType(oFF.UiType.VERTICAL_LAYOUT);
	this.m_itemWrapper.setName(oFF.XStringUtils.concatenate2(itemName, "_wrapper"));
	this.m_itemWrapper.setWidth(oFF.UiCssLength.create(cssWidth));
	this.m_itemWrapper.setFlex(oFF.XStringUtils.concatenate2("1 1 ", cssWidth));
	this.m_itemWrapper.setPadding(oFF.UiCssBoxEdges.create("10px"));
	this.m_itemLabel = this.m_itemWrapper.addNewItemOfType(oFF.UiType.LABEL);
	this.m_itemLabel.setName(oFF.XStringUtils.concatenate2(itemName, "_label"));
	this.m_itemLabel.setText(oFF.XStringUtils.concatenate2(text, ":"));
	this.m_itemLabel.setFontWeight(oFF.UiFontWeight.BOLD);
	this.m_itemInput = this.m_itemWrapper.addNewItemOfType(oFF.UiType.INPUT);
	this.m_itemInput.setName(oFF.XStringUtils.concatenate2(itemName, "_input"));
	this.m_itemInput.setInputType(oFF.isNull(inputType) ? oFF.UiInputType.TEXT : inputType);
	this.m_itemInput.setPlaceholder("");
	this.m_itemInput.setEditable(false);
	this.m_itemInput.registerOnLiveChange(this);
	this.m_itemLabel.setLabelFor(this.m_itemInput);
	if (inputType === oFF.UiInputType.PASSWORD)
	{
		var showPasswordBtn = this.m_itemInput.addNewEndIcon();
		showPasswordBtn.setName(oFF.XStringUtils.concatenate2(itemName, "_showPwdEndIcon"));
		showPasswordBtn.setTag("showPwdEndIcon");
		showPasswordBtn.setIcon("show");
		showPasswordBtn.setTooltip("Show password");
		showPasswordBtn.registerOnPress(this);
	}
	this.m_liveChangeListener = liveChangeListener;
};
oFF.SleMetisFormItem.prototype.setText = function(text)
{
	this.m_itemInput.setText(text);
};
oFF.SleMetisFormItem.prototype.getText = function()
{
	return this.m_itemInput.getText();
};
oFF.SleMetisFormItem.prototype.setRequired = function(required)
{
	this.m_itemInput.setRequired(required);
	this.m_itemLabel.setRequired(required);
};
oFF.SleMetisFormItem.prototype.isRequired = function()
{
	return this.m_itemInput.isRequired();
};
oFF.SleMetisFormItem.prototype.setEditable = function(editable)
{
	this.m_itemInput.setEditable(editable);
};
oFF.SleMetisFormItem.prototype.isEditable = function()
{
	return this.m_itemInput.isEditable();
};
oFF.SleMetisFormItem.prototype.setVisible = function(isVisible)
{
	this.m_itemWrapper.setVisible(isVisible);
};
oFF.SleMetisFormItem.prototype.setInvalid = function()
{
	this.m_itemInput.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_itemInput.setBorderColor(oFF.UiColor.RED);
	this.m_itemInput.setBorderWidth(oFF.UiCssBoxEdges.create("1px"));
	this.m_itemInput.setBackgroundColor(oFF.UiColor.createByRgba(200, 20, 20, 0.1));
};
oFF.SleMetisFormItem.prototype.setValid = function()
{
	this.m_itemInput.setBorderStyle(null);
	this.m_itemInput.setBorderColor(null);
	this.m_itemInput.setBorderWidth(null);
	this.m_itemInput.setBackgroundColor(null);
};
oFF.SleMetisFormItem.prototype.focus = function()
{
	this.m_itemInput.focus();
};
oFF.SleMetisFormItem.prototype.onLiveChange = function(event)
{
	if (oFF.notNull(this.m_liveChangeListener))
	{
		this.m_liveChangeListener.onMetisFormItemLiveChange(this);
	}
};
oFF.SleMetisFormItem.prototype.onPress = function(event)
{
	if (oFF.notNull(this.m_itemInput) && this.m_itemInput.hasEndIcons())
	{
		var tmpEndIcon = this.m_itemInput.getEndIcon(0);
		if (oFF.notNull(tmpEndIcon))
		{
			var isPwdVisible = !oFF.XString.isEqual(tmpEndIcon.getIcon(), "show");
			if (!isPwdVisible)
			{
				this.m_itemInput.setInputType(oFF.UiInputType.TEXT);
				tmpEndIcon.setIcon("hide");
				tmpEndIcon.setTooltip("Hide password");
			}
			else
			{
				this.m_itemInput.setInputType(oFF.UiInputType.PASSWORD);
				tmpEndIcon.setIcon("show");
				tmpEndIcon.setTooltip("Show password");
			}
		}
	}
};

oFF.SleMetisImporter = function() {};
oFF.SleMetisImporter.prototype = new oFF.XObject();
oFF.SleMetisImporter.prototype._ff_c = "SleMetisImporter";

oFF.SleMetisImporter.createNewMetisImporter = function(application, genesis, listener)
{
	var prg = new oFF.SleMetisImporter();
	if (oFF.isNull(application))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Metis importer instance without an application. Please sepcify an application!");
	}
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("Cannot create a Metis importer instance without a genesis object. Please sepcify a genesis object!");
	}
	prg.setupImporter(application, genesis, listener);
	return prg;
};
oFF.SleMetisImporter.prototype.m_application = null;
oFF.SleMetisImporter.prototype.m_genesis = null;
oFF.SleMetisImporter.prototype.m_listener = null;
oFF.SleMetisImporter.prototype.m_dialog = null;
oFF.SleMetisImporter.prototype.m_urlInput = null;
oFF.SleMetisImporter.prototype.m_systemNameInput = null;
oFF.SleMetisImporter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_application = null;
	this.m_genesis = null;
	this.m_listener = null;
	this.m_dialog = oFF.XObjectExt.release(this.m_dialog);
	this.m_urlInput = oFF.XObjectExt.release(this.m_urlInput);
	this.m_systemNameInput = oFF.XObjectExt.release(this.m_systemNameInput);
};
oFF.SleMetisImporter.prototype.setupImporter = function(application, genesis, listener)
{
	this.m_application = application;
	this.m_genesis = genesis;
	this.m_listener = listener;
	this.buildView(this.m_genesis);
};
oFF.SleMetisImporter.prototype.open = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.open();
	}
};
oFF.SleMetisImporter.prototype.close = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.close();
	}
};
oFF.SleMetisImporter.prototype.startImport = function()
{
	var slUrl = this.m_urlInput.getText();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(slUrl))
	{
		var tmpUri = oFF.XUri.createFromUrl(slUrl);
		var systemName = this.m_systemNameInput.getText();
		if (oFF.XStringUtils.isNullOrEmpty(systemName))
		{
			systemName = tmpUri.getQueryMap().getByKey("systemName");
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(systemName))
		{
			var sysDesc = this.m_application.getSystemLandscape().getSystemDescription(systemName);
			if (oFF.notNull(sysDesc))
			{
				tmpUri.setUser(sysDesc.getUser());
				tmpUri.setPassword(sysDesc.getPassword());
			}
		}
		var slFile = oFF.XFile.createByUri(this.m_application.getProcess(), tmpUri);
		if (oFF.notNull(slFile) && slFile.isValid())
		{
			this.m_dialog.getContent().setBusy(true);
			this.m_dialog.getDialogButtonByName("sleMetisImporterDialogOkBtn").setEnabled(false);
			slFile.processLoad(oFF.SyncType.NON_BLOCKING, this, null, oFF.CompressionType.NONE);
		}
		else
		{
			this.m_urlInput.setValueState(oFF.UiValueState.ERROR);
			this.m_urlInput.setValueStateText("Wrong url format");
			this.showErrorMessage("Wrong url format!");
		}
	}
	else
	{
		this.m_urlInput.setValueState(oFF.UiValueState.ERROR);
		this.m_urlInput.setValueStateText("URL cannot be empty");
		this.showErrorMessage("Missing url!");
	}
};
oFF.SleMetisImporter.prototype.parseSystemLadscape = function(systems)
{
	var systemsStructure = systems.getStructureByKey("Systems");
	if (oFF.notNull(systemsStructure))
	{
		var systemLandscape = this.m_application.getSystemLandscape();
		oFF.SystemLandscapeLoadAction.setSystems(systemsStructure, systemLandscape);
		this.m_dialog.close();
		this.showSuccessMessage("Systems successfully loaded!");
		if (oFF.notNull(this.m_listener))
		{
			this.m_listener.onMetisImportSuccess();
		}
	}
	else
	{
		this.showErrorMessage("Missing 'Systems' property. Is the specified JSON in the correct format?");
	}
};
oFF.SleMetisImporter.prototype.showSuccessMessage = function(text)
{
	if (oFF.notNull(this.m_genesis))
	{
		this.m_genesis.showSuccessToast(text);
	}
};
oFF.SleMetisImporter.prototype.showErrorMessage = function(text)
{
	this.m_genesis.showErrorToast(text);
	this.m_dialog.getContent().setBusy(false);
	this.m_dialog.getDialogButtonByName("sleMetisImporterDialogOkBtn").setEnabled(true);
};
oFF.SleMetisImporter.prototype.buildView = function(genesis)
{
	this.m_dialog = genesis.newControl(oFF.UiType.DIALOG);
	this.m_dialog.setName("sleMetisImporterDialog");
	this.m_dialog.setTitle("System Landscape importer");
	this.m_dialog.setPadding(oFF.UiCssBoxEdges.create("20px"));
	this.m_dialog.setWidth(oFF.UiCssLength.create("600px"));
	this.m_dialog.registerOnAfterOpen(this);
	this.m_dialog.registerOnAfterClose(this);
	var okButton = this.m_dialog.addNewDialogButton();
	okButton.setName("sleMetisImporterDialogOkBtn");
	okButton.setText("Import");
	okButton.setButtonType(oFF.UiButtonType.PRIMARY);
	okButton.registerOnPress(this);
	var cancelButton = this.m_dialog.addNewDialogButton();
	cancelButton.setName("sleMetisImporterDialogCancelBtn");
	cancelButton.setText("Cancel");
	cancelButton.setButtonType(oFF.UiButtonType.DEFAULT);
	cancelButton.registerOnPress(this);
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var importLabel = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	importLabel.setName("sleImportLbl");
	importLabel.setWrapping(true);
	importLabel.setText("Import systems from the specified URL into the system landscape. Specify a system name to retrieve the credentials for the specified URL.");
	this.m_urlInput = mainLayout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_urlInput.setName("sleUrlInput");
	this.m_urlInput.setPlaceholder("System landscape url");
	this.m_urlInput.setRequired(true);
	this.m_urlInput.registerOnLiveChange(this);
	this.m_systemNameInput = mainLayout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_systemNameInput.setName("sleSystemNameInput");
	this.m_systemNameInput.setPlaceholder("System name");
	this.m_dialog.setContent(mainLayout);
};
oFF.SleMetisImporter.prototype.onPress = function(event)
{
	switch (event.getControl().getName())
	{
		case "sleMetisImporterDialogOkBtn":
			this.startImport();
			break;

		case "sleMetisImporterDialogCancelBtn":
			this.m_dialog.close();
			break;

		default:
	}
};
oFF.SleMetisImporter.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	if (extResult.isValid())
	{
		if (oFF.notNull(fileContent))
		{
			var jsonContent = fileContent.getJsonContent();
			if (oFF.notNull(jsonContent) && jsonContent.isStructure())
			{
				var systems = jsonContent;
				this.parseSystemLadscape(systems);
			}
			else
			{
				this.showErrorMessage("Failed to parse the response!");
			}
		}
		else
		{
			this.showErrorMessage("No json in the response!");
		}
	}
	else
	{
		this.showErrorMessage("Could not retrieve system landscape!");
	}
};
oFF.SleMetisImporter.prototype.onLiveChange = function(event)
{
	if (event.getControl() === this.m_urlInput)
	{
		this.m_urlInput.setValueState(oFF.UiValueState.NONE);
	}
};
oFF.SleMetisImporter.prototype.onAfterOpen = function(event)
{
	this.m_urlInput.focus();
};
oFF.SleMetisImporter.prototype.onAfterClose = function(event)
{
	this.m_dialog.getContent().setBusy(false);
	this.m_dialog.getDialogButtonByName("sleMetisImporterDialogOkBtn").setEnabled(true);
	this.m_urlInput.setValueState(oFF.UiValueState.NONE);
	this.m_urlInput.setText("");
	this.m_systemNameInput.setText("");
};

oFF.UiCredentialsDialogI18n = function() {};
oFF.UiCredentialsDialogI18n.prototype = new oFF.DfUiLocalizationProvider();
oFF.UiCredentialsDialogI18n.prototype._ff_c = "UiCredentialsDialogI18n";

oFF.UiCredentialsDialogI18n.TITLE = "FF_TITLE";
oFF.UiCredentialsDialogI18n.CONNECTION_LABEL_VALUE = "FF_CONNECTION_LABEL_VALUE";
oFF.UiCredentialsDialogI18n.USERNAME_LABEL_VALUE = "FF_USERNAME_LABEL_VALUE";
oFF.UiCredentialsDialogI18n.PASSWORD_LABEL_VALUE = "FF_PASSWORD_LABEL_VALUE";
oFF.UiCredentialsDialogI18n.ERROR_INVALID_USERNAME = "FF_ERROR_INVALID_USERNAME";
oFF.UiCredentialsDialogI18n.ERROR_INVALID_PASSWORD = "FF_ERROR_INVALID_PASSWORD";
oFF.UiCredentialsDialogI18n.ERROR_WRONG_CREDENTIALS = "FF_ERROR_WRONG_CREDENTIALS";
oFF.UiCredentialsDialogI18n.ERROR_AUTHENTICATION_EXTERNAL = "FF_ERROR_AUTHENTICATION_EXTERNAL";
oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_BLOCKED = "FF_ERROR_POPUP_BLOCKED";
oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_TIMEOUT_REACHED = "FF_POPUP_TIMEOUT_REACHED";
oFF.UiCredentialsDialogI18n.staticSetup = function()
{
	var tmpProvider = new oFF.UiCredentialsDialogI18n();
	tmpProvider.setupProvider("UiCredentialsProvider", true);
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.TITLE, "Set Credentials");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.TITLE, "#XTIT: The title of the credentials dialog");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.CONNECTION_LABEL_VALUE, "Connection:");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.CONNECTION_LABEL_VALUE, "#XFLD: Label showing the connection name");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.USERNAME_LABEL_VALUE, "User Name");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.USERNAME_LABEL_VALUE, "#XFLD: Username label");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.PASSWORD_LABEL_VALUE, "Password");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.PASSWORD_LABEL_VALUE, "#XFLD: Password label");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_USERNAME, "Invalid user name");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_INVALID_USERNAME, "#XMSG: Value state message shown when using an invalid username");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_PASSWORD, "Invalid password");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_INVALID_PASSWORD, "#XMSG: Value state message shown when using an invalid password");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_WRONG_CREDENTIALS, "Sorry, we couldn\u2019t authenticate you. Please ensure your credentials are valid.");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_WRONG_CREDENTIALS, "#XMSG: Message strip error shown in the credentials dialog when credentials are invalid");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_AUTHENTICATION_EXTERNAL, "We couldn\u2019t connect to your {0} system. Please contact your system administrator and see our troubleshooting page.");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_AUTHENTICATION_EXTERNAL, "#XMSG: Error shown in a message box popup when user cannot be logged in because of a server or configuration issue");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_BLOCKED, "Please allow popups for this site to enable your live data connection.");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_BLOCKED, "#XMSG: Error shown when popups are blocked by the browser but popups are needed for SAML authentication");
	tmpProvider.addText(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_TIMEOUT_REACHED, "You were not automatically logged on to the remote data source. Please ask your administrator to verify the SAML Single Sign On configuration.");
	tmpProvider.addComment(oFF.UiCredentialsDialogI18n.ERROR_SAML_POPUP_TIMEOUT_REACHED, "#YMSE: Error shown when the SAML authentication popup closes due to timeout reached");
	return tmpProvider;
};

oFF.SuExportI18n = function() {};
oFF.SuExportI18n.prototype = new oFF.DfUiLocalizationProvider();
oFF.SuExportI18n.prototype._ff_c = "SuExportI18n";

oFF.SuExportI18n.EXPORT_BUTTON = "FF_SU_EXPORT_DIALOG_EXPORT_BUTTON";
oFF.SuExportI18n.CANCEL_BUTTON = "FF_SU_EXPORT_DIALOG_CANCEL_BUTTON";
oFF.SuExportI18n.EXPAND_HIERARCHY = "FF_SU_EXPORT_DIALOG_EXPAND";
oFF.SuExportI18n.NAME = "FF_SU_EXPORT_DIALOG_NAME";
oFF.SuExportI18n.PDF_EXPORT_TITLE = "FF_SU_EXPORT_DIALOG_PDF_TITLE";
oFF.SuExportI18n.CSV_EXPORT_TITLE = "FF_SU_EXPORT_DIALOG_CSV_TITLE";
oFF.SuExportI18n.XLSX_EXPORT_TITLE = "FF_SU_EXPORT_DIALOG_XLSX_TITLE";
oFF.SuExportI18n.PAGE_NUMBER_LOCATION = "FF_SU_EXPORT_DIALOG_PDF_PAGE_NUM_LOC";
oFF.SuExportI18n.NONE = "FF_SU_EXPORT_DIALOG_PDF_PAGE_NUM_LOC_NONE";
oFF.SuExportI18n.HEADER = "FF_SU_EXPORT_DIALOG_PDF_PAGE_NUM_LOC_HEADER";
oFF.SuExportI18n.FOOTER = "FF_SU_EXPORT_DIALOG_PDF_PAGE_NUM_LOC_FOOTER";
oFF.SuExportI18n.ENABLE_APPENDIX = "FF_SU_EXPORT_DIALOG_PDF_ENABLE_APPENDIX";
oFF.SuExportI18n.LANDSCAPE = "FF_SU_EXPORT_DIALOG_PDF_ORIENT_LANDSCAPE";
oFF.SuExportI18n.PORTRAIT = "FF_SU_EXPORT_DIALOG_PDF_ORIENT_PORTRAIT";
oFF.SuExportI18n.SETTINGS = "FF_SU_EXPORT_DIALOG_PDF_SETTINGS";
oFF.SuExportI18n.PAPER_SIZE = "FF_SU_EXPORT_DIALOG_PDF_PAPER_SIZE";
oFF.SuExportI18n.ORIENTATION = "FF_SU_EXPORT_DIALOG_PDF_ORIENTATION";
oFF.SuExportI18n.DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_DELIMITER";
oFF.SuExportI18n.COMMA_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_COMMA_DELIMTER";
oFF.SuExportI18n.SEMI_COLON_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_SEMI_COLON_DELIMTER";
oFF.SuExportI18n.TAB_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_TAB_DELIMTER";
oFF.SuExportI18n.SPACE_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_SPACE_DELIMTER";
oFF.SuExportI18n.DOT_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_DOT_DELIMTER";
oFF.SuExportI18n.COLON_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_COLON_DELIMTER";
oFF.SuExportI18n.DASH_DELIMITER = "FF_SU_EXPORT_DIALOG_CSV_DASH_DELIMTER";
oFF.SuExportI18n.staticSetup = function()
{
	var provider = new oFF.SuExportI18n();
	provider.setupProvider(oFF.SuExportDialog.DEFAULT_PROGRAM_NAME, true);
	provider.addText(oFF.SuExportI18n.EXPORT_BUTTON, "Export");
	provider.addComment(oFF.SuExportI18n.EXPORT_BUTTON, "#XBUT: The ok button in the dialog for starting the data export");
	provider.addText(oFF.SuExportI18n.CANCEL_BUTTON, "Cancel");
	provider.addComment(oFF.SuExportI18n.CANCEL_BUTTON, "#XBUT: The cancel button in the dialog for cancelling the data export");
	provider.addText(oFF.SuExportI18n.EXPAND_HIERARCHY, "Expand Hierarchy");
	provider.addComment(oFF.SuExportI18n.EXPAND_HIERARCHY, "#XCKL: Option to expand the data source hierarchies");
	provider.addText(oFF.SuExportI18n.NAME, "Name:");
	provider.addComment(oFF.SuExportI18n.NAME, "#XFLD: The name of the file to save the exported data to.");
	provider.addText(oFF.SuExportI18n.PDF_EXPORT_TITLE, "Export Data as PDF File");
	provider.addComment(oFF.SuExportI18n.PDF_EXPORT_TITLE, "#XTIT: Export the data to a pdf file");
	provider.addText(oFF.SuExportI18n.CSV_EXPORT_TITLE, "Export Data as CSV File");
	provider.addComment(oFF.SuExportI18n.CSV_EXPORT_TITLE, "#XTIT: Export the data to a csv file");
	provider.addText(oFF.SuExportI18n.XLSX_EXPORT_TITLE, "Export Data as Microsoft Excel File");
	provider.addComment(oFF.SuExportI18n.XLSX_EXPORT_TITLE, "#XTIT: Export the data to a Microsoft Excel file");
	provider.addText(oFF.SuExportI18n.LANDSCAPE, "Landscape");
	provider.addComment(oFF.SuExportI18n.LANDSCAPE, "XSEL: An option for generating the pdf page in landscape orientation");
	provider.addText(oFF.SuExportI18n.PORTRAIT, "Portrait");
	provider.addComment(oFF.SuExportI18n.PORTRAIT, "XSEL: An option for generating the pdf page in portrait orientation");
	provider.addText(oFF.SuExportI18n.NONE, "None");
	provider.addComment(oFF.SuExportI18n.NONE, "#XSEL: An option for choosing where to put the page number; this option means that no page number will be included anywhere");
	provider.addText(oFF.SuExportI18n.HEADER, "Header");
	provider.addComment(oFF.SuExportI18n.HEADER, "#XSEL: An option for choosing where to put the page number; this option means that the page number will be included in the PDF page header");
	provider.addText(oFF.SuExportI18n.FOOTER, "Footer");
	provider.addComment(oFF.SuExportI18n.FOOTER, "#XSEL: An option for choosing where to put the page number; this option means that the page number will be included in the PDF page footer");
	provider.addText(oFF.SuExportI18n.ENABLE_APPENDIX, "Enable Appendix");
	provider.addComment(oFF.SuExportI18n.ENABLE_APPENDIX, "#XCKL: Configures the inclusion of the datasource metadata in the exported pdf file");
	provider.addText(oFF.SuExportI18n.SETTINGS, "Settings");
	provider.addComment(oFF.SuExportI18n.SETTINGS, "#XFLD: The sub-heading for the pdf options in the dialog");
	provider.addText(oFF.SuExportI18n.PAPER_SIZE, "Paper Size:");
	provider.addComment(oFF.SuExportI18n.PAPER_SIZE, "#XFLD: The size of the paper to export to. Default value is A4");
	provider.addText(oFF.SuExportI18n.ORIENTATION, "Orientation:");
	provider.addComment(oFF.SuExportI18n.ORIENTATION, "#XFLD: The orientation of the page when exported; this will be either landscape or portrait");
	provider.addText(oFF.SuExportI18n.PAGE_NUMBER_LOCATION, "Page Number Location:");
	provider.addComment(oFF.SuExportI18n.PAGE_NUMBER_LOCATION, "#XFLD: The location of the page number on pages when exported; this will be header, footer or none");
	provider.addText(oFF.SuExportI18n.DELIMITER, "CSV Delimiter:");
	provider.addComment(oFF.SuExportI18n.DELIMITER, "XFLD: The delimiter to be used for generating the CSV; e.g. comma");
	provider.addText(oFF.SuExportI18n.COMMA_DELIMITER, "Comma ,");
	provider.addComment(oFF.SuExportI18n.COMMA_DELIMITER, "XSEL: The comma type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.SEMI_COLON_DELIMITER, "Semicolon ;");
	provider.addComment(oFF.SuExportI18n.SEMI_COLON_DELIMITER, "XSEL: The semicolon type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.TAB_DELIMITER, "Tab");
	provider.addComment(oFF.SuExportI18n.TAB_DELIMITER, "XSEL: The tab type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.SPACE_DELIMITER, "Space");
	provider.addComment(oFF.SuExportI18n.SPACE_DELIMITER, "XSEL: The space type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.DOT_DELIMITER, "Dot .");
	provider.addComment(oFF.SuExportI18n.DOT_DELIMITER, "XSEL: The dot type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.COLON_DELIMITER, "Colon :");
	provider.addComment(oFF.SuExportI18n.COLON_DELIMITER, "XSEL: The colon type delimiter selection for CSV");
	provider.addText(oFF.SuExportI18n.DASH_DELIMITER, "Dash -");
	provider.addComment(oFF.SuExportI18n.DASH_DELIMITER, "XSEL: The dash type delimiter selection for CSV");
	return provider;
};

oFF.FeApolloDir = function() {};
oFF.FeApolloDir.prototype = new oFF.FeApolloItemBase();
oFF.FeApolloDir.prototype._ff_c = "FeApolloDir";

oFF.FeApolloDir.createNewDir = function(file, parent)
{
	var newDir = new oFF.FeApolloDir();
	newDir.setupApolloItem(file, parent);
	return newDir;
};
oFF.FeApolloDir.prototype.m_children = null;
oFF.FeApolloDir.prototype.m_isContentLoad = false;
oFF.FeApolloDir.prototype.releaseObject = function()
{
	this.m_children.clear();
	this.m_children = oFF.XObjectExt.release(this.m_children);
	oFF.FeApolloItemBase.prototype.releaseObject.call( this );
};
oFF.FeApolloDir.prototype.setupApolloItem = function(file, parent)
{
	oFF.FeApolloItemBase.prototype.setupApolloItem.call( this , file, parent);
	this.m_children = oFF.XList.create();
	this.m_isContentLoad = false;
};
oFF.FeApolloDir.prototype.isDirectory = function()
{
	return true;
};
oFF.FeApolloDir.prototype.addChildItem = function(feItem)
{
	if (oFF.notNull(feItem))
	{
		this.m_children.add(feItem);
	}
};
oFF.FeApolloDir.prototype.removeChildItem = function(feItem)
{
	if (oFF.notNull(feItem))
	{
		this.m_children.removeElement(feItem);
	}
};
oFF.FeApolloDir.prototype.clearChildItems = function()
{
	this.m_children.clear();
};
oFF.FeApolloDir.prototype.getChildItems = function()
{
	return this.m_children;
};
oFF.FeApolloDir.prototype.getNumberOfChildren = function()
{
	if (oFF.notNull(this.m_children))
	{
		return this.m_children.size();
	}
	return 0;
};
oFF.FeApolloDir.prototype.isContentLoaded = function()
{
	return this.m_isContentLoad;
};
oFF.FeApolloDir.prototype.setContentLoaded = function(isContentLoaded)
{
	this.m_isContentLoad = isContentLoaded;
};

oFF.FeApolloFile = function() {};
oFF.FeApolloFile.prototype = new oFF.FeApolloItemBase();
oFF.FeApolloFile.prototype._ff_c = "FeApolloFile";

oFF.FeApolloFile.createNewFile = function(file, parent)
{
	var newFile = new oFF.FeApolloFile();
	newFile.setupApolloItem(file, parent);
	return newFile;
};
oFF.FeApolloFile.prototype.m_apolloFileExtension = null;
oFF.FeApolloFile.prototype.m_extensionStr = null;
oFF.FeApolloFile.prototype.m_nameWithoutExtensionStr = null;
oFF.FeApolloFile.prototype.setupApolloItem = function(file, parent)
{
	oFF.FeApolloItemBase.prototype.setupApolloItem.call( this , file, parent);
	this.extractFileExtensionAndName();
	this.m_apolloFileExtension = oFF.FeApolloFileExtension.getApolloExtensionForFile(file);
};
oFF.FeApolloFile.prototype.isDirectory = function()
{
	return false;
};
oFF.FeApolloFile.prototype.releaseObject = function()
{
	this.m_apolloFileExtension = null;
	oFF.FeApolloItemBase.prototype.releaseObject.call( this );
};
oFF.FeApolloFile.prototype.getExtension = function()
{
	return this.m_extensionStr;
};
oFF.FeApolloFile.prototype.getApolloFileExtension = function()
{
	return this.m_apolloFileExtension;
};
oFF.FeApolloFile.prototype.getFileNameWithoutExtension = function()
{
	return this.m_nameWithoutExtensionStr;
};
oFF.FeApolloFile.prototype.getResolvedFileIconPath = function(session)
{
	var prgName = null;
	var iconPath = null;
	if (this.getApolloFileExtension().isExecutable())
	{
		prgName = this.getFileNameWithoutExtension();
	}
	else
	{
		prgName = this.getApolloFileExtension().getProgramName();
	}
	var process = session;
	var kernel = process.getKernel();
	var prgManifest = kernel.getProgramManifest(prgName);
	if (oFF.notNull(prgManifest))
	{
		iconPath = prgManifest.getResolvedIconPath(session);
	}
	return iconPath;
};
oFF.FeApolloFile.prototype.extractFileExtensionAndName = function()
{
	var fileName = this.getName();
	var extPoint = oFF.XString.lastIndexOf(fileName, ".");
	if (extPoint !== -1)
	{
		this.m_nameWithoutExtensionStr = oFF.XString.substring(fileName, 0, extPoint);
		this.m_extensionStr = oFF.XString.substring(fileName, extPoint + 1, -1);
	}
	else
	{
		this.m_nameWithoutExtensionStr = fileName;
		this.m_extensionStr = null;
	}
};

oFF.SuDfVulcanView = function() {};
oFF.SuDfVulcanView.prototype = new oFF.DfUiWrapperView();
oFF.SuDfVulcanView.prototype._ff_c = "SuDfVulcanView";

oFF.SuDfVulcanView.prototype.getWrapperControl = function(genesis)
{
	var pageControl = genesis.newControl(oFF.UiType.PAGE);
	pageControl.useMaxSpace();
	pageControl.setShowHeader(true);
	pageControl.setTitle(this.getType().getDisplayName());
	return pageControl;
};
oFF.SuDfVulcanView.prototype.setTitle = function(title)
{
	var pageControl = this.getView();
	if (oFF.notNull(pageControl))
	{
		var subTitleLabel = pageControl.getSubHeader();
		if (oFF.isNull(subTitleLabel))
		{
			pageControl.setShowSubHeader(false);
			subTitleLabel = pageControl.setNewSubHeader(oFF.UiType.LABEL);
			subTitleLabel.setText(null);
			subTitleLabel.useMaxWidth();
			subTitleLabel.setTextAlign(oFF.UiTextAlign.CENTER);
		}
		pageControl.setShowSubHeader(oFF.XStringUtils.isNotNullAndNotEmpty(title));
		subTitleLabel.setText(title);
	}
};

oFF.SuRecentlyUsedConfigDataProvider = function() {};
oFF.SuRecentlyUsedConfigDataProvider.prototype = new oFF.SuRecentlyUsedDataProviderBase();
oFF.SuRecentlyUsedConfigDataProvider.prototype._ff_c = "SuRecentlyUsedConfigDataProvider";

oFF.SuRecentlyUsedConfigDataProvider.create = function(config)
{
	var newProvider = new oFF.SuRecentlyUsedConfigDataProvider();
	var recentlyUsedElement = config.getByPath2(oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION, oFF.SuResourceExplorerConfig.DATASOURCE_NAVIGATION_RECENTLY_USED);
	var recentlyUsedList = null;
	if (oFF.notNull(recentlyUsedElement) && recentlyUsedElement.isList())
	{
		recentlyUsedList = recentlyUsedElement.asList();
	}
	newProvider.initRecentlyUsedByList(recentlyUsedList);
	return newProvider;
};
oFF.SuRecentlyUsedConfigDataProvider.prototype.get = function()
{
	return this.m_recentlyUsed;
};
oFF.SuRecentlyUsedConfigDataProvider.prototype.update = function(list) {};
oFF.SuRecentlyUsedConfigDataProvider.prototype.add = function(datasource) {};

oFF.SuRecentlyUsedLocalStoreDataProvider = function() {};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype = new oFF.SuRecentlyUsedDataProviderBase();
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype._ff_c = "SuRecentlyUsedLocalStoreDataProvider";

oFF.SuRecentlyUsedLocalStoreDataProvider.MAX_RECENTLY_USED_RECORDS = 15;
oFF.SuRecentlyUsedLocalStoreDataProvider.create = function()
{
	var newProvider = new oFF.SuRecentlyUsedLocalStoreDataProvider();
	var recentString = oFF.SuResourceExplorerLocalStorageManager.get(oFF.SuResourceExplorerLocalStorageManager.DS_RECENTLY_USED_LIST);
	var datasourceList = null;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(recentString))
	{
		datasourceList = oFF.JsonParserFactory.createFromSafeString(recentString).asList();
	}
	newProvider.initRecentlyUsedByList(datasourceList);
	return newProvider;
};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype.get = function()
{
	return this.m_recentlyUsed;
};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype.update = function(list)
{
	this.m_recentlyUsed = list;
	this.saveToLocalStorage();
};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype.add = function(datasource)
{
	if (this.m_recentlyUsed.contains(datasource))
	{
		return;
	}
	this.m_recentlyUsed.insert(0, datasource);
	this.saveToLocalStorage();
};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype.serialize = function()
{
	var datasourceList = oFF.PrList.create();
	for (var j = 0; j < this.m_recentlyUsed.size() && j < oFF.SuRecentlyUsedLocalStoreDataProvider.MAX_RECENTLY_USED_RECORDS; j++)
	{
		var datasource = this.m_recentlyUsed.get(j);
		datasourceList.add(datasource.generateIPrElement());
	}
	return datasourceList.getStringRepresentation();
};
oFF.SuRecentlyUsedLocalStoreDataProvider.prototype.saveToLocalStorage = function()
{
	oFF.SuResourceExplorerLocalStorageManager.save(oFF.SuResourceExplorerLocalStorageManager.DS_RECENTLY_USED_LIST, this.serialize());
};

oFF.SuResourceExplorerI18n = function() {};
oFF.SuResourceExplorerI18n.prototype = new oFF.DfUiLocalizationProvider();
oFF.SuResourceExplorerI18n.prototype._ff_c = "SuResourceExplorerI18n";

oFF.SuResourceExplorerI18n.PROGRAM_STATUS_INIT_TEXT = "FF_RE_PROGRAM_STATUS_INIT_TEXT";
oFF.SuResourceExplorerI18n.PROGRAM_STATUS_ERROR_TEXT = "FF_RE_PROGRAM_STATUS_ERROR_TEXT";
oFF.SuResourceExplorerI18n.DEFAULT_PROGRAM_TITLE_RESOURCE = "FF_RE_DEFAULT_PROGRAM_TITLE_RESOURCE";
oFF.SuResourceExplorerI18n.SAVE_FORM_NAME = "FF_RE_SAVE_FORM_NAME";
oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION = "FF_RE_SAVE_FORM_DESCRIPTION";
oFF.SuResourceExplorerI18n.SAVE_FORM_NAME_NEW = "FF_RE_SAVE_FORM_NAME_NEW";
oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION_PLACEHOLDER = "FF_RE_SAVE_FORM_DESCRIPTION_PLACEHOLDER";
oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_CHARS = "FF_RE_SAVE_FORM_INVALID_NAME_ERROR_CHARS";
oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_MIN_LENGTH = "FF_RE_SAVE_FORM_INVALID_NAME_ERROR_MIN_LENGTHT";
oFF.SuResourceExplorerI18n.TOOLBAR_REFRESH = "FF_RE_TOOLBAR_REFRESH";
oFF.SuResourceExplorerI18n.TOOLBAR_SWITCH_VIEWER = "FF_RE_TOOLBAR_SWITCH_VIEWER";
oFF.SuResourceExplorerI18n.TOOLBAR_SEARCH_PLACEHOLDER = "FF_RE_TOOLBAR_SEARCH_PLACEHOLDER";
oFF.SuResourceExplorerI18n.TOOLBAR_NEW_FOLDER = "FF_RE_TOOLBAR_NEW_FOLDER";
oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_TITLE = "FF_RE_DIALOG_ADD_FOLDER_TITLE";
oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_NAME_PLACEHOLDER = "FF_RE_DIALOG_ADD_FOLDER_PLACEHOLDER";
oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_INVALID_FOLDER_NAME = "FF_RE_DIALOG_ADD_FOLDER_WARNING_FAIL_INVALID_FOLDER_NAME";
oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL = "FF_RE_DIALOG_ADD_FOLDER_WARNING_FAIL";
oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_FOLDER_EXIST = "FF_RE_DIALOG_ADD_FOLDER_WARNING_FAIL_FOLDER_EXIST";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE = "FF_RE_DATASOURCE_NAVIGATION_SYSTEM_TYPE";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION = "FF_RE_DATASOURCE_NAVIGATION_CONNECTION";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_PACKAGE = "FF_RE_DATASOURCE_NAVIGATION_PACKAGE";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_ERROR = "FF_RE_DATASOURCE_NAVIGATION_DATASOURCE_ERROR";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_NOT_FOUND_ERROR = "FF_RE_DATASOURCE_NAVIGATION_DATASOURCE_NOT_FOUND_ERROR";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_ALL = "FF_RE_DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_ALL";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_SELECTION = "FF_RE_DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_SELECTION";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_TITLE = "FF_RE_DATASOURCE_NAVIGATION_RECENTLY_USED_TITLE";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_DATASOURCES = "FF_RE_DATASOURCE_NAVIGATION_MENU_DATASOURCES";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS = "FF_RE_DATASOURCE_NAVIGATION_MENU_VIEWS";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS_RECENTLY_USED = "FF_RE_DATASOURCE_NAVIGATION_MENU_VIEWS_RECENTLY_USED";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_HANA_NAME = "FF_RE_DATASOURCE_NAVIGATION_SYSTEM_HANA_NAME";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_BW_NAME = "FF_RE_DATASOURCE_NAVIGATION_SYSTEM_BW_NAME";
oFF.SuResourceExplorerI18n.DATASOURCE_INVALID_CONNECTION = "FF_DATASOURCE_INVALID_CONNECTION";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_ID = "FF_RE_DETAILS_VIEW_RESOURCE_ID";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_NAME = "FF_RE_DETAILS_VIEW_RESOURCE_NAME";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_DESCRIPTION = "FF_RE_DETAILS_VIEW_RESOURCE_DESCRIPTION";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_TYPE = "FF_RE_DETAILS_VIEW_RESOURCE_TYPE";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_OWNER = "FF_RE_DETAILS_VIEW_RESOURCE_OWNER";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_CREATED = "FF_RE_DETAILS_VIEW_RESOURCE_CREATED";
oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_MODFIED = "FF_RE_DETAILS_VIEW_RESOURCE_MODFIED";
oFF.SuResourceExplorerI18n.RESOURCE_RETRIEVAL_ERROR = "FF_RE_RESOURCE_RETRIEVAL_ERROR";
oFF.SuResourceExplorerI18n.OVERWRITE_POPUP_QUESTION = "FF_RE_OVERWRITE_POPUP_QUESTION";
oFF.SuResourceExplorerI18n.QUICK_FILTER_TOOLTIP = "FF_RE_QUICK_FILTER_TOOLTIP";
oFF.SuResourceExplorerI18n.QUICK_FILTER_ALL = "FF_RE_QUICK_FILTER_ALL";
oFF.SuResourceExplorerI18n.QUICK_FILTER_OWNED = "FF_RE_QUICK_FILTER_OWNED";
oFF.SuResourceExplorerI18n.QUICK_FILTER_SHARED_WITH_ME = "FF_RE_QUICK_FILTER_SHARED_WITH_ME";
oFF.SuResourceExplorerI18n.PAGINATOR_PREV_PAGE = "FF_RE_PAGINATOR_PREV_PAGE";
oFF.SuResourceExplorerI18n.PAGINATOR_NEXT_PAGE = "FF_RE_PAGINATOR_NEXT_PAGE";
oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO = "FF_RE_PAGINATOR_PAGE_INFO";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_TOOLTIP = "FF_RE_DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_TOOLTIP";
oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_COLUMNS_TOOLTIP = "FF_RE_DATASOURCE_NAVIGATION_RECENTLY_USED_COLUMNS_TOOLTIP";
oFF.SuResourceExplorerI18n.staticSetup = function()
{
	var i18nProvider = new oFF.SuResourceExplorerI18n();
	i18nProvider.setupProvider(oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME, true);
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.PROGRAM_STATUS_INIT_TEXT, "Initialization in progress...", "#XMSG: Message shown during the app initialization");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.PROGRAM_STATUS_ERROR_TEXT, "Error during the initialization! {0}", "#XMSG: Error message shown in case of app initialization error");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DEFAULT_PROGRAM_TITLE_RESOURCE, "Resource Explorer", "#XTIT: Resource explorer mode default title, shown on the app/dialog header");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.OVERWRITE_POPUP_QUESTION, "Do you want to overwrite the existing item?", "#XMSG: Confirmation message, shown in a popup, to ovwewrite a resource");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME, "Name", "#XFLD: Name field label");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME_NEW, "New File", "#YINS: Name field suggestion");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION, "Description", "#XFLD: Description field label");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION_PLACEHOLDER, "Optional", "#YINS: Description field placeholder");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_CHARS, "File name cannot be empty, or contain special characters \\ : and *\"", "#XMSG: Validation message shown in case of special characters in name field");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.SAVE_FORM_INVALID_NAME_ERROR_MIN_LENGTH, "File name should contain at least {0} characters", "#XMSG: Validation message shown in case of name field lenght is less than the expected size");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.TOOLBAR_REFRESH, "Refresh active directory", "#XTOL: Refresh status toolbar button");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.TOOLBAR_SWITCH_VIEWER, "Switch view", "#XTOL: Switch view toolbar button");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.TOOLBAR_SEARCH_PLACEHOLDER, "Search...", "#YINS: Search field placeholder");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.TOOLBAR_NEW_FOLDER, "New Folder", "#XTOL: New folder creation button tooltip");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_TITLE, "Create New Folder", "#XTIT: Dialog title to create a new folder");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_NAME_PLACEHOLDER, "Enter the new folder name", "#YINS: Folder name field placeholder");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL, "Failed to create folder.", "#XMSG: Generic error message shown in case of error during the folder creation");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_INVALID_FOLDER_NAME, "Folder name cannot be empty, or contain special characters \\ : and *", "#XMSG: Validation message shown in case of folder name field lenght is empty or contains special characters");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DIALOG_ADD_FOLDER_WARNING_FAIL_FOLDER_EXIST, "Folder already exists", "#XMSG: Warning message shown in case of existing folder");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE, "System Type", "#XTIT: Heading for datasource system type");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION, "Connection", "#XTIT: Heading for datasource connection");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_PACKAGE, "Package", "#XTIT: Heading for datasource package");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_ERROR, "Error during datasource retrieval: {0}", "#XMSG: Error message shown after datasources retrieval issue");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_DATASOURCE_NOT_FOUND_ERROR, "Datasource {0} not found", "#XMSG: Error message shown after datasources not found issue");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_ALL, "Remove All", "#XMIT: Remove all items from the recently used datasources table");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_SELECTION, "Remove Selection", "#XMIT: Remove selected items from the recently used datasource table");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_TITLE, "Recently Used ({0})", "#XTIT: Heading for Recently used datasource table, including the number of items shown");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_DATASOURCES, "Data Sources", "#XMIT: Link to the datasource picker section");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS, "Views", "#XMIT: Heading for Views submenu");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS_RECENTLY_USED, "Recently Used", "#XMIT: Link to the recently used datasources section");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_TOOLTIP, "Delete", "#XTIT: Tooltip shown on the recently used delete button");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_COLUMNS_TOOLTIP, "Columns", "#XTIT: Tooltip shown on the recently used columns button");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_INVALID_CONNECTION, "The connection name is invalid. Please enter a valid connection name.", "#XMSG: Error message shown if an invalid connection name is entered");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_HANA_NAME, "SAP HANA", "#NOTR: HANA system type technical name");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_BW_NAME, "SAP BW", "#NOTR: BW system type technical name");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_ID, "ID", "#XTIT: Heading for resource ID, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_NAME, "Name", "#XTIT: Heading for resource name, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_DESCRIPTION, "Description", "#XTIT: Heading for resource description, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_TYPE, "Type", "#XTIT: Heading for resource type, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_OWNER, "Owner", "#XTIT: Heading for resource type, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_CREATED, "Created On", "#XTIT: Heading for resource creation time, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_MODFIED, "Changed On", "#XTIT: Heading for resource last edit time, used in the details view");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.RESOURCE_RETRIEVAL_ERROR, "Error during resource retrieval: {0}", "#XMSG: Error message shown in case resource retrieval issue");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.QUICK_FILTER_TOOLTIP, "Privacy Filter", "#XTOL: Quick filter privacy tooltip");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.QUICK_FILTER_ALL, "All files", "#XSEL: Quick filter item to get all files (no quick filter)");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.QUICK_FILTER_OWNED, "Owned by me", "#XSEL: Quick filter item to filter all files owned by me");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.QUICK_FILTER_SHARED_WITH_ME, "Shared with me", "#XSEL: Quick filter item to filter all files shared with me");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.PAGINATOR_PREV_PAGE, "Previous page", "#XTOL: Previous page button's tooltip (in pagination widget)");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.PAGINATOR_NEXT_PAGE, "Next page", "#XTOL: Next page button's tooltip (in pagination widget)");
	i18nProvider.addTextAndComment(oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO, "{0} of {1}", "#XTIT: Pagination info to show the current page '{0}' and the last page '{1}'");
	return i18nProvider;
};
oFF.SuResourceExplorerI18n.prototype.addTextAndComment = function(key, text, comment)
{
	this.addText(key, text);
	this.addComment(key, comment);
};

oFF.SuDfUiViewEventHandler = function() {};
oFF.SuDfUiViewEventHandler.prototype = new oFF.DfUiView();
oFF.SuDfUiViewEventHandler.prototype._ff_c = "SuDfUiViewEventHandler";

oFF.SuDfUiViewEventHandler.prototype.m_consumersHandler = null;
oFF.SuDfUiViewEventHandler.prototype.getEventConsumers = function(eventDef)
{
	return this.m_consumersHandler.getEventConsumers(eventDef.getName());
};
oFF.SuDfUiViewEventHandler.prototype.destroyView = function()
{
	if (oFF.isNull(this.m_consumersHandler))
	{
		throw oFF.XException.createRuntimeException("Consumers null. have you called super.setupView() in your setupView() method?");
	}
	this.m_consumersHandler = oFF.XObjectExt.release(this.m_consumersHandler);
};
oFF.SuDfUiViewEventHandler.prototype.setupView = function()
{
	this.m_consumersHandler = oFF.SuEventConsumerHandler.create();
};
oFF.SuDfUiViewEventHandler.prototype.attachEventConsumer = function(eventDef, consumer)
{
	this.m_consumersHandler.attachEventConsumer(eventDef.getName(), consumer);
	return this;
};
oFF.SuDfUiViewEventHandler.prototype.detachEventConsumer = function(eventDef, consumer)
{
	this.m_consumersHandler.detachEventConsumer(eventDef.getName(), consumer);
	return this;
};
oFF.SuDfUiViewEventHandler.prototype.fireEvent = function(eventDef, data)
{
	this.m_consumersHandler.fireEvent(eventDef.getName(), data);
};

oFF.SuExportAbstractView = function() {};
oFF.SuExportAbstractView.prototype = new oFF.DfUiContentView();
oFF.SuExportAbstractView.prototype._ff_c = "SuExportAbstractView";

oFF.SuExportAbstractView.prototype.m_root = null;
oFF.SuExportAbstractView.prototype.m_config = null;
oFF.SuExportAbstractView.prototype.addNameLayout = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var nameLayout = this.addVerticalLayout();
	nameLayout.setMargin(oFF.UiCssBoxEdges.create("0 0 20px 0"));
	var nameLabel = nameLayout.addNewItemOfType(oFF.UiType.LABEL);
	nameLabel.setText(i18nProvider.getText(oFF.SuExportI18n.NAME));
	nameLabel.setWidth(oFF.UiCssLength.create("100%"));
	var nameInput = nameLayout.addNewItemOfType(oFF.UiType.INPUT).registerOnEditingEnd(oFF.UiLambdaEditingEndListener.create( function(nameEditingChange){
		this.m_config.setFileName(nameEditingChange.getControl().getText());
	}.bind(this)));
	nameInput.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create( function(nameLiveChange){
		this.m_config.setFileName(nameLiveChange.getControl().getText());
	}.bind(this)));
	nameInput.setText(this.m_config.getFileName());
	nameInput.setWidth(oFF.UiCssLength.create("100%"));
};
oFF.SuExportAbstractView.prototype.addMessage = function(type, text)
{
	var messageLayout = this.addVerticalLayout();
	var message = messageLayout.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	message.setMessageType(type);
	message.setText(text);
	message.setTooltip(text);
	message.setShowIcon(true);
};
oFF.SuExportAbstractView.prototype.addHorizontalLayout = function()
{
	return this.addLayoutByType(oFF.UiType.HORIZONTAL_LAYOUT, oFF.UiFlexJustifyContent.START);
};
oFF.SuExportAbstractView.prototype.addFlexLayout = function(direction)
{
	var layout = this.addLayoutByType(oFF.UiType.FLEX_LAYOUT, oFF.UiFlexJustifyContent.START);
	layout.setDirection(direction);
	return layout;
};
oFF.SuExportAbstractView.prototype.addLayoutByType = function(type, justify)
{
	var layout = this.m_root.addNewItemOfType(type);
	layout.setMargin(oFF.UiCssBoxEdges.create("0 0 20px 0"));
	layout.setJustifyContent(justify);
	layout.setWidth(oFF.UiCssLength.create("100%"));
	layout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	layout.setFlex("1");
	return layout;
};
oFF.SuExportAbstractView.prototype.addVerticalLayout = function()
{
	return this.addLayoutByType(oFF.UiType.VERTICAL_LAYOUT, oFF.UiFlexJustifyContent.CENTER);
};
oFF.SuExportAbstractView.prototype.getConfig = function()
{
	return this.m_config;
};
oFF.SuExportAbstractView.prototype.releaseObject = function()
{
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.DfUiContentView.prototype.releaseObject.call( this );
};
oFF.SuExportAbstractView.prototype.destroyView = function() {};

oFF.SuDfVulcanSampleView = function() {};
oFF.SuDfVulcanSampleView.prototype = new oFF.DfUiContentView();
oFF.SuDfVulcanSampleView.prototype._ff_c = "SuDfVulcanSampleView";


oFF.SuVulcanConstantsView = function() {};
oFF.SuVulcanConstantsView.prototype = new oFF.SuDfVulcanView();
oFF.SuVulcanConstantsView.prototype._ff_c = "SuVulcanConstantsView";

oFF.SuVulcanConstantsView.prototype.m_searchableListView = null;
oFF.SuVulcanConstantsView.prototype.m_constantDetailsContainer = null;
oFF.SuVulcanConstantsView.prototype.setupView = function() {};
oFF.SuVulcanConstantsView.prototype.buildViewUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	this.m_searchableListView = oFF.UtSearchableListView.create(this.getGenesis(), null);
	this.m_searchableListView.setSearchFieldPlaceholder("Search constant...");
	this.m_searchableListView.setListItemSelectedConsumer( function(selectedListItem){
		var tmpConstant = selectedListItem.getCustomObject();
		this.updateConstantDetailsSection(tmpConstant);
	}.bind(this));
	var searchableListWrapper = this.m_searchableListView.getView();
	searchableListWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	searchableListWrapper.setBorderColor(oFF.UiColor.GREY);
	searchableListWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	mainLayout.addItem(searchableListWrapper);
	this.m_constantDetailsContainer = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_constantDetailsContainer.useMaxHeight();
	this.m_constantDetailsContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_constantDetailsContainer.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_constantDetailsContainer.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_constantDetailsContainer.setWidth(oFF.UiCssLength.create("80%"));
	this.m_constantDetailsContainer.setFlex("1 1 80%");
	this.m_constantDetailsContainer.setBackgroundColor(oFF.UiColor.WHITE);
	genesis.setRoot(mainLayout);
	this.prepareUi();
};
oFF.SuVulcanConstantsView.prototype.destroyView = function()
{
	this.m_searchableListView = oFF.XObjectExt.release(this.m_searchableListView);
	this.m_constantDetailsContainer = oFF.XObjectExt.release(this.m_constantDetailsContainer);
};
oFF.SuVulcanConstantsView.prototype.getType = function()
{
	return oFF.SuVulcanViewType.CONSTANTS;
};
oFF.SuVulcanConstantsView.prototype.prepareUi = function()
{
	this.fillUiConstantsList();
	if (oFF.notNull(this.m_searchableListView) && this.m_searchableListView.getListItems().hasElements())
	{
		var tmpListItem = this.m_searchableListView.getListItems().get(0);
		this.m_searchableListView.selectItem(tmpListItem);
		var tmpConstant = tmpListItem.getCustomObject();
		this.updateConstantDetailsSection(tmpConstant);
	}
};
oFF.SuVulcanConstantsView.prototype.fillUiConstantsList = function()
{
	if (oFF.notNull(this.m_searchableListView))
	{
		var sortedConstantNameList = oFF.UiConstant.getAllConstantNamesSorted();
		var itemList = oFF.XList.create();
		oFF.XCollectionUtils.forEachString(sortedConstantNameList,  function(constantName){
			var tmpConstant = oFF.UiConstant.lookupUiConstant(constantName);
			if (oFF.notNull(tmpConstant))
			{
				var newListItem = this.getGenesis().newControl(oFF.UiType.LIST_ITEM);
				newListItem.setName(tmpConstant.getName());
				newListItem.setText(tmpConstant.getName());
				newListItem.setCustomObject(tmpConstant);
				newListItem.setIcon("product");
				newListItem.setTooltip(tmpConstant.getName());
				itemList.add(newListItem);
			}
		}.bind(this));
		if (oFF.notNull(itemList) && itemList.hasElements())
		{
			this.m_searchableListView.setListItems(itemList);
		}
	}
};
oFF.SuVulcanConstantsView.prototype.updateConstantDetailsSection = function(constant)
{
	if (oFF.notNull(this.m_constantDetailsContainer) && oFF.notNull(constant))
	{
		this.m_constantDetailsContainer.clearItems();
		this.createOverviewSection(constant);
		this.createContantDetailsSection(constant);
	}
};
oFF.SuVulcanConstantsView.prototype.createOverviewSection = function(constant)
{
	if (oFF.notNull(this.m_constantDetailsContainer))
	{
		var overviewLayout = this.m_constantDetailsContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		overviewLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		overviewLayout.useMaxWidth();
		overviewLayout.setHeight(oFF.UiCssLength.create("125px"));
		overviewLayout.setFlex("0 0 80px");
		overviewLayout.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
		var constantNameTitle = overviewLayout.addNewItemOfType(oFF.UiType.TITLE);
		constantNameTitle.setText(constant.getName());
		constantNameTitle.setTitleLevel(oFF.UiTitleLevel.H_4);
		constantNameTitle.setTitleStyle(oFF.UiTitleLevel.H_4);
		constantNameTitle.setMargin(oFF.UiCssBoxEdges.create("0.5rem"));
		constantNameTitle.setWrapping(false);
		constantNameTitle.setFlex("0 0 auto");
		var titleSpacer = overviewLayout.addNewItemOfType(oFF.UiType.SPACER);
		titleSpacer.setHeight(oFF.UiCssLength.create("1px"));
		titleSpacer.setWidth(oFF.UiCssLength.create("auto"));
		titleSpacer.setBackgroundColor(oFF.UiColor.GREY);
		var descriptionLbl = this.createNewHeaderLabel("Description", constant.getDescription(), true, false, null);
		overviewLayout.addItem(descriptionLbl);
		var cssBasedLbl = this.createNewHeaderLabel("Css based", constant.isCssBased() ? "Yes" : "No", true, false, null);
		overviewLayout.addItem(cssBasedLbl);
	}
};
oFF.SuVulcanConstantsView.prototype.createContantDetailsSection = function(constant)
{
	var constantDetailsTabBar = this.m_constantDetailsContainer.addNewItemOfType(oFF.UiType.ICON_TAB_BAR);
	constantDetailsTabBar.setHeight(oFF.UiCssLength.create("auto"));
	constantDetailsTabBar.setWidth(oFF.UiCssLength.create("100%"));
	constantDetailsTabBar.setFlex("1 1 auto");
	constantDetailsTabBar.setMinHeight(oFF.UiCssLength.create("200px"));
	var valuesTab = this.createDetailsTab(constant, "Values");
	constantDetailsTabBar.addItem(valuesTab);
};
oFF.SuVulcanConstantsView.prototype.createNewHeaderLabel = function(label, text, wrapping, isLink, linkedUiType)
{
	var labelLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	labelLayout.setDirection(oFF.UiFlexDirection.ROW);
	labelLayout.setMargin(oFF.UiCssBoxEdges.create("5px"));
	var tmpLabelLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLabelLbl.setText(oFF.XStringUtils.concatenate2(label, ": "));
	tmpLabelLbl.setFlex("0 0 100px");
	if (isLink)
	{
		var tmpTextLink = labelLayout.addNewItemOfType(oFF.UiType.LINK);
		tmpTextLink.setText(text);
		tmpTextLink.setFontWeight(oFF.UiFontWeight.BOLD);
		tmpTextLink.setWrapping(wrapping);
		tmpTextLink.registerOnPress(this);
		tmpTextLink.setCustomObject(linkedUiType);
	}
	else
	{
		var tmpTextLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
		tmpTextLbl.setText(text);
		tmpTextLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		tmpTextLbl.setWrapping(wrapping);
	}
	return labelLayout;
};
oFF.SuVulcanConstantsView.prototype.createDetailsTab = function(constant, title)
{
	var tmpTabItem = this.getGenesis().newControl(oFF.UiType.ICON_TAB_BAR_ITEM);
	tmpTabItem.setText(title);
	var tabWrapperFlexLayout = tmpTabItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
	tabWrapperFlexLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var valuesTable = this.createValuesTable(constant);
	tabWrapperFlexLayout.addItem(valuesTable);
	return tmpTabItem;
};
oFF.SuVulcanConstantsView.prototype.createValuesTable = function(constant)
{
	var valuesTable = this.getGenesis().newControl(oFF.UiType.RESPONSIVE_TABLE);
	valuesTable.useMaxSpace();
	var nameCol = valuesTable.addNewResponsiveTableColumn();
	nameCol.setTitle("Name");
	var valueCol = valuesTable.addNewResponsiveTableColumn();
	valueCol.setTitle("Value");
	oFF.XCollectionUtils.forEach(constant.getValues(),  function(constValue){
		var constFullName = oFF.XStringUtils.concatenate3(constValue.getClassName(), ".", oFF.XStringUtils.camelCaseToUpperCase(constValue.getName()));
		var valueRow = valuesTable.addNewResponsiveTableRow();
		var nameCell = valueRow.addNewLabelCell();
		nameCell.setText(constFullName);
		var valueCell = valueRow.addNewLabelCell();
		valueCell.setText(constValue.getName());
	}.bind(this));
	return valuesTable;
};
oFF.SuVulcanConstantsView.prototype.onPress = function(event)
{
	var element = event.getControl();
	if (element.getUiType() === oFF.UiType.LINK)
	{
		oFF.XLogger.println("test");
	}
};

oFF.SuVulcanControlsView = function() {};
oFF.SuVulcanControlsView.prototype = new oFF.SuDfVulcanView();
oFF.SuVulcanControlsView.prototype._ff_c = "SuVulcanControlsView";

oFF.SuVulcanControlsView.CHARACTERISTIC_PROPERTIES = 0;
oFF.SuVulcanControlsView.CHARACTERISTIC_AGGREGATIONS = 1;
oFF.SuVulcanControlsView.CHARACTERISTIC_METHODS = 2;
oFF.SuVulcanControlsView.CHARACTERISTIC_EVENTS = 3;
oFF.SuVulcanControlsView.CHARACTERISTIC_INTERFACES = 4;
oFF.SuVulcanControlsView.prototype.m_searchableListView = null;
oFF.SuVulcanControlsView.prototype.m_controlDetailsContainer = null;
oFF.SuVulcanControlsView.prototype.setupView = function() {};
oFF.SuVulcanControlsView.prototype.buildViewUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setName("futVulcanUiControlsViewPageLayout");
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundColor(oFF.UiColor.create("#f9fafc"));
	mainLayout.setBorderWidth(oFF.UiCssBoxEdges.create("1px 0px 0px 0px"));
	mainLayout.setBorderColor(oFF.UiColor.GREY);
	mainLayout.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_searchableListView = oFF.UtSearchableListView.create(this.getGenesis(), null);
	this.m_searchableListView.setSearchFieldPlaceholder("Search control...");
	this.m_searchableListView.setListItemSelectedConsumer( function(selectedListItem){
		var tmpUiType = selectedListItem.getCustomObject();
		this.updateControlDetailsSection(tmpUiType);
	}.bind(this));
	var searchableListWrapper = this.m_searchableListView.getView();
	searchableListWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	searchableListWrapper.setBorderColor(oFF.UiColor.GREY);
	searchableListWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	mainLayout.addItem(searchableListWrapper);
	this.m_controlDetailsContainer = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_controlDetailsContainer.setName("futVulcanUiControlsViewDetailsContainer");
	this.m_controlDetailsContainer.useMaxHeight();
	this.m_controlDetailsContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_controlDetailsContainer.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_controlDetailsContainer.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_controlDetailsContainer.setWidth(oFF.UiCssLength.create("80%"));
	this.m_controlDetailsContainer.setFlex("1 1 80%");
	this.m_controlDetailsContainer.setBackgroundColor(oFF.UiColor.WHITE);
	genesis.setRoot(mainLayout);
	this.prepareUi();
};
oFF.SuVulcanControlsView.prototype.destroyView = function()
{
	this.m_searchableListView = oFF.XObjectExt.release(this.m_searchableListView);
	this.m_controlDetailsContainer = oFF.XObjectExt.release(this.m_controlDetailsContainer);
};
oFF.SuVulcanControlsView.prototype.getType = function()
{
	return oFF.SuVulcanViewType.CONTROLS;
};
oFF.SuVulcanControlsView.prototype.prepareUi = function()
{
	this.fillUiTypesList();
	if (oFF.notNull(this.m_searchableListView) && this.m_searchableListView.getListItems().hasElements())
	{
		var tmpListItem = this.m_searchableListView.getListItems().get(0);
		this.m_searchableListView.selectItem(tmpListItem);
		var tmpUiType = tmpListItem.getCustomObject();
		this.updateControlDetailsSection(tmpUiType);
	}
};
oFF.SuVulcanControlsView.prototype.fillUiTypesList = function()
{
	if (oFF.notNull(this.m_searchableListView))
	{
		var sortedUiTypeNameList = oFF.UiType.getAllUiTypeNamesSorted();
		var itemList = oFF.XList.create();
		oFF.XCollectionUtils.forEachString(sortedUiTypeNameList,  function(uiTypeName){
			var tmpUiType = oFF.UiType.lookupUiType(uiTypeName);
			if (oFF.notNull(tmpUiType))
			{
				var newListItem = this.getGenesis().newControl(oFF.UiType.LIST_ITEM);
				newListItem.setName(tmpUiType.getName());
				newListItem.setText(tmpUiType.getName());
				newListItem.setCustomObject(tmpUiType);
				if (tmpUiType.isAbstractControl())
				{
					newListItem.setIcon("database");
					newListItem.setTooltip("Abstract interface");
				}
				else
				{
					newListItem.setIcon("product");
					newListItem.setTooltip("Ui Element");
				}
				itemList.add(newListItem);
			}
		}.bind(this));
		if (oFF.notNull(itemList) && itemList.hasElements())
		{
			this.m_searchableListView.setListItems(itemList);
		}
	}
};
oFF.SuVulcanControlsView.prototype.updateControlDetailsSection = function(uiType)
{
	if (oFF.notNull(this.m_controlDetailsContainer) && oFF.notNull(uiType))
	{
		this.m_controlDetailsContainer.clearItems();
		this.createOverviewSection(uiType);
		this.createUiTypeDetailsTabStrip(uiType);
	}
};
oFF.SuVulcanControlsView.prototype.createOverviewSection = function(uiType)
{
	if (oFF.notNull(this.m_controlDetailsContainer))
	{
		var overviewLayout = this.m_controlDetailsContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		overviewLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		overviewLayout.useMaxWidth();
		overviewLayout.setHeight(oFF.UiCssLength.create("160px"));
		overviewLayout.setFlex("0 0 160px");
		overviewLayout.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
		var controlNameTitle = overviewLayout.addNewItemOfType(oFF.UiType.TITLE);
		controlNameTitle.setText(uiType.getName());
		controlNameTitle.setTitleLevel(oFF.UiTitleLevel.H_4);
		controlNameTitle.setTitleStyle(oFF.UiTitleLevel.H_4);
		controlNameTitle.setMargin(oFF.UiCssBoxEdges.create("0.5rem"));
		controlNameTitle.setWrapping(false);
		controlNameTitle.setFlex("0 0 auto");
		var titleSpacer = overviewLayout.addNewItemOfType(oFF.UiType.SPACER);
		titleSpacer.setHeight(oFF.UiCssLength.create("1px"));
		titleSpacer.setWidth(oFF.UiCssLength.create("auto"));
		titleSpacer.setBackgroundColor(oFF.UiColor.GREY);
		var superType = uiType.getSuperType();
		var superclassNameLbl = null;
		if (oFF.notNull(superType))
		{
			superclassNameLbl = this.createNewHeaderLabel("Superclass", superType.getName(), false, true, superType);
		}
		else
		{
			superclassNameLbl = this.createNewHeaderLabel("Superclass", "-", false, false, null);
		}
		overviewLayout.addItem(superclassNameLbl);
		var typeStr = uiType.isAbstractControl() ? "Interface" : "Class";
		var typeLbl = this.createNewHeaderLabel("Type", typeStr, true, false, null);
		overviewLayout.addItem(typeLbl);
		var descriptionLbl = this.createNewHeaderLabel("Description", uiType.getDescription(), true, false, null);
		overviewLayout.addItem(descriptionLbl);
	}
};
oFF.SuVulcanControlsView.prototype.createUiTypeDetailsTabStrip = function(uiType)
{
	var controlDetailsTabStrip = this.m_controlDetailsContainer.addNewItemOfType(oFF.UiType.ICON_TAB_BAR);
	controlDetailsTabStrip.setHeight(oFF.UiCssLength.create("auto"));
	controlDetailsTabStrip.setWidth(oFF.UiCssLength.create("100%"));
	controlDetailsTabStrip.setFlex("1 1 auto");
	controlDetailsTabStrip.setMinHeight(oFF.UiCssLength.create("200px"));
	var propertiesTab = this.createUiTypeCharacteristicsTab(uiType, "Properties", oFF.SuVulcanControlsView.CHARACTERISTIC_PROPERTIES);
	controlDetailsTabStrip.addItem(propertiesTab);
	var aggregationsTab = this.createUiTypeCharacteristicsTab(uiType, "Aggregations", oFF.SuVulcanControlsView.CHARACTERISTIC_AGGREGATIONS);
	controlDetailsTabStrip.addItem(aggregationsTab);
	var methodsTab = this.createUiTypeCharacteristicsTab(uiType, "Methods", oFF.SuVulcanControlsView.CHARACTERISTIC_METHODS);
	controlDetailsTabStrip.addItem(methodsTab);
	var eventsTab = this.createUiTypeCharacteristicsTab(uiType, "Events", oFF.SuVulcanControlsView.CHARACTERISTIC_EVENTS);
	controlDetailsTabStrip.addItem(eventsTab);
	var interfacesTab = this.createUiTypeCharacteristicsTab(uiType, "Interfaces", oFF.SuVulcanControlsView.CHARACTERISTIC_INTERFACES);
	controlDetailsTabStrip.addItem(interfacesTab);
};
oFF.SuVulcanControlsView.prototype.createNewHeaderLabel = function(label, text, wrapping, isLink, linkedUiType)
{
	var labelLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	labelLayout.setDirection(oFF.UiFlexDirection.ROW);
	labelLayout.setMargin(oFF.UiCssBoxEdges.create("5px"));
	var tmpLabelLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLabelLbl.setText(oFF.XStringUtils.concatenate2(label, ": "));
	tmpLabelLbl.setFlex("0 0 100px");
	if (isLink)
	{
		var tmpTextLink = labelLayout.addNewItemOfType(oFF.UiType.LINK);
		tmpTextLink.setText(text);
		tmpTextLink.setFontWeight(oFF.UiFontWeight.BOLD);
		tmpTextLink.setWrapping(wrapping);
		tmpTextLink.registerOnPress(this);
		tmpTextLink.setCustomObject(linkedUiType);
	}
	else
	{
		var tmpTextLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
		tmpTextLbl.setText(text);
		tmpTextLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		tmpTextLbl.setWrapping(wrapping);
	}
	return labelLayout;
};
oFF.SuVulcanControlsView.prototype.createUiTypeCharacteristicsTab = function(uiType, title, characteristic)
{
	var tmpTabItem = this.getGenesis().newControl(oFF.UiType.ICON_TAB_BAR_ITEM);
	tmpTabItem.setText(title);
	var tabWrapperFlexLayout = tmpTabItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
	tabWrapperFlexLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var ownCharacteristicsListStr = this.getUiTypeCharacteristicAsString(uiType, characteristic);
	var ownLbl = tabWrapperFlexLayout.addNewItemOfType(oFF.UiType.LABEL);
	ownLbl.setWrapping(true);
	ownLbl.setFlex("0 0 auto");
	ownLbl.setMargin(oFF.UiCssBoxEdges.create("10px"));
	ownLbl.setText(ownCharacteristicsListStr);
	var superType = uiType.getSuperType();
	var inheritedLbl = null;
	if (oFF.notNull(superType))
	{
		inheritedLbl = tabWrapperFlexLayout.addNewItemOfType(oFF.UiType.LABEL);
		inheritedLbl.setWrapping(true);
		inheritedLbl.setFlex("0 0 auto");
		inheritedLbl.setMargin(oFF.UiCssBoxEdges.create("10px"));
		inheritedLbl.setFontSize(oFF.UiCssLength.create("17px"));
		inheritedLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		inheritedLbl.setText("Inherited:");
	}
	var isSomethingInherited = false;
	while (oFF.notNull(superType))
	{
		var tmpCharacteristicsSortedStr = this.getUiTypeCharacteristicAsString(superType, characteristic);
		if (!oFF.XString.isEqual(tmpCharacteristicsSortedStr, "-"))
		{
			this.addUiTypeTabSection(tabWrapperFlexLayout, superType, tmpCharacteristicsSortedStr);
			isSomethingInherited = true;
		}
		superType = superType.getSuperType();
	}
	if (!isSomethingInherited && oFF.notNull(inheritedLbl))
	{
		tabWrapperFlexLayout.removeItem(inheritedLbl);
	}
	return tmpTabItem;
};
oFF.SuVulcanControlsView.prototype.addUiTypeTabSection = function(tabFlexLayout, uiType, text)
{
	if (oFF.notNull(uiType))
	{
		var tmpPanel = tabFlexLayout.addNewItemOfType(oFF.UiType.PANEL);
		tmpPanel.setFlex("0 0 75px");
		tmpPanel.setMargin(oFF.UiCssBoxEdges.create("0 0 0.25rem 0"));
		var tmpPanelHeaderLink = tmpPanel.setNewHeader(oFF.UiType.LINK);
		tmpPanelHeaderLink.setText(uiType.getName());
		tmpPanelHeaderLink.setFontSize(oFF.UiCssLength.create("16px"));
		tmpPanelHeaderLink.setFontWeight(oFF.UiFontWeight.BOLD);
		tmpPanelHeaderLink.setWrapping(false);
		tmpPanelHeaderLink.registerOnPress(this);
		tmpPanelHeaderLink.setCustomObject(uiType);
		var propertiesLbl = tmpPanel.setNewContent(oFF.UiType.LABEL);
		propertiesLbl.useMaxSpace();
		propertiesLbl.setWrapping(true);
		propertiesLbl.setText(text);
	}
};
oFF.SuVulcanControlsView.prototype.getUiTypeCharacteristicAsString = function(tmpType, characteristic)
{
	var tmpCharaceristicsListSorted = null;
	if (oFF.notNull(tmpType))
	{
		if (characteristic === oFF.SuVulcanControlsView.CHARACTERISTIC_PROPERTIES)
		{
			tmpCharaceristicsListSorted = tmpType.getOwnPropertyNamesSorted();
		}
		else if (characteristic === oFF.SuVulcanControlsView.CHARACTERISTIC_AGGREGATIONS)
		{
			tmpCharaceristicsListSorted = tmpType.getOwnAggregationNamesSorted();
		}
		else if (characteristic === oFF.SuVulcanControlsView.CHARACTERISTIC_METHODS)
		{
			tmpCharaceristicsListSorted = tmpType.getOwnMethodNamesSorted();
		}
		else if (characteristic === oFF.SuVulcanControlsView.CHARACTERISTIC_EVENTS)
		{
			tmpCharaceristicsListSorted = tmpType.getOwnEventNamesSorted();
		}
		else if (characteristic === oFF.SuVulcanControlsView.CHARACTERISTIC_INTERFACES)
		{
			tmpCharaceristicsListSorted = tmpType.getOwnInterfaceNamesSorted();
		}
	}
	var tmpPropsSortedStr = this.generateCharacteristicItemsString(tmpCharaceristicsListSorted);
	return tmpPropsSortedStr;
};
oFF.SuVulcanControlsView.prototype.generateCharacteristicItemsString = function(itemsList)
{
	if (oFF.notNull(itemsList) && !itemsList.isEmpty())
	{
		var strBuffer = oFF.XStringBuffer.create();
		var itemIterator = itemsList.getIterator();
		while (itemIterator.hasNext())
		{
			var prop = itemIterator.next();
			strBuffer.append(prop);
			if (itemIterator.hasNext())
			{
				strBuffer.append(", ");
			}
		}
		return strBuffer.toString();
	}
	return "-";
};
oFF.SuVulcanControlsView.prototype.openUiTypeDetailsForLink = function(link)
{
	if (oFF.notNull(link))
	{
		var linkedType = link.getCustomObject();
		if (oFF.notNull(linkedType))
		{
			var linkedTypeName = linkedType.getName();
			if (oFF.notNull(this.m_searchableListView))
			{
				this.m_searchableListView.selectItemByName(linkedTypeName);
				this.m_searchableListView.scrollToItemByName(linkedTypeName);
				this.updateControlDetailsSection(linkedType);
			}
		}
	}
};
oFF.SuVulcanControlsView.prototype.onPress = function(event)
{
	var element = event.getControl();
	if (element.getUiType() === oFF.UiType.LINK)
	{
		var tmpLink = element;
		this.openUiTypeDetailsForLink(tmpLink);
	}
};

oFF.SuVulcanIconExplorerView = function() {};
oFF.SuVulcanIconExplorerView.prototype = new oFF.SuDfVulcanView();
oFF.SuVulcanIconExplorerView.prototype._ff_c = "SuVulcanIconExplorerView";

oFF.SuVulcanIconExplorerView.prototype.m_iconGridList = null;
oFF.SuVulcanIconExplorerView.prototype.m_headerLabel = null;
oFF.SuVulcanIconExplorerView.prototype.m_filterWidget = null;
oFF.SuVulcanIconExplorerView.prototype.m_allGridListItems = null;
oFF.SuVulcanIconExplorerView.prototype.setupView = function()
{
	this.m_allGridListItems = oFF.XList.create();
};
oFF.SuVulcanIconExplorerView.prototype.buildViewUi = function(genesis)
{
	this.m_iconGridList = genesis.newControl(oFF.UiType.GRID_LIST);
	this.m_iconGridList.useMaxSpace();
	this.m_iconGridList.setOverflow(oFF.UiOverflow.AUTO);
	genesis.setRoot(this.m_iconGridList);
	this.renderGridHeader();
	this.renderGridItems();
};
oFF.SuVulcanIconExplorerView.prototype.destroyView = function()
{
	this.m_headerLabel = oFF.XObjectExt.release(this.m_headerLabel);
	this.m_filterWidget = oFF.XObjectExt.release(this.m_filterWidget);
	this.m_iconGridList = oFF.XObjectExt.release(this.m_iconGridList);
	this.m_allGridListItems = oFF.XObjectExt.release(this.m_allGridListItems);
};
oFF.SuVulcanIconExplorerView.prototype.getType = function()
{
	return oFF.SuVulcanViewType.ICON_EXPLORER;
};
oFF.SuVulcanIconExplorerView.prototype.renderGridHeader = function()
{
	if (oFF.notNull(this.m_iconGridList))
	{
		var headerLayout = this.m_iconGridList.setNewHeader(oFF.UiType.FLEX_LAYOUT);
		headerLayout.useMaxSpace();
		headerLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		headerLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
		var iconCount = this.getGenesis().getUiManager().getDriverInfo().getAllIconNames().size();
		this.m_headerLabel = headerLayout.addNewItemOfType(oFF.UiType.LABEL);
		this.m_headerLabel.setText(oFF.XStringUtils.concatenate2("Available icons: ", oFF.XInteger.convertToString(iconCount)));
		this.m_headerLabel.setFlex("0 1 auto");
		this.m_headerLabel.setMargin(oFF.UiCssBoxEdges.create("0 0.5rem 0 0"));
		this.m_filterWidget = oFF.UtTextFilterWidget.create(this.getGenesis(), null);
		this.m_filterWidget.setPlaceholder("Search icon...");
		this.m_filterWidget.getView().setFlex("0 5 350px");
		this.m_filterWidget.setTextFunction( function(gridListItem){
			return this.getItemText(gridListItem);
		}.bind(this));
		this.m_filterWidget.setFilterChangedConsumer( function(filteredGridListItems){
			this.handleFilterListchanged(filteredGridListItems);
		}.bind(this));
		headerLayout.addItem(this.m_filterWidget.getView());
	}
};
oFF.SuVulcanIconExplorerView.prototype.renderGridItems = function()
{
	if (oFF.notNull(this.m_iconGridList))
	{
		this.m_iconGridList.clearItems();
		var allIconNames = this.getGenesis().getUiManager().getDriverInfo().getAllIconNames();
		oFF.XCollectionUtils.forEachString(allIconNames,  function(iconName){
			var tmpGridItem = this.m_iconGridList.addNewItem();
			tmpGridItem.setMargin(oFF.UiCssBoxEdges.create("1px"));
			var griItemContentLayout = tmpGridItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
			griItemContentLayout.useMaxSpace();
			griItemContentLayout.setDirection(oFF.UiFlexDirection.COLUMN);
			griItemContentLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			griItemContentLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
			var tmpIcon = griItemContentLayout.addNewItemOfType(oFF.UiType.ICON);
			tmpIcon.setIcon(iconName);
			tmpIcon.setEnabled(false);
			tmpIcon.setIconSize(oFF.UiCssLength.create("2.25rem"));
			tmpIcon.setPadding(oFF.UiCssBoxEdges.create("0.75rem"));
			var tmpLabel = griItemContentLayout.addNewItemOfType(oFF.UiType.LABEL);
			tmpLabel.setText(iconName);
			tmpLabel.setPadding(oFF.UiCssBoxEdges.create("0.75rem"));
			tmpGridItem.setCustomObject(tmpLabel);
			this.m_allGridListItems.add(tmpGridItem);
		}.bind(this));
		this.m_filterWidget.setFilterList(this.m_allGridListItems);
	}
};
oFF.SuVulcanIconExplorerView.prototype.getItemText = function(gridListItem)
{
	var tmpTileLabel = gridListItem.getCustomObject();
	return tmpTileLabel.getText();
};
oFF.SuVulcanIconExplorerView.prototype.handleFilterListchanged = function(newGridListItems)
{
	this.m_iconGridList.clearItems();
	oFF.XCollectionUtils.forEach(newGridListItems,  function(listItem){
		this.m_iconGridList.addItem(listItem);
	}.bind(this));
};

oFF.SuVulcanPopupsView = function() {};
oFF.SuVulcanPopupsView.prototype = new oFF.SuDfVulcanView();
oFF.SuVulcanPopupsView.prototype._ff_c = "SuVulcanPopupsView";

oFF.SuVulcanPopupsView.prototype.setupView = function() {};
oFF.SuVulcanPopupsView.prototype.buildViewUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setName("futVulcanUiPopupsViewPageLayout");
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundColor(oFF.UiColor.create("#f9fafc"));
	genesis.setRoot(mainLayout);
	this.createPopupButtons(mainLayout);
};
oFF.SuVulcanPopupsView.prototype.destroyView = function() {};
oFF.SuVulcanPopupsView.prototype.getType = function()
{
	return oFF.SuVulcanViewType.POPUPS;
};
oFF.SuVulcanPopupsView.prototype.formPopupSubmitted = function(prefsStruct)
{
	this.getGenesis().showSuccessToast(oFF.XStringUtils.concatenate2("Model: ", prefsStruct.toString()));
};
oFF.SuVulcanPopupsView.prototype.createPopupButtons = function(layout)
{
	var confirmPopupBtn = layout.addNewItemOfType(oFF.UiType.BUTTON);
	confirmPopupBtn.setName("futVulcanUiPopupsConfirmBtn");
	confirmPopupBtn.setText("Confirm Popup");
	confirmPopupBtn.setIcon("accept");
	confirmPopupBtn.registerOnPress(this);
	confirmPopupBtn.setMargin(oFF.UiCssBoxEdges.create("10px"));
	var warningPopupBtn = layout.addNewItemOfType(oFF.UiType.BUTTON);
	warningPopupBtn.setName("futVulcanUiPopupsWarningBtn");
	warningPopupBtn.setText("Warning Popup");
	warningPopupBtn.setIcon("warning");
	warningPopupBtn.registerOnPress(this);
	warningPopupBtn.setMargin(oFF.UiCssBoxEdges.create("10px"));
	var errorPopupBtn = layout.addNewItemOfType(oFF.UiType.BUTTON);
	errorPopupBtn.setName("futVulcanUiPopupsErrorBtn");
	errorPopupBtn.setText("Error Popup");
	errorPopupBtn.setIcon("error");
	errorPopupBtn.registerOnPress(this);
	errorPopupBtn.setMargin(oFF.UiCssBoxEdges.create("10px"));
	var inputPopupBtn = layout.addNewItemOfType(oFF.UiType.BUTTON);
	inputPopupBtn.setName("futVulcanUiPopupsInputBtn");
	inputPopupBtn.setText("Input Popup");
	inputPopupBtn.setIcon("text");
	inputPopupBtn.registerOnPress(this);
	inputPopupBtn.setMargin(oFF.UiCssBoxEdges.create("10px"));
	var formPopupBtn = layout.addNewItemOfType(oFF.UiType.BUTTON);
	formPopupBtn.setName("futVulcanUiPopupsFormBtn");
	formPopupBtn.setText("Form Popup");
	formPopupBtn.setIcon("form");
	formPopupBtn.registerOnPress(this);
	formPopupBtn.setMargin(oFF.UiCssBoxEdges.create("10px"));
};
oFF.SuVulcanPopupsView.prototype.openConfirmPopup = function()
{
	var newConfirmPopup = oFF.UtConfirmPopup.create(this.getGenesis(), "Really?", "Are you sure that you want to delete the internet?");
	newConfirmPopup.setConfirmButtonText("Delete it!");
	newConfirmPopup.setConfirmButtonIcon("delete");
	newConfirmPopup.setConfirmButtonType(oFF.UiButtonType.DESTRUCTIVE);
	newConfirmPopup.setConfirmProcedure( function(){
		this.getGenesis().showSuccessToast("You have sucessfully deleted the internet!");
	}.bind(this));
	newConfirmPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openInputPopup = function()
{
	var newInputPoptup = oFF.UtInputPopup.create(this.getGenesis(), "Save as...", "Please specify the file");
	newInputPoptup.setInputPlaceholder("File path");
	newInputPoptup.setInputValue("");
	newInputPoptup.setOkButtonText("Save");
	newInputPoptup.setOkButtonIcon("save");
	newInputPoptup.setInputConsumer( function(text){
		this.getGenesis().showSuccessToast(oFF.XStringUtils.concatenate2("File: ", text));
	}.bind(this));
	newInputPoptup.open();
};
oFF.SuVulcanPopupsView.prototype.openFormMenu = function(control)
{
	var formMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	var formItemsMenuItem = formMenu.addNewItem();
	formItemsMenuItem.setName("formItemsMenuItem");
	formItemsMenuItem.setText("Form items");
	formItemsMenuItem.registerOnPress(this);
	var userRegistrationFormMenuItem = formMenu.addNewItem();
	userRegistrationFormMenuItem.setName("userRegistrationFormMenuItem");
	userRegistrationFormMenuItem.setText("User registration form");
	userRegistrationFormMenuItem.registerOnPress(this);
	var complexFormMenuItem = formMenu.addNewItem();
	complexFormMenuItem.setName("complexFormMenuItem");
	complexFormMenuItem.setText("Complex form");
	complexFormMenuItem.registerOnPress(this);
	var centralFormLabelsMenuItem = formMenu.addNewItem();
	centralFormLabelsMenuItem.setName("centralFormLabelsMenuItem");
	centralFormLabelsMenuItem.setText("Central form labels");
	centralFormLabelsMenuItem.registerOnPress(this);
	formMenu.openAt(control);
};
oFF.SuVulcanPopupsView.prototype.openFormItemsFormPopup = function()
{
	var ddDummyEntries = oFF.XHashMapOfStringByString.create();
	ddDummyEntries.put("entry1", "Entry 1");
	ddDummyEntries.put("entry2", "Entry 2");
	var sbDummyEntries = oFF.XHashMapOfStringByString.create();
	sbDummyEntries.put("button1", "Button 1");
	sbDummyEntries.put("button2", "Button 2");
	var rgDummyEntries = oFF.XHashMapOfStringByString.create();
	rgDummyEntries.put("radio1", "Radio 1");
	rgDummyEntries.put("radio2", "Radio 2");
	rgDummyEntries.put("radio3", "Radio 3");
	var formPopup = oFF.UtFormPopup.create(this.getGenesis(), "Form items",  function(model){
		this.formPopupSubmitted(model);
	}.bind(this));
	var modelIncludedSection = formPopup.addFormSection("modelIncludedSection", "Included in model", false);
	modelIncludedSection.alwaysShowSectionMarker(true);
	modelIncludedSection.addInput("input", "", "Input", "", null, null);
	modelIncludedSection.addInput("inputWithValueHelp", "", "Input with value help", "", null,  function(){
		this.getGenesis().showInfoToast("Value help pressed");
	}.bind(this));
	modelIncludedSection.addDropdown("dropdown", "entry1", "Dropdown", ddDummyEntries, false);
	modelIncludedSection.addSegmentedButton("segmentedButton", "button1", "Segmented Button", sbDummyEntries);
	modelIncludedSection.addRadioGroup("radioGroup", "radio1", "Radio Group", rgDummyEntries);
	modelIncludedSection.addSwitch("switch", false, "Switch");
	modelIncludedSection.addCheckbox("checkbox", false, "Checkbox");
	var dumbControlSection = formPopup.addFormSection("dumbControlSection", "Dumb controls", false);
	dumbControlSection.alwaysShowSectionMarker(true);
	dumbControlSection.addFormLabel("label", "Just a label", "Label");
	dumbControlSection.addFormButton("button", "Just a button", "button", null,  function(){
		this.getGenesis().showInfoToast("Button pressed");
	}.bind(this));
	formPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openUserRegistrationFormPopup = function()
{
	var countryList = oFF.XHashMapOfStringByString.create();
	countryList.put("de", "Germany");
	countryList.put("us", "USA");
	countryList.put("uk", "UK");
	countryList.put("fr", "France");
	countryList.put("js", "Japan");
	countryList.put("ca", "Canada");
	var registrationPopup = oFF.UtFormPopup.create(this.getGenesis(), "Sign up",  function(model){
		this.formPopupSubmitted(model);
	}.bind(this));
	registrationPopup.setWidth(oFF.UiCssLength.create("300px"));
	registrationPopup.addInput("username", "", "Username", null, null, null).setRequired(true).setCustomValidator( function(loginItem){
		if (loginItem.isEmpty() || oFF.XString.size(oFF.XValueUtil.getString(loginItem.getValue())) < 5)
		{
			loginItem.setInvalid("Username must be at least 5 characters long");
			return;
		}
		loginItem.setValid();
	}.bind(this));
	registrationPopup.addInput("email", "", "Email", null, oFF.UiInputType.EMAIL, null).setRequired(true).setCustomValidator( function(emailItem){
		if (!emailItem.isEmpty() && (!oFF.XString.containsString(oFF.XValueUtil.getString(emailItem.getValue()), "@") || !oFF.XString.containsString(oFF.XValueUtil.getString(emailItem.getValue()), ".")))
		{
			emailItem.setInvalid("This is not a valid email adress");
			return;
		}
		emailItem.setValid();
	}.bind(this));
	var countryDd = registrationPopup.addDropdown("country", "", "Country", countryList, true);
	countryDd.setEmptyItemText("Not specified");
	var passwordSection = registrationPopup.addFormSection("passwordSec", "", false);
	var passwdItem = passwordSection.addInput("password", "", "Password", "", oFF.UiInputType.PASSWORD, null);
	passwdItem.setRequired(true);
	passwdItem.setCustomValidator( function(pwdItem){
		var pwdVal = oFF.XValueUtil.getString(pwdItem.getValue());
		pwdVal = oFF.isNull(pwdVal) ? "" : pwdVal;
		if (!oFF.XString.match(pwdVal, "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
		{
			pwdItem.setInvalid("Password needs to be at least 8 characters, with at least one letter and one number");
			return;
		}
		pwdItem.setValid();
	}.bind(this));
	var passwdRepItem = passwordSection.addInput("passwordRepear", "", "Repeat password", "", oFF.UiInputType.PASSWORD, null);
	passwdRepItem.setRequired(true);
	passwdRepItem.setCustomValidator( function(pwdRepItem){
		if (!passwdRepItem.getValue().isEqualTo(passwdItem.getValue()))
		{
			pwdRepItem.setInvalid("Passwords are not equal!");
			passwordSection.setInvalid("Passwords does not match!");
			return;
		}
		passwordSection.setValid();
		pwdRepItem.setValid();
	}.bind(this));
	registrationPopup.addSwitch("notRobot", false, "I'm not a robot").setCustomValidator( function(switchItem){
		if (!oFF.XValueUtil.getBoolean(switchItem.getValue(), true, true))
		{
			switchItem.setInvalid("You need to confirm that you are not a robot");
			return;
		}
		switchItem.setValid();
	}.bind(this));
	registrationPopup.setSubmitButtonText("Register");
	registrationPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openComplexFormPopup = function()
{
	var regionMap = oFF.XHashMapOfStringByString.create();
	regionMap.put("de", "Germany");
	regionMap.put("us", "USA");
	regionMap.put("uk", "UK");
	regionMap.put("fr", "France");
	var formPopup = oFF.UtFormPopup.create(this.getGenesis(), "Complex form",  function(model){
		this.formPopupSubmitted(model);
	}.bind(this));
	var labelSection = formPopup.addFormSection(null, null, true);
	labelSection.addFormLabel("lbl1", "Test label", "Tooltip");
	labelSection.addFormLabel("lbl2", "Required labbel", "IS required").setRequired(true);
	labelSection.addFormLabel("lbl3", "One more", "Tooltip");
	var firstName = formPopup.addInput("firstName", "", "First name", "", null, null);
	firstName.setCustomValidator( function(formItem0){
		if (firstName.isEmpty() || oFF.XString.size(oFF.XValueUtil.getString(firstName.getValue())) < 4)
		{
			formItem0.setInvalid("First name must be at least 4 characters long");
		}
		else
		{
			formItem0.setValid();
		}
	}.bind(this));
	var lastName = formPopup.addInput("lastName", "", "Last name", "", null, null);
	lastName.setRequired(true);
	var pwdField1 = formPopup.addInput("password", "", "Super secret password", "", oFF.UiInputType.PASSWORD, null);
	pwdField1.setRequired(true);
	var pwdField2 = formPopup.addInput("passwordRepeat", "", "Repeat password", "", oFF.UiInputType.PASSWORD, null);
	pwdField2.setCustomValidator( function(formItem){
		if (!pwdField1.getValue().isEqualTo(pwdField2.getValue()))
		{
			formItem.setInvalid("Passwords are not equal!");
		}
		else
		{
			formItem.setValid();
		}
	}.bind(this));
	var regionDd = formPopup.addDropdown("region", null, "Region", regionMap, true);
	regionDd.setRequired(true);
	regionDd.setValueChangedConsumer( function(key, newVal){
		this.getGenesis().showWarningToast(newVal.toString());
	}.bind(this));
	var shareDataSwitch = formPopup.addSwitch("shareData", false, "Share data?");
	var tmpSection = formPopup.addFormSection("address", "This is an example description of a form section", true);
	var adrStreet = tmpSection.addInput("street", "", "", "Street", null, null);
	adrStreet.setRequired(true);
	adrStreet.setFlex("29%");
	var adrHousenum = tmpSection.addInput("number", "", "", "House number", null, null);
	adrHousenum.setRequired(true);
	adrHousenum.setCustomRequiredText("Not so fast! This is required!");
	adrHousenum.setFlex("29%");
	var adrCity = tmpSection.addInput("city", "", "", "City", null, null);
	adrCity.setRequired(true);
	adrCity.setFlex("29%");
	tmpSection.addFormButton(null, "", "Remove this section!", "delete",  function(){
		formPopup.removeFormItemByKey("address");
	}.bind(this));
	var phoneSection = formPopup.addFormSection("phone", null, true);
	phoneSection.alwaysShowSectionMarker(true);
	var phoneHome = phoneSection.addInput("homePhone", "", "Home phone", "", oFF.UiInputType.NUMBER, null);
	phoneHome.setFlex("1 1 25%");
	var phoneMobile = phoneSection.addInput("mobilePhone", "", "Mobile phone", "", oFF.UiInputType.NUMBER, null);
	phoneMobile.setFlex("1 1 25%");
	var isPrivate = phoneSection.addSwitch("isPrivate", false, "Is private?");
	isPrivate.setFlex("1 1 46%");
	phoneSection.setCustomRequiredText("");
	phoneSection.setCustomValidator( function(formItem3){
		if (isPrivate.getValue().isEqualTo(oFF.XBooleanValue.create(false)))
		{
			formItem3.setInvalid("Private switch must be ON in order to proceed!");
		}
		else
		{
			formItem3.setValid();
		}
	}.bind(this));
	var autoFillBtn = formPopup.addFormButton(null, "Autofill form", "Autofill form", "car-rental",  function(){
		firstName.setValue(oFF.XStringValue.create("This is my first name"));
		lastName.setValue(oFF.XStringValue.create("This should be my last name"));
		pwdField1.setValue(oFF.XStringValue.create("secretPWd"));
		pwdField2.setValue(oFF.XStringValue.create("secretPWd"));
		regionDd.setValue(oFF.XStringValue.create("us"));
		shareDataSwitch.setValue(oFF.XBooleanValue.create(true));
		adrStreet.setValue(oFF.XStringValue.create("Some street"));
		adrHousenum.setValue(oFF.XStringValue.create("666"));
		adrCity.setValue(oFF.XStringValue.create("Funny city"));
		phoneHome.setValue(oFF.XStringValue.create("6666666655"));
		phoneMobile.setValue(oFF.XStringValue.create("123456343"));
		isPrivate.setValue(oFF.XBooleanValue.create(true));
		tmpSection.validate();
		phoneSection.validate();
	}.bind(this));
	autoFillBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	formPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openCentralLabelsFormPopup = function()
{
	var formPopup = oFF.UtFormPopup.create(this.getGenesis(), "Central form labels",  function(model){
		this.formPopupSubmitted(model);
	}.bind(this));
	var labelSection = formPopup.addFormSection(null, null, true);
	labelSection.addFormLabel("lbl1", "Name", null).setFlex("2 0 190px");
	labelSection.addFormLabel("lbl2", "Type", null).setFlex("1 0 110px");
	labelSection.addFormLabel("lbl3", "Technical Name", null).setFlex("2 0 190px");
	labelSection.addFormLabel("dummyLbl", null, null).setFlex("0 0 32px");
	var fieldsSection = formPopup.addFormSection("fields", null, true);
	var textItem = fieldsSection.addInput("name", null, null, "", null, null);
	textItem.setRequired(true);
	textItem.setFlex("2 0 190px");
	var scopeItem = fieldsSection.addDropdown("type", null, null, null, false);
	scopeItem.setFlex("1 0 110px");
	var nameItem = fieldsSection.addInput("technicalName", null, null, "", null, null);
	nameItem.setRequired(true);
	nameItem.setFlex("2 0 190px");
	var buttonItem = fieldsSection.addFormButton("delete", null, null, "delete", null);
	buttonItem.setFlex("0 0 auto");
	var fieldsSection2 = formPopup.addFormSection("fields", null, true);
	var textItem2 = fieldsSection2.addInput("name", null, null, "", null, null);
	textItem2.setRequired(true);
	textItem2.setFlex("2 0 190px");
	var scopeItem2 = fieldsSection2.addDropdown("type", null, null, null, false);
	scopeItem2.setFlex("1 0 110px");
	var nameItem2 = fieldsSection2.addInput("technicalName", null, null, "", null, null);
	nameItem2.setRequired(true);
	nameItem2.setFlex("2 0 190px");
	var buttonItem2 = fieldsSection2.addFormButton("delete", null, null, "delete", null);
	buttonItem2.setFlex("0 0 auto");
	formPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openErrorPopup = function()
{
	var errorPopup = oFF.UtErrorPopup.create(this.getGenesis(), "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
	errorPopup.open();
};
oFF.SuVulcanPopupsView.prototype.openWarningPopup = function()
{
	var content = this.getGenesis().newControl(oFF.UiType.FORMATTED_TEXT);
	content.setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
	var warningPopup = oFF.UtWarningPopup.create(this.getGenesis(), "Warning", content);
	warningPopup.setWidth("25em");
	warningPopup.open();
};
oFF.SuVulcanPopupsView.prototype.onPress = function(event)
{
	var element = event.getControl();
	if (element.getUiType() === oFF.UiType.BUTTON)
	{
		switch (element.getName())
		{
			case "futVulcanUiPopupsConfirmBtn":
				this.openConfirmPopup();
				break;

			case "futVulcanUiPopupsErrorBtn":
				this.openErrorPopup();
				break;

			case "futVulcanUiPopupsWarningBtn":
				this.openWarningPopup();
				break;

			case "futVulcanUiPopupsInputBtn":
				this.openInputPopup();
				break;

			case "futVulcanUiPopupsFormBtn":
				this.openFormMenu(event.getControl());
				break;

			default:
				break;
		}
	}
	else if (element.getUiType() === oFF.UiType.MENU_ITEM)
	{
		switch (element.getName())
		{
			case "formItemsMenuItem":
				this.openFormItemsFormPopup();
				break;

			case "userRegistrationFormMenuItem":
				this.openUserRegistrationFormPopup();
				break;

			case "complexFormMenuItem":
				this.openComplexFormPopup();
				break;

			case "centralFormLabelsMenuItem":
				this.openCentralLabelsFormPopup();
				break;

			default:
				break;
		}
	}
};

oFF.SuVulcanSamplesView = function() {};
oFF.SuVulcanSamplesView.prototype = new oFF.SuDfVulcanView();
oFF.SuVulcanSamplesView.prototype._ff_c = "SuVulcanSamplesView";

oFF.SuVulcanSamplesView.prototype.m_searchableListView = null;
oFF.SuVulcanSamplesView.prototype.m_widgetSampleContainer = null;
oFF.SuVulcanSamplesView.prototype.m_currentSampleView = null;
oFF.SuVulcanSamplesView.prototype.setupView = function() {};
oFF.SuVulcanSamplesView.prototype.buildViewUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundColor(oFF.UiColor.create("#f9fafc"));
	this.m_searchableListView = oFF.UtSearchableListView.create(this.getGenesis(), null);
	this.m_searchableListView.setSearchFieldPlaceholder("Search sample...");
	this.m_searchableListView.setListItemSelectedConsumer( function(listItem){
		this.renderSample(listItem);
	}.bind(this));
	var searchableListWrapper = this.m_searchableListView.getView();
	searchableListWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	searchableListWrapper.setBorderColor(oFF.UiColor.GREY);
	searchableListWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	mainLayout.addItem(searchableListWrapper);
	this.m_widgetSampleContainer = mainLayout.addNewItemOfType(oFF.UiType.CONTENT_WRAPPER);
	this.m_widgetSampleContainer.useMaxHeight();
	this.m_widgetSampleContainer.setWidth(oFF.UiCssLength.create("80%"));
	this.m_widgetSampleContainer.setFlex("1 1 80%");
	this.m_widgetSampleContainer.setBackgroundColor(oFF.UiColor.WHITE);
	genesis.setRoot(mainLayout);
	this.prepareSamplesList();
	this.renderInitalSampleView();
};
oFF.SuVulcanSamplesView.prototype.destroyView = function()
{
	this.m_currentSampleView = oFF.XObjectExt.release(this.m_currentSampleView);
	this.m_searchableListView = oFF.XObjectExt.release(this.m_searchableListView);
	this.m_widgetSampleContainer = oFF.XObjectExt.release(this.m_widgetSampleContainer);
};
oFF.SuVulcanSamplesView.prototype.getType = function()
{
	return oFF.SuVulcanViewType.SAMPLES;
};
oFF.SuVulcanSamplesView.prototype.prepareSamplesList = function()
{
	var listItems = oFF.XList.create();
	oFF.XCollectionUtils.forEach(oFF.SuVulcanSampleRegistration.getAllWidgetSampleViews(),  function(sampleViewFactory){
		var tmpListItem = this.getGenesis().newControl(oFF.UiType.LIST_ITEM);
		tmpListItem.setText(sampleViewFactory.getDisplayName());
		tmpListItem.setTooltip(sampleViewFactory.getDescription());
		tmpListItem.setIcon(this.getIconForType(sampleViewFactory.getType()));
		tmpListItem.setCustomObject(sampleViewFactory);
		listItems.add(tmpListItem);
	}.bind(this));
	this.m_searchableListView.setListItems(listItems);
};
oFF.SuVulcanSamplesView.prototype.renderInitalSampleView = function()
{
	if (oFF.notNull(this.m_searchableListView) && this.m_searchableListView.getListItems().hasElements())
	{
		var firstListItem = this.m_searchableListView.getListItems().get(0);
		this.renderSample(firstListItem);
		this.m_searchableListView.selectItem(firstListItem);
	}
	else
	{
		var noSamplesLbl = this.m_widgetSampleContainer.setNewContent(oFF.UiType.LABEL);
		noSamplesLbl.setText("There are no samples yet...");
	}
};
oFF.SuVulcanSamplesView.prototype.renderSample = function(listItem)
{
	if (oFF.notNull(listItem))
	{
		var viewFactory = listItem.getCustomObject();
		var sampleViewInstance = viewFactory.newSampleView(this.getGenesis());
		this.m_widgetSampleContainer.clearContent();
		this.m_widgetSampleContainer.setContent(sampleViewInstance.getView());
		this.m_currentSampleView = oFF.XObjectExt.release(this.m_currentSampleView);
		this.m_currentSampleView = sampleViewInstance;
		this.setTitle(oFF.XStringUtils.concatenate3(sampleViewInstance.getDisplayName(), " - ", sampleViewInstance.getDescription()));
	}
};
oFF.SuVulcanSamplesView.prototype.getIconForType = function(sampleType)
{
	var icon = "question-mark";
	if (sampleType === oFF.SuVulcanSampleType.CONTROL)
	{
		icon = "lightbulb";
	}
	else if (sampleType === oFF.SuVulcanSampleType.WIDGET)
	{
		icon = "widgets";
	}
	else if (sampleType === oFF.SuVulcanSampleType.VIEW)
	{
		icon = "sys-monitor";
	}
	else if (sampleType === oFF.SuVulcanSampleType.DIALOG)
	{
		icon = "fpa/dialog";
	}
	else
	{
		icon = "question-mark";
	}
	return icon;
};

oFF.SuFilterType = function() {};
oFF.SuFilterType.prototype = new oFF.XConstant();
oFF.SuFilterType.prototype._ff_c = "SuFilterType";

oFF.SuFilterType.EXACT = null;
oFF.SuFilterType.ASTERISK = null;
oFF.SuFilterType.NOT = null;
oFF.SuFilterType.ENDS = null;
oFF.SuFilterType.STARTS = null;
oFF.SuFilterType.s_lookup = null;
oFF.SuFilterType.staticSetup = function()
{
	oFF.SuFilterType.s_lookup = oFF.XHashMapByString.create();
	oFF.SuFilterType.EXACT = oFF.SuFilterType.create("Exact");
	oFF.SuFilterType.ASTERISK = oFF.SuFilterType.create("Asterisk");
	oFF.SuFilterType.STARTS = oFF.SuFilterType.create("Starts");
	oFF.SuFilterType.ENDS = oFF.SuFilterType.create("Ends");
	oFF.SuFilterType.NOT = oFF.SuFilterType.create("Not");
};
oFF.SuFilterType.create = function(name)
{
	var type = new oFF.SuFilterType();
	type.setupConstant(name);
	oFF.SuFilterType.s_lookup.put(name, type);
	return type;
};
oFF.SuFilterType.lookup = function(name)
{
	return oFF.SuFilterType.s_lookup.getByKey(name);
};
oFF.SuFilterType.prototype.is = function(other)
{
	return oFF.notNull(other) && oFF.XString.isEqual(this.getName(), other.getName());
};

oFF.SuDfUiWidgetEventHandler = function() {};
oFF.SuDfUiWidgetEventHandler.prototype = new oFF.DfUiWidget();
oFF.SuDfUiWidgetEventHandler.prototype._ff_c = "SuDfUiWidgetEventHandler";

oFF.SuDfUiWidgetEventHandler.prototype.m_consumersHandler = null;
oFF.SuDfUiWidgetEventHandler.prototype.getEventConsumers = function(eventDef)
{
	return this.m_consumersHandler.getEventConsumers(eventDef.getName());
};
oFF.SuDfUiWidgetEventHandler.prototype.destroyWidget = function()
{
	if (oFF.isNull(this.m_consumersHandler))
	{
		throw oFF.XException.createRuntimeException("Consumers null. have you called super.setupView() in your setupView() method?");
	}
	this.m_consumersHandler = oFF.XObjectExt.release(this.m_consumersHandler);
};
oFF.SuDfUiWidgetEventHandler.prototype.setupWidget = function()
{
	this.m_consumersHandler = oFF.SuEventConsumerHandler.create();
};
oFF.SuDfUiWidgetEventHandler.prototype.attachEventConsumer = function(eventDef, consumer)
{
	this.m_consumersHandler.attachEventConsumer(eventDef.getName(), consumer);
	return this;
};
oFF.SuDfUiWidgetEventHandler.prototype.detachEventConsumer = function(eventDef, consumer)
{
	this.m_consumersHandler.detachEventConsumer(eventDef.getName(), consumer);
	return this;
};
oFF.SuDfUiWidgetEventHandler.prototype.fireEvent = function(eventDef, data)
{
	this.m_consumersHandler.fireEvent(eventDef.getName(), data);
};

oFF.SuPaginator = function() {};
oFF.SuPaginator.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuPaginator.prototype._ff_c = "SuPaginator";

oFF.SuPaginator.create = function(pageSize)
{
	var paginator = new oFF.SuPaginator();
	paginator.m_pageSize = pageSize;
	return paginator;
};
oFF.SuPaginator.prototype.m_prev = null;
oFF.SuPaginator.prototype.m_next = null;
oFF.SuPaginator.prototype.m_pageInfo = null;
oFF.SuPaginator.prototype.m_listSize = 0;
oFF.SuPaginator.prototype.m_pageSize = -1;
oFF.SuPaginator.prototype.m_currentPage = -1;
oFF.SuPaginator.prototype.m_pageCount = 0;
oFF.SuPaginator.prototype.m_pageInfoLabelSize = "0";
oFF.SuPaginator.prototype.m_enabled = true;
oFF.SuPaginator.prototype.setListSize = function(listSize)
{
	this.m_listSize = listSize;
	this.initUI();
};
oFF.SuPaginator.prototype.clear = function()
{
	this.getView().clearItems();
	this.m_listSize = 0;
	this.m_currentPage = -1;
	this.m_pageCount = 0;
	this.getView().setVisible(false);
};
oFF.SuPaginator.prototype.getPageList = function(list)
{
	if (!this.m_enabled)
	{
		return list;
	}
	this.validateList(list);
	if (this.m_pageCount <= 1)
	{
		return list;
	}
	var begin = this.m_currentPage * this.m_pageSize;
	var end = begin + this.m_pageSize - 1;
	end = end >= this.m_listSize ? this.m_listSize - 1 : end;
	return oFF.XListUtils.sublist(list, oFF.XList.create(), begin, end);
};
oFF.SuPaginator.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.SuPaginator.prototype.setEnabled = function(enabled)
{
	this.m_enabled = enabled;
	this.initUI();
};
oFF.SuPaginator.prototype.getCurrentPage = function()
{
	return this.m_currentPage;
};
oFF.SuPaginator.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuPaginator.prototype.layoutView = function(viewControl)
{
	viewControl.useMaxSpace();
	viewControl.setDirection(oFF.UiFlexDirection.ROW);
	viewControl.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	viewControl.setAlignContent(oFF.UiFlexAlignContent.CENTER);
	viewControl.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	viewControl.setOverflow(oFF.UiOverflow.HIDDEN);
	viewControl.setName("rePaginator");
	viewControl.addCssClass("ffRePaginator");
	viewControl.setHeight(oFF.UiCssLength.create("auto"));
	this.initUI();
};
oFF.SuPaginator.prototype.attachOnChange = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuPaginator.prototype.detachOnChange = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuPaginator.prototype.getConsumersOnChange = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CHANGE);
};
oFF.SuPaginator.prototype.onPress = function(event)
{
	if (!this.m_enabled)
	{
		return;
	}
	var pageToGo = event.getControl() === this.m_prev ? this.m_currentPage - 1 : this.m_currentPage + 1;
	this.goToPage(pageToGo);
};
oFF.SuPaginator.prototype.fireOnSelectionChange = function()
{
	this.fireEvent(oFF.UiEvent.ON_CHANGE, this);
};
oFF.SuPaginator.prototype.initUI = function()
{
	if (!this.m_enabled || this.getView() === null)
	{
		return;
	}
	this.getView().clearItems();
	this.m_currentPage = -1;
	this.m_pageCount = 0;
	if (this.m_listSize === 0)
	{
		this.getView().setVisible(false);
		return;
	}
	this.getView().setVisible(true);
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_currentPage = 0;
	var pageSize = this.m_pageSize;
	this.m_pageCount = oFF.XDouble.convertToInt(oFF.XMath.ceil(this.m_listSize / pageSize));
	this.setupLabelSize();
	this.m_prev = this.getView().addNewItemOfType(oFF.UiType.BUTTON);
	this.setupButton(this.m_prev, "navigation-left-arrow", i18nProvider.getText(oFF.SuResourceExplorerI18n.PAGINATOR_PREV_PAGE));
	this.m_pageInfo = this.getView().addNewItemOfType(oFF.UiType.LABEL);
	this.m_pageInfo.setWidth(oFF.UiCssLength.create(this.m_pageInfoLabelSize));
	this.m_pageInfo.setPadding(oFF.UiCssBoxEdges.create("0 5px"));
	this.m_pageInfo.setTextAlign(oFF.UiTextAlign.CENTER);
	this.m_next = this.getView().addNewItemOfType(oFF.UiType.BUTTON);
	this.setupButton(this.m_next, "navigation-right-arrow", i18nProvider.getText(oFF.SuResourceExplorerI18n.PAGINATOR_NEXT_PAGE));
	this.updateUI();
};
oFF.SuPaginator.prototype.setupButton = function(btn, icon, text)
{
	btn.setIcon(icon);
	btn.setTooltip(text);
	btn.registerOnPress(oFF.UiLambdaPressListener.create( function(event){
		this.onPress(event);
	}.bind(this)));
	btn.setButtonType(oFF.UiButtonType.TRANSPARENT);
	btn.setWidth(oFF.UiCssLength.create(oFF.SuResourceExplorerStyle.PAGINATION_BUTTON_SIZE_REM));
};
oFF.SuPaginator.prototype.setupLabelSize = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var maxInfoText = i18nProvider.getTextWithPlaceholder2(oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO, oFF.XInteger.convertToString(this.m_pageCount), oFF.XInteger.convertToString(this.m_pageCount));
	this.m_pageInfoLabelSize = oFF.SuResourceExplorerStyle.getStringSizeRem(maxInfoText);
};
oFF.SuPaginator.prototype.updateUI = function()
{
	if (this.m_pageCount <= 1)
	{
		this.getView().setVisible(false);
		return;
	}
	this.m_prev.setEnabled(this.m_currentPage > 0);
	this.m_next.setEnabled(this.m_currentPage < this.m_pageCount - 1);
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var infoText = i18nProvider.getTextWithPlaceholder2(oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO, oFF.XInteger.convertToString(this.m_currentPage + 1), oFF.XInteger.convertToString(this.m_pageCount));
	this.m_pageInfo.setText(infoText);
	this.m_pageInfo.setTooltip(infoText);
};
oFF.SuPaginator.prototype.goToPage = function(index)
{
	this.m_currentPage = index;
	this.updateUI();
	this.fireOnSelectionChange();
};
oFF.SuPaginator.prototype.validateList = function(list)
{
	if (oFF.isNull(list))
	{
		throw oFF.XException.createIllegalArgumentException("list null");
	}
	if (this.m_listSize !== list.size())
	{
		throw oFF.XException.createIllegalArgumentException("illegal list size");
	}
};

oFF.SuPaginatorV2 = function() {};
oFF.SuPaginatorV2.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuPaginatorV2.prototype._ff_c = "SuPaginatorV2";

oFF.SuPaginatorV2.create = function(dataProvider)
{
	var paginator = new oFF.SuPaginatorV2();
	paginator.m_dataProvider = dataProvider;
	return paginator;
};
oFF.SuPaginatorV2.prototype.m_dataProvider = null;
oFF.SuPaginatorV2.prototype.m_prev = null;
oFF.SuPaginatorV2.prototype.m_next = null;
oFF.SuPaginatorV2.prototype.m_pageInfo = null;
oFF.SuPaginatorV2.prototype.m_currentPage = -1;
oFF.SuPaginatorV2.prototype.m_pageInfoLabelSize = "0";
oFF.SuPaginatorV2.prototype.m_enabled = true;
oFF.SuPaginatorV2.prototype.m_lastOffset = 2147483647;
oFF.SuPaginatorV2.prototype.clear = function()
{
	this.m_currentPage = -1;
	this.getView().setVisible(false);
};
oFF.SuPaginatorV2.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.SuPaginatorV2.prototype.setEnabled = function(enabled)
{
	this.m_enabled = enabled;
	this.initUI();
};
oFF.SuPaginatorV2.prototype.getCurrentPage = function()
{
	return this.m_currentPage;
};
oFF.SuPaginatorV2.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuPaginatorV2.prototype.layoutView = function(viewControl)
{
	viewControl.useMaxSpace();
	viewControl.setDirection(oFF.UiFlexDirection.ROW);
	viewControl.addCssClass("ffRePaginator");
	viewControl.setHeight(oFF.UiCssLength.create("auto"));
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_prev = viewControl.addNewItemOfType(oFF.UiType.BUTTON);
	this.setupButton(this.m_prev, "ffRePaginatorNavPrev", "navigation-left-arrow", i18nProvider.getText(oFF.SuResourceExplorerI18n.PAGINATOR_PREV_PAGE));
	this.m_pageInfo = viewControl.addNewItemOfType(oFF.UiType.LABEL);
	this.m_pageInfo.addCssClass("ffRePageInfo");
	this.m_next = viewControl.addNewItemOfType(oFF.UiType.BUTTON);
	this.setupButton(this.m_next, "ffRePaginatorNavNext", "navigation-right-arrow", i18nProvider.getText(oFF.SuResourceExplorerI18n.PAGINATOR_NEXT_PAGE));
	this.m_dataProvider.attachOnDataFetch( function(data){
		if (!this.isTotalItemsAvailable() && this.m_dataProvider.get().size() === 0 && this.m_dataProvider.getOffset() < this.m_lastOffset)
		{
			this.m_lastOffset = this.m_dataProvider.getOffset();
		}
		if (oFF.SuDataProviderHelper.isPageInfoChanged(this.m_dataProvider))
		{
			this.initUI();
		}
		else
		{
			this.updateUI();
		}
	}.bind(this));
	this.initUI();
};
oFF.SuPaginatorV2.prototype.attachOnChange = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuPaginatorV2.prototype.detachOnChange = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuPaginatorV2.prototype.getConsumersOnChange = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CHANGE);
};
oFF.SuPaginatorV2.prototype.onPress = function(event)
{
	if (!this.m_enabled)
	{
		return;
	}
	var pageToGo = event.getControl() === this.m_prev ? this.m_currentPage - 1 : this.m_currentPage + 1;
	this.goToPage(pageToGo);
};
oFF.SuPaginatorV2.prototype.fireOnSelectionChange = function()
{
	this.fireEvent(oFF.UiEvent.ON_CHANGE, this);
};
oFF.SuPaginatorV2.prototype.isVisible = function()
{
	if (oFF.isNull(this.m_dataProvider) || this.m_dataProvider.get() === null)
	{
		return false;
	}
	return this.m_dataProvider.get().size() > 0 || this.m_dataProvider.getTotalItems() < 0 && this.m_dataProvider.get().size() === 0 && this.m_dataProvider.getOffset() !== 0;
};
oFF.SuPaginatorV2.prototype.initUI = function()
{
	if (!this.m_enabled || this.getView() === null)
	{
		return;
	}
	if (!this.isVisible())
	{
		this.getView().setVisible(false);
		return;
	}
	this.getView().setVisible(true);
	this.m_currentPage = 0;
	this.setupLabelSize();
	this.m_pageInfo.setWidth(oFF.UiCssLength.create(this.m_pageInfoLabelSize));
	this.updateUI();
};
oFF.SuPaginatorV2.prototype.setupButton = function(btn, css, icon, text)
{
	btn.addCssClass(css);
	btn.setIcon(icon);
	btn.setTooltip(text);
	btn.registerOnPress(oFF.UiLambdaPressListener.create( function(event){
		this.onPress(event);
	}.bind(this)));
	btn.setButtonType(oFF.UiButtonType.TRANSPARENT);
	btn.setWidth(oFF.UiCssLength.create(oFF.SuResourceExplorerStyle.PAGINATION_BUTTON_SIZE_REM));
};
oFF.SuPaginatorV2.prototype.setupLabelSize = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var pageCount = this.getPageCount();
	var maxInfoText = i18nProvider.getTextWithPlaceholder2(oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO, oFF.XInteger.convertToString(pageCount), oFF.XInteger.convertToString(pageCount));
	this.m_pageInfoLabelSize = oFF.SuResourceExplorerStyle.getStringSizeRem(maxInfoText);
};
oFF.SuPaginatorV2.prototype.updateUI = function()
{
	this.m_currentPage = this.m_currentPage < 0 ? 0 : this.m_currentPage;
	this.m_prev.setEnabled(this.m_currentPage > 0);
	this.m_next.setEnabled(this.hasNext());
	var isVisible = this.m_next.isEnabled() || this.m_prev.isEnabled();
	this.getView().setVisible(isVisible);
	if (!isVisible)
	{
		return;
	}
	if (!this.isTotalItemsAvailable())
	{
		this.m_pageInfo.setVisible(false);
	}
	else
	{
		var i18nProvider = oFF.UiLocalizationCenter.getCenter();
		var infoText = i18nProvider.getTextWithPlaceholder2(oFF.SuResourceExplorerI18n.PAGINATOR_PAGE_INFO, oFF.XInteger.convertToString(this.m_currentPage + 1), oFF.XInteger.convertToString(this.getPageCount()));
		this.m_pageInfo.setVisible(true);
		this.m_pageInfo.setText(infoText);
		this.m_pageInfo.setTooltip(infoText);
	}
};
oFF.SuPaginatorV2.prototype.isTotalItemsAvailable = function()
{
	return this.m_dataProvider.getTotalItems() !== -1;
};
oFF.SuPaginatorV2.prototype.hasNext = function()
{
	if (this.isTotalItemsAvailable())
	{
		return this.m_currentPage < this.getPageCount() - 1;
	}
	else
	{
		return this.m_dataProvider.getOffset() + this.m_dataProvider.getMaxItems() < this.m_lastOffset;
	}
};
oFF.SuPaginatorV2.prototype.getPageCount = function()
{
	if (!this.isTotalItemsAvailable())
	{
		return -1;
	}
	var totalItems = oFF.XInteger.convertToDouble(this.m_dataProvider.getTotalItems());
	return oFF.XDouble.convertToInt(oFF.XMath.ceil(totalItems / this.m_dataProvider.getMaxItems()));
};
oFF.SuPaginatorV2.prototype.goToPage = function(index)
{
	this.m_currentPage = index;
	this.m_dataProvider.setPageNumber(index);
	this.updateUI();
	this.fireOnSelectionChange();
};

oFF.SuQuickAccessNavigationReduxConsumer = function() {};
oFF.SuQuickAccessNavigationReduxConsumer.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuQuickAccessNavigationReduxConsumer.prototype._ff_c = "SuQuickAccessNavigationReduxConsumer";

oFF.SuQuickAccessNavigationReduxConsumer.SELECTED_CSS_CLASS = "ffReQaSelected";
oFF.SuQuickAccessNavigationReduxConsumer.SELECTABLE_CSS_CLASS = "ffReQaSelectable";
oFF.SuQuickAccessNavigationReduxConsumer.create = function(store, config)
{
	var quickAccessNavigation = new oFF.SuQuickAccessNavigationReduxConsumer();
	quickAccessNavigation.m_store = store;
	quickAccessNavigation.m_config = config;
	quickAccessNavigation.m_selectableItems = oFF.XList.create();
	return quickAccessNavigation;
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.m_config = null;
oFF.SuQuickAccessNavigationReduxConsumer.prototype.m_store = null;
oFF.SuQuickAccessNavigationReduxConsumer.prototype.m_selectableItems = null;
oFF.SuQuickAccessNavigationReduxConsumer.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_BROWSED_RESOURCE))
	{
		this.selectItems();
	}
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reQuickAccessContainer");
	viewControl.addCssClass("ffReQuickAccessNav");
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.setWidth(null);
	this.updateUI();
	this.m_store.subscribe(this);
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.updateUI = function()
{
	var isEmpty = true;
	var view = this.getView();
	var categoryIterator = this.m_config.getQuickAccess().getValuesAsReadOnlyList().getIterator();
	view.clearItems();
	while (categoryIterator.hasNext())
	{
		isEmpty = !this.renderCategory(categoryIterator.next()) && isEmpty;
	}
	view.setVisible(!isEmpty);
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.isSelectable = function(control)
{
	var resource = control.getCustomObject();
	return oFF.notNull(resource);
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.isSelected = function(control)
{
	var resource = control.getCustomObject();
	if (oFF.isNull(resource))
	{
		return false;
	}
	var browsedResource = this.m_store.getBrowsedResource();
	return oFF.SuResourceWrapper.isAncestor(resource, browsedResource);
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.renderCategoryButton = function(container, resource, label, icon, enabled, name)
{
	if (oFF.isNull(resource))
	{
		return false;
	}
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	var menuItemButton = container.addNewItemOfType(oFF.UiType.TOGGLE_BUTTON);
	menuItemButton.setText(oFF.notNull(label) ? label : resourceWrapper.getTranslatedDisplayName());
	menuItemButton.setName(name);
	menuItemButton.setEnabled(enabled);
	menuItemButton.setCustomObject(resource);
	menuItemButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	menuItemButton.setHeight(oFF.UiCssLength.create("3rem"));
	menuItemButton.setPadding(oFF.UiCssBoxEdges.create("0"));
	menuItemButton.addCssClass("ffReQaButtonLink");
	this.checkSelectable(menuItemButton);
	if (oFF.notNull(icon))
	{
		menuItemButton.setIcon(icon);
	}
	menuItemButton.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		if (resourceWrapper.isResourceDirectory())
		{
			this.m_store.setBrowsedResource(resource);
		}
		else
		{
			this.m_store.setSelectedResource(resource);
		}
	}.bind(this)));
	return true;
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.renderCategory = function(qaCategory)
{
	var categoryName = qaCategory.getKey();
	var categoryNameNormalized = oFF.XString.replace(categoryName, " ", "");
	var categoryConfig = this.m_config.getQuickAccess().getByKey(categoryName);
	var labelTxt = categoryConfig.getLabel();
	var icon = categoryConfig.getIcon();
	var link = categoryConfig.getLink();
	var resource = categoryConfig.getResource();
	var enabled = categoryConfig.isEnabled();
	if (oFF.XStringUtils.isNullOrEmpty(labelTxt))
	{
		return false;
	}
	var categoryContainer = this.getView().addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	categoryContainer.setCustomObject(resource);
	categoryContainer.addCssClass("ffReQaCategoryContainer");
	categoryContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	var categoryLabelContainer = categoryContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	categoryLabelContainer.addCssClass("ffReQaCategoryLabelContainer");
	categoryLabelContainer.setDirection(oFF.UiFlexDirection.ROW);
	categoryLabelContainer.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	if (oFF.notNull(link) && oFF.notNull(resource))
	{
		this.renderCategoryButton(categoryLabelContainer, resource, labelTxt, icon, enabled, oFF.XStringUtils.concatenate2("reQaCategory-", categoryNameNormalized));
	}
	else
	{
		categoryLabelContainer.addCssClass("ffReQaItem");
		if (oFF.notNull(icon))
		{
			var categoryIcon = categoryLabelContainer.addNewItemOfType(oFF.UiType.ICON);
			categoryIcon.setIcon(icon);
		}
		var categoryNameControl = this.createLabel(categoryLabelContainer, labelTxt);
		if (oFF.notNull(categoryNameControl))
		{
			categoryNameControl.setName(oFF.XStringUtils.concatenate2("reQaCategory-", categoryNameNormalized));
			categoryNameControl.setEnabled(enabled);
		}
	}
	if (!qaCategory.isEmpty())
	{
		if (qaCategory.isEditable())
		{
			var eraseBtn = categoryLabelContainer.addNewItemOfType(oFF.UiType.ICON);
			eraseBtn.setIcon("delete");
			eraseBtn.setPadding(oFF.UiCssBoxEdges.create(oFF.SuResourceExplorerStyle.LINK_PADDING_EM));
			eraseBtn.setFlex("0");
			eraseBtn.setWidth(oFF.UiCssLength.create(oFF.SuResourceExplorerStyle.QUICK_ACCESS_ITEM_HEIGHT));
			eraseBtn.setCustomObject(oFF.XStringValue.create(categoryName));
			eraseBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
				qaCategory.clear();
				this.updateUI();
			}.bind(this)));
		}
		var resourceLinksContainer = categoryContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		resourceLinksContainer.addCssClass("ffReQaCategoryLinksContainer");
		resourceLinksContainer.setDirection(oFF.UiFlexDirection.COLUMN);
		for (var i = 0; i < qaCategory.getLinks().size(); i++)
		{
			var qaLink = qaCategory.getLinks().get(i);
			this.renderCategoryButton(resourceLinksContainer, qaLink.getResource(), qaLink.getLabel(), qaLink.getIcon(), qaLink.isEnabled(), oFF.XStringUtils.concatenate2("ffReQaLink-", oFF.XInteger.convertToString(i)));
		}
	}
	return true;
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.checkSelectable = function(control)
{
	if (this.isSelectable(control))
	{
		this.setSelected(control);
		control.addCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTABLE_CSS_CLASS);
		this.m_selectableItems.add(control);
	}
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.createLabel = function(container, labelTxt)
{
	var categoryLabel = container.addNewItemOfType(oFF.UiType.LABEL);
	categoryLabel.addCssClass("ffReQaLabel");
	categoryLabel.setText(labelTxt);
	return categoryLabel;
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.selectItems = function()
{
	for (var i = 0; i < this.m_selectableItems.size(); i++)
	{
		this.setSelected(this.m_selectableItems.get(i));
	}
};
oFF.SuQuickAccessNavigationReduxConsumer.prototype.setSelected = function(control)
{
	if (this.isSelected(control))
	{
		if (control.getUiType().isTypeOf(oFF.UiType.TOGGLE_BUTTON))
		{
			control.setPressed(true);
		}
		else
		{
			control.addCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTED_CSS_CLASS);
		}
	}
	else
	{
		if (control.getUiType().isTypeOf(oFF.UiType.TOGGLE_BUTTON))
		{
			control.setPressed(false);
		}
		else
		{
			control.removeCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTED_CSS_CLASS);
		}
	}
};

oFF.SuResourceBreadcrumbs = function() {};
oFF.SuResourceBreadcrumbs.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuResourceBreadcrumbs.prototype._ff_c = "SuResourceBreadcrumbs";

oFF.SuResourceBreadcrumbs.MAX_DEEP_BREADCRUMBS_NAV = 100;
oFF.SuResourceBreadcrumbs.createByResource = function(resource, root)
{
	return oFF.SuResourceBreadcrumbs.create(resource, root, true, true, false);
};
oFF.SuResourceBreadcrumbs.createEmpty = function(isLastALink, resolveRealResource)
{
	return oFF.SuResourceBreadcrumbs.create(null, null, isLastALink, true, resolveRealResource);
};
oFF.SuResourceBreadcrumbs.create = function(resource, root, isLastALink, enabled, resolveRealResource)
{
	var newBreadcrumbNav = new oFF.SuResourceBreadcrumbs();
	newBreadcrumbNav.m_root = root;
	newBreadcrumbNav.m_resource = resource;
	newBreadcrumbNav.m_isLastALink = isLastALink;
	newBreadcrumbNav.m_isNavigational = enabled;
	newBreadcrumbNav.m_resolveRealResource = resolveRealResource;
	return newBreadcrumbNav;
};
oFF.SuResourceBreadcrumbs.prototype.m_resolveRealResource = false;
oFF.SuResourceBreadcrumbs.prototype.m_isNavigational = false;
oFF.SuResourceBreadcrumbs.prototype.m_isLastALink = false;
oFF.SuResourceBreadcrumbs.prototype.m_resource = null;
oFF.SuResourceBreadcrumbs.prototype.m_root = null;
oFF.SuResourceBreadcrumbs.prototype.setResources = function(rootResource, resource)
{
	this.m_resource = resource;
	this.m_root = rootResource;
	this.updateUI();
};
oFF.SuResourceBreadcrumbs.prototype.setResource = function(resource)
{
	this.m_resource = resource;
	this.updateUI();
};
oFF.SuResourceBreadcrumbs.prototype.setRoot = function(root)
{
	this.m_root = root;
	this.updateUI();
};
oFF.SuResourceBreadcrumbs.prototype.getViewControl = function(genesis)
{
	return this.m_isNavigational ? genesis.newControl(oFF.UiType.BREADCRUMBS) : genesis.newControl(oFF.UiType.LABEL);
};
oFF.SuResourceBreadcrumbs.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reResourceBreadcrumbs");
	viewControl.addCssClass("ffReResourceBreadcrumbs");
	this.updateUI();
};
oFF.SuResourceBreadcrumbs.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
};
oFF.SuResourceBreadcrumbs.prototype.attachOnClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuResourceBreadcrumbs.prototype.detachOnClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuResourceBreadcrumbs.prototype.getConsumersOnClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CLICK);
};
oFF.SuResourceBreadcrumbs.prototype.validateResources = function() {};
oFF.SuResourceBreadcrumbs.prototype.isRootResource = function(resource)
{
	return oFF.SuResourceWrapper.areEquals(resource, this.m_root);
};
oFF.SuResourceBreadcrumbs.prototype.isValidLink = function(resource)
{
	return oFF.notNull(resource) && !oFF.SuResourceWrapper.isAncestor(resource, this.m_root) && !oFF.XString.isEqual(resource.getUri().getPath(), oFF.SuResourceWrapper.PATH_SEPARATOR);
};
oFF.SuResourceBreadcrumbs.prototype.updateUI = function()
{
	if (this.getView() === null || oFF.isNull(this.m_resource))
	{
		return;
	}
	this.validateResources();
	var resource = this.m_resolveRealResource ? oFF.SuResourceWrapper.create(this.m_resource).getRealResource() : this.m_resource;
	if (this.m_isNavigational)
	{
		this.updateUIBreadcrumbs(resource);
	}
	else
	{
		this.updateUILabel(resource);
	}
};
oFF.SuResourceBreadcrumbs.prototype.updateUILabel = function(resource)
{
	var view = this.getView();
	var fileList = oFF.XList.create();
	var resourceTmp = resource;
	for (var i = 0; i < oFF.SuResourceBreadcrumbs.MAX_DEEP_BREADCRUMBS_NAV && this.isValidLink(resourceTmp); i++, resourceTmp = resourceTmp.getParent())
	{
		fileList.add(resourceTmp);
	}
	if (fileList.size() > 0)
	{
		resourceTmp = fileList.get(fileList.size() - 1);
		var resourceTmpWrapper = oFF.SuResourceWrapper.create(resourceTmp);
		var path = resourceTmpWrapper.getTranslatedDisplayName();
		for (var j = fileList.size() - 2; j >= 0; j--)
		{
			resourceTmp = fileList.get(j);
			resourceTmpWrapper = oFF.SuResourceWrapper.create(resourceTmp);
			path = oFF.XStringUtils.concatenate5(path, " ", oFF.SuResourceWrapper.PATH_SEPARATOR, " ", resourceTmpWrapper.getTranslatedDisplayName());
		}
		view.setText(path);
		view.setTooltip(path);
	}
};
oFF.SuResourceBreadcrumbs.prototype.updateUIBreadcrumbs = function(resource)
{
	var view = this.getView();
	view.clearLinks();
	var resourceTmp = resource;
	var resourceTmpWrapper = oFF.SuResourceWrapper.create(resourceTmp);
	var fileList = oFF.XList.create();
	if (!this.m_isLastALink)
	{
		view.setCurrentLocationText(resourceTmpWrapper.getAliasOrTranslatedDisplayName());
		resourceTmp = resourceTmp.getParent();
	}
	if (oFF.SuResourceWrapper.getAlias(resource) !== null)
	{
		return;
	}
	for (var i = 0; i < oFF.SuResourceBreadcrumbs.MAX_DEEP_BREADCRUMBS_NAV && this.isValidLink(resourceTmp); i++, resourceTmp = resourceTmp.getParent())
	{
		fileList.add(resourceTmp);
		var alias = oFF.SuResourceWrapper.getAlias(resourceTmp);
		if (oFF.notNull(alias))
		{
			break;
		}
	}
	for (var j = fileList.size() - 1; j >= 0; j--)
	{
		this.createLink(fileList.get(j));
	}
};
oFF.SuResourceBreadcrumbs.prototype.createUiLambdaPressListener = function()
{
	return oFF.UiLambdaPressListener.create( function(event){
		var element = event.getControl();
		var resource = element.getCustomObject();
		this.fireOnResourceClick(resource);
	}.bind(this));
};
oFF.SuResourceBreadcrumbs.prototype.createLink = function(resource)
{
	var view = this.getView();
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	var fileName = resourceWrapper.getAliasOrTranslatedDisplayName();
	var fileLink = view.addNewLink();
	fileLink.setEnabled(this.m_isNavigational);
	fileLink.setText(fileName);
	fileLink.setTooltip(fileName);
	fileLink.addCssClass("ffReBreadcrumbsItem");
	fileLink.setFontSize(oFF.SuResourceExplorerStyle.createLinkFontSize());
	fileLink.registerOnPress(this.createUiLambdaPressListener());
	fileLink.setCustomObject(resource);
	return fileLink;
};
oFF.SuResourceBreadcrumbs.prototype.fireOnResourceClick = function(resource)
{
	this.fireEvent(oFF.UiEvent.ON_CLICK, resource);
};

oFF.SuResourceExplorerView = function() {};
oFF.SuResourceExplorerView.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuResourceExplorerView.prototype._ff_c = "SuResourceExplorerView";

oFF.SuResourceExplorerView.create = function(config, resourceNavigationHelper, store, fileHandler, filterManager)
{
	var view = new oFF.SuResourceExplorerView();
	view.m_config = config;
	view.m_resourceNavigationHelper = resourceNavigationHelper;
	view.m_store = store;
	view.m_fileHandler = fileHandler;
	view.m_filterManager = filterManager;
	return view;
};
oFF.SuResourceExplorerView.prototype.m_treeNavigation = null;
oFF.SuResourceExplorerView.prototype.m_quickAccess = null;
oFF.SuResourceExplorerView.prototype.m_tilesFileViewer = null;
oFF.SuResourceExplorerView.prototype.m_detailsFileViewer = null;
oFF.SuResourceExplorerView.prototype.m_detailsResourceViewer = null;
oFF.SuResourceExplorerView.prototype.m_toolbar = null;
oFF.SuResourceExplorerView.prototype.m_messageArea = null;
oFF.SuResourceExplorerView.prototype.m_resourceInfoForm = null;
oFF.SuResourceExplorerView.prototype.m_config = null;
oFF.SuResourceExplorerView.prototype.m_resourceNavigationHelper = null;
oFF.SuResourceExplorerView.prototype.m_filterManager = null;
oFF.SuResourceExplorerView.prototype.m_store = null;
oFF.SuResourceExplorerView.prototype.m_fileHandler = null;
oFF.SuResourceExplorerView.prototype.m_UIBodyLayout = null;
oFF.SuResourceExplorerView.prototype.m_UIHeaderContainer = null;
oFF.SuResourceExplorerView.prototype.m_UIFooterLayout = null;
oFF.SuResourceExplorerView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuResourceExplorerView.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reResourceExplorerView");
	viewControl.addCssClass("ffReMainView");
	viewControl.addCssClass("ffReResourceExplorerView");
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	this.createContainers();
	this.setupUI(this.getGenesis());
	this.updateUI();
	this.m_store.subscribe(this);
};
oFF.SuResourceExplorerView.prototype.createContainers = function()
{
	var view = this.getView();
	if (this.m_config.isToolbarEnabled())
	{
		this.m_UIHeaderContainer = view.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		this.m_UIHeaderContainer.useMaxWidth();
		this.m_UIHeaderContainer.setName("reHeaderLayout");
	}
	var bodyLayout = view.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	bodyLayout.setName("reBodyLayout");
	bodyLayout.useMaxWidth();
	bodyLayout.setOverflow(oFF.UiOverflow.HIDDEN);
	bodyLayout.setDirection(oFF.UiFlexDirection.ROW);
	bodyLayout.setAlignItems(oFF.UiFlexAlignItems.STRETCH);
	bodyLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	bodyLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	bodyLayout.setFlex("1");
	this.m_UIBodyLayout = bodyLayout;
	this.m_UIFooterLayout = view.addNewItemOfType(oFF.UiType.VERTICAL_LAYOUT);
	this.m_UIFooterLayout.useMaxWidth();
	this.m_UIFooterLayout.setName("reFooterLayout");
};
oFF.SuResourceExplorerView.prototype.setupUI = function(genesis)
{
	if (this.m_config.isToolbarEnabled())
	{
		this.m_toolbar = oFF.SuToolbar.create(this.m_UIHeaderContainer, this.m_store, this.m_config, this.m_resourceNavigationHelper);
	}
	if (this.m_config.isQuickAccessEnabled())
	{
		this.m_quickAccess = oFF.SuQuickAccessNavigationReduxConsumer.create(this.m_store, oFF.SuQuickAccessConfig.create(this.m_config, this.m_resourceNavigationHelper));
		this.m_quickAccess.renderView(genesis);
		this.m_UIBodyLayout.addItem(this.m_quickAccess.getView());
	}
	if (this.m_config.isTreeNavigationEnabled())
	{
		this.m_treeNavigation = oFF.SuTreeNavigation.create(this.m_UIBodyLayout, this.m_resourceNavigationHelper.getRoot(), this.m_store, this.m_filterManager);
	}
	if (this.m_config.isTilesFileViewerEnabled())
	{
		this.m_tilesFileViewer = oFF.SuTileFileViewerReduxConsumer.create(this.m_UIBodyLayout, this.m_store, this.m_fileHandler, this.m_filterManager);
		this.m_tilesFileViewer.buildUI(this.m_UIBodyLayout);
	}
	if (this.m_config.isDetailsFileViewerEnabled())
	{
		var rootResource = this.m_resourceNavigationHelper.getResourceByPath(this.m_config.getRootPath());
		var detailsResourceViewerConfig = oFF.SuDetailsResourceViewerConfig.createFromConfig(this.m_config).setRootResource(rootResource);
		var resourceExplorerDataProviderFactory = oFF.SuResourceExplorerDataProviderFactory.create(this.m_store, this.m_config, detailsResourceViewerConfig, this.m_filterManager, this);
		var dataProviderFactory = resourceExplorerDataProviderFactory.createProviderFactory();
		if (this.m_config.isVersionGTE(oFF.SuResourceExplorerConfig.VERSION_2))
		{
			var dataProvider = dataProviderFactory.createProvider();
			this.m_detailsResourceViewer = oFF.SuDetailsResourceViewerReduxConsumer.create(this.m_store, detailsResourceViewerConfig, dataProvider);
			this.m_detailsResourceViewer.buildUI(this.m_UIBodyLayout);
		}
		else
		{
			this.m_detailsFileViewer = oFF.SuDetailsFileViewerReduxConsumer.create(this.m_store, detailsResourceViewerConfig, this.m_filterManager);
			this.m_detailsFileViewer.buildUI(this.m_UIBodyLayout);
		}
	}
	if (this.m_config.isMessageAreaEnabled())
	{
		this.m_messageArea = oFF.SuReMessageAreaReduxConsumer.create(this.m_store);
		this.m_messageArea.buildUI(genesis);
		this.m_UIFooterLayout.addItem(this.m_messageArea.getView());
	}
	if (this.isDialogSaveMode())
	{
		this.m_resourceInfoForm = oFF.SuResourceInfoFormReduxConsumer.create(this.m_store, this.m_config);
		this.m_resourceInfoForm.buildUI(genesis);
		this.m_resourceInfoForm.attachOnEnter( function(obj){
			this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_SUBMIT);
		}.bind(this));
		this.m_UIFooterLayout.addItem(this.m_resourceInfoForm.getUiView());
	}
};
oFF.SuResourceExplorerView.prototype.isDialogSaveMode = function()
{
	return this.m_config.getDialogMode().isMode(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE);
};
oFF.SuResourceExplorerView.prototype.setViewerModeDetails = function(isDetailsViewMode)
{
	if (oFF.notNull(this.m_tilesFileViewer))
	{
		this.m_tilesFileViewer.setVisible(!isDetailsViewMode);
	}
	if (oFF.notNull(this.m_detailsFileViewer))
	{
		this.m_detailsFileViewer.setVisible(isDetailsViewMode);
	}
	if (oFF.notNull(this.m_detailsResourceViewer))
	{
		this.m_detailsResourceViewer.setVisible(isDetailsViewMode);
	}
};
oFF.SuResourceExplorerView.prototype.updateUI = function()
{
	if (this.isMultipleViewEnabled())
	{
		this.setViewerModeDetails(this.m_store.isResourceViewerMode(oFF.SuResourceExplorerStore.RESOURCE_VIEWER_DETAILS));
	}
};
oFF.SuResourceExplorerView.prototype.isMultipleViewEnabled = function()
{
	return oFF.notNull(this.m_tilesFileViewer) && (oFF.notNull(this.m_detailsFileViewer) || oFF.notNull(this.m_detailsResourceViewer));
};
oFF.SuResourceExplorerView.prototype.accept = function(state)
{
	this.updateUI();
};

oFF.SuResourceInfoForm = function() {};
oFF.SuResourceInfoForm.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuResourceInfoForm.prototype._ff_c = "SuResourceInfoForm";

oFF.SuResourceInfoForm.create = function(config)
{
	var newInfoForm = new oFF.SuResourceInfoForm();
	newInfoForm.m_resourceInfo = oFF.SuResourceInfo.createEmpty();
	newInfoForm.m_resourceInfo.setIsDirectory(false);
	newInfoForm.m_config = config;
	newInfoForm.m_inputFieldMap = oFF.XHashMapByString.create();
	return newInfoForm;
};
oFF.SuResourceInfoForm.prototype.m_newResourceName = null;
oFF.SuResourceInfoForm.prototype.m_resourceInfo = null;
oFF.SuResourceInfoForm.prototype.m_resource = null;
oFF.SuResourceInfoForm.prototype.m_config = null;
oFF.SuResourceInfoForm.prototype.m_fileNameInput = null;
oFF.SuResourceInfoForm.prototype.m_fileDescriptionInput = null;
oFF.SuResourceInfoForm.prototype.m_inputFieldMap = null;
oFF.SuResourceInfoForm.prototype.getInfo = function()
{
	return oFF.SuResourceInfo.createClone(this.m_resourceInfo);
};
oFF.SuResourceInfoForm.prototype.setResource = function(resource)
{
	this.m_resource = resource;
};
oFF.SuResourceInfoForm.prototype.setBaseInfo = function(displayName, description)
{
	this.m_resourceInfo.setName(displayName);
	this.m_resourceInfo.setDescription(description);
	this.updateUi();
};
oFF.SuResourceInfoForm.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuResourceInfoForm.prototype.layoutView = function(viewControl)
{
	var performFreeNameAlgorithm = this.m_config.getDialogMode().isNextFreeResourceName();
	var initialFileName = !performFreeNameAlgorithm ? this.m_newResourceName : oFF.SuResourceCRUDManager.getNextFreeResourceName(this.m_resource, this.m_newResourceName, this.m_config.getResourceType());
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	viewControl.setName("reResourceInfoFormContainer");
	viewControl.addCssClass("ffReResourceInfoFormContainer");
	viewControl.setPadding(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.useMaxWidth();
	var infoContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	infoContainer.setName("reResourceInfoFormInfoContainer");
	infoContainer.addCssClass("ffReResourceInfoFormInfoContainer");
	infoContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	infoContainer.useMaxWidth();
	infoContainer.setMargin(oFF.UiCssBoxEdges.create("0 0 15px 0"));
	var labelName = this.createLabel(infoContainer, i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME), "name");
	labelName.setRequired(true);
	this.m_fileNameInput = infoContainer.addNewItemOfType(oFF.UiType.INPUT);
	this.m_fileNameInput.setName("reResourceInfoFormNameInput");
	this.m_fileNameInput.addCssClass("ffReFieldName");
	this.m_fileNameInput.setWidth(oFF.UiCssLength.create("100%"));
	this.m_fileNameInput.setPlaceholder(i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME));
	this.m_fileNameInput.setText(initialFileName);
	this.m_fileNameInput.setRequired(true);
	this.m_fileNameInput.setMaxLength(oFF.SuResourceInfoFormHelper.MAX_LENGHT);
	labelName.setLabelFor(this.m_fileNameInput);
	var descLabel = this.createLabel(infoContainer, i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION), "description");
	this.m_fileDescriptionInput = infoContainer.addNewItemOfType(oFF.UiType.INPUT);
	this.m_fileDescriptionInput.addCssClass("ffReFieldDescription");
	this.m_fileDescriptionInput.setWidth(oFF.UiCssLength.create("100%"));
	this.m_fileDescriptionInput.setPlaceholder(i18nProvider.getText(oFF.SuResourceExplorerI18n.SAVE_FORM_DESCRIPTION_PLACEHOLDER));
	this.m_fileDescriptionInput.setMaxLength(oFF.SuResourceInfoFormHelper.MAX_LENGHT);
	descLabel.setLabelFor(this.m_fileDescriptionInput);
	this.buildAdvancedOptions(viewControl);
	this.m_fileNameInput.registerOnEnter(this.createOnEnterLambda());
	this.m_fileNameInput.registerOnEditingEnd(this.createOnEditingEndLambda());
	this.m_fileNameInput.registerOnLiveChange(this.createOnLiveChangeLambda());
	this.m_fileDescriptionInput.registerOnEnter(this.createOnEnterLambda());
	this.m_fileDescriptionInput.registerOnEditingEnd(this.createOnEditingEndLambda());
	this.updateState();
};
oFF.SuResourceInfoForm.prototype.getFileNameInput = function()
{
	return this.m_fileNameInput;
};
oFF.SuResourceInfoForm.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
	this.m_newResourceName = this.getNewResourceName();
};
oFF.SuResourceInfoForm.prototype.attachOnChange = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuResourceInfoForm.prototype.detachOnChange = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuResourceInfoForm.prototype.getConsumersOnChange = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CHANGE);
};
oFF.SuResourceInfoForm.prototype.attachOnEnter = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_ENTER, consumer);
};
oFF.SuResourceInfoForm.prototype.detachOnEnter = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_ENTER, consumer);
};
oFF.SuResourceInfoForm.prototype.getConsumersOnEnter = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_ENTER);
};
oFF.SuResourceInfoForm.prototype.fireOnSelectionChange = function()
{
	this.fireEvent(oFF.UiEvent.ON_CHANGE, this.m_resourceInfo);
};
oFF.SuResourceInfoForm.prototype.fireOnEnter = function()
{
	this.fireEvent(oFF.UiEvent.ON_ENTER, this.m_resourceInfo);
};
oFF.SuResourceInfoForm.prototype.createLabel = function(infoContainer, text, fieldName)
{
	if (oFF.notNull(text))
	{
		var label = infoContainer.addNewItemOfType(oFF.UiType.LABEL);
		label.setName(oFF.XStringUtils.concatenate2("reFieldLabel-", fieldName));
		label.setWrapping(true);
		label.setFlex("0 0 auto");
		label.setMargin(oFF.UiCssBoxEdges.create("0.625rem 0.625rem 0.625rem 0"));
		label.setText(text);
		label.setTooltip(text);
		return label;
	}
	return null;
};
oFF.SuResourceInfoForm.prototype.updateUi = function()
{
	this.m_fileNameInput.setText(this.m_resourceInfo.getName());
	this.m_fileDescriptionInput.setText(this.m_resourceInfo.getDescription());
};
oFF.SuResourceInfoForm.prototype.updateState = function()
{
	this.m_resourceInfo.setName(this.m_fileNameInput.getText());
	this.m_resourceInfo.setDescription(this.m_fileDescriptionInput.getText());
	this.fireOnSelectionChange();
};
oFF.SuResourceInfoForm.prototype.buildAdvancedOptions = function(container)
{
	var fieldsConfig = this.m_config.getByPath(oFF.XStringUtils.concatenate2(oFF.SuResourceExplorerConfig.DIALOG_MODE, ".save.fields"));
	if (this.m_config.getDialogMode().isMode(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE) && oFF.notNull(fieldsConfig))
	{
		var advancedOptionsContainer = container.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		advancedOptionsContainer.setName("reResourceInfoFormFieldsContainer");
		advancedOptionsContainer.addCssClass("ffReResourceInfoFormFieldsContainer");
		advancedOptionsContainer.setDirection(oFF.UiFlexDirection.COLUMN);
		advancedOptionsContainer.useMaxWidth();
		var fieldList = fieldsConfig.asList();
		for (var i = 0; i < fieldList.size(); i++)
		{
			var field = fieldList.get(i).asStructure();
			if (!field.containsKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_NAME))
			{
				continue;
			}
			var name = field.getStringByKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_NAME);
			var type = field.getStringByKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_TYPE) !== null ? field.getStringByKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_TYPE) : "";
			var label = field.getStringByKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_LABEL);
			var infoTooltip = field.getStringByKey(oFF.SuDialogModeConfigWrapper.SAVE_FIELDS_INFO);
			var fieldContainer = advancedOptionsContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			fieldContainer.setName(oFF.XStringUtils.concatenate2("reFieldContainer-", name));
			fieldContainer.useMaxWidth();
			fieldContainer.setOverflow(oFF.UiOverflow.HIDDEN);
			fieldContainer.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			var fieldControl;
			switch (type)
			{
				case "checkbox":
					var checkBox = fieldContainer.addNewItemOfType(oFF.UiType.CHECKBOX);
					checkBox.registerOnChange(oFF.UiLambdaChangeListener.create( function(event){
						var checkBoxEvent = event.getControl();
						this.setAttributeInResourceInfoState(checkBoxEvent.getTag(), oFF.XBooleanValue.create(checkBoxEvent.isChecked()));
					}.bind(this)));
					checkBox.setText(label);
					fieldControl = checkBox;
					break;

				default:
					this.createLabel(fieldContainer, label, name);
					var input = fieldContainer.addNewItemOfType(oFF.UiType.INPUT);
					this.m_inputFieldMap.put(name, input);
					fieldContainer.setDirection(oFF.UiFlexDirection.COLUMN);
					input.registerOnEditingEnd(oFF.UiLambdaEditingEndListener.create( function(event){
						this.setAttributeInResourceInfoStateByInputEvent(event);
					}.bind(this)));
					input.registerOnEnter(oFF.UiLambdaEnterListener.create( function(event){
						this.setAttributeInResourceInfoStateByInputEvent(event);
						this.fireOnEnter();
					}.bind(this)));
					fieldControl = input;
			}
			if (oFF.notNull(infoTooltip))
			{
				var infoIcon = oFF.UtInfoIconWidget.create(this.getGenesis(), null, infoTooltip);
				infoIcon.addCssClass(oFF.XStringUtils.concatenate2("ffReFieldIcon-", name));
				fieldContainer.addItem(infoIcon.getView());
			}
			fieldControl.setName(oFF.XStringUtils.concatenate2("reField-", name));
			fieldControl.setTag(name);
		}
	}
};
oFF.SuResourceInfoForm.prototype.createOnEnterLambda = function()
{
	return oFF.UiLambdaEnterListener.create( function(event){
		this.updateState();
		this.fireOnEnter();
	}.bind(this));
};
oFF.SuResourceInfoForm.prototype.createOnLiveChangeLambda = function()
{
	return oFF.UiLambdaLiveChangeListener.create( function(event){
		this.updateState();
	}.bind(this));
};
oFF.SuResourceInfoForm.prototype.createOnEditingEndLambda = function()
{
	return oFF.UiLambdaEditingEndListener.create( function(event){
		this.updateState();
	}.bind(this));
};
oFF.SuResourceInfoForm.prototype.setAttributeInResourceInfoStateByInputEvent = function(inputEvent)
{
	var inputControl = inputEvent.getControl();
	this.setAttributeInResourceInfoState(inputControl.getTag(), oFF.XStringValue.create(inputControl.getText()));
};
oFF.SuResourceInfoForm.prototype.setAttributeInResourceInfoState = function(attribute, value)
{
	this.m_resourceInfo.set(attribute, value);
	this.fireOnSelectionChange();
};
oFF.SuResourceInfoForm.prototype.getNewResourceName = function()
{
	var newResourceNameConfig = this.m_config.getByPath(oFF.XStringUtils.concatenate2(oFF.SuResourceExplorerConfig.DIALOG_MODE, ".save.newResourceName"));
	if (oFF.notNull(newResourceNameConfig))
	{
		return newResourceNameConfig.asString().getString();
	}
	return oFF.UiLocalizationCenter.getCenter().getText(oFF.SuResourceExplorerI18n.SAVE_FORM_NAME_NEW);
};
oFF.SuResourceInfoForm.prototype.setValidState = function(name)
{
	this.setUiInputState(name, oFF.UiValueState.NONE, "");
};
oFF.SuResourceInfoForm.prototype.setInvalidState = function(name, msg)
{
	this.setUiInputState(name, oFF.UiValueState.ERROR, msg);
};
oFF.SuResourceInfoForm.prototype.setUiInputState = function(name, state, msg)
{
	var input = this.getInputByName(name);
	input.setValueState(state);
	input.setValueStateText(msg);
};
oFF.SuResourceInfoForm.prototype.getInputByName = function(name)
{
	switch (name)
	{
		case "name":
			return this.m_fileNameInput;

		default:
			return this.m_inputFieldMap.getByKey(name);
	}
};

oFF.SuTableViewBase = function() {};
oFF.SuTableViewBase.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuTableViewBase.prototype._ff_c = "SuTableViewBase";

oFF.SuTableViewBase.prototype.m_mainContainer = null;
oFF.SuTableViewBase.prototype.m_table = null;
oFF.SuTableViewBase.prototype.m_headerContainer = null;
oFF.SuTableViewBase.prototype.m_tableContainer = null;
oFF.SuTableViewBase.prototype.m_scrollContainer = null;
oFF.SuTableViewBase.prototype.m_title = null;
oFF.SuTableViewBase.prototype.m_toolbarContainer = null;
oFF.SuTableViewBase.prototype.m_toolbarLayoutData = null;
oFF.SuTableViewBase.prototype.m_paginator = null;
oFF.SuTableViewBase.prototype.m_columnsButtonWidget = null;
oFF.SuTableViewBase.prototype.m_dataProvider = null;
oFF.SuTableViewBase.prototype.m_paginatorEnabled = false;
oFF.SuTableViewBase.prototype.m_columnSettings = null;
oFF.SuTableViewBase.prototype.m_selectableColumns = null;
oFF.SuTableViewBase.prototype.m_selectableColumnsTooltip = null;
oFF.SuTableViewBase.prototype.m_selectableColumnsStorageKey = null;
oFF.SuTableViewBase.prototype.setup = function()
{
	this.m_selectableColumns = oFF.XList.create();
	this.m_columnSettings = oFF.PrStructure.create();
};
oFF.SuTableViewBase.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuTableViewBase.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
	var mainContainer = this.getView();
	mainContainer.setName("reTableView");
	mainContainer.addCssClass("ffReTableView");
	mainContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	mainContainer.setHeight(oFF.UiCssLength.AUTO);
};
oFF.SuTableViewBase.prototype.layoutView = function(viewControl)
{
	this.m_headerContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_headerContainer.setName("reTableViewHeader");
	this.m_headerContainer.addCssClass("ffReTableViewHeader");
	this.m_headerContainer.useMaxWidth();
	this.m_headerContainer.setDirection(oFF.UiFlexDirection.ROW);
	this.m_headerContainer.setVisible(false);
	this.m_scrollContainer = viewControl.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	this.m_scrollContainer.addCssClass("ffReDfvScrollContainer");
	this.m_scrollContainer.setHeight(oFF.UiCssLength.create("100%"));
	this.m_tableContainer = this.m_scrollContainer.setNewContent(oFF.UiType.FLEX_LAYOUT);
	this.m_tableContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_tableContainer.setName("reTableViewTableContainer");
	this.m_tableContainer.setName("ffReTableViewTableContainer");
	this.m_tableContainer.useMaxSpace();
	this.m_tableContainer.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.buildHeader();
	this.buildTableUI();
	if (this.m_paginatorEnabled)
	{
		this.m_paginator = oFF.SuPaginatorV2.create(this.m_dataProvider);
		this.m_paginator.renderView(this.getGenesis());
		this.m_paginator.attachOnChange( function(paginator){
			this.updateUI();
		}.bind(this));
		viewControl.addItem(this.m_paginator.getView());
	}
	this.updateUI();
	this.m_dataProvider.attachOnDataFetch( function(data){
		this.onDataFetched();
	}.bind(this));
};
oFF.SuTableViewBase.prototype.updateUI = function()
{
	this.getView().setBusyDelay(0);
	this.setBusy(true);
	oFF.XTimeout.timeout(0,  function(){
		this.m_dataProvider.fetch().then(this.onFetchDataSuccess(), this.onFetchDataError()).onFinally( function(){
			oFF.XTimeout.timeout(0,  function(){
				this.setBusy(false);
			}.bind(this));
		}.bind(this));
	}.bind(this));
};
oFF.SuTableViewBase.prototype.setBusy = function(busy)
{
	this.getView().setBusy(busy);
};
oFF.SuTableViewBase.prototype.clear = function()
{
	this.m_table.clearResponsiveTableRows();
	if (this.m_paginatorEnabled)
	{
		this.m_paginator.clear();
	}
};
oFF.SuTableViewBase.prototype.setSelectedItem = function(item) {};
oFF.SuTableViewBase.prototype.clearSelection = function()
{
	this.m_table.clearSelectedItems();
};
oFF.SuTableViewBase.prototype.updateSortingInfo = function(isSortAscending, sortingAttribute)
{
	this.m_dataProvider.setSortingAttribute(sortingAttribute);
	this.m_dataProvider.setSortingOrder(isSortAscending);
	this.updateUI();
};
oFF.SuTableViewBase.prototype.setVisible = function(isVisible)
{
	if (this.getView() !== null)
	{
		this.getView().setVisible(isVisible);
	}
};
oFF.SuTableViewBase.prototype.setColumnVisible = function(name, isVisible)
{
	if (oFF.notNull(this.m_table))
	{
		var column = this.m_table.getResponsiveTableColumnByName(name);
		if (oFF.notNull(column))
		{
			column.setVisible(isVisible);
		}
	}
};
oFF.SuTableViewBase.prototype.buildTableUI = function()
{
	this.m_table = this.m_tableContainer.addNewItemOfType(oFF.UiType.RESPONSIVE_TABLE);
	this.m_table.registerOnSelect(this.createUiLambdaTableSelectListener());
	this.m_table.setColumnResize(true);
	this.m_table.setName("reTableViewTable");
	this.m_table.addCssClass("ffReTableViewTable");
	this.m_table.setAlternateRowColors(true);
	this.m_table.setAlignSelf(oFF.UiFlexAlignSelf.START);
	this.m_table.setFlex("auto");
	this.m_table.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.buildColumns();
};
oFF.SuTableViewBase.prototype.buildHeader = function()
{
	this.m_toolbarContainer = this.m_headerContainer.addNewItemOfType(oFF.UiType.TOOLBAR);
	this.m_toolbarContainer.addCssClass("ffReTableToolbar");
	this.m_toolbarContainer.setWidth(oFF.UiCssLength.create("100%"));
	this.m_title = this.m_toolbarContainer.addNewItemOfType(oFF.UiType.TITLE);
	this.m_title.addCssClass("ffReTableTitle");
	this.m_title.setTitleLevel(oFF.UiTitleLevel.H_3);
	this.m_toolbarContainer.addNewItemOfType(oFF.UiType.SPACER);
	this.m_toolbarLayoutData = oFF.UiOverflowToolbarLayoutData.create();
	this.m_toolbarLayoutData.setMinWidth(oFF.UiCssLength.create("1rem"));
	this.m_toolbarLayoutData.setShrinkable(false);
	this.m_toolbarContainer.setLayoutData(this.m_toolbarLayoutData);
	this.buildToolbar();
	var columnSelectionMenu = this.buildColumnSelectionMenu();
	if (columnSelectionMenu.isPresent())
	{
		this.m_toolbarContainer.addItem(columnSelectionMenu.get());
	}
};
oFF.SuTableViewBase.prototype.buildToolbar = function() {};
oFF.SuTableViewBase.prototype.buildColumnSelectionMenu = function()
{
	if (oFF.isNull(this.m_selectableColumns) || this.m_selectableColumns.size() === 0)
	{
		return oFF.XOptional.empty();
	}
	this.m_columnsButtonWidget = oFF.SuTableColumnSelectionButton.create(this.m_selectableColumns, this.m_columnSettings, this.m_selectableColumnsStorageKey, this.m_selectableColumnsTooltip);
	this.m_columnsButtonWidget.renderView(this.getGenesis());
	var columnsMenuButton = this.m_columnsButtonWidget.getView();
	this.m_columnsButtonWidget.attachOnItemPress( function(obj){
		var event = obj;
		var columnId = event.getControl().getTag();
		this.setColumnVisible(columnId, this.m_columnsButtonWidget.getColumnVisibility(columnId));
	}.bind(this));
	return oFF.XOptional.of(columnsMenuButton);
};
oFF.SuTableViewBase.prototype.onDataFetched = function() {};
oFF.SuTableViewBase.prototype.addNewTableRow = function(data)
{
	var table = this.m_table;
	var tableRow = table.newResponsiveTableRow();
	var isEmptyRow = oFF.isNull(data);
	if (isEmptyRow)
	{
		tableRow.addCssClass("ffReTVEmpty");
	}
	else
	{
		tableRow.setCustomObject(data);
	}
	tableRow.registerOnDoubleClick(this.createUiLambdaRowDblClickListener());
	tableRow.registerOnClick(this.createUiLambdaRowClickListener());
	return tableRow;
};
oFF.SuTableViewBase.prototype.onFetchDataSuccess = function()
{
	return  function(list){
		this.onDataFetched();
		this.m_table.clearResponsiveTableRows();
		var rows = this.getTableRows();
		this.m_table.addAllResponsiveTableRows(rows);
		if (this.getView().isVisible() && this.m_table.isVisible() && rows.size() > 0)
		{
			this.m_table.scrollToIndex(0);
		}
		return list;
	}.bind(this);
};
oFF.SuTableViewBase.prototype.onFetchDataError = function()
{
	return  function(errMsg){
		this.onDataFetched();
		this.m_table.clearResponsiveTableRows();
		this.logWarning(errMsg.getText());
	}.bind(this);
};
oFF.SuTableViewBase.prototype.isSelectedItem = function(item)
{
	var tableRow = this.m_table.getSelectedItem();
	if (oFF.isNull(tableRow))
	{
		return oFF.isNull(item);
	}
	var selectedResource = tableRow.getCustomObject();
	if (oFF.isNull(selectedResource))
	{
		return oFF.isNull(item);
	}
	return item.isEqualTo(selectedResource);
};
oFF.SuTableViewBase.prototype.createUiLambdaTableSelectListener = function()
{
	return oFF.UiLambdaSelectListener.create( function(event){
		var control = event.getControl();
		var selectedItem = control.getSelectedItem();
		if (oFF.notNull(selectedItem))
		{
			this.fireOnResourceSelect(selectedItem.getCustomObject());
		}
		else
		{
			this.fireOnResourceSelect(null);
		}
	}.bind(this));
};
oFF.SuTableViewBase.prototype.createUiLambdaRowDblClickListener = function()
{
	return oFF.UiLambdaDoubleClickListener.create( function(event){
		var control = event.getControl();
		this.fireOnResourceDblClick(control.getCustomObject());
	}.bind(this));
};
oFF.SuTableViewBase.prototype.createUiLambdaRowClickListener = function()
{
	return oFF.UiLambdaClickListener.create( function(event){
		var control = event.getControl();
		var clickedItem = control.getCustomObject();
		if (!this.isSelectedItem(clickedItem))
		{
			this.setSelectedItem(clickedItem);
			this.fireOnResourceSelect(clickedItem);
		}
		this.fireOnResourceClick(control.getCustomObject());
	}.bind(this));
};
oFF.SuTableViewBase.prototype.attachOnSelect = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_SELECT, consumer);
};
oFF.SuTableViewBase.prototype.detachOnSelect = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_SELECT, consumer);
};
oFF.SuTableViewBase.prototype.getConsumersOnSelect = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_SELECT);
};
oFF.SuTableViewBase.prototype.attachOnDoubleClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuTableViewBase.prototype.detachOnDoubleClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuTableViewBase.prototype.getConsumersOnDoubleClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_DOUBLE_CLICK);
};
oFF.SuTableViewBase.prototype.fireOnResourceSelect = function(data)
{
	this.fireEvent(oFF.UiEvent.ON_SELECT, data);
};
oFF.SuTableViewBase.prototype.fireOnResourceClick = function(data)
{
	this.fireEvent(oFF.UiEvent.ON_CLICK, data);
};
oFF.SuTableViewBase.prototype.fireOnResourceDblClick = function(data)
{
	this.fireEvent(oFF.UiEvent.ON_DOUBLE_CLICK, data);
};

oFF.SuDataSourceNavigationReduxConsumer = function() {};
oFF.SuDataSourceNavigationReduxConsumer.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuDataSourceNavigationReduxConsumer.prototype._ff_c = "SuDataSourceNavigationReduxConsumer";

oFF.SuDataSourceNavigationReduxConsumer.PAGE_SIZE = 15;
oFF.SuDataSourceNavigationReduxConsumer.create = function(store, config, filterManager)
{
	var dataSourceNavigation = new oFF.SuDataSourceNavigationReduxConsumer();
	dataSourceNavigation.m_store = store;
	dataSourceNavigation.m_config = config;
	dataSourceNavigation.m_resourceList = oFF.XList.create();
	dataSourceNavigation.m_helper = oFF.SuDataSourceNavigationHelper.create(dataSourceNavigation, config, filterManager);
	return dataSourceNavigation;
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_store = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_config = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_mainContainer = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_systemTypeCB = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_connectionCB = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_searchInput = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_datasourceTable = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_paginator = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_systemTypeList = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_resourceList = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_resourceListFiltered = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_connectionList = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.m_helper = null;
oFF.SuDataSourceNavigationReduxConsumer.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reDataSourceNavigation");
	viewControl.addCssClass("ffReDataSourceNavigation");
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.useMaxSpace();
	this.m_mainContainer = viewControl;
	var headerContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerContainer.setName("reDataSourceNavigationHeader");
	headerContainer.addCssClass("ffReDataSourceNavigationHeader");
	headerContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.buildSelectionUI(headerContainer);
	this.buildSearchUI(headerContainer);
	var tableContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	tableContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	tableContainer.setName("reDataSourceNavigationTable");
	tableContainer.addCssClass("ffReDataSourceNavigationTable");
	tableContainer.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.buildTableUI(tableContainer);
	this.m_paginator = oFF.SuPaginator.create(oFF.SuDataSourceNavigationReduxConsumer.PAGE_SIZE);
	this.m_paginator.renderView(this.getGenesis());
	this.m_paginator.attachOnChange( function(paginator){
		this.updateListAndPaginator(false);
	}.bind(this));
	tableContainer.addItem(this.m_paginator.getView());
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.onChange = function(event)
{
	if (event.getControl() === this.m_systemTypeCB)
	{
		this.onSystemTypeUpdated();
	}
	else if (event.getControl() === this.m_connectionCB)
	{
		this.onConnectionUpdated();
	}
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.setConncetions = function(connectionList)
{
	this.m_connectionList = connectionList;
	this.m_systemTypeList = this.m_helper.getSystemTypeList(this.m_connectionList);
	if (!this.initSystemTypeCB())
	{
		this.initConnectionComboBoxItems();
	}
	this.setBusy(false);
	this.m_store.subscribe(this);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.getUiView = function()
{
	return this.getView();
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.getSelectedConnection = function()
{
	var selectedItem = this.m_connectionCB.getSelectedItem();
	if (oFF.isNull(selectedItem))
	{
		return null;
	}
	return selectedItem.getCustomObject();
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.buildSelectionUI = function(container)
{
	var selectionContainer = container.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	selectionContainer.setName("reDataSourceNavigationSelection");
	selectionContainer.addCssClass("ffReDsnSelection");
	selectionContainer.useMaxWidth();
	selectionContainer.setAlignItems(oFF.UiFlexAlignItems.END);
	selectionContainer.setDirection(oFF.UiFlexDirection.ROW);
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_systemTypeCB = this.m_helper.addComboBox(selectionContainer, "DataSourceNavSystemType", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE), "1 1 50%");
	this.m_store.getApp().setFocus(this.m_systemTypeCB);
	this.m_connectionCB = this.m_helper.addComboBox(selectionContainer, "DataSourceNavConnection", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION), "1 1 50%");
	this.m_connectionCB.setShowSecondaryValues(true);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.buildTableUI = function(container)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var fields = oFF.XLinkedHashMapOfStringByString.create();
	fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_ID));
	fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_DESCRIPTION));
	var sortableFields = oFF.XLinkedHashMapByString.create();
	sortableFields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, oFF.XBooleanValue.create(true));
	var detailsFileViewerConfig = oFF.SuDetailsResourceViewerConfig.create(fields, sortableFields).setNavigationEnabled(false);
	this.m_datasourceTable = oFF.SuDetailsFileViewer.create(detailsFileViewerConfig);
	this.m_datasourceTable.renderView(container.getUiManager().getGenesis());
	this.m_datasourceTable.attachOnClick( function(data){
		this.selectResource(data);
	}.bind(this));
	this.m_datasourceTable.attachOnDoubleClick( function(data){
		this.selectResource(data);
		this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_SUBMIT);
	}.bind(this));
	var view = this.m_datasourceTable.getView();
	view.addCssClass("ffReDsnTable");
	container.addItem(view);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.selectResource = function(data)
{
	var resource = data;
	this.m_store.setSelectedResource(resource);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.buildSearchUI = function(container)
{
	this.m_searchInput = oFF.SuDataSourceNavigationHelper.createSearchField(this.getGenesis(),  function(searchEvent){
		this.doSearch();
	}.bind(this));
	this.m_searchInput.setEnabled(false);
	container.addItem(this.m_searchInput);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.initSystemTypeCB = function()
{
	var systemTypeListIt = this.m_systemTypeList.getIterator();
	while (systemTypeListIt.hasNext())
	{
		var systemType = systemTypeListIt.next();
		var item = this.m_systemTypeCB.addNewItem();
		item.setName(systemType).setText(this.m_helper.getSystemText(systemType));
	}
	if (this.handle0Or1Items(this.m_systemTypeCB))
	{
		this.onSystemTypeUpdated();
		return true;
	}
	this.m_systemTypeCB.setEnabled(true);
	var initialSystem = this.m_config.getInitialSystem();
	if (oFF.notNull(initialSystem))
	{
		this.m_systemTypeCB.setSelectedName(initialSystem);
		if (this.m_systemTypeCB.getSelectedItem() !== null)
		{
			this.onSystemTypeUpdated();
			return true;
		}
	}
	return false;
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.initConnectionComboBoxItems = function()
{
	this.m_helper.clearComboBoxElement(this.m_connectionCB);
	var connectionIterator = this.m_connectionList.getIterator();
	while (connectionIterator.hasNext())
	{
		var connection = connectionIterator.next();
		if (this.m_helper.isConnectionVisible(connection, this.m_systemTypeCB.getSelectedName()))
		{
			this.m_helper.addConnectionItem(this.m_connectionCB, connection);
		}
	}
	if (!this.handle0Or1Items(this.m_connectionCB))
	{
		this.m_connectionCB.setEnabled(true);
		var initiaConnection = this.m_config.getInitialConnection();
		if (oFF.notNull(initiaConnection))
		{
			this.m_connectionCB.setSelectedName(initiaConnection.getName());
		}
	}
	if (this.m_connectionCB.getSelectedItem() !== null)
	{
		this.onConnectionUpdated();
	}
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.handle0Or1Items = function(combo)
{
	if (combo.getItemCount() < 2)
	{
		combo.setEnabled(false);
		if (combo.getItemCount() === 1)
		{
			combo.setSelectedItemByIndex(0);
			return true;
		}
	}
	this.m_connectionCB.setEnabled(true);
	return false;
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.onSystemTypeUpdated = function()
{
	this.clearData();
	this.enableDatasource(false);
	this.initConnectionComboBoxItems();
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.onConnectionUpdated = function()
{
	this.clearData();
	this.enableDatasource(true);
	this.initDatasourceTable(null);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.clearData = function()
{
	this.m_datasourceTable.clear();
	this.m_resourceList = oFF.XObjectExt.release(this.m_resourceList);
	this.m_paginator.clear();
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.initDatasourceTable = function(filterFn)
{
	var selectedItem = this.m_connectionCB.getSelectedItem();
	if (oFF.notNull(selectedItem))
	{
		if (oFF.isNull(this.m_resourceList))
		{
			this.setBusy(true);
			var connectionResource = selectedItem.getCustomObject();
			oFF.SuDataSourceNavigationHelper.processFetchAllDatasources(connectionResource, this.onFetchDatasourcesSuccess(filterFn), this.onFetchDatasourcesError());
		}
		else
		{
			this.filterResourceList(filterFn);
		}
	}
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.setBusy = function(isBusy)
{
	this.m_mainContainer.setBusy(isBusy);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.onFetchDatasourcesSuccess = function(filterFn)
{
	return  function(resourceList){
		if (!this.isReleased())
		{
			var resourceListTmp = resourceList;
			var emptyResult = oFF.XList.create();
			this.m_resourceList = oFF.notNull(resourceListTmp) ? resourceListTmp : emptyResult;
			this.filterResourceList(filterFn);
			this.setBusy(false);
		}
	}.bind(this);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.filterResourceList = function(filterFn)
{
	if (!this.m_resourceList.isEmpty())
	{
		this.m_resourceListFiltered = oFF.SuResourceWrapper.filterResources(this.m_resourceList, this.m_helper.createDatasourceFilter(filterFn));
	}
	else
	{
		this.m_resourceListFiltered = this.m_resourceList;
	}
	this.updateListAndPaginator(true);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.onFetchDatasourcesError = function()
{
	return  function(messages){
		oFF.SuDataSourceNavigationHelper.handleErrorMsgByView(this, messages);
	}.bind(this);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.enableDatasource = function(enable)
{
	this.m_searchInput.setEnabled(enable);
	this.m_searchInput.setText(null);
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE))
	{
		var newResourceInfo = this.m_helper.setDatasourceProperitesToResourceInfo(state);
		this.m_store.setResourceInfo(newResourceInfo);
	}
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.doSearch = function()
{
	var text = this.m_searchInput.getText();
	this.initDatasourceTable(this.m_helper.createDatasourceTextSearchFilter(text));
};
oFF.SuDataSourceNavigationReduxConsumer.prototype.updateListAndPaginator = function(initPaginator)
{
	if (initPaginator)
	{
		this.m_paginator.setListSize(this.m_resourceListFiltered.size());
	}
	var resourceList = this.m_paginator.getPageList(this.m_resourceListFiltered);
	this.m_datasourceTable.setResourceList(resourceList);
};

oFF.SuDataSourceNavigationReduxConsumerV2 = function() {};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuDataSourceNavigationReduxConsumerV2.prototype._ff_c = "SuDataSourceNavigationReduxConsumerV2";

oFF.SuDataSourceNavigationReduxConsumerV2.create = function(store, config, filterManager, dataProvider)
{
	var dataSourceNavigation = new oFF.SuDataSourceNavigationReduxConsumerV2();
	dataSourceNavigation.m_store = store;
	dataSourceNavigation.m_dataProvider = dataProvider;
	dataSourceNavigation.m_config = config;
	dataSourceNavigation.m_helper = oFF.SuDataSourceNavigationHelper.create(dataSourceNavigation, config, filterManager);
	return dataSourceNavigation;
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_store = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_config = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_dataProvider = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_mainContainer = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_systemTypeDropdown = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_connectionCB = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_searchInput = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_datasourceTable = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_systemTypeList = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_connectionList = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.m_helper = null;
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reDataSourceNavigation");
	viewControl.addCssClass("ffReDataSourceNavigation");
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.useMaxSpace();
	this.m_mainContainer = viewControl;
	var headerContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	headerContainer.setName("reDataSourceNavigationHeader");
	headerContainer.addCssClass("ffReDataSourceNavigationHeader");
	headerContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.buildSelectionUI(headerContainer);
	this.buildSearchUI(headerContainer);
	var tableContainer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	tableContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	tableContainer.setName("reDataSourceNavigationTable");
	tableContainer.addCssClass("ffReDataSourceNavigationTable");
	tableContainer.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.buildTableUI(tableContainer);
	this.m_dataProvider.attachOnDataFetch( function(data){
		var showPackageColumn = this.m_dataProvider.get().size() > 0 && oFF.XStream.of(this.m_dataProvider.get()).find( function(resource){
			var packageName = oFF.SuResourceWrapper.getFileAttributeStringByType(resource, oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE, null);
			return oFF.XStringUtils.isNotNullAndNotEmpty(packageName);
		}.bind(this)).isPresent();
		this.m_datasourceTable.setColumnVisible(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE.getName(), showPackageColumn);
	}.bind(this));
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.onChange = function(event)
{
	if (event.getControl() === this.m_systemTypeDropdown)
	{
		this.onSystemTypeUpdated();
	}
	else if (event.getControl() === this.m_connectionCB)
	{
		var value = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_VALUE, null);
		this.onConnectionUpdated(value);
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.setConncetions = function(connectionList)
{
	this.m_connectionList = connectionList;
	this.m_systemTypeList = this.m_helper.getSystemTypeList(this.m_connectionList);
	if (!this.initSystemTypeDropdown())
	{
		this.initConnectionComboBoxItems();
	}
	this.setBusy(false);
	this.m_store.subscribe(this);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.getUiView = function()
{
	return this.getView();
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.getSelectedConnection = function()
{
	var selectedItem = this.m_connectionCB.getSelectedItem();
	if (oFF.isNull(selectedItem))
	{
		return null;
	}
	return selectedItem.getCustomObject();
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.buildSelectionUI = function(container)
{
	var selectionContainer = container.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	selectionContainer.setName("reDataSourceNavigationSelection");
	selectionContainer.addCssClass("ffReDsnSelection");
	selectionContainer.useMaxWidth();
	selectionContainer.setAlignItems(oFF.UiFlexAlignItems.END);
	selectionContainer.setDirection(oFF.UiFlexDirection.ROW);
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_systemTypeDropdown = this.m_helper.addDropdown(selectionContainer, "DataSourceNavSystemType", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE), "1 1 50%");
	this.m_store.getApp().setFocus(this.m_systemTypeDropdown);
	this.m_connectionCB = this.m_helper.addComboBox(selectionContainer, "DataSourceNavConnection", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION), "1 1 50%");
	this.m_connectionCB.setShowSecondaryValues(true);
	this.m_connectionCB.setValueStateText(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_INVALID_CONNECTION));
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.buildTableUI = function(container)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var fields = oFF.XLinkedHashMapOfStringByString.create();
	fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_ID));
	fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_DESCRIPTION));
	fields.put(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE.getName(), i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_PACKAGE));
	var sortableFields = oFF.XLinkedHashMapByString.create();
	sortableFields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_DESCRIPTION, oFF.XBooleanValue.create(true));
	var detailsFileViewerConfig = oFF.SuDetailsResourceViewerConfig.create(fields, sortableFields).setNavigationEnabled(false);
	if (this.m_dataProvider.isRemote())
	{
		detailsFileViewerConfig.clearSortableFields();
	}
	this.m_datasourceTable = oFF.SuDetailsResourceViewer.create(detailsFileViewerConfig, this.m_dataProvider);
	this.m_datasourceTable.renderView(this.getGenesis());
	this.m_datasourceTable.setColumnVisible(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE.getName(), false);
	this.m_datasourceTable.getView().setHeight(oFF.UiCssLength.create("0px"));
	this.m_datasourceTable.attachOnSelect( function(data){
		this.selectResource(data);
	}.bind(this));
	this.m_datasourceTable.attachOnDoubleClick( function(data){
		this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_SUBMIT);
	}.bind(this));
	var view = this.m_datasourceTable.getView();
	view.addCssClass("ffReDsnTable");
	container.addItem(view);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.selectResource = function(data)
{
	var resource = data;
	this.m_store.setSelectedResource(resource);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.buildSearchUI = function(container)
{
	this.m_searchInput = oFF.SuDataSourceNavigationHelper.createSearchField(this.getGenesis(),  function(searchEvent){
		this.doSearch();
	}.bind(this));
	this.m_searchInput.setEnabled(false);
	container.addItem(this.m_searchInput);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.initSystemTypeDropdown = function()
{
	var systemTypeListIt = this.m_systemTypeList.getIterator();
	while (systemTypeListIt.hasNext())
	{
		var systemType = systemTypeListIt.next();
		var item = this.m_systemTypeDropdown.addNewItem();
		item.setName(systemType).setText(this.m_helper.getSystemText(systemType));
	}
	if (this.handle0Or1Items(this.m_systemTypeDropdown))
	{
		this.onSystemTypeUpdated();
		return true;
	}
	this.m_systemTypeDropdown.setEnabled(true);
	var initialSystem = this.m_config.getInitialSystem();
	if (oFF.notNull(initialSystem))
	{
		this.m_systemTypeDropdown.setSelectedName(initialSystem);
		if (this.m_systemTypeDropdown.getSelectedItem() !== null)
		{
			this.onSystemTypeUpdated();
			return true;
		}
	}
	return false;
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.initConnectionComboBoxItems = function()
{
	this.m_helper.clearComboBoxElement(this.m_connectionCB);
	var connectionIterator = this.m_connectionList.getIterator();
	while (connectionIterator.hasNext())
	{
		var connection = connectionIterator.next();
		if (this.m_helper.isConnectionVisible(connection, this.m_systemTypeDropdown.getSelectedName()))
		{
			this.m_helper.addConnectionItem(this.m_connectionCB, connection);
		}
	}
	if (!this.handle0Or1Items(this.m_connectionCB))
	{
		this.m_connectionCB.setEnabled(true);
		var initiaConnection = this.m_config.getInitialConnection();
		if (oFF.notNull(initiaConnection))
		{
			this.m_connectionCB.setSelectedName(initiaConnection.getName());
		}
	}
	if (this.m_connectionCB.getSelectedItem() !== null)
	{
		this.onConnectionUpdated(this.m_connectionCB.getSelectedItem().getName());
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.handle0Or1Items = function(control)
{
	var aggregationItems = control;
	if (aggregationItems.getItemCount() < 2)
	{
		control.setEnabled(false);
		if (aggregationItems.getItemCount() === 1)
		{
			control.setSelectedItemByIndex(0);
			return true;
		}
	}
	this.m_connectionCB.setEnabled(true);
	return false;
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.onSystemTypeUpdated = function()
{
	this.clearData();
	this.enableDatasource(false);
	this.initConnectionComboBoxItems();
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.onConnectionUpdated = function(newValue)
{
	var selectedConnection = this.getSelectedConnection();
	if ((oFF.notNull(selectedConnection) && oFF.XString.isEqual(selectedConnection.getName(), newValue)) || oFF.isNull(newValue))
	{
		this.m_store.setBrowsedResource(selectedConnection);
		this.clearData();
		this.enableDatasource(true);
		this.initDatasourceTable(true);
	}
	else
	{
		this.m_connectionCB.setValueState(oFF.UiValueState.ERROR);
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.clearData = function()
{
	this.m_datasourceTable.clear();
	this.m_datasourceTable.setColumnVisible(oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE.getName(), false);
	this.m_dataProvider.setPageNumber(0);
	this.m_connectionCB.setValueState(oFF.UiValueState.NONE);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.setBusy = function(isBusy)
{
	if (this.m_dataProvider.isRemote())
	{
		this.m_datasourceTable.setBusy(isBusy);
	}
	else
	{
		this.m_mainContainer.setBusy(isBusy);
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.enableDatasource = function(enable)
{
	this.m_searchInput.setEnabled(enable);
	this.m_searchInput.setText(null);
	this.m_dataProvider.setQuery(null);
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.initDatasourceTable = function(force)
{
	if (this.getSelectedConnection() !== null)
	{
		if (force)
		{
			this.m_dataProvider.forceInit();
		}
		this.m_datasourceTable.updateUI();
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.accept = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_SELECTED_RESOURCE))
	{
		var newResourceInfo = this.m_helper.setDatasourceProperitesToResourceInfo(state);
		this.m_store.setResourceInfo(newResourceInfo);
		var selectedResource = state.getSelectedResource();
		this.m_datasourceTable.setSelectedItem(selectedResource);
	}
};
oFF.SuDataSourceNavigationReduxConsumerV2.prototype.doSearch = function()
{
	if (!this.isReleased() && !this.m_searchInput.isReleased())
	{
		var text = this.m_searchInput.getText();
		this.m_dataProvider.setQuery(text);
		this.m_dataProvider.setOffset(0);
		this.initDatasourceTable(false);
	}
};

oFF.SuDatasourcePickerMenu = function() {};
oFF.SuDatasourcePickerMenu.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuDatasourcePickerMenu.prototype._ff_c = "SuDatasourcePickerMenu";

oFF.SuDatasourcePickerMenu.DATASOURCE_LINK = "DATASOURCE";
oFF.SuDatasourcePickerMenu.RECENTLY_USED_LINK = "RECENTLY_USED";
oFF.SuDatasourcePickerMenu.create = function()
{
	var menu = new oFF.SuDatasourcePickerMenu();
	return menu;
};
oFF.SuDatasourcePickerMenu.prototype.m_clickedItem = null;
oFF.SuDatasourcePickerMenu.prototype.m_selectMenuItem = null;
oFF.SuDatasourcePickerMenu.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuDatasourcePickerMenu.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reDatasourcePickerMenu");
	viewControl.addCssClass("ffReQuickAccessNav");
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.setWidth(null);
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var datasourceItem = this.createButtonItem("fpa/data", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_DATASOURCES), oFF.SuDatasourcePickerMenu.DATASOURCE_LINK, "reDpmDatasourceLink");
	this.setSelected(datasourceItem);
	this.createLabelItem(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS));
	this.createButtonItem("fpa/list", i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_MENU_VIEWS_RECENTLY_USED), oFF.SuDatasourcePickerMenu.RECENTLY_USED_LINK, "reDpmRecentlyUsedLink");
};
oFF.SuDatasourcePickerMenu.prototype.createLabelItem = function(text)
{
	var menuItemContainer = this.getView().addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	menuItemContainer.addCssClass("ffReQaItem");
	menuItemContainer.setDirection(oFF.UiFlexDirection.ROW);
	var categoryLabel = menuItemContainer.addNewItemOfType(oFF.UiType.LABEL);
	categoryLabel.addCssClass("ffReQaLabel");
	categoryLabel.setText(text);
	return menuItemContainer;
};
oFF.SuDatasourcePickerMenu.prototype.createButtonItem = function(icon, text, link, name)
{
	var menuItemButton = this.getView().addNewItemOfType(oFF.UiType.TOGGLE_BUTTON);
	menuItemButton.setText(text);
	menuItemButton.setName(name);
	menuItemButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	menuItemButton.setHeight(oFF.UiCssLength.create("3rem"));
	menuItemButton.setPadding(oFF.UiCssBoxEdges.create("0"));
	menuItemButton.addCssClass("ffReQaButtonLink");
	if (oFF.notNull(icon))
	{
		menuItemButton.setIcon(icon);
	}
	menuItemButton.addCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTABLE_CSS_CLASS);
	menuItemButton.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.setSelected(menuItemButton);
		this.handleClick(link);
	}.bind(this)));
	return menuItemButton;
};
oFF.SuDatasourcePickerMenu.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
	this.m_clickedItem = oFF.SuDatasourcePickerMenu.DATASOURCE_LINK;
};
oFF.SuDatasourcePickerMenu.prototype.handleClick = function(link)
{
	if (!oFF.XString.isEqual(link, this.m_clickedItem))
	{
		this.m_clickedItem = link;
		this.fireOnChange(link);
	}
};
oFF.SuDatasourcePickerMenu.prototype.setSelected = function(control)
{
	if (oFF.notNull(this.m_selectMenuItem))
	{
		if (this.m_selectMenuItem.getUiType().isTypeOf(oFF.UiType.TOGGLE_BUTTON))
		{
			this.m_selectMenuItem.setPressed(false);
		}
		else
		{
			this.m_selectMenuItem.removeCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTED_CSS_CLASS);
		}
	}
	this.m_selectMenuItem = control;
	if (this.m_selectMenuItem.getUiType().isTypeOf(oFF.UiType.TOGGLE_BUTTON))
	{
		this.m_selectMenuItem.setPressed(true);
	}
	else
	{
		this.m_selectMenuItem.addCssClass(oFF.SuQuickAccessNavigationReduxConsumer.SELECTED_CSS_CLASS);
	}
};
oFF.SuDatasourcePickerMenu.prototype.attachOnChange = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuDatasourcePickerMenu.prototype.detachOnChange = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CHANGE, consumer);
};
oFF.SuDatasourcePickerMenu.prototype.getConsumersOnChange = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CHANGE);
};
oFF.SuDatasourcePickerMenu.prototype.fireOnChange = function(link)
{
	this.fireEvent(oFF.UiEvent.ON_CHANGE, oFF.XStringValue.create(link));
};

oFF.SuDatasourcePickerView = function() {};
oFF.SuDatasourcePickerView.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuDatasourcePickerView.prototype._ff_c = "SuDatasourcePickerView";

oFF.SuDatasourcePickerView.create = function(config, datasourceConfig, resourceNavigationHelper, store, filterManager, connectionList)
{
	var newDatasourcePickerView = new oFF.SuDatasourcePickerView();
	newDatasourcePickerView.m_config = config;
	newDatasourcePickerView.m_datasourceConfig = datasourceConfig;
	newDatasourcePickerView.m_resourceNavigationHelper = resourceNavigationHelper;
	newDatasourcePickerView.m_store = store;
	newDatasourcePickerView.m_filterManager = filterManager;
	newDatasourcePickerView.m_connectionList = connectionList;
	return newDatasourcePickerView;
};
oFF.SuDatasourcePickerView.prototype.m_dataSourceNavigation = null;
oFF.SuDatasourcePickerView.prototype.m_menu = null;
oFF.SuDatasourcePickerView.prototype.m_recentlyUsed = null;
oFF.SuDatasourcePickerView.prototype.m_config = null;
oFF.SuDatasourcePickerView.prototype.m_resourceNavigationHelper = null;
oFF.SuDatasourcePickerView.prototype.m_filterManager = null;
oFF.SuDatasourcePickerView.prototype.m_store = null;
oFF.SuDatasourcePickerView.prototype.m_datasourceConfig = null;
oFF.SuDatasourcePickerView.prototype.m_datasourcePickerShown = false;
oFF.SuDatasourcePickerView.prototype.m_connectionList = null;
oFF.SuDatasourcePickerView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.SuDatasourcePickerView.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reDatasourcePickerView");
	viewControl.addCssClass("ffReMainView");
	viewControl.addCssClass("ffReDatasourcePickerView");
	viewControl.setDirection(oFF.UiFlexDirection.ROW);
	this.buildMenuAndRecentlyUsedViews(this.getGenesis());
	this.m_dataSourceNavigation.renderView(this.getGenesis());
	this.m_dataSourceNavigation.getUiView().setVisible(this.m_datasourcePickerShown);
	viewControl.addItem(this.m_dataSourceNavigation.getUiView());
	this.initConnectionList();
};
oFF.SuDatasourcePickerView.prototype.buildMenuAndRecentlyUsedViews = function(genesis)
{
	var view = this.getView();
	this.m_menu.renderView(genesis);
	view.addItem(this.m_menu.getView());
	this.m_menu.attachOnChange( function(link){
		this.setDatasourcePickerShown(oFF.XString.isEqual(link.getString(), oFF.SuDatasourcePickerMenu.DATASOURCE_LINK));
	}.bind(this));
	this.m_recentlyUsed.renderView(genesis);
	this.m_recentlyUsed.getView().setVisible(!this.m_datasourcePickerShown);
	this.m_recentlyUsed.attachOnSelect( function(data){
		this.selectDatasourceResource(data, false);
	}.bind(this));
	this.m_recentlyUsed.attachOnDoubleClick( function(data){
		this.selectDatasourceResource(data, true);
	}.bind(this));
	this.m_recentlyUsed.attachOnDelete( function(event){
		this.m_datasourceConfig.getRecentlyUsedDataProvider().update(event);
		this.m_store.setSelectedResource(null);
	}.bind(this));
	view.addItem(this.m_recentlyUsed.getView());
};
oFF.SuDatasourcePickerView.prototype.selectDatasourceResource = function(data, isSubmit)
{
	if (oFF.isNull(data))
	{
		this.m_store.setResourceInfo(null);
	}
	else
	{
		var dataSourceInfo = data;
		this.m_store.setResourceInfo(oFF.SuResourceInfo.createByDatasource(dataSourceInfo));
	}
	this.m_store.setStatus(isSubmit ? oFF.SuResourceExplorerState.STATUS_SUBMIT : oFF.SuResourceExplorerState.STATUS_READY);
};
oFF.SuDatasourcePickerView.prototype.updateUI = function()
{
	this.m_dataSourceNavigation.getUiView().setVisible(this.m_datasourcePickerShown);
	this.m_recentlyUsed.getView().setVisible(!this.m_datasourcePickerShown);
};
oFF.SuDatasourcePickerView.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
	this.m_datasourcePickerShown = true;
	if (this.m_config.isVersionGTE(oFF.SuResourceExplorerConfig.VERSION_2))
	{
		var rootResource = this.m_resourceNavigationHelper.getResourceByPath(this.m_config.getRootPath());
		var detailsResourceViewerConfig = oFF.SuDetailsResourceViewerConfig.createFromConfig(this.m_config).setRootResource(rootResource);
		var resourceExplorerDataProviderFactory = oFF.SuResourceExplorerDataProviderFactory.create(this.m_store, this.m_config, detailsResourceViewerConfig, this.m_filterManager, this);
		var dataProviderFactory = resourceExplorerDataProviderFactory.createProviderFactory();
		this.m_dataSourceNavigation = oFF.SuDataSourceNavigationReduxConsumerV2.create(this.m_store, this.m_datasourceConfig, this.m_filterManager, dataProviderFactory.createProvider());
	}
	else
	{
		this.m_dataSourceNavigation = oFF.SuDataSourceNavigationReduxConsumer.create(this.m_store, this.m_datasourceConfig, this.m_filterManager);
	}
	this.m_menu = oFF.SuDatasourcePickerMenu.create();
	this.m_recentlyUsed = oFF.SuDatasourceRecentlyUsed.create();
};
oFF.SuDatasourcePickerView.prototype.initConnectionList = function()
{
	this.m_recentlyUsed.setList(this.decorateDataSourceListInfoWithConnection());
	this.m_dataSourceNavigation.setConncetions(this.m_connectionList);
};
oFF.SuDatasourcePickerView.prototype.decorateDataSourceListInfoWithConnection = function()
{
	return oFF.XStream.of(this.getRecentlyUsedDatasourceList()).map( function(fetchedDs){
		return this.decorateDataSourceInfoWithConnection(fetchedDs);
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.SuDatasourcePickerView.prototype.getRecentlyUsedDatasourceList = function()
{
	if (this.m_datasourceConfig.isRecentlyUsedSet())
	{
		return this.m_datasourceConfig.getRecentlyUsedDataProvider().get();
	}
	return oFF.XList.create();
};
oFF.SuDatasourcePickerView.prototype.decorateDataSourceInfoWithConnection = function(datasource)
{
	var connection = oFF.SuDataSourceNavigationHelper.getConnectionByName(this.m_connectionList, datasource.getSystemName());
	if (connection.isPresent())
	{
		datasource.setSystemType(oFF.SuResourceWrapper.getFileAttributeStringByType(connection.get(), oFF.XFileAttribute.SYSTEM_TYPE, ""));
	}
	return datasource;
};
oFF.SuDatasourcePickerView.prototype.setDatasourcePickerShown = function(shown)
{
	this.m_datasourcePickerShown = shown;
	this.m_store.setSelectedResource(null);
	this.m_store.setResourceViewerMode(this.m_datasourcePickerShown ? oFF.SuResourceExplorerStore.DATASOURCE_VIEWER : oFF.SuResourceExplorerStore.RECENTLY_USED_VIEWER);
	this.m_recentlyUsed.clearSelection();
	this.updateUI();
};

oFF.SuDetailsFileViewer = function() {};
oFF.SuDetailsFileViewer.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuDetailsFileViewer.prototype._ff_c = "SuDetailsFileViewer";

oFF.SuDetailsFileViewer.create = function(config)
{
	var newDetailsFileViewer = new oFF.SuDetailsFileViewer();
	newDetailsFileViewer.m_config = config;
	newDetailsFileViewer.m_isSortAscending = true;
	newDetailsFileViewer.m_resourceList = oFF.XList.create();
	newDetailsFileViewer.m_helper = oFF.SuDetailsResourceViewerHelper.create(newDetailsFileViewer, config);
	return newDetailsFileViewer;
};
oFF.SuDetailsFileViewer.prototype.m_config = null;
oFF.SuDetailsFileViewer.prototype.m_isSortAscending = false;
oFF.SuDetailsFileViewer.prototype.m_sortingAttribute = null;
oFF.SuDetailsFileViewer.prototype.m_resourceList = null;
oFF.SuDetailsFileViewer.prototype.m_table = null;
oFF.SuDetailsFileViewer.prototype.m_helper = null;
oFF.SuDetailsFileViewer.prototype.destroyView = function()
{
	this.m_resourceList = oFF.XObjectExt.release(this.m_resourceList);
	this.m_helper = oFF.XObjectExt.release(this.m_helper);
	this.m_config = null;
	oFF.SuDfUiViewEventHandler.prototype.destroyView.call( this );
};
oFF.SuDetailsFileViewer.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.SCROLL_CONTAINER);
};
oFF.SuDetailsFileViewer.prototype.setupView = function()
{
	oFF.SuDfUiViewEventHandler.prototype.setupView.call( this );
	var scrollContainer = this.getView();
	scrollContainer.addCssClass("ffReDfvScrollContainer");
	scrollContainer.setHeight(oFF.UiCssLength.create("0"));
};
oFF.SuDetailsFileViewer.prototype.layoutView = function(viewControl)
{
	var table = viewControl.setNewContent(oFF.UiType.RESPONSIVE_TABLE);
	this.m_table = table;
	table.registerOnSelect(this.createUiLambdaTableSelectListener());
	table.setColumnResize(true);
	table.setName("reDetailsResourceViewer");
	table.addCssClass("ffReDfv");
	table.setAlternateRowColors(true);
	table.setAlignSelf(oFF.UiFlexAlignSelf.START);
	table.setFlex("auto");
	table.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	var fields = this.m_config.getFields();
	if (oFF.isNull(fields) || fields.size() === 0)
	{
		fields = oFF.XLinkedHashMapOfStringByString.create();
		fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, null);
	}
	var tableColumn = null;
	for (var iterator = fields.getKeysAsIteratorOfString(); iterator.hasNext(); )
	{
		var cssClass = oFF.XStringBuffer.create();
		var fieldName = iterator.next();
		var fieldLabel = this.m_config.getFieldLabel(fieldName);
		tableColumn = table.addNewResponsiveTableColumn().setTitle(oFF.notNull(fieldLabel) ? fieldLabel : fieldName);
		var isNameField = oFF.XString.isEqual(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, fieldName);
		tableColumn.setTag(isNameField ? oFF.XFileAttribute.DISPLAY_NAME.toString() : fieldName);
		if (this.m_config.isFieldSortable(fieldName))
		{
			cssClass.append("ffReDfvSortable");
			tableColumn.setSortIndicator(oFF.UiSortOrder.NONE);
			tableColumn.registerOnPress(this.m_helper.createUiLambdaColumnPressListener(this.m_table));
		}
		if (!iterator.hasNext())
		{
			if (cssClass.length() > 0)
			{
				cssClass.append(" ");
			}
			cssClass.append("ffReDfvLastColumn");
		}
		if (cssClass.length() > 0)
		{
			tableColumn.addCssClass(cssClass.toString());
		}
	}
	if (oFF.notNull(tableColumn))
	{
		var firstColumn = table.getResponsiveTableColumn(0);
		firstColumn.setSortIndicator(oFF.UiSortOrder.ASCENDING);
		this.m_sortingAttribute = firstColumn.getTag();
	}
	this.updateUI();
};
oFF.SuDetailsFileViewer.prototype.attachOnClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuDetailsFileViewer.prototype.detachOnClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuDetailsFileViewer.prototype.getConsumersOnClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CLICK);
};
oFF.SuDetailsFileViewer.prototype.attachOnDoubleClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuDetailsFileViewer.prototype.detachOnDoubleClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuDetailsFileViewer.prototype.getConsumersOnDoubleClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_DOUBLE_CLICK);
};
oFF.SuDetailsFileViewer.prototype.clearSelection = function()
{
	this.m_table.clearSelectedItems();
};
oFF.SuDetailsFileViewer.prototype.updateSortingInfo = function(isSortAscending, sortingAttribute)
{
	var table = this.m_table;
	this.m_isSortAscending = isSortAscending;
	this.m_sortingAttribute = sortingAttribute;
	table.clearResponsiveTableRows();
	this.updateUI();
};
oFF.SuDetailsFileViewer.prototype.setBusy = function(busy)
{
	var table = this.m_table;
	table.setBusy(busy);
};
oFF.SuDetailsFileViewer.prototype.setVisible = function(isVisible)
{
	if (this.getView() !== null)
	{
		this.getView().setVisible(isVisible);
	}
};
oFF.SuDetailsFileViewer.prototype.clear = function()
{
	var table = this.m_table;
	this.m_resourceList.clear();
	table.clearResponsiveTableRows();
};
oFF.SuDetailsFileViewer.prototype.setSelectedItem = function(item)
{
	oFF.SuDetailsResourceViewerHelper.setSelectedResource(this.m_table, item);
};
oFF.SuDetailsFileViewer.prototype.setResourceList = function(resourceList)
{
	this.clear();
	this.m_resourceList.addAll(resourceList);
	this.updateUI();
};
oFF.SuDetailsFileViewer.prototype.setBrowsedResource = function(resource) {};
oFF.SuDetailsFileViewer.prototype.getTable = function()
{
	return this.m_table;
};
oFF.SuDetailsFileViewer.prototype.enableSorting = function(enable) {};
oFF.SuDetailsFileViewer.prototype.updateUI = function()
{
	var table = this.m_table;
	var rows = oFF.XList.create();
	var sortedResourceList = this.getSortedResourceList(this.m_resourceList);
	var resourceIterator = sortedResourceList.getIterator();
	while (oFF.notNull(resourceIterator) && resourceIterator.hasNext())
	{
		var resource = resourceIterator.next();
		var resourceWrapper = oFF.SuResourceWrapper.create(resource);
		var newRow = this.addNewResourceTableRow(resourceWrapper, rows.size());
		rows.add(newRow);
	}
	this.fillWithEmptyRows(rows);
	table.addAllResponsiveTableRows(rows);
	if (this.getView().isVisible() && table.isVisible() && rows.size() > 0)
	{
		table.scrollToIndex(0);
	}
};
oFF.SuDetailsFileViewer.prototype.fillWithEmptyRows = function(rows)
{
	if (rows.size() === 0)
	{
		return;
	}
	var emptyRows = this.m_config.getRowsToFill() - rows.size();
	if (emptyRows > 0)
	{
		for (var i = 0; i < emptyRows; i++)
		{
			var newRow = this.addNewResourceTableRow(null, rows.size());
			rows.add(newRow);
		}
	}
};
oFF.SuDetailsFileViewer.prototype.getSortedResourceList = function(resourceList)
{
	resourceList.sortByComparator(oFF.SuResourceComparator.create(this.m_isSortAscending, this.m_sortingAttribute, this.m_config.isGroupDirectoriesEnabled()));
	return resourceList.getValuesAsReadOnlyList();
};
oFF.SuDetailsFileViewer.prototype.addNewResourceTableRow = function(resourceWrapper, rowIndex)
{
	var table = this.m_table;
	var tableRow = table.newResponsiveTableRow();
	var isEmptyRow = oFF.isNull(resourceWrapper);
	if (isEmptyRow)
	{
		tableRow.addCssClass("ffReTVEmpty");
	}
	else
	{
		tableRow.setCustomObject(resourceWrapper.getFile());
	}
	var fields = this.m_config.getFields();
	if (oFF.isNull(fields) || fields.size() === 0)
	{
		if (isEmptyRow)
		{
			this.addNewEmptyCell(tableRow);
		}
		else
		{
			this.addNewCell(tableRow, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, rowIndex, resourceWrapper);
		}
	}
	else
	{
		var fieldsList = fields.getKeysAsReadOnlyListOfString();
		for (var i = 0; i < fieldsList.size(); i++)
		{
			if (isEmptyRow)
			{
				this.addNewEmptyCell(tableRow);
			}
			else
			{
				var fieldName = fieldsList.get(i);
				this.addNewCell(tableRow, fieldName, rowIndex, resourceWrapper);
			}
		}
	}
	tableRow.registerOnDoubleClick(this.createUiLambdaRowDblClickListener());
	return tableRow;
};
oFF.SuDetailsFileViewer.prototype.addNewEmptyCell = function(tableRow)
{
	return tableRow.addNewLabelCell();
};
oFF.SuDetailsFileViewer.prototype.addNewCell = function(tableRow, fieldName, rowIndex, resourceWrapper)
{
	var tableCell = null;
	if (oFF.XString.isEqual(fieldName, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME))
	{
		tableCell = this.addNewResourceNameCell(tableRow, resourceWrapper);
	}
	else
	{
		tableCell = this.m_helper.addNewCellTextControl(tableRow, resourceWrapper, fieldName);
	}
	tableCell.addCssClass(this.m_helper.getCellClass(fieldName));
	tableCell.setName(this.m_helper.getCellName(rowIndex, fieldName));
	return tableCell;
};
oFF.SuDetailsFileViewer.prototype.addNewResourceNameCell = function(tableRow, resourceWrapper)
{
	var cellLayout = tableRow.addNewResponsiveTableCellOfType(oFF.UiType.FLEX_LAYOUT);
	cellLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	if (oFF.notNull(resourceWrapper))
	{
		var nameLayout = cellLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		nameLayout.addCssClass("ffReDfvResourceName");
		nameLayout.useMaxSpace();
		nameLayout.setDirection(oFF.UiFlexDirection.ROW);
		var iconControl = resourceWrapper.getIconControl(nameLayout);
		if (oFF.notNull(iconControl))
		{
			iconControl.addCssClass("ffReResourceIcon");
			nameLayout.addItem(iconControl);
		}
		this.m_helper.addNewNameTextControl(nameLayout, resourceWrapper.getTranslatedDisplayName());
		if (resourceWrapper.isSharedToMe())
		{
			var shareIcon = nameLayout.addNewItemOfType(oFF.UiType.ICON);
			shareIcon.setIcon("share-2");
			shareIcon.addCssClass("ffReResourceSharedIcon");
		}
		if (this.m_config.isBreadcrumbsEnabled())
		{
			cellLayout.addItem(this.m_helper.createBreadcrumbsForResource(resourceWrapper.getFile(), this.createBreadcrumbsClickCallback(), this.getGenesis()).getView());
		}
	}
	return cellLayout;
};
oFF.SuDetailsFileViewer.prototype.createUiLambdaTableSelectListener = function()
{
	return oFF.UiLambdaSelectListener.create( function(event){
		var control = event.getControl();
		var selectedItem = control.getSelectedItem();
		var resource = selectedItem.getCustomObject();
		this.fireOnResourceClick(resource);
	}.bind(this));
};
oFF.SuDetailsFileViewer.prototype.createUiLambdaRowDblClickListener = function()
{
	return oFF.UiLambdaDoubleClickListener.create( function(event){
		var control = event.getControl();
		var resource = control.getCustomObject();
		this.fireOnResourceDblClick(resource);
	}.bind(this));
};
oFF.SuDetailsFileViewer.prototype.createBreadcrumbsClickCallback = function()
{
	return  function(data){
		var dataTmp = data;
		this.fireOnResourceClick(dataTmp);
	}.bind(this);
};
oFF.SuDetailsFileViewer.prototype.fireOnResourceClick = function(resource)
{
	this.fireEvent(oFF.UiEvent.ON_CLICK, resource);
};
oFF.SuDetailsFileViewer.prototype.fireOnResourceDblClick = function(resource)
{
	this.fireEvent(oFF.UiEvent.ON_DOUBLE_CLICK, resource);
};

oFF.SuTileFileViewer = function() {};
oFF.SuTileFileViewer.prototype = new oFF.SuDfUiViewEventHandler();
oFF.SuTileFileViewer.prototype._ff_c = "SuTileFileViewer";

oFF.SuTileFileViewer.create = function()
{
	var newContentViewer = new oFF.SuTileFileViewer();
	return newContentViewer;
};
oFF.SuTileFileViewer.prototype.setBusy = function(busy)
{
	var tileContainer = this.getView();
	tileContainer.setBusy(busy);
};
oFF.SuTileFileViewer.prototype.setVisible = function(isVisible)
{
	if (this.getView() !== null)
	{
		this.getView().setVisible(isVisible);
	}
};
oFF.SuTileFileViewer.prototype.clear = function()
{
	var tileContainer = this.getView();
	tileContainer.clearItems();
	tileContainer.setCustomObject(null);
};
oFF.SuTileFileViewer.prototype.setSelectedItem = function(item)
{
	var tileContainer = this.getView();
	if (oFF.notNull(tileContainer))
	{
		if (oFF.notNull(item))
		{
			this.setSelection(item);
		}
	}
};
oFF.SuTileFileViewer.prototype.clearSelection = function()
{
	this.setSelection(null);
};
oFF.SuTileFileViewer.prototype.enableSorting = function(enable) {};
oFF.SuTileFileViewer.prototype.setSelection = function(item)
{
	var tileContainer = this.getView();
	if (oFF.notNull(tileContainer))
	{
		oFF.XCollectionUtils.forEach(tileContainer.getItems(),  function(childItem){
			var tmpFileIcon = childItem;
			var iconResource = tmpFileIcon.getCustomObject();
			tmpFileIcon.setSelected(oFF.isNull(item) ? false : iconResource.isEquals(item));
		}.bind(this));
	}
};
oFF.SuTileFileViewer.prototype.setResourceList = function(resourceList)
{
	this.clear();
	var itemIterator = resourceList.getIterator();
	while (itemIterator.hasNext())
	{
		var resource = itemIterator.next();
		this.addResource(resource);
	}
};
oFF.SuTileFileViewer.prototype.setBrowsedResource = function(resource)
{
	var tileContainer = this.getView();
	tileContainer.setCustomObject(oFF.SuResourceWrapper.create(resource));
};
oFF.SuTileFileViewer.prototype.updateUI = function() {};
oFF.SuTileFileViewer.prototype.updateSortingInfo = function(isSortAscending, sortingAttribute) {};
oFF.SuTileFileViewer.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.TILE_CONTAINER);
};
oFF.SuTileFileViewer.prototype.layoutView = function(viewControl)
{
	viewControl.setName("reTileResourceViewer");
	viewControl.useMaxSpace();
	viewControl.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create( function(controlCtxEvent){
		this.fireUiEvent(oFF.UiEvent.ON_CONTEXT_MENU, controlCtxEvent.getControl().getCustomObject());
	}.bind(this)));
	viewControl.registerOnClick(oFF.UiLambdaClickListener.create( function(controlClickEvent){
		this.fireUiEvent(oFF.UiEvent.ON_CLICK, controlClickEvent.getControl().getCustomObject());
	}.bind(this)));
};
oFF.SuTileFileViewer.prototype.addResource = function(resource)
{
	var resourceWrapper = oFF.SuResourceWrapper.create(resource);
	var isResourceDir = resourceWrapper.isResourceDirectory();
	var tileContainer = this.getView();
	var session = tileContainer.getUiManager().getSession();
	var folderIconSrc = session.resolvePath("${ff_mimes}/images/apolloFileExplorer/folder.png");
	var fileIconSrc = session.resolvePath("${ff_mimes}/images/apolloFileExplorer/file.png");
	var iconSrc = isResourceDir ? folderIconSrc : fileIconSrc;
	var newFileItem = tileContainer.addNewItemOfType(oFF.UiType.FILE_ICON);
	var fileDisplayName = resourceWrapper.getTranslatedDisplayName();
	newFileItem.setText(fileDisplayName);
	newFileItem.setTooltip(fileDisplayName);
	var extension = null;
	if (!isResourceDir)
	{
		var feaExtension = oFF.FeApolloFileExtension.getApolloExtensionForFile(resource);
		if (oFF.notNull(feaExtension))
		{
			extension = feaExtension.getExtension();
			var fileNameNoExt = resourceWrapper.extractNameNoExt();
			if (resource.isExecutable())
			{
				var tmpFileIconSrc = this.getResolvedFileIconPath(session, feaExtension, fileNameNoExt);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(tmpFileIconSrc))
				{
					iconSrc = tmpFileIconSrc;
					extension = null;
				}
			}
		}
	}
	newFileItem.setDescription(extension);
	newFileItem.setSrc(iconSrc);
	newFileItem.setCustomObject(resourceWrapper);
	newFileItem.registerOnDoubleClick(oFF.UiLambdaDoubleClickListener.create( function(controlDblClickEvent){
		this.fireUiEvent(oFF.UiEvent.ON_DOUBLE_CLICK, controlDblClickEvent.getControl().getCustomObject());
	}.bind(this)));
	newFileItem.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create( function(controlCtxEvent){
		this.fireUiEvent(oFF.UiEvent.ON_CONTEXT_MENU, controlCtxEvent.getControl().getCustomObject());
	}.bind(this)));
	newFileItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlClickEvent){
		this.fireUiEvent(oFF.UiEvent.ON_CLICK, controlClickEvent.getControl().getCustomObject());
	}.bind(this)));
};
oFF.SuTileFileViewer.prototype.getResolvedFileIconPath = function(session, feaExtension, fileNameNoExt)
{
	var prgName = null;
	var iconPath = null;
	if (feaExtension.isExecutable())
	{
		prgName = fileNameNoExt;
	}
	else
	{
		prgName = feaExtension.getProgramName();
	}
	var prgManifest = oFF.ProgramRegistration.getProgramManifest(prgName);
	if (oFF.notNull(prgManifest))
	{
		iconPath = prgManifest.getResolvedIconPath(session);
	}
	return iconPath;
};
oFF.SuTileFileViewer.prototype.attachOnContextMenu = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CONTEXT_MENU, consumer);
};
oFF.SuTileFileViewer.prototype.detachOnContextMenu = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CONTEXT_MENU, consumer);
};
oFF.SuTileFileViewer.prototype.getConsumersOnContextMenu = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CONTEXT_MENU);
};
oFF.SuTileFileViewer.prototype.attachOnDoubleClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuTileFileViewer.prototype.detachOnDoubleClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_DOUBLE_CLICK, consumer);
};
oFF.SuTileFileViewer.prototype.getConsumersOnDoubleClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_DOUBLE_CLICK);
};
oFF.SuTileFileViewer.prototype.attachOnClick = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuTileFileViewer.prototype.detachOnClick = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_CLICK, consumer);
};
oFF.SuTileFileViewer.prototype.getConsumersOnClick = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_CLICK);
};
oFF.SuTileFileViewer.prototype.fireUiEvent = function(eventDef, resourceWrapper)
{
	if (oFF.notNull(resourceWrapper) && resourceWrapper.getFile() !== null)
	{
		this.fireEvent(eventDef, resourceWrapper.getFile());
	}
};

oFF.SuSideNavigationView = function() {};
oFF.SuSideNavigationView.prototype = new oFF.DfUiContentView();
oFF.SuSideNavigationView.prototype._ff_c = "SuSideNavigationView";

oFF.SuSideNavigationView.create = function(genesis)
{
	var newView = new oFF.SuSideNavigationView();
	newView.setupSideNavigation(genesis);
	return newView;
};
oFF.SuSideNavigationView.prototype.m_layout = null;
oFF.SuSideNavigationView.prototype.m_panelContainer = null;
oFF.SuSideNavigationView.prototype.m_sideNavigation = null;
oFF.SuSideNavigationView.prototype.m_navList = null;
oFF.SuSideNavigationView.prototype.m_lastOpenedPanelKey = null;
oFF.SuSideNavigationView.prototype.m_panels = null;
oFF.SuSideNavigationView.prototype.setupSideNavigation = function(genesis)
{
	oFF.DfUiContentView.prototype.initView.call( this , genesis);
};
oFF.SuSideNavigationView.prototype.setupView = function()
{
	this.m_panels = oFF.XHashMapByString.create();
};
oFF.SuSideNavigationView.prototype.buildViewUi = function(genesis)
{
	this.m_layout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_layout.useMaxSpace();
	this.m_layout.setDirection(oFF.UiFlexDirection.ROW);
	this.m_panelContainer = this.m_layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_panelContainer.setDirection(oFF.UiFlexDirection.ROW);
	this.m_panelContainer.useMaxHeight();
	this.m_panelContainer.setFlex("1");
	this.m_panelContainer.setOverflow(oFF.UiOverflow.VISIBLE);
	this.m_panelContainer.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_panelContainer.setBorderWidth(oFF.UiCssBoxEdges.create("1px"));
	this.m_panelContainer.setBorderColor(oFF.UiTheme.getCurrentTheme().getLightGrayColor());
	this.m_sideNavigation = this.m_layout.addNewItemOfType(oFF.UiType.SIDE_NAVIGATION);
	this.m_sideNavigation.useMaxHeight();
	this.m_sideNavigation.setFlex("0 0 auto");
	this.m_sideNavigation.setExpanded(false);
	this.m_sideNavigation.registerOnItemSelect(oFF.UiLambdaItemSelectListener.create( function(event){
		var selectedItem = event.getAffectedItem();
		this.togglePanel(selectedItem.getTag());
	}.bind(this)));
	this.m_navList = genesis.newControl(oFF.UiType.NAVIGATION_LIST);
	this.m_navList.addNewItem().setIcon("close-command-field").setTooltip("Expand").registerOnSelect(oFF.UiLambdaSelectListener.create( function(event1){
		var items = this.m_navList.getItems();
		var lastOpenedPanelKey = null;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_lastOpenedPanelKey))
		{
			lastOpenedPanelKey = this.m_lastOpenedPanelKey;
		}
		else if (items.size() > 1)
		{
			lastOpenedPanelKey = items.get(1).getTag();
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(lastOpenedPanelKey))
		{
			this.togglePanel(lastOpenedPanelKey);
		}
	}.bind(this)));
	this.m_sideNavigation.setNavList(this.m_navList);
};
oFF.SuSideNavigationView.prototype.releaseObject = function()
{
	this.m_layout = oFF.XObjectExt.release(this.m_layout);
	this.m_panelContainer = oFF.XObjectExt.release(this.m_panelContainer);
	this.m_sideNavigation = oFF.XObjectExt.release(this.m_sideNavigation);
	this.m_navList = oFF.XObjectExt.release(this.m_navList);
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_panels);
	oFF.DfUiContentView.prototype.releaseObject.call( this );
};
oFF.SuSideNavigationView.prototype.destroyView = function() {};
oFF.SuSideNavigationView.prototype.addSideNavigationItem = function(control, key, icon, description)
{
	var navItem = this.m_navList.addNewItem();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(key))
	{
		navItem.setTag(key);
		this.m_panels.put(key, control);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(icon))
		{
			navItem.setIcon(icon);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
		{
			navItem.setTooltip(description);
		}
	}
	else
	{
		this.logError("Side navigation item cannot be added without a key.");
	}
};
oFF.SuSideNavigationView.prototype.removeSideNavigationItem = function(key)
{
	this.m_panels.remove(key);
	if (oFF.XString.isEqual(key, this.m_lastOpenedPanelKey))
	{
		this.m_lastOpenedPanelKey = null;
	}
};
oFF.SuSideNavigationView.prototype.isSideNavigationHidden = function()
{
	return !this.m_sideNavigation.isVisible();
};
oFF.SuSideNavigationView.prototype.setSideNavigationHidden = function(hidden)
{
	this.m_sideNavigation.setVisible(!hidden);
};
oFF.SuSideNavigationView.prototype.togglePanel = function(key)
{
	var isPanelOpened = false;
	var panel = this.m_panels.getByKey(key);
	if (oFF.notNull(panel))
	{
		if (panel.getParent() !== null)
		{
			this.m_panelContainer.removeItem(panel);
			this.collapseSideNavigation();
		}
		else
		{
			this.m_panelContainer.clearItems();
			this.m_panelContainer.addItem(panel);
			this.m_lastOpenedPanelKey = key;
			var selectedItem = oFF.XCollectionUtils.findFirst(this.m_navList.getItems(),  function(item){
				return oFF.XString.isEqual(item.getTag(), key);
			}.bind(this));
			oFF.XTimeout.timeout(0,  function(){
				this.m_navList.setSelectedItem(selectedItem);
			}.bind(this));
			this.expandSideNavigation();
			isPanelOpened = true;
		}
	}
	else
	{
		this.logError2("Cannot determine panel of key : ", key);
	}
	return isPanelOpened;
};
oFF.SuSideNavigationView.prototype.getCollapseExpandItem = function()
{
	return this.m_navList.getItem(0);
};
oFF.SuSideNavigationView.prototype.collapseSideNavigation = function()
{
	var collapseExpandItem = this.getCollapseExpandItem();
	collapseExpandItem.setIcon("close-command-field");
	collapseExpandItem.setTooltip("Expand");
};
oFF.SuSideNavigationView.prototype.expandSideNavigation = function()
{
	var collapseExpandItem = this.getCollapseExpandItem();
	collapseExpandItem.setIcon("open-command-field");
	collapseExpandItem.setTooltip("Collapse");
};

oFF.SuYouTubePlayerView = function() {};
oFF.SuYouTubePlayerView.prototype = new oFF.DfUiContentView();
oFF.SuYouTubePlayerView.prototype._ff_c = "SuYouTubePlayerView";

oFF.SuYouTubePlayerView.YOUTUBE_PLAYER_TEMPLATE = "<iframe style='width:100%;height:100%;position:absolute;left:0:right:0;' src=\"https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1&controls=0&autohide=1&showinfo=0{MUTE}{LOOP}{PLAYLIST}\" allow='autoplay' frameborder='0' {HIDDEN}> </iframe>";
oFF.SuYouTubePlayerView.create = function(genesis)
{
	var newView = new oFF.SuYouTubePlayerView();
	newView.setupPlayer(genesis);
	return newView;
};
oFF.SuYouTubePlayerView.prototype.m_playerHtml = null;
oFF.SuYouTubePlayerView.prototype.m_currentVideoId = null;
oFF.SuYouTubePlayerView.prototype.m_isPlayerHidden = false;
oFF.SuYouTubePlayerView.prototype.m_isLoopEnabled = false;
oFF.SuYouTubePlayerView.prototype.m_isMuted = false;
oFF.SuYouTubePlayerView.prototype.releaseObject = function()
{
	this.m_playerHtml = oFF.XObjectExt.release(this.m_playerHtml);
	oFF.DfUiContentView.prototype.releaseObject.call( this );
};
oFF.SuYouTubePlayerView.prototype.destroyView = function() {};
oFF.SuYouTubePlayerView.prototype.setupPlayer = function(genesis)
{
	oFF.DfUiContentView.prototype.initView.call( this , genesis);
};
oFF.SuYouTubePlayerView.prototype.setupView = function()
{
	this.m_isPlayerHidden = false;
	this.m_isLoopEnabled = false;
	this.m_isMuted = false;
};
oFF.SuYouTubePlayerView.prototype.buildViewUi = function(genesis)
{
	this.m_playerHtml = genesis.newRoot(oFF.UiType.HTML);
	this.m_playerHtml.useMaxSpace();
};
oFF.SuYouTubePlayerView.prototype.playVideo = function(videoId)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(videoId))
	{
		this.m_currentVideoId = videoId;
		this.playVideoInternal(videoId);
	}
};
oFF.SuYouTubePlayerView.prototype.stop = function()
{
	this.m_playerHtml.setValue(null);
};
oFF.SuYouTubePlayerView.prototype.setPlayerHidden = function(hidden)
{
	this.m_isPlayerHidden = hidden;
	this.rePlayIfNeeded();
};
oFF.SuYouTubePlayerView.prototype.setLoopEnabled = function(loopEnabled)
{
	this.m_isLoopEnabled = loopEnabled;
	this.rePlayIfNeeded();
};
oFF.SuYouTubePlayerView.prototype.setMuted = function(muted)
{
	this.m_isMuted = muted;
	this.rePlayIfNeeded();
};
oFF.SuYouTubePlayerView.prototype.getCurrentVideoId = function()
{
	return this.m_currentVideoId;
};
oFF.SuYouTubePlayerView.prototype.isPlayerHidden = function()
{
	return this.m_isPlayerHidden;
};
oFF.SuYouTubePlayerView.prototype.isLoopEnabled = function()
{
	return this.m_isLoopEnabled;
};
oFF.SuYouTubePlayerView.prototype.isMuted = function()
{
	return this.m_isMuted;
};
oFF.SuYouTubePlayerView.prototype.isPlaying = function()
{
	return oFF.notNull(this.m_playerHtml);
};
oFF.SuYouTubePlayerView.prototype.playVideoInternal = function(videoId)
{
	if (this.isPlaying())
	{
		this.stop();
	}
	var videoPlayerStr = oFF.SuYouTubePlayerView.YOUTUBE_PLAYER_TEMPLATE;
	if (oFF.XString.containsString(videoId, ","))
	{
		videoPlayerStr = oFF.XString.replace(oFF.SuYouTubePlayerView.YOUTUBE_PLAYER_TEMPLATE, "{VIDEO_ID}", "watch");
		var tmpPlaylistStr = oFF.XStringUtils.concatenate2("&playlist=", videoId);
		videoPlayerStr = oFF.XString.replace(videoPlayerStr, "{PLAYLIST}", tmpPlaylistStr);
	}
	else
	{
		videoPlayerStr = oFF.XString.replace(oFF.SuYouTubePlayerView.YOUTUBE_PLAYER_TEMPLATE, "{VIDEO_ID}", videoId);
	}
	videoPlayerStr = this.applyMutedIfNeeded(videoPlayerStr);
	videoPlayerStr = this.applyLoopIfNeeded(videoPlayerStr);
	videoPlayerStr = this.applyHiddenIfNeeded(videoPlayerStr);
	this.m_playerHtml.setValue(videoPlayerStr);
};
oFF.SuYouTubePlayerView.prototype.applyMutedIfNeeded = function(iframeVideoStr)
{
	var mutedStr = this.isMuted() ? "&mute=1" : "";
	return oFF.XString.replace(iframeVideoStr, "{MUTE}", mutedStr);
};
oFF.SuYouTubePlayerView.prototype.applyLoopIfNeeded = function(iframeVideoStr)
{
	var loopStr = this.isLoopEnabled() ? "&loop=1" : "";
	return oFF.XString.replace(iframeVideoStr, "{LOOP}", loopStr);
};
oFF.SuYouTubePlayerView.prototype.applyHiddenIfNeeded = function(iframeVideoStr)
{
	var hideStr = this.isPlayerHidden() ? "hidden" : "";
	return oFF.XString.replace(iframeVideoStr, "{HIDDEN}", hideStr);
};
oFF.SuYouTubePlayerView.prototype.rePlayIfNeeded = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_currentVideoId))
	{
		this.playVideoInternal(this.m_currentVideoId);
	}
};

oFF.SubSysCredentialsProviderPrg = function() {};
oFF.SubSysCredentialsProviderPrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysCredentialsProviderPrg.prototype._ff_c = "SubSysCredentialsProviderPrg";

oFF.SubSysCredentialsProviderPrg.DEFAULT_PROGRAM_NAME = "@SubSys.CredentialsProvider";
oFF.SubSysCredentialsProviderPrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysCredentialsProviderPrg();
	prg.setup();
	return prg;
};
oFF.SubSysCredentialsProviderPrg.prototype.getProgramName = function()
{
	return oFF.SubSysCredentialsProviderPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysCredentialsProviderPrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.CREDENTIALS_PROVIDER;
};
oFF.SubSysCredentialsProviderPrg.prototype.getMainApi = function()
{
	return this;
};
oFF.SubSysCredentialsProviderPrg.prototype.getAdminApi = function()
{
	return this;
};
oFF.SubSysCredentialsProviderPrg.prototype.runProcess = function()
{
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return true;
};
oFF.SubSysCredentialsProviderPrg.prototype.processGetCredentials = function(syncType, listener, customIdentifier, connection, credentialsCallCounter, response, messages, changedType)
{
	return oFF.UiCredentialsProviderSyncAction.createAndRun(this, syncType, listener, customIdentifier, connection, credentialsCallCounter, response, messages, changedType);
};
oFF.SubSysCredentialsProviderPrg.prototype.notifyCredentialsSuccess = function(connection)
{
	oFF.UiCredentialsProviderSyncAction.notifyAuthenticationSuccessful(connection.getSystemName());
	var systemDescription = connection.getSystemDescription();
	var fpaKeepAlive = systemDescription.getProperties().getIntegerByKeyExt(oFF.ConnectionParameters.FPA_KEEP_ALIVE_INTERVAL, -1);
	if (fpaKeepAlive !== -1)
	{
		systemDescription.setKeepAliveDelayMs(fpaKeepAlive);
		systemDescription.setKeepAliveIntervalMs(fpaKeepAlive);
	}
	systemDescription.setConnected(true);
	if (this.getSession().getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_REMOVE_CREDENTIALS_AFTER_LOGIN, false) && systemDescription.getAuthenticationType().isEqualTo(oFF.AuthenticationType.BASIC))
	{
		systemDescription.setUser(null);
		systemDescription.setPassword(null);
	}
};
oFF.SubSysCredentialsProviderPrg.prototype.supportsOnErrorHandling = function()
{
	return true;
};
oFF.SubSysCredentialsProviderPrg.prototype.getRuntimeUserManager = function()
{
	return this.getProcess().getUserManager();
};

oFF.SuExportCsvView = function() {};
oFF.SuExportCsvView.prototype = new oFF.SuExportAbstractView();
oFF.SuExportCsvView.prototype._ff_c = "SuExportCsvView";

oFF.SuExportCsvView.COMMA = ",";
oFF.SuExportCsvView.SEMICOLON = ";";
oFF.SuExportCsvView.TAB = "\t";
oFF.SuExportCsvView.SPACE = " ";
oFF.SuExportCsvView.DOT = ".";
oFF.SuExportCsvView.COLON = ":";
oFF.SuExportCsvView.DASH = "-";
oFF.SuExportCsvView.create = function(genesis, config)
{
	var obj = new oFF.SuExportCsvView();
	obj.m_config = config;
	obj.m_csvConfig = config;
	obj.initView(genesis);
	return obj;
};
oFF.SuExportCsvView.prototype.m_csvConfig = null;
oFF.SuExportCsvView.prototype.setupView = function() {};
oFF.SuExportCsvView.prototype.buildViewUi = function(genesis)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_root = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.addNameLayout();
	var delimiterLayout = this.addVerticalLayout();
	var delimiterLabel = delimiterLayout.addNewItemOfType(oFF.UiType.LABEL);
	delimiterLabel.setText(i18nProvider.getText(oFF.SuExportI18n.DELIMITER));
	delimiterLabel.setWidth(oFF.UiCssLength.create("100%"));
	var delimiterDropdown = delimiterLayout.addNewItemOfType(oFF.UiType.DROPDOWN).registerOnSelect(oFF.UiLambdaSelectListener.create( function(delimiterEvent){
		this.m_csvConfig.setDelimiter(delimiterEvent.getControl().getSelectedItem().getName());
	}.bind(this)));
	delimiterDropdown.setEditable(true);
	delimiterDropdown.setWidth(oFF.UiCssLength.create("35%"));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.COMMA).setText(i18nProvider.getText(oFF.SuExportI18n.COMMA_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.COMMA_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.SEMICOLON).setText(i18nProvider.getText(oFF.SuExportI18n.SEMI_COLON_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.SEMI_COLON_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.TAB).setText(i18nProvider.getText(oFF.SuExportI18n.TAB_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.TAB_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.SPACE).setText(i18nProvider.getText(oFF.SuExportI18n.SPACE_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.SPACE_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.DOT).setText(i18nProvider.getText(oFF.SuExportI18n.DOT_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.DOT_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.COLON).setText(i18nProvider.getText(oFF.SuExportI18n.COLON_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.COLON_DELIMITER));
	delimiterDropdown.addNewItem().setName(oFF.SuExportCsvView.DASH).setText(i18nProvider.getText(oFF.SuExportI18n.DASH_DELIMITER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.DASH_DELIMITER));
	delimiterDropdown.setSelectedItemByIndex(0);
	delimiterDropdown.setBorderStyle(oFF.UiBorderStyle.SOLID);
	delimiterDropdown.setBorderWidth(oFF.UiCssBoxEdges.create("0.1em"));
	genesis.setRoot(this.m_root);
};

oFF.SuExportFullOptionsView = function() {};
oFF.SuExportFullOptionsView.prototype = new oFF.SuExportAbstractView();
oFF.SuExportFullOptionsView.prototype._ff_c = "SuExportFullOptionsView";

oFF.SuExportFullOptionsView.create = function(genesis, fileName)
{
	var obj = new oFF.SuExportFullOptionsView();
	obj.initView(genesis);
	obj.m_fileName = fileName;
	return obj;
};
oFF.SuExportFullOptionsView.prototype.m_csvView = null;
oFF.SuExportFullOptionsView.prototype.m_xlsxView = null;
oFF.SuExportFullOptionsView.prototype.m_pdfView = null;
oFF.SuExportFullOptionsView.prototype.m_currentView = null;
oFF.SuExportFullOptionsView.prototype.m_fileName = null;
oFF.SuExportFullOptionsView.prototype.setupView = function()
{
	this.m_csvView = oFF.SuExportCsvView.create(this.getGenesis(), oFF.CsvConfig.createDefault(oFF.PrFactory.createStructure(), this.m_fileName));
	this.m_xlsxView = oFF.SuExportSpreadSheetView.create(this.getGenesis(), oFF.XlsConfig.createDefault(oFF.PrFactory.createStructure(), this.m_fileName));
	this.m_pdfView = oFF.SuExportPDFView.create(this.getGenesis(), oFF.PdfConfig.createDefault(oFF.PrFactory.createStructure(), this.m_fileName));
	this.m_currentView = this.m_csvView;
	this.m_csvView.getView().setVisible(false);
	this.m_xlsxView.getView().setVisible(false);
	this.m_pdfView.getView().setVisible(false);
};
oFF.SuExportFullOptionsView.prototype.buildViewUi = function(genesis)
{
	this.m_root = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	var typeOptionsLayout = this.addVerticalLayout();
	typeOptionsLayout.setMargin(oFF.UiCssBoxEdges.create("0 0 20px 0"));
	var typeLabel = typeOptionsLayout.addNewItemOfType(oFF.UiType.LABEL);
	typeLabel.setText("File Type");
	typeLabel.setWidth(oFF.UiCssLength.create("100%"));
	var typeDropdown = typeOptionsLayout.addNewItemOfType(oFF.UiType.DROPDOWN);
	typeDropdown.registerOnSelect(oFF.UiLambdaSelectListener.create( function(typeEvent){
		var selection = typeEvent.getControl().getSelectedItem().getName();
		if (oFF.XString.isEqual(selection, oFF.BaseExportConfig.CSV_EXPORT))
		{
			this.m_currentView.getView().setVisible(false);
			this.m_currentView = this.m_csvView;
			this.m_csvView.getView().setVisible(true);
		}
		else if (oFF.XString.isEqual(selection, oFF.BaseExportConfig.XLSX_EXPORT))
		{
			this.m_currentView.getView().setVisible(false);
			this.m_currentView = this.m_xlsxView;
			this.m_xlsxView.getView().setVisible(true);
		}
		else if (oFF.XString.isEqual(selection, oFF.BaseExportConfig.PDF_EXPORT))
		{
			this.m_currentView.getView().setVisible(false);
			this.m_currentView = this.m_pdfView;
			this.m_pdfView.getView().setVisible(true);
		}
	}.bind(this)));
	typeDropdown.setWidth(oFF.UiCssLength.create("100%"));
	typeDropdown.addNewItem().setName(oFF.BaseExportConfig.CSV_EXPORT).setText(oFF.BaseExportConfig.CSV_EXPORT).setTooltip(oFF.BaseExportConfig.CSV_EXPORT);
	typeDropdown.addNewItem().setName(oFF.BaseExportConfig.PDF_EXPORT).setText(oFF.BaseExportConfig.PDF_EXPORT).setTooltip(oFF.BaseExportConfig.PDF_EXPORT);
	typeDropdown.addNewItem().setName(oFF.BaseExportConfig.XLSX_EXPORT).setText(oFF.BaseExportConfig.XLSX_EXPORT).setTooltip(oFF.BaseExportConfig.XLSX_EXPORT);
	var subLayout = this.addVerticalLayout();
	this.m_csvView.getView().setVisible(true);
	subLayout.addItem(this.m_csvView.getView());
	subLayout.addItem(this.m_pdfView.getView());
	subLayout.addItem(this.m_xlsxView.getView());
	genesis.setRoot(this.m_root);
};
oFF.SuExportFullOptionsView.prototype.releaseObject = function()
{
	this.m_root = oFF.XObjectExt.release(this.m_root);
	this.m_csvView = oFF.XObjectExt.release(this.m_csvView);
	this.m_xlsxView = oFF.XObjectExt.release(this.m_xlsxView);
	this.m_pdfView = oFF.XObjectExt.release(this.m_pdfView);
	oFF.SuExportAbstractView.prototype.releaseObject.call( this );
};

oFF.SuExportPDFView = function() {};
oFF.SuExportPDFView.prototype = new oFF.SuExportAbstractView();
oFF.SuExportPDFView.prototype._ff_c = "SuExportPDFView";

oFF.SuExportPDFView.create = function(genesis, config)
{
	var obj = new oFF.SuExportPDFView();
	obj.m_config = config;
	obj.m_pdfConfig = config;
	obj.initView(genesis);
	return obj;
};
oFF.SuExportPDFView.prototype.m_pdfConfig = null;
oFF.SuExportPDFView.prototype.setupView = function() {};
oFF.SuExportPDFView.prototype.buildViewUi = function(genesis)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_root = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.addNameLayout();
	var optionsLayout = this.m_root.addNewItemOfType(oFF.UiType.VERTICAL_LAYOUT);
	optionsLayout.setMargin(oFF.UiCssBoxEdges.create("0.5em 0 0.3em 0"));
	optionsLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	optionsLayout.setWidth(oFF.UiCssLength.create("100%"));
	optionsLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	optionsLayout.setFlex("1");
	var optionsLabel = optionsLayout.addNewItemOfType(oFF.UiType.LABEL);
	optionsLabel.setText(i18nProvider.getText(oFF.SuExportI18n.SETTINGS));
	optionsLabel.setWidth(oFF.UiCssLength.create("100%"));
	optionsLabel.setFontSize(oFF.UiCssLength.create("1em"));
	optionsLayout.setBorderStyle(oFF.UiBorderStyle.NONE);
	var orientationLayout = this.addVerticalLayout();
	var orientationLabel = orientationLayout.addNewItemOfType(oFF.UiType.LABEL);
	orientationLabel.setText(i18nProvider.getText(oFF.SuExportI18n.ORIENTATION));
	orientationLabel.setWidth(oFF.UiCssLength.create("100%"));
	var orientationDropdown = orientationLayout.addNewItemOfType(oFF.UiType.DROPDOWN).registerOnSelect(oFF.UiLambdaSelectListener.create( function(orientationEvent){
		this.m_pdfConfig.setOrientation(orientationEvent.getControl().getSelectedItem().getName());
	}.bind(this)));
	orientationDropdown.setEditable(true);
	orientationDropdown.setWidth(oFF.UiCssLength.create("100%"));
	orientationDropdown.addNewItem().setName(oFF.PdfConfig.PDF_ORIENT_LANDSCAPE).setText(i18nProvider.getText(oFF.SuExportI18n.LANDSCAPE)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.LANDSCAPE));
	orientationDropdown.addNewItem().setName(oFF.PdfConfig.PDF_ORIENT_PORTRAIT).setText(i18nProvider.getText(oFF.SuExportI18n.PORTRAIT)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.PORTRAIT));
	orientationDropdown.setBorderStyle(oFF.UiBorderStyle.SOLID);
	orientationDropdown.setBorderWidth(oFF.UiCssBoxEdges.create("0.1em"));
	var paperLayout = this.addVerticalLayout();
	var paperLabel = paperLayout.addNewItemOfType(oFF.UiType.LABEL);
	paperLabel.setText(i18nProvider.getText(oFF.SuExportI18n.PAPER_SIZE));
	paperLabel.setWidth(oFF.UiCssLength.create("100%"));
	var paperDropdown = paperLayout.addNewItemOfType(oFF.UiType.DROPDOWN).registerOnSelect(oFF.UiLambdaSelectListener.create( function(paperEvent){
		this.m_pdfConfig.setPageSize(paperEvent.getControl().getSelectedItem().getName());
	}.bind(this)));
	paperDropdown.setEditable(true);
	paperDropdown.setWidth(oFF.UiCssLength.create("100%"));
	paperDropdown.addNewItem().setName("A2").setText("A2").setTooltip("A2");
	paperDropdown.addNewItem().setName("A3").setText("A3").setTooltip("A3");
	paperDropdown.addNewItem().setName("A4").setText("A4").setTooltip("A4");
	paperDropdown.addNewItem().setName("A5").setText("A5").setTooltip("A5");
	paperDropdown.addNewItem().setName("LETTER").setText("Letter").setTooltip("Letter");
	paperDropdown.addNewItem().setName("LEGAL").setText("Legal").setTooltip("Legal");
	paperDropdown.setSelectedItemByIndex(2);
	paperDropdown.setBorderStyle(oFF.UiBorderStyle.SOLID);
	paperDropdown.setBorderWidth(oFF.UiCssBoxEdges.create("0.1em"));
	var pageNumberLocationLayout = this.addVerticalLayout();
	var pageNumberLocationLabel = pageNumberLocationLayout.addNewItemOfType(oFF.UiType.LABEL);
	pageNumberLocationLabel.setText(i18nProvider.getText(oFF.SuExportI18n.PAGE_NUMBER_LOCATION));
	pageNumberLocationLabel.setWidth(oFF.UiCssLength.create("100%"));
	var pageNumberLocationDropdown = pageNumberLocationLayout.addNewItemOfType(oFF.UiType.DROPDOWN).registerOnSelect(oFF.UiLambdaSelectListener.create( function(pageNumberLocationEvent){
		this.m_pdfConfig.setNumberLocation(pageNumberLocationEvent.getControl().getSelectedItem().getName());
	}.bind(this)));
	pageNumberLocationDropdown.setEditable(true);
	pageNumberLocationDropdown.setWidth(oFF.UiCssLength.create("100%"));
	pageNumberLocationDropdown.addNewItem().setName("none").setText(i18nProvider.getText(oFF.SuExportI18n.NONE)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.NONE));
	pageNumberLocationDropdown.addNewItem().setName("header").setText(i18nProvider.getText(oFF.SuExportI18n.HEADER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.HEADER));
	pageNumberLocationDropdown.addNewItem().setName("footer").setText(i18nProvider.getText(oFF.SuExportI18n.FOOTER)).setTooltip(i18nProvider.getText(oFF.SuExportI18n.FOOTER));
	pageNumberLocationDropdown.setSelectedItemByIndex(0);
	pageNumberLocationDropdown.setBorderStyle(oFF.UiBorderStyle.SOLID);
	pageNumberLocationDropdown.setBorderWidth(oFF.UiCssBoxEdges.create("0.1em"));
	genesis.setRoot(this.m_root);
};

oFF.SuExportSpreadSheetView = function() {};
oFF.SuExportSpreadSheetView.prototype = new oFF.SuExportAbstractView();
oFF.SuExportSpreadSheetView.prototype._ff_c = "SuExportSpreadSheetView";

oFF.SuExportSpreadSheetView.create = function(genesis, config)
{
	var obj = new oFF.SuExportSpreadSheetView();
	obj.m_config = config;
	obj.initView(genesis);
	return obj;
};
oFF.SuExportSpreadSheetView.prototype.setupView = function() {};
oFF.SuExportSpreadSheetView.prototype.buildViewUi = function(genesis)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.m_root = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.addNameLayout();
	var expandHierarchyLayout = this.addFlexLayout(oFF.UiFlexDirection.ROW);
	expandHierarchyLayout.addNewItemOfType(oFF.UiType.CHECKBOX).setText(i18nProvider.getText(oFF.SuExportI18n.EXPAND_HIERARCHY)).registerOnChange(oFF.UiLambdaChangeListener.create( function(expandEvent){
		this.m_config.setExpandHierarchy(expandEvent.getControl().isChecked());
	}.bind(this)));
	genesis.setRoot(this.m_root);
};

oFF.SuVulcanViewType = function() {};
oFF.SuVulcanViewType.prototype = new oFF.UiBaseConstant();
oFF.SuVulcanViewType.prototype._ff_c = "SuVulcanViewType";

oFF.SuVulcanViewType.CONTROLS = null;
oFF.SuVulcanViewType.CONSTANTS = null;
oFF.SuVulcanViewType.ICON_EXPLORER = null;
oFF.SuVulcanViewType.POPUPS = null;
oFF.SuVulcanViewType.SAMPLES = null;
oFF.SuVulcanViewType.s_lookup = null;
oFF.SuVulcanViewType.staticSetup = function()
{
	if (oFF.isNull(oFF.SuVulcanViewType.s_lookup))
	{
		oFF.SuVulcanViewType.s_lookup = oFF.XLinkedHashMapByString.create();
		oFF.SuVulcanViewType.CONTROLS = oFF.SuVulcanViewType.createExt("Controls", "Controls", "A list of available ui controls", "background", oFF.UiColor.create("#FA7445"), oFF.XClass.create(oFF.SuVulcanControlsView));
		oFF.SuVulcanViewType.CONSTANTS = oFF.SuVulcanViewType.createExt("Constants", "Constants", "A list of available ui constants", "locked", oFF.UiColor.create("#AB218E"), oFF.XClass.create(oFF.SuVulcanConstantsView));
		oFF.SuVulcanViewType.ICON_EXPLORER = oFF.SuVulcanViewType.createExt("IconExplorer", "Icon Explorer", "A list of available icons", "explorer", oFF.UiColor.create("#007db2"), oFF.XClass.create(oFF.SuVulcanIconExplorerView));
		oFF.SuVulcanViewType.POPUPS = oFF.SuVulcanViewType.createExt("Popups", "Popups", "Available reusable popups", "popup-window", oFF.UiColor.create("#685C88"), oFF.XClass.create(oFF.SuVulcanPopupsView));
		oFF.SuVulcanViewType.SAMPLES = oFF.SuVulcanViewType.createExt("Samples", "Samples", "Ui samples", "widgets", oFF.UiColor.create("#4de3ac"), oFF.XClass.create(oFF.SuVulcanSamplesView));
	}
};
oFF.SuVulcanViewType.create = function(name)
{
	var newConstant = oFF.UiBaseConstant.createUiConstant(new oFF.SuVulcanViewType(), name, oFF.SuVulcanViewType.s_lookup);
	return newConstant;
};
oFF.SuVulcanViewType.createExt = function(name, displayName, description, icon, accentColor, viewClass)
{
	var newConstant = oFF.SuVulcanViewType.create(name);
	newConstant.m_displayName = displayName;
	newConstant.m_description = description;
	newConstant.m_icon = icon;
	newConstant.m_accentColor = accentColor;
	newConstant.m_viewClass = viewClass;
	return newConstant;
};
oFF.SuVulcanViewType.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.SuVulcanViewType.s_lookup);
};
oFF.SuVulcanViewType.getAllTypes = function()
{
	return oFF.SuVulcanViewType.s_lookup.getValuesAsReadOnlyList();
};
oFF.SuVulcanViewType.prototype.m_displayName = null;
oFF.SuVulcanViewType.prototype.m_description = null;
oFF.SuVulcanViewType.prototype.m_icon = null;
oFF.SuVulcanViewType.prototype.m_accentColor = null;
oFF.SuVulcanViewType.prototype.m_viewClass = null;
oFF.SuVulcanViewType.prototype.getDisplayName = function()
{
	return this.m_displayName;
};
oFF.SuVulcanViewType.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.SuVulcanViewType.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.SuVulcanViewType.prototype.getAccentColor = function()
{
	return this.m_accentColor;
};
oFF.SuVulcanViewType.prototype.getViewClass = function()
{
	return this.m_viewClass;
};

oFF.SuVulcanSampleType = function() {};
oFF.SuVulcanSampleType.prototype = new oFF.UiBaseConstant();
oFF.SuVulcanSampleType.prototype._ff_c = "SuVulcanSampleType";

oFF.SuVulcanSampleType.CONTROL = null;
oFF.SuVulcanSampleType.WIDGET = null;
oFF.SuVulcanSampleType.VIEW = null;
oFF.SuVulcanSampleType.DIALOG = null;
oFF.SuVulcanSampleType.s_lookup = null;
oFF.SuVulcanSampleType.staticSetup = function()
{
	oFF.SuVulcanSampleType.s_lookup = oFF.XHashMapByString.create();
	oFF.SuVulcanSampleType.CONTROL = oFF.SuVulcanSampleType.create("Control");
	oFF.SuVulcanSampleType.WIDGET = oFF.SuVulcanSampleType.create("Widget");
	oFF.SuVulcanSampleType.VIEW = oFF.SuVulcanSampleType.create("View");
	oFF.SuVulcanSampleType.DIALOG = oFF.SuVulcanSampleType.create("Dialog");
};
oFF.SuVulcanSampleType.create = function(name)
{
	return oFF.UiBaseConstant.createUiConstant(new oFF.SuVulcanSampleType(), name, oFF.SuVulcanSampleType.s_lookup);
};
oFF.SuVulcanSampleType.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.SuVulcanSampleType.s_lookup);
};

oFF.SuVulcanCredentialsDialogSample = function() {};
oFF.SuVulcanCredentialsDialogSample.prototype = new oFF.SuDfVulcanSampleView();
oFF.SuVulcanCredentialsDialogSample.prototype._ff_c = "SuVulcanCredentialsDialogSample";

oFF.SuVulcanCredentialsDialogSample.prototype.m_uiCredentialsDialogPrg = null;
oFF.SuVulcanCredentialsDialogSample.prototype.buildViewUi = function(genesis)
{
	var layout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	layout.setPadding(oFF.UiCssBoxEdges.create("15px"));
	var openCredDialog = genesis.newControl(oFF.UiType.BUTTON);
	openCredDialog.setName("openCredDialog");
	openCredDialog.setText("Open Credentials Dialog");
	openCredDialog.registerOnPress(this);
	layout.addItem(openCredDialog);
	genesis.setRoot(layout);
};
oFF.SuVulcanCredentialsDialogSample.prototype.newSampleView = function(genesis)
{
	var newSampleView = new oFF.SuVulcanCredentialsDialogSample();
	newSampleView.initView(genesis);
	return newSampleView;
};
oFF.SuVulcanCredentialsDialogSample.prototype.setupView = function() {};
oFF.SuVulcanCredentialsDialogSample.prototype.destroyView = function() {};
oFF.SuVulcanCredentialsDialogSample.prototype.getDisplayName = function()
{
	return "Credentials Dialog";
};
oFF.SuVulcanCredentialsDialogSample.prototype.getDescription = function()
{
	return "Credentials Dialog";
};
oFF.SuVulcanCredentialsDialogSample.prototype.getType = function()
{
	return oFF.SuVulcanSampleType.DIALOG;
};
oFF.SuVulcanCredentialsDialogSample.prototype.getName = function()
{
	return "CredentialsDialogSample";
};
oFF.SuVulcanCredentialsDialogSample.prototype.onPress = function(event)
{
	if (oFF.XString.isEqual(event.getControl().getName(), "openCredDialog"))
	{
		var process = this.getGenesis().getUiManager().getProcess();
		var properties = oFF.XProperties.create();
		var systemDescription = oFF.SystemDescription.create(null, "dummySystem", properties);
		var uiCredentialsDialogRunner = oFF.ProgramRunner.createRunner(process, oFF.UiCredentialsDialogPrg.DEFAULT_PROGRAM_NAME);
		uiCredentialsDialogRunner.setObjectArgument(oFF.UiCredentialsDialogPrg.PARAM_SYSTEM, systemDescription);
		uiCredentialsDialogRunner.setObjectArgument(oFF.UiCredentialsDialogPrg.PARAM_LISTENER, this);
		uiCredentialsDialogRunner.runProgram().then( function(prg){
			this.m_uiCredentialsDialogPrg = prg;
			return prg;
		}.bind(this),  function(errMsg){
			this.getGenesis().showErrorToast(errMsg.getText());
		}.bind(this));
	}
};
oFF.SuVulcanCredentialsDialogSample.prototype.onLogin = function(username, password)
{
	if (oFF.isNull(this.m_uiCredentialsDialogPrg))
	{
		return;
	}
	if (oFF.XString.isEqual(username, "anzeiger") && oFF.XString.isEqual(password, "display"))
	{
		oFF.XTimeout.timeout(1000,  function(){
			this.m_uiCredentialsDialogPrg.notifyAuthenticationSuccessful();
			this.getGenesis().showSuccessToast("Login successful.");
		}.bind(this));
	}
	else
	{
		oFF.XTimeout.timeout(1000,  function(){
			this.m_uiCredentialsDialogPrg.notifyAuthenticationFailed(this, true);
		}.bind(this));
	}
};
oFF.SuVulcanCredentialsDialogSample.prototype.onCancel = function()
{
	this.m_uiCredentialsDialogPrg = null;
	this.getGenesis().showInfoToast("Authentication canceled.");
};

oFF.SuVulcanSideNavigationViewSample = function() {};
oFF.SuVulcanSideNavigationViewSample.prototype = new oFF.SuDfVulcanSampleView();
oFF.SuVulcanSideNavigationViewSample.prototype._ff_c = "SuVulcanSideNavigationViewSample";

oFF.SuVulcanSideNavigationViewSample.prototype.newSampleView = function(genesis)
{
	var newSampleView = new oFF.SuVulcanSideNavigationViewSample();
	newSampleView.initView(genesis);
	return newSampleView;
};
oFF.SuVulcanSideNavigationViewSample.prototype.getName = function()
{
	return "SideNavigationViewSample";
};
oFF.SuVulcanSideNavigationViewSample.prototype.getDisplayName = function()
{
	return "Side Navigation View";
};
oFF.SuVulcanSideNavigationViewSample.prototype.getDescription = function()
{
	return "A side navigation view sample";
};
oFF.SuVulcanSideNavigationViewSample.prototype.getType = function()
{
	return oFF.SuVulcanSampleType.VIEW;
};
oFF.SuVulcanSideNavigationViewSample.prototype.destroyView = function() {};
oFF.SuVulcanSideNavigationViewSample.prototype.setupView = function() {};
oFF.SuVulcanSideNavigationViewSample.prototype.buildViewUi = function(genesis)
{
	var view = oFF.SuSideNavigationView.create(genesis);
	view.addSideNavigationItem(genesis.newControl(oFF.UiType.BUTTON).setText("Panel type 1"), "Type1", "accept", "Panel type 1");
	view.addSideNavigationItem(genesis.newControl(oFF.UiType.BUTTON).setText("Panel type 2"), "Type2", "decline", "Panel type 2");
	view.addSideNavigationItem(genesis.newControl(oFF.UiType.BUTTON).setText("Panel type 3"), "Type3", "feedback", "Panel type 3");
	genesis.setRoot(view.getView());
};

oFF.SuVulcanSimpleButtonSample = function() {};
oFF.SuVulcanSimpleButtonSample.prototype = new oFF.SuDfVulcanSampleView();
oFF.SuVulcanSimpleButtonSample.prototype._ff_c = "SuVulcanSimpleButtonSample";

oFF.SuVulcanSimpleButtonSample.prototype.newSampleView = function(genesis)
{
	var newSampleView = new oFF.SuVulcanSimpleButtonSample();
	newSampleView.initView(genesis);
	return newSampleView;
};
oFF.SuVulcanSimpleButtonSample.prototype.getName = function()
{
	return "SimpleButtonSample";
};
oFF.SuVulcanSimpleButtonSample.prototype.getDisplayName = function()
{
	return "Simple Button";
};
oFF.SuVulcanSimpleButtonSample.prototype.getDescription = function()
{
	return "A very simple button sample";
};
oFF.SuVulcanSimpleButtonSample.prototype.getType = function()
{
	return oFF.SuVulcanSampleType.CONTROL;
};
oFF.SuVulcanSimpleButtonSample.prototype.destroyView = function() {};
oFF.SuVulcanSimpleButtonSample.prototype.setupView = function() {};
oFF.SuVulcanSimpleButtonSample.prototype.buildViewUi = function(genesis)
{
	var newButton = genesis.newControl(oFF.UiType.BUTTON);
	newButton.setText("Sample button");
	newButton.registerOnPress(oFF.UiLambdaPressListener.create( function(event){
		this.getGenesis().showInfoToast("Sample works!");
	}.bind(this)));
	genesis.setRoot(newButton);
};

oFF.SuTableColumnSelectionButton = function() {};
oFF.SuTableColumnSelectionButton.prototype = new oFF.SuDfUiWidgetEventHandler();
oFF.SuTableColumnSelectionButton.prototype._ff_c = "SuTableColumnSelectionButton";

oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_ID = "id";
oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_TEXT = "text";
oFF.SuTableColumnSelectionButton.create = function(selectableColumns, columnSettings, localStorageKey, tooltip)
{
	var btn = new oFF.SuTableColumnSelectionButton();
	btn.m_selectableColumns = selectableColumns;
	btn.m_columnSettings = oFF.notNull(columnSettings) ? columnSettings : oFF.PrStructure.create();
	btn.m_tooltip = tooltip;
	btn.m_localStorageKey = localStorageKey;
	return btn;
};
oFF.SuTableColumnSelectionButton.prototype.m_selectableColumns = null;
oFF.SuTableColumnSelectionButton.prototype.m_columnSettings = null;
oFF.SuTableColumnSelectionButton.prototype.m_localStorageKey = null;
oFF.SuTableColumnSelectionButton.prototype.m_tooltip = null;
oFF.SuTableColumnSelectionButton.prototype.attachOnItemPress = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_ITEM_PRESS, consumer);
};
oFF.SuTableColumnSelectionButton.prototype.detachOnItemPress = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_ITEM_PRESS, consumer);
};
oFF.SuTableColumnSelectionButton.prototype.getConsumersOnItemPress = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_ITEM_PRESS);
};
oFF.SuTableColumnSelectionButton.prototype.getWidgetControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.MENU_BUTTON);
};
oFF.SuTableColumnSelectionButton.prototype.layoutWidget = function(widgetControl)
{
	if (oFF.isNull(this.m_selectableColumns) || this.m_selectableColumns.size() === 0)
	{
		widgetControl.setVisible(false);
	}
	else
	{
		widgetControl.setVisible(true);
		widgetControl.setIcon("fpa/columns");
		widgetControl.setButtonType(oFF.UiButtonType.TRANSPARENT);
		widgetControl.addCssClass("ffReTableColumnSelectionMenuBtn");
		if (oFF.notNull(this.m_tooltip))
		{
			widgetControl.setTooltip(this.m_tooltip);
		}
		var columnButtonMenu = this.getGenesis().newControl(oFF.UiType.MENU);
		columnButtonMenu.addCssClass("ffReColumnSelectionMenu");
		for (var i = 0; i < this.m_selectableColumns.size(); i++)
		{
			var column = this.m_selectableColumns.get(i);
			var colId = column.getStringByKey(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_ID);
			var colText = column.getStringByKey(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_TEXT);
			var menuItem = columnButtonMenu.addNewItem();
			menuItem.setText(colText);
			menuItem.setTag(colId);
			menuItem.registerOnPress(this.createUiLambdaPressListener());
			this.setMenuItemToggle(menuItem, this.m_columnSettings.getBooleanByKeyExt(colId, false));
		}
		widgetControl.setMenu(columnButtonMenu);
	}
};
oFF.SuTableColumnSelectionButton.prototype.createUiLambdaPressListener = function()
{
	return oFF.UiLambdaPressListener.create( function(event){
		var columnId = event.getControl().getTag();
		var isVisible = this.getColumnVisibility(columnId);
		this.setColumnVisibile(columnId, !isVisible);
		this.setMenuItemToggle(event.getControl(), !isVisible);
		this.fireOnItemPress(event);
	}.bind(this));
};
oFF.SuTableColumnSelectionButton.prototype.getColumnVisibility = function(colId)
{
	return this.m_columnSettings.getBooleanByKeyExt(colId, false);
};
oFF.SuTableColumnSelectionButton.prototype.setColumnVisibile = function(columnId, isVisible)
{
	this.m_columnSettings.putBoolean(columnId, isVisible);
	if (oFF.notNull(this.m_localStorageKey))
	{
		oFF.SuResourceExplorerLocalStorageManager.saveIPrElement(this.m_localStorageKey, this.m_columnSettings);
	}
};
oFF.SuTableColumnSelectionButton.prototype.setMenuItemToggle = function(menuItem, isTrue)
{
	if (isTrue)
	{
		menuItem.setIcon("accept");
	}
	else
	{
		menuItem.setIcon(null);
	}
};
oFF.SuTableColumnSelectionButton.prototype.fireOnItemPress = function(event)
{
	this.fireEvent(oFF.UiEvent.ON_ITEM_PRESS, event);
};

oFF.SuDatasourceRecentlyUsed = function() {};
oFF.SuDatasourceRecentlyUsed.prototype = new oFF.SuTableViewBase();
oFF.SuDatasourceRecentlyUsed.prototype._ff_c = "SuDatasourceRecentlyUsed";

oFF.SuDatasourceRecentlyUsed.TOOLBAR_REMOVE_BUTTON_CSS = "ffReRecentlyUsedRmvMenuBtn";
oFF.SuDatasourceRecentlyUsed.TOOLBAR_REMOVE_BUTTON_MENU_CSS = "ffReRecentlyUsedRmvMenu";
oFF.SuDatasourceRecentlyUsed.COLUMN_ID_NAME = "id";
oFF.SuDatasourceRecentlyUsed.COLUMN_PACKAGE_NAME = "package";
oFF.SuDatasourceRecentlyUsed.COLUMN_CONNECTION_NAME = "connection";
oFF.SuDatasourceRecentlyUsed.COLUMN_SYSTEM_TYPE_NAME = "systemType";
oFF.SuDatasourceRecentlyUsed.create = function()
{
	var view = new oFF.SuDatasourceRecentlyUsed();
	view.m_dataProvider = oFF.SuDatasourceRecentlyUsed.createProvider();
	view.setup();
	return view;
};
oFF.SuDatasourceRecentlyUsed.createProvider = function()
{
	var provider = oFF.SuLocalDataProvider.createEmpty();
	provider.setComparator(null);
	provider.setCustomFilter( function(datasource, txtToSearch){
		var test = false;
		if (oFF.XStringUtils.isNullOrEmpty(txtToSearch))
		{
			test = true;
		}
		else if (oFF.XStringUtils.containsString(datasource.getDataSourceName(), txtToSearch, true))
		{
			test = true;
		}
		else if (oFF.XStringUtils.containsString(datasource.getSystemType(), txtToSearch, true))
		{
			test = true;
		}
		else if (oFF.XStringUtils.containsString(datasource.getSystemName(), txtToSearch, true))
		{
			test = true;
		}
		return oFF.XBooleanValue.create(test);
	}.bind(this));
	return provider;
};
oFF.SuDatasourceRecentlyUsed.prototype.m_removeSelectionMenuItem = null;
oFF.SuDatasourceRecentlyUsed.prototype.setup = function()
{
	oFF.SuTableViewBase.prototype.setup.call( this );
	this.m_selectableColumnsStorageKey = oFF.SuResourceExplorerLocalStorageManager.DS_RECENTLY_USED_COLUMNS;
	this.initColumnSettings();
	this.initSelectabeColumnList();
};
oFF.SuDatasourceRecentlyUsed.prototype.setupView = function()
{
	oFF.SuTableViewBase.prototype.setupView.call( this );
	this.getView().setName("reDatasourceRecentlyUsed");
	this.getView().addCssClass("ffReDatasourceRecentlyUsedContainer");
};
oFF.SuDatasourceRecentlyUsed.prototype.buildHeader = function()
{
	oFF.SuTableViewBase.prototype.buildHeader.call( this );
	this.m_headerContainer.setVisible(true);
};
oFF.SuDatasourceRecentlyUsed.prototype.buildToolbar = function()
{
	oFF.SuTableViewBase.prototype.buildToolbar.call( this );
	this.buildRemoveRowsMenu(this.m_toolbarContainer);
};
oFF.SuDatasourceRecentlyUsed.prototype.buildTableUI = function()
{
	oFF.SuTableViewBase.prototype.buildTableUI.call( this );
	this.attachOnSelect( function(item){
		if (oFF.notNull(item))
		{
			this.m_removeSelectionMenuItem.setEnabled(true);
		}
	}.bind(this));
};
oFF.SuDatasourceRecentlyUsed.prototype.setList = function(list)
{
	this.m_dataProvider.setFetchFn( function(){
		return oFF.SuDataProviderFetchResult.createList(list);
	}.bind(this));
	this.updateUI();
};
oFF.SuDatasourceRecentlyUsed.prototype.enableSorting = function(enable) {};
oFF.SuDatasourceRecentlyUsed.prototype.initSelectabeColumnList = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.addColumnSelectionConfig(oFF.SuDatasourceRecentlyUsed.COLUMN_SYSTEM_TYPE_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE));
	this.addColumnSelectionConfig(oFF.SuDatasourceRecentlyUsed.COLUMN_CONNECTION_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION));
	this.addColumnSelectionConfig(oFF.SuDatasourceRecentlyUsed.COLUMN_PACKAGE_NAME, i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_PACKAGE));
	if (oFF.notNull(this.m_selectableColumns) && this.m_selectableColumns.size() > 0)
	{
		this.m_selectableColumnsTooltip = i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_COLUMNS_TOOLTIP);
	}
};
oFF.SuDatasourceRecentlyUsed.prototype.initColumnSettings = function()
{
	this.m_columnSettings = oFF.SuResourceExplorerLocalStorageManager.getIPrElement(this.m_selectableColumnsStorageKey).asStructure();
	if (!this.m_columnSettings.hasElements())
	{
		this.m_columnSettings.putBoolean(oFF.SuDatasourceRecentlyUsed.COLUMN_CONNECTION_NAME, true);
		oFF.SuResourceExplorerLocalStorageManager.saveIPrElement(this.m_selectableColumnsStorageKey, this.m_columnSettings);
	}
};
oFF.SuDatasourceRecentlyUsed.prototype.buildRemoveRowsMenu = function(header)
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var removeButton = header.addNewItemOfType(oFF.UiType.MENU_BUTTON);
	removeButton.setIcon("fpa/delete");
	removeButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	removeButton.addCssClass(oFF.SuDatasourceRecentlyUsed.TOOLBAR_REMOVE_BUTTON_CSS);
	removeButton.setTooltip(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_TOOLTIP));
	var removeButtonMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	removeButtonMenu.addCssClass(oFF.SuDatasourceRecentlyUsed.TOOLBAR_REMOVE_BUTTON_MENU_CSS);
	var removeAllMenuItem = removeButtonMenu.addNewItem();
	removeAllMenuItem.setText(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_ALL));
	removeAllMenuItem.registerOnPress(this.createRemoveAllUiLambdaPressListener());
	this.m_removeSelectionMenuItem = removeButtonMenu.addNewItem();
	this.m_removeSelectionMenuItem.setText(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_REMOVE_SELECTION));
	this.m_removeSelectionMenuItem.registerOnPress(this.createRemoveSelectedUiLambdaPressListener());
	this.m_removeSelectionMenuItem.setEnabled(false);
	removeButton.setMenu(removeButtonMenu);
};
oFF.SuDatasourceRecentlyUsed.prototype.addColumnSelectionConfig = function(id, text)
{
	var column = oFF.PrStructure.create().asStructure();
	column.putString(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_ID, id);
	column.putString(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_TEXT, text);
	this.m_selectableColumns.add(column);
};
oFF.SuDatasourceRecentlyUsed.prototype.createRemoveAllUiLambdaPressListener = function()
{
	return oFF.UiLambdaPressListener.create( function(event){
		this.setList(oFF.XList.create());
		this.fireEvent(oFF.UiEvent.ON_DELETE, oFF.XList.create());
		this.m_removeSelectionMenuItem.setEnabled(false);
	}.bind(this));
};
oFF.SuDatasourceRecentlyUsed.prototype.createRemoveSelectedUiLambdaPressListener = function()
{
	return oFF.UiLambdaPressListener.create( function(event){
		var selectedItem = this.m_table.getSelectedItem();
		var recentlyUsedDsList = oFF.XList.create();
		recentlyUsedDsList.addAll(this.m_dataProvider.get());
		this.m_table.removeSelectedItem(selectedItem);
		recentlyUsedDsList.removeElement(selectedItem.getCustomObject());
		this.fireEvent(oFF.UiEvent.ON_DELETE, recentlyUsedDsList);
		this.setList(recentlyUsedDsList);
		this.m_removeSelectionMenuItem.setEnabled(false);
	}.bind(this));
};
oFF.SuDatasourceRecentlyUsed.prototype.onDataFetched = function()
{
	oFF.SuTableViewBase.prototype.onDataFetched.call( this );
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	var totalItems = this.m_dataProvider.getTotalItems();
	var size = totalItems < 0 ? oFF.XIntegerValue.create(0).toString() : oFF.XIntegerValue.create(this.m_dataProvider.getTotalItems()).toString();
	var text = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_TITLE, size);
	this.m_title.setText(text);
};
oFF.SuDatasourceRecentlyUsed.prototype.buildColumns = function()
{
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	this.buildColumn(i18nProvider.getText(oFF.SuResourceExplorerI18n.DETAILS_VIEW_RESOURCE_ID), oFF.SuDatasourceRecentlyUsed.COLUMN_ID_NAME, true);
	this.buildColumn(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_TYPE), oFF.SuDatasourceRecentlyUsed.COLUMN_SYSTEM_TYPE_NAME, this.m_columnSettings.getBooleanByKeyExt(oFF.SuDatasourceRecentlyUsed.COLUMN_SYSTEM_TYPE_NAME, false));
	this.buildColumn(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_CONNECTION), oFF.SuDatasourceRecentlyUsed.COLUMN_CONNECTION_NAME, this.m_columnSettings.getBooleanByKeyExt(oFF.SuDatasourceRecentlyUsed.COLUMN_CONNECTION_NAME, false));
	this.buildColumn(i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_PACKAGE), oFF.SuDatasourceRecentlyUsed.COLUMN_PACKAGE_NAME, this.m_columnSettings.getBooleanByKeyExt(oFF.SuDatasourceRecentlyUsed.COLUMN_PACKAGE_NAME, false));
};
oFF.SuDatasourceRecentlyUsed.prototype.buildColumn = function(text, name, isVisible)
{
	var column = this.m_table.addNewResponsiveTableColumn().setTitle(text);
	column.setName(name);
	column.setVisible(isVisible);
};
oFF.SuDatasourceRecentlyUsed.prototype.getTableRows = function()
{
	var rows = oFF.XList.create();
	var list = this.m_dataProvider.get();
	if (oFF.notNull(list))
	{
		var iterator = list.getIterator();
		while (oFF.notNull(iterator) && iterator.hasNext())
		{
			var datasource = iterator.next();
			var newRow = this.addNewTableRow(datasource);
			rows.add(newRow);
		}
	}
	return rows;
};
oFF.SuDatasourceRecentlyUsed.prototype.addNewTableRow = function(data)
{
	var tableRow = oFF.SuTableViewBase.prototype.addNewTableRow.call( this , data);
	tableRow.setTooltip(oFF.XStringUtils.concatenate3(data.getSystemName(), "-", data.getDataSourceName()));
	var idCell = tableRow.addNewLabelCell();
	idCell.setText(data.getDataSourceName());
	var systemTypeCell = tableRow.addNewLabelCell();
	systemTypeCell.setText(data.getSystemType());
	var connectionCell = tableRow.addNewLabelCell();
	connectionCell.setText(data.getSystemName());
	var packageCell = tableRow.addNewLabelCell();
	packageCell.setText(data.getPackageName());
	return tableRow;
};
oFF.SuDatasourceRecentlyUsed.prototype.detachOnDelete = function(consumer)
{
	this.detachEventConsumer(oFF.UiEvent.ON_DELETE, consumer);
};
oFF.SuDatasourceRecentlyUsed.prototype.getConsumersOnDelete = function()
{
	return this.getEventConsumers(oFF.UiEvent.ON_DELETE);
};
oFF.SuDatasourceRecentlyUsed.prototype.attachOnDelete = function(consumer)
{
	this.attachEventConsumer(oFF.UiEvent.ON_DELETE, consumer);
};

oFF.SuDetailsResourceViewer = function() {};
oFF.SuDetailsResourceViewer.prototype = new oFF.SuTableViewBase();
oFF.SuDetailsResourceViewer.prototype._ff_c = "SuDetailsResourceViewer";

oFF.SuDetailsResourceViewer.SORTABLE_COLUMN_CSS = "ffReDfvSortable";
oFF.SuDetailsResourceViewer.create = function(config, dataProvider)
{
	var view = new oFF.SuDetailsResourceViewer();
	view.m_config = config;
	view.m_helper = oFF.SuDetailsResourceViewerHelper.create(view, config);
	view.m_dataProvider = dataProvider;
	view.setup();
	return view;
};
oFF.SuDetailsResourceViewer.prototype.m_config = null;
oFF.SuDetailsResourceViewer.prototype.m_helper = null;
oFF.SuDetailsResourceViewer.prototype.m_sortableColumn = null;
oFF.SuDetailsResourceViewer.prototype.m_sortEnabled = false;
oFF.SuDetailsResourceViewer.prototype.setup = function()
{
	oFF.SuTableViewBase.prototype.setup.call( this );
	this.m_sortableColumn = oFF.XHashMapByString.create();
	this.m_sortEnabled = true;
	this.m_paginatorEnabled = true;
	this.m_selectableColumnsStorageKey = oFF.SuResourceExplorerLocalStorageManager.RE_DETAILS_VIEW_COLUMNS;
	this.initColumnSettings();
	this.initSelectabeColumnList();
};
oFF.SuDetailsResourceViewer.prototype.destroyView = function()
{
	this.m_helper = oFF.XObjectExt.release(this.m_helper);
	this.m_config = null;
	oFF.SuTableViewBase.prototype.destroyView.call( this );
};
oFF.SuDetailsResourceViewer.prototype.layoutView = function(viewControl)
{
	oFF.SuTableViewBase.prototype.layoutView.call( this , viewControl);
	this.m_table.setName("reDetailsResourceViewer");
	this.m_table.addCssClass("ffReDfv");
};
oFF.SuDetailsResourceViewer.prototype.buildHeader = function()
{
	oFF.SuTableViewBase.prototype.buildHeader.call( this );
	if (this.m_config.isVersionGTE(oFF.SuResourceExplorerConfig.VERSION_3) && oFF.notNull(this.m_selectableColumns) && this.m_selectableColumns.size() > 0)
	{
		this.m_headerContainer.setVisible(true);
	}
};
oFF.SuDetailsResourceViewer.prototype.clearSelection = function()
{
	this.m_table.clearSelectedItems();
};
oFF.SuDetailsResourceViewer.prototype.setSelectedItem = function(item)
{
	oFF.SuDetailsResourceViewerHelper.setSelectedResource(this.m_table, item);
};
oFF.SuDetailsResourceViewer.prototype.getTable = function()
{
	return this.m_table;
};
oFF.SuDetailsResourceViewer.prototype.enableSorting = function(enable)
{
	this.m_sortEnabled = enable;
	var sortableColumns = this.m_sortableColumn.getValuesAsReadOnlyList();
	for (var i = 0; i < sortableColumns.size(); i++)
	{
		var column = sortableColumns.get(i);
		column.setSortIndicator(oFF.UiSortOrder.NONE);
		if (enable)
		{
			column.addCssClass(oFF.SuDetailsResourceViewer.SORTABLE_COLUMN_CSS);
		}
		else
		{
			column.removeCssClass(oFF.SuDetailsResourceViewer.SORTABLE_COLUMN_CSS);
		}
	}
	if (enable)
	{
		this.setInitialSortableColumn();
	}
};
oFF.SuDetailsResourceViewer.prototype.isSortingEnabled = function()
{
	return this.m_sortEnabled;
};
oFF.SuDetailsResourceViewer.prototype.onDataFetched = function()
{
	oFF.SuTableViewBase.prototype.onDataFetched.call( this );
	this.fireOnResourceSelect(null);
};
oFF.SuDetailsResourceViewer.prototype.buildColumns = function()
{
	var fields = this.m_config.getFields();
	if (oFF.isNull(fields) || fields.size() === 0)
	{
		fields = oFF.XLinkedHashMapOfStringByString.create();
		fields.put(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, null);
	}
	var tableColumn = null;
	for (var iterator = fields.getKeysAsIteratorOfString(); iterator.hasNext(); )
	{
		var fieldName = iterator.next();
		var fieldLabel = this.m_config.getFieldLabel(fieldName);
		tableColumn = this.m_table.addNewResponsiveTableColumn().setTitle(oFF.notNull(fieldLabel) ? fieldLabel : fieldName);
		tableColumn.setName(fieldName);
		var isNameField = oFF.XString.isEqual(oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, fieldName);
		tableColumn.setTag(isNameField ? oFF.XFileAttribute.DISPLAY_NAME.toString() : fieldName);
		if (this.m_config.isFieldSortable(fieldName))
		{
			this.m_sortableColumn.put(fieldName, tableColumn);
			tableColumn.addCssClass(oFF.SuDetailsResourceViewer.SORTABLE_COLUMN_CSS);
			tableColumn.setSortIndicator(oFF.UiSortOrder.NONE);
			tableColumn.registerOnPress(this.createUiLambdaColumnPressListener());
		}
		if (!iterator.hasNext())
		{
			tableColumn.addCssClass("ffReDfvLastColumn");
		}
	}
	if (oFF.notNull(tableColumn))
	{
		this.setInitialSortableColumn();
	}
};
oFF.SuDetailsResourceViewer.prototype.createUiLambdaColumnPressListener = function()
{
	return oFF.UiLambdaPressListener.create( function(event){
		if (!this.isSortingEnabled())
		{
			return;
		}
		var columnPressListener = this.m_helper.createUiLambdaColumnPressListener(this.m_table);
		columnPressListener.onPress(event);
	}.bind(this));
};
oFF.SuDetailsResourceViewer.prototype.setInitialSortableColumn = function()
{
	var sortableColumn = this.getFirstSortableColumn();
	if (oFF.notNull(sortableColumn))
	{
		sortableColumn.setSortIndicator(this.m_dataProvider.isSortingAscending() ? oFF.UiSortOrder.ASCENDING : oFF.UiSortOrder.DESCENDING);
		this.m_dataProvider.setSortingAttribute(sortableColumn.getName());
	}
};
oFF.SuDetailsResourceViewer.prototype.getFirstSortableColumn = function()
{
	return oFF.XStream.of(this.m_table.getResponsiveTableColumns()).find( function(column){
		return this.m_config.isFieldSortable(column.getName());
	}.bind(this)).orElse(null);
};
oFF.SuDetailsResourceViewer.prototype.getTableRows = function()
{
	var rows = oFF.XList.create();
	var sortedResourceList = this.m_dataProvider.get();
	if (oFF.notNull(sortedResourceList))
	{
		var resourceIterator = sortedResourceList.getIterator();
		while (oFF.notNull(resourceIterator) && resourceIterator.hasNext())
		{
			var resource = resourceIterator.next();
			var resourceWrapper = oFF.SuResourceWrapper.create(resource);
			var newRow = this.addNewResourceTableRow(resourceWrapper, rows.size());
			rows.add(newRow);
		}
		this.fillWithEmptyRows(rows);
	}
	return rows;
};
oFF.SuDetailsResourceViewer.prototype.isSelectedItem = function(item)
{
	return oFF.SuDetailsResourceViewerHelper.isSelectedResource(this.m_table, item);
};
oFF.SuDetailsResourceViewer.prototype.initColumnSettings = function()
{
	this.m_columnSettings = oFF.SuResourceExplorerLocalStorageManager.getIPrElement(oFF.SuResourceExplorerLocalStorageManager.RE_DETAILS_VIEW_COLUMNS).asStructure();
	if (!this.m_columnSettings.hasElements())
	{
		var fields = this.m_config.getFields();
		for (var iterator = fields.getKeysAsIteratorOfString(); iterator.hasNext(); )
		{
			var fieldName = iterator.next();
			this.m_columnSettings.putBoolean(fieldName, true);
		}
		oFF.SuResourceExplorerLocalStorageManager.saveIPrElement(this.m_selectableColumnsStorageKey, this.m_columnSettings);
	}
};
oFF.SuDetailsResourceViewer.prototype.initSelectabeColumnList = function()
{
	var fields = this.m_config.getFields();
	for (var iterator = fields.getKeysAsIteratorOfString(); iterator.hasNext(); )
	{
		var fieldName = iterator.next();
		if (this.m_config.isFieldSelectable(fieldName))
		{
			var fieldLabel = this.m_config.getFieldLabel(fieldName);
			this.addColumnSelectionConfig(fieldName, fieldLabel);
		}
	}
	if (oFF.notNull(this.m_selectableColumns) && this.m_selectableColumns.size() > 0)
	{
		var i18nProvider = oFF.UiLocalizationCenter.getCenter();
		this.m_selectableColumnsTooltip = i18nProvider.getText(oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_RECENTLY_USED_COLUMNS_TOOLTIP);
	}
};
oFF.SuDetailsResourceViewer.prototype.addColumnSelectionConfig = function(id, text)
{
	var column = oFF.PrStructure.create().asStructure();
	column.putString(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_ID, id);
	column.putString(oFF.SuTableColumnSelectionButton.SELECTABLE_COLUMN_TEXT, text);
	this.m_selectableColumns.add(column);
};
oFF.SuDetailsResourceViewer.prototype.fillWithEmptyRows = function(rows)
{
	if (rows.size() === 0)
	{
		return;
	}
	var emptyRows = this.m_config.getRowsToFill() - rows.size();
	if (emptyRows > 0)
	{
		for (var i = 0; i < emptyRows; i++)
		{
			var newRow = this.addNewResourceTableRow(null, rows.size());
			rows.add(newRow);
		}
	}
};
oFF.SuDetailsResourceViewer.prototype.addNewResourceTableRow = function(resourceWrapper, rowIndex)
{
	var isEmptyRow = oFF.isNull(resourceWrapper);
	var tableRow = oFF.SuTableViewBase.prototype.addNewTableRow.call( this , isEmptyRow ? null : resourceWrapper.getFile());
	var fields = this.m_config.getFields();
	if (oFF.isNull(fields) || fields.size() === 0)
	{
		if (isEmptyRow)
		{
			this.addNewEmptyCell(tableRow);
		}
		else
		{
			this.addNewCell(tableRow, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME, rowIndex, resourceWrapper);
		}
	}
	else
	{
		var fieldsList = fields.getKeysAsReadOnlyListOfString();
		for (var i = 0; i < fieldsList.size(); i++)
		{
			if (isEmptyRow)
			{
				this.addNewEmptyCell(tableRow);
			}
			else
			{
				var fieldName = fieldsList.get(i);
				this.addNewCell(tableRow, fieldName, rowIndex, resourceWrapper);
			}
		}
	}
	return tableRow;
};
oFF.SuDetailsResourceViewer.prototype.addNewEmptyCell = function(tableRow)
{
	return tableRow.addNewLabelCell();
};
oFF.SuDetailsResourceViewer.prototype.addNewCell = function(tableRow, fieldName, rowIndex, resourceWrapper)
{
	var tableCell = null;
	if (oFF.XString.isEqual(fieldName, oFF.SuResourceWrapper.RESOURCE_FIELD_NAME))
	{
		tableCell = this.addNewResourceNameCell(tableRow, resourceWrapper);
	}
	else
	{
		tableCell = this.m_helper.addNewCellTextControl(tableRow, resourceWrapper, fieldName);
	}
	tableCell.addCssClass(this.m_helper.getCellClass(fieldName));
	tableCell.setName(this.m_helper.getCellName(rowIndex, fieldName));
	return tableCell;
};
oFF.SuDetailsResourceViewer.prototype.addNewResourceNameCell = function(tableRow, resourceWrapper)
{
	var cellLayout = tableRow.addNewResponsiveTableCellOfType(oFF.UiType.FLEX_LAYOUT);
	cellLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	if (oFF.notNull(resourceWrapper))
	{
		var nameLayout = cellLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		nameLayout.addCssClass("ffReDfvResourceName");
		nameLayout.useMaxSpace();
		nameLayout.setDirection(oFF.UiFlexDirection.ROW);
		var iconControl = resourceWrapper.getIconControl(nameLayout);
		if (oFF.notNull(iconControl))
		{
			iconControl.addCssClass("ffReResourceIcon");
			nameLayout.addItem(iconControl);
		}
		this.m_helper.addNewNameTextControl(nameLayout, resourceWrapper.getTranslatedDisplayName());
		if (resourceWrapper.isSharedToMe())
		{
			var shareIcon = nameLayout.addNewItemOfType(oFF.UiType.ICON);
			shareIcon.setIcon("share-2");
			shareIcon.addCssClass("ffReResourceSharedIcon");
		}
		if (this.m_config.isBreadcrumbsEnabled())
		{
			cellLayout.addItem(this.m_helper.createBreadcrumbsForResource(resourceWrapper.getFile(), this.createBreadcrumbsClickCallback(), this.getGenesis()).getView());
		}
	}
	return cellLayout;
};
oFF.SuDetailsResourceViewer.prototype.createBreadcrumbsClickCallback = function()
{
	return  function(data){
		var dataTmp = data;
		this.fireOnResourceClick(dataTmp);
	}.bind(this);
};

oFF.UiCredentialsProviderSyncAction = function() {};
oFF.UiCredentialsProviderSyncAction.prototype = new oFF.SyncActionExt();
oFF.UiCredentialsProviderSyncAction.prototype._ff_c = "UiCredentialsProviderSyncAction";

oFF.UiCredentialsProviderSyncAction.DIALOGS = null;
oFF.UiCredentialsProviderSyncAction.ERROR_POPUP = null;
oFF.UiCredentialsProviderSyncAction.createAndRun = function(context, syncType, listener, customIdentifier, connection, credentialsCallCounter, response, messages, changedType)
{
	var newCredentialsProviderSyncAction = new oFF.UiCredentialsProviderSyncAction();
	newCredentialsProviderSyncAction.m_connection = connection;
	newCredentialsProviderSyncAction.m_credentialsCallCounter = credentialsCallCounter;
	newCredentialsProviderSyncAction.m_rpcMessages = messages;
	newCredentialsProviderSyncAction.m_response = response;
	newCredentialsProviderSyncAction.m_changedAuthType = changedType;
	newCredentialsProviderSyncAction.setupActionAndRun(syncType, listener, customIdentifier, context);
	return newCredentialsProviderSyncAction;
};
oFF.UiCredentialsProviderSyncAction.notifyAuthenticationSuccessful = function(systemName)
{
	if (oFF.notNull(oFF.UiCredentialsProviderSyncAction.DIALOGS) && oFF.UiCredentialsProviderSyncAction.DIALOGS.containsKey(systemName))
	{
		oFF.UiCredentialsProviderSyncAction.DIALOGS.getByKey(systemName).notifyAuthenticationSuccessful();
		oFF.UiCredentialsProviderSyncAction.DIALOGS.remove(systemName);
	}
};
oFF.UiCredentialsProviderSyncAction.prototype.m_connection = null;
oFF.UiCredentialsProviderSyncAction.prototype.m_credentialsCallCounter = 0;
oFF.UiCredentialsProviderSyncAction.prototype.m_rpcMessages = null;
oFF.UiCredentialsProviderSyncAction.prototype.m_response = null;
oFF.UiCredentialsProviderSyncAction.prototype.m_changedAuthType = null;
oFF.UiCredentialsProviderSyncAction.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(oFF.UiCredentialsProviderSyncAction.DIALOGS))
	{
		oFF.UiCredentialsProviderSyncAction.DIALOGS = oFF.XHashMapByString.create();
	}
	if (this.hasError())
	{
		this.handleError();
	}
	else
	{
		this.handleLogin();
	}
	return true;
};
oFF.UiCredentialsProviderSyncAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCredentialsReady(extResult, data, customIdentifier);
};
oFF.UiCredentialsProviderSyncAction.prototype.createPersonalization = function()
{
	var systemDescription = this.m_connection.getSystemDescription();
	var newPersonalization = this.getProcess().getUserManager().newMergedPersonalization2(systemDescription);
	newPersonalization.setIsXAuthorizationRequired(systemDescription.isXAuthorizationRequired());
	return newPersonalization;
};
oFF.UiCredentialsProviderSyncAction.prototype.handleLogin = function()
{
	var newPersonalization = this.createPersonalization();
	if (oFF.notNull(this.m_changedAuthType))
	{
		newPersonalization.setAuthenticationType(this.m_changedAuthType);
	}
	oFF.XObjectExt.assertNotNull(newPersonalization);
	var showSamlPopup = this.m_connection.getSystemDescription().getAuthenticationType().isSaml() && oFF.SamlUtils.isPopupSupported();
	if (newPersonalization.getAuthenticationType() !== oFF.AuthenticationType.NONE && !showSamlPopup)
	{
		var curUser = newPersonalization.getUser();
		var curPass = newPersonalization.getPassword();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(curUser) && oFF.XStringUtils.isNotNullAndNotEmpty(curPass))
		{
			this.setData(newPersonalization);
			this.endSync();
		}
		else
		{
			newPersonalization.setAuthenticationType(oFF.AuthenticationType.NONE);
			this.setData(newPersonalization);
			this.endSync();
		}
	}
	else
	{
		this.setData(newPersonalization);
		this.endSync();
	}
};
oFF.UiCredentialsProviderSyncAction.prototype.hasError = function()
{
	if (oFF.notNull(this.m_response))
	{
		return true;
	}
	if (oFF.notNull(this.m_rpcMessages) && this.m_rpcMessages.hasErrors())
	{
		return true;
	}
	if (this.m_credentialsCallCounter > 5)
	{
		return true;
	}
	return false;
};
oFF.UiCredentialsProviderSyncAction.prototype.handleError = function()
{
	var systemDescription = this.m_connection.getSystemDescription();
	if (systemDescription.getAuthenticationType().isEqualTo(oFF.AuthenticationType.NONE) && oFF.XPlatform.getPlatform().isTypeOf(oFF.XPlatform.UI5))
	{
		if (oFF.notNull(this.m_rpcMessages) && this.m_rpcMessages.hasErrors())
		{
			this.addAllMessages(this.m_rpcMessages);
		}
		if (oFF.notNull(this.m_response))
		{
			this.addAllMessages(this.m_response.getMessageCollection());
		}
		this.endSync();
		return;
	}
	if (oFF.notNull(this.m_rpcMessages) && this.m_rpcMessages.hasErrors())
	{
		if (systemDescription.isConnected())
		{
			this.addAllMessages(this.m_rpcMessages);
			this.endSync();
			return;
		}
		else if (this.m_rpcMessages.getFirstError().getCode() === oFF.HttpStatusCode.SC_UNAUTHORIZED)
		{
			this.showLoginDialog(true);
			return;
		}
	}
	if (systemDescription.getAuthenticationType().isEqualTo(oFF.AuthenticationType.BASIC) && !systemDescription.isConnected())
	{
		if (oFF.notNull(this.m_response))
		{
			var statusCode = this.m_response.getStatusCode();
			var contentType = this.m_response.getContentType();
			if (statusCode === 0 || oFF.HttpStatusCode.isRedirect(statusCode) || statusCode === oFF.HttpStatusCode.SC_UNAUTHORIZED || (statusCode === oFF.HttpStatusCode.SC_OK && contentType.isTypeOf(oFF.ContentType.TEXT_OR_HTML)))
			{
				this.showLoginDialog(true);
				return;
			}
		}
	}
	if (oFF.UiCredentialsProviderSyncAction.DIALOGS.containsKey(this.m_connection.getSystemDescription().getSystemName()))
	{
		this.showLoginDialog(false);
		this.showErrorPopup();
	}
	else
	{
		this.showErrorPopup();
		this.onCancel();
	}
};
oFF.UiCredentialsProviderSyncAction.prototype.tryToLogin = function(newUsername, newPassword)
{
	var systemDescription = this.m_connection.getSystemDescription();
	var newPersonalization = this.getProcess().getUserManager().newMergedPersonalization2(systemDescription);
	if (oFF.notNull(newPersonalization))
	{
		newPersonalization.setUser(newUsername);
		newPersonalization.setPassword(newPassword);
		newPersonalization.setIsXAuthorizationRequired(systemDescription.isXAuthorizationRequired());
		this.setData(newPersonalization);
		this.endSync();
	}
};
oFF.UiCredentialsProviderSyncAction.prototype.showLoginDialog = function(invalidCredentials)
{
	var systemName = this.m_connection.getSystemDescription().getSystemName();
	if (oFF.UiCredentialsProviderSyncAction.DIALOGS.containsKey(systemName))
	{
		oFF.UiCredentialsProviderSyncAction.DIALOGS.getByKey(systemName).notifyAuthenticationFailed(this, invalidCredentials);
	}
	else
	{
		var uiCredentialsDialogRunner = oFF.ProgramRunner.createRunner(this.getProcess(), oFF.UiCredentialsDialogPrg.DEFAULT_PROGRAM_NAME);
		uiCredentialsDialogRunner.setObjectArgument(oFF.UiCredentialsDialogPrg.PARAM_SYSTEM, this.m_connection.getSystemDescription());
		uiCredentialsDialogRunner.setObjectArgument(oFF.UiCredentialsDialogPrg.PARAM_LISTENER, this);
		uiCredentialsDialogRunner.runProgram().then( function(prg){
			this.handleProgramStarted(prg);
			return prg;
		}.bind(this),  function(errMsg){
			this.addError(oFF.ErrorCodes.PROGRAM_FAILED_TO_START, errMsg.getText());
			this.endSync();
		}.bind(this));
	}
};
oFF.UiCredentialsProviderSyncAction.prototype.getFreeGenesis = function()
{
	var uiManager = this.getActionContext().getProcess().getUiManager();
	return uiManager.getFreeGenesis();
};
oFF.UiCredentialsProviderSyncAction.prototype.showErrorPopup = function()
{
	if (oFF.isNull(oFF.UiCredentialsProviderSyncAction.ERROR_POPUP))
	{
		var systemTypeKey = this.m_connection.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.BW) ? oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_BW_NAME : oFF.SuResourceExplorerI18n.DATASOURCE_NAVIGATION_SYSTEM_HANA_NAME;
		oFF.UiCredentialsProviderSyncAction.ERROR_POPUP = oFF.UtErrorPopup.create(this.getFreeGenesis(), oFF.UiLocalizationCenter.getCenter().getTextWithPlaceholder(oFF.UiCredentialsDialogI18n.ERROR_AUTHENTICATION_EXTERNAL, oFF.UiLocalizationCenter.getCenter().getText(systemTypeKey)));
	}
	oFF.UiCredentialsProviderSyncAction.ERROR_POPUP.open();
};
oFF.UiCredentialsProviderSyncAction.prototype.onLogin = function(username, password)
{
	this.tryToLogin(username, password);
};
oFF.UiCredentialsProviderSyncAction.prototype.onCancel = function()
{
	var systemName = this.m_connection.getSystemName();
	if (oFF.UiCredentialsProviderSyncAction.DIALOGS.containsKey(systemName))
	{
		oFF.UiCredentialsProviderSyncAction.DIALOGS.remove(systemName);
	}
	this.addError(oFF.ErrorCodes.BASIC_AUTHENTICATION_CANCELED, "Authentication Canceled");
	this.endSync();
};
oFF.UiCredentialsProviderSyncAction.prototype.handleProgramStarted = function(uiCredentialsDialogPrg)
{
	var systemDescription = uiCredentialsDialogPrg.getArguments().getXObjectByKey(oFF.UiCredentialsDialogPrg.PARAM_SYSTEM);
	if (oFF.notNull(systemDescription) && !oFF.UiCredentialsProviderSyncAction.DIALOGS.containsKey(systemDescription.getName()))
	{
		oFF.UiCredentialsProviderSyncAction.DIALOGS.put(systemDescription.getName(), uiCredentialsDialogPrg);
	}
	else
	{
		uiCredentialsDialogPrg.exit();
	}
};

oFF.Chronos = function() {};
oFF.Chronos.prototype = new oFF.DfUiProgram();
oFF.Chronos.prototype._ff_c = "Chronos";

oFF.Chronos.DEFAULT_PROGRAM_NAME = "Chronos";
oFF.Chronos.prototype.m_buttonMonth = null;
oFF.Chronos.prototype.m_buttonYear = null;
oFF.Chronos.prototype.m_buttonUi5 = null;
oFF.Chronos.prototype.m_dialog = null;
oFF.Chronos.prototype.m_dialogButton = null;
oFF.Chronos.prototype.newProgram = function()
{
	var program = new oFF.Chronos();
	program.setup();
	return program;
};
oFF.Chronos.prototype.getProgramName = function()
{
	return oFF.Chronos.DEFAULT_PROGRAM_NAME;
};
oFF.Chronos.prototype.prepareProgramMetadata = function(metadata) {};
oFF.Chronos.prototype.processArguments = function(args) {};
oFF.Chronos.prototype.setupProgram = function()
{
	return null;
};
oFF.Chronos.prototype.buildUi = function(genesis)
{
	var layout = genesis.newRoot(oFF.UiType.VERTICAL_LAYOUT);
	this.m_buttonMonth = layout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_buttonMonth.setText("Month Calendar");
	this.m_buttonMonth.setWidth(oFF.UiCssLength.create("100px"));
	this.m_buttonMonth.registerOnPress(this);
	this.m_buttonYear = layout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_buttonYear.setText("Year Calendar");
	this.m_buttonMonth.setWidth(oFF.UiCssLength.create("100px"));
	this.m_buttonYear.registerOnPress(this);
	this.m_buttonUi5 = layout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_buttonUi5.setText("UI5 Calendar");
	this.m_buttonUi5.setWidth(oFF.UiCssLength.create("100px"));
	this.m_buttonUi5.registerOnPress(this);
};
oFF.Chronos.prototype.onPress = function(event)
{
	if (event.getControl() === this.m_dialogButton)
	{
		this.m_dialog.close();
		this.buildUi(this.m_genesis);
	}
	else
	{
		if (event.getControl() === this.m_buttonMonth)
		{
			this.openMonthCalendarDialog();
		}
		else if (event.getControl() === this.m_buttonYear)
		{
			this.m_dialog = this.createYearCalendarDialog();
			this.m_dialog.open();
			this.m_dialogButton = this.m_dialog.addNewDialogButton();
			this.m_dialogButton.setText("Close");
			this.m_dialogButton.registerOnPress(this);
		}
		else if (event.getControl() === this.m_buttonUi5)
		{
			this.m_dialog = this.createUi5Dialog();
			this.m_dialog.open();
			this.m_dialogButton = this.m_dialog.addNewDialogButton();
			this.m_dialogButton.setText("Close");
			this.m_dialogButton.registerOnPress(this);
		}
	}
};
oFF.Chronos.prototype.createUi5Dialog = function()
{
	var calendarDialog = this.m_genesis.newControl(oFF.UiType.DIALOG);
	calendarDialog.setTitle("Calendar");
	calendarDialog.setNewContent(oFF.UiType.CALENDAR);
	return calendarDialog;
};
oFF.Chronos.prototype.openMonthCalendarDialog = function()
{
	var calendarDlgStartCfg = oFF.ProgramStartCfg.create(this.getProcess(), oFF.SuCalendarDialog.DEFAULT_PROGRAM_NAME, null, null);
	calendarDlgStartCfg.setParentProcess(this.getProcess());
	calendarDlgStartCfg.setIsNewConsoleNeeded(true);
	calendarDlgStartCfg.setIsCreatingChildProcess(true);
	calendarDlgStartCfg.processExecution(oFF.SyncType.NON_BLOCKING, null, null);
};
oFF.Chronos.prototype.createYearCalendarDialog = function()
{
	var calendarDialog = this.m_genesis.newControl(oFF.UiType.DIALOG);
	calendarDialog.setTitle("Calendar");
	calendarDialog.setContent(oFF.YearView.create(this.m_genesis, oFF.YearUiModel.create()).getRoot());
	return calendarDialog;
};

oFF.CoronaInfo = function() {};
oFF.CoronaInfo.prototype = new oFF.DfUiProgram();
oFF.CoronaInfo.prototype._ff_c = "CoronaInfo";

oFF.CoronaInfo.GERMANY_ENDPOINT = "https://api.corona-zahlen.org/germany";
oFF.CoronaInfo.REGIONS_ENDPOINT = "https://api.corona-zahlen.org/states";
oFF.CoronaInfo.DEFAULT_PROGRAM_NAME = "Corona";
oFF.CoronaInfo.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.CoronaInfo.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.CoronaInfo.prototype.m_mainLayout = null;
oFF.CoronaInfo.prototype.m_coronaJsonStruct = null;
oFF.CoronaInfo.prototype.m_regionMap = null;
oFF.CoronaInfo.prototype.m_selectedRegion = null;
oFF.CoronaInfo.prototype.newProgram = function()
{
	var prg = new oFF.CoronaInfo();
	prg.setup();
	return prg;
};
oFF.CoronaInfo.prototype.getProgramName = function()
{
	return oFF.CoronaInfo.DEFAULT_PROGRAM_NAME;
};
oFF.CoronaInfo.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.CoronaInfo.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.CoronaInfo.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60%", "60%");
};
oFF.CoronaInfo.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.CoronaInfo.prototype.getMenuBarDisplayName = function()
{
	return oFF.CoronaInfo.DEFAULT_PROGRAM_NAME;
};
oFF.CoronaInfo.prototype.prepareProgramMetadata = function(metadata) {};
oFF.CoronaInfo.prototype.processArguments = function(args) {};
oFF.CoronaInfo.prototype.setupProgram = function()
{
	this.m_regionMap = oFF.XHashMapOfStringByString.create();
	this.m_regionMap.put("all", "All");
	this.m_regionMap.put("BW", "Baden-W\u00FCrttemberg");
	this.m_regionMap.put("BY", "Bayern");
	this.m_regionMap.put("BE", "Berlin");
	this.m_regionMap.put("BB", "Brandenburg");
	this.m_regionMap.put("HB", "Bremen");
	this.m_regionMap.put("HH", "Hamburg");
	this.m_regionMap.put("HE", "Hessen");
	this.m_regionMap.put("MV", "Mecklenburg-Vorpommern");
	this.m_regionMap.put("NI", "Niedersachsen");
	this.m_regionMap.put("NW", "Nordrhein-Westfalen");
	this.m_regionMap.put("RP", "Rheinland-Pfalz");
	this.m_regionMap.put("SL", "Saarland");
	this.m_regionMap.put("SN", "Sachsen");
	this.m_regionMap.put("ST", "Sachsen-Anhalt");
	this.m_regionMap.put("SH", "Schleswig-Holstein");
	this.m_regionMap.put("TH", "Th\u00FCringen");
	this.m_selectedRegion = "all";
	return null;
};
oFF.CoronaInfo.prototype.buildUi = function(genesis)
{
	this.setTitle("Corona");
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	genesis.setRoot(this.m_mainLayout);
	this.addMenuBarButton("Region", null, null,  function(controlEvent){
		this.createRegionToolbarMenu(controlEvent.getControl());
	}.bind(this));
	this.addMenuBarButton("Refresh", "refresh", null,  function(controlEvent2){
		this.getCoronaData(this.m_selectedRegion);
	}.bind(this));
	this.getCoronaData(this.m_selectedRegion);
};
oFF.CoronaInfo.prototype.getCoronaData = function(region)
{
	this.m_mainLayout.clearItems();
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_mainLayout.setBusy(true);
	var loadingLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	loadingLbl.setText("Loading...");
	loadingLbl.setFontSize(oFF.UiCssLength.create("18px"));
	loadingLbl.setMargin(oFF.UiCssBoxEdges.create("20px"));
	var endpoint = oFF.CoronaInfo.GERMANY_ENDPOINT;
	if (!this.isAllRegion(region))
	{
		endpoint = oFF.CoronaInfo.REGIONS_ENDPOINT;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_selectedRegion))
		{
			endpoint = oFF.XStringUtils.concatenate3(endpoint, "/", this.m_selectedRegion);
		}
	}
	oFF.UtFetch.fetch(endpoint, this.getProcess()).then( function(result){
		this.m_coronaJsonStruct = result;
		this.displayCoronaData();
		return result;
	}.bind(this), null).onCatch( function(reason){
		this.displayError(reason.getText());
	}.bind(this)).onFinally( function(){
		this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
		this.m_mainLayout.setBusy(false);
	}.bind(this));
};
oFF.CoronaInfo.prototype.getStructureForSelectedRegion = function()
{
	if (oFF.isNull(this.m_coronaJsonStruct) || this.m_coronaJsonStruct.isEmpty())
	{
		return null;
	}
	if (this.m_coronaJsonStruct.containsKey("error"))
	{
		return this.m_coronaJsonStruct;
	}
	if (this.isAllRegion(this.m_selectedRegion))
	{
		return this.m_coronaJsonStruct;
	}
	var dataStructure = this.m_coronaJsonStruct.getStructureByKey("data");
	if (oFF.notNull(dataStructure))
	{
		var regionStructure = dataStructure.getStructureByKey(this.m_selectedRegion);
		if (oFF.notNull(regionStructure))
		{
			return regionStructure;
		}
	}
	return null;
};
oFF.CoronaInfo.prototype.displayCoronaData = function()
{
	var coronaDataStructure = this.getStructureForSelectedRegion();
	if (oFF.notNull(coronaDataStructure))
	{
		if (coronaDataStructure.containsKey("error"))
		{
			var errorStruct = coronaDataStructure.getStructureByKey("error");
			var errorMsg = this.parseError(errorStruct);
			this.displayError(errorMsg);
		}
		else
		{
			var testLogCases = oFF.XInteger.convertToString(coronaDataStructure.getStructureByKey("delta").getIntegerByKeyExt("cases", 0));
			this.log(testLogCases);
			var casesTotal = coronaDataStructure.getIntegerByKeyExt("cases", 0);
			var recoveredTotal = coronaDataStructure.getIntegerByKeyExt("recovered", 0);
			var deathsTotal = coronaDataStructure.getIntegerByKeyExt("deaths", 0);
			var casesToday = 0;
			var recoveredToday = 0;
			var deathsToday = 0;
			var coronaDelta = coronaDataStructure.getStructureByKey("delta");
			if (oFF.notNull(coronaDelta))
			{
				casesToday = coronaDelta.getIntegerByKeyExt("cases", 0);
				recoveredToday = coronaDelta.getIntegerByKeyExt("recovered", 0);
				deathsToday = coronaDelta.getIntegerByKeyExt("deaths", 0);
			}
			var weekIncidence = coronaDataStructure.getDoubleByKeyExt("weekIncidence", 0);
			var casesPerWeek = coronaDataStructure.getIntegerByKeyExt("casesPerWeek", 0);
			var deathsPerWeek = coronaDataStructure.getIntegerByKeyExt("deathsPerWeek", -1);
			var casesPer100k = coronaDataStructure.getDoubleByKeyExt("casesPer100k", 0);
			var region = coronaDataStructure.getStringByKeyExt("name", "All");
			var lastUpdateStr = "Unknown";
			var source = "";
			if (oFF.notNull(this.m_coronaJsonStruct))
			{
				var coronaMeta = this.m_coronaJsonStruct.getStructureByKey("meta");
				if (oFF.notNull(coronaMeta))
				{
					var tempStr = coronaMeta.getStringByKeyExt("lastCheckedForUpdate", "");
					var lastUpdate = oFF.XDateTime.createDateTimeSafe(tempStr);
					if (oFF.notNull(lastUpdate))
					{
						lastUpdate.setMillisecondOfSecond(0);
						lastUpdateStr = lastUpdate.getDate().getStringRepresentation();
						lastUpdateStr = oFF.XStringUtils.concatenate3(lastUpdateStr, " ", lastUpdate.getTime().getStringRepresentation());
					}
					source = coronaMeta.getStringByKeyExt("source", "");
				}
			}
			this.m_mainLayout.clearItems();
			var coronaInfoLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			coronaInfoLayout.setDirection(oFF.UiFlexDirection.ROW);
			coronaInfoLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			coronaInfoLayout.setWidth(oFF.UiCssLength.create("100%"));
			coronaInfoLayout.setHeight(oFF.UiCssLength.create("45%"));
			coronaInfoLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_AROUND);
			var casesLayout = coronaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertLargeInfoNumber(casesLayout, "Cases", casesTotal, casesToday);
			var recoveredLayout = coronaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertLargeInfoNumber(recoveredLayout, "Recovered", recoveredTotal, recoveredToday);
			var deathsLayout = coronaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertLargeInfoNumber(deathsLayout, "Deaths", deathsTotal, deathsToday);
			var coronaWeekSpacer = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			coronaWeekSpacer.setHeight(oFF.UiCssLength.create("1px"));
			coronaWeekSpacer.setWidth(oFF.UiCssLength.create("100%"));
			coronaWeekSpacer.setBackgroundColor(oFF.UiColor.GREY);
			var weekInfoLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			weekInfoLayout.setDirection(oFF.UiFlexDirection.ROW);
			weekInfoLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			weekInfoLayout.setWidth(oFF.UiCssLength.create("100%"));
			weekInfoLayout.setHeight(oFF.UiCssLength.create("45%"));
			weekInfoLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_AROUND);
			var weekIncidenceLayout = weekInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertNormalInfoNumber(weekIncidenceLayout, "Week Incidence", oFF.XDouble.convertToInt(weekIncidence), 0);
			var casesPerWeekLayout = weekInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertNormalInfoNumber(casesPerWeekLayout, "Cases per week", casesPerWeek, 0);
			if (deathsPerWeek >= 0)
			{
				var deathsPerWeekLayout = weekInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
				this.insertNormalInfoNumber(deathsPerWeekLayout, "Deaths per week", deathsPerWeek, 0);
			}
			var casesPer100kLayout = weekInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertNormalInfoNumber(casesPer100kLayout, "Cases per 100k", oFF.XDouble.convertToInt(casesPer100k), 0);
			var weekDataSpacer = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			weekDataSpacer.setHeight(oFF.UiCssLength.create("1px"));
			weekDataSpacer.setWidth(oFF.UiCssLength.create("100%"));
			weekDataSpacer.setBackgroundColor(oFF.UiColor.GREY);
			var metaInfoLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			metaInfoLayout.setDirection(oFF.UiFlexDirection.ROW);
			metaInfoLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			metaInfoLayout.setWidth(oFF.UiCssLength.create("100%"));
			metaInfoLayout.setHeight(oFF.UiCssLength.create("10%"));
			metaInfoLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_AROUND);
			var lastUpdateLayout = metaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertSmallInfoText(lastUpdateLayout, "Last update", lastUpdateStr);
			var countryLayout = metaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertSmallInfoText(countryLayout, "Country", "Germany");
			var regionLayout = metaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertSmallInfoText(regionLayout, "Region", region);
			var sourceLayout = metaInfoLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
			this.insertSmallInfoText(sourceLayout, "Source", source);
		}
	}
	else
	{
		this.displayError("Unknown error occured! Could not retrieve data!");
	}
};
oFF.CoronaInfo.prototype.parseError = function(errorStruct)
{
	var errorMsg = errorStruct.getStringByKeyExt("message", "Unknown error!");
	if (errorStruct.containsKey("rkiError"))
	{
		var rkiErrorStruct = errorStruct.getStructureByKey("rkiError");
		if (rkiErrorStruct.containsKey("details"))
		{
			errorMsg = rkiErrorStruct.getListByKey("details").getStringAtExt(0, errorMsg);
		}
		else
		{
			errorMsg = rkiErrorStruct.getStringByKeyExt("message", errorMsg);
		}
	}
	return errorMsg;
};
oFF.CoronaInfo.prototype.displayError = function(message)
{
	this.log(message);
	this.m_mainLayout.clearItems();
	var errorLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	errorLbl.setText("Failed to retrieve the data!");
	errorLbl.setFontSize(oFF.UiCssLength.create("20px"));
	if (oFF.XStringUtils.isNotNullAndNotEmpty(message))
	{
		var messageLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		messageLbl.setText(message);
		messageLbl.setFontSize(oFF.UiCssLength.create("18px"));
		messageLbl.setMargin(oFF.UiCssBoxEdges.create("10px"));
		messageLbl.setFontColor(oFF.UiColor.RED);
	}
};
oFF.CoronaInfo.prototype.insertInfoNumber = function(layout, label, total, today, titleSizeCss, totalSizeCss, todaySizeCss)
{
	layout.setDirection(oFF.UiFlexDirection.COLUMN);
	var titleLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	titleLbl.setText(label);
	titleLbl.setFontSize(oFF.UiCssLength.create(titleSizeCss));
	titleLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	titleLbl.setFontColor(oFF.UiColor.GREY);
	var totalLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	totalLbl.setText(oFF.XInteger.convertToString(total));
	totalLbl.setFontSize(oFF.UiCssLength.create(totalSizeCss));
	if (today > 0)
	{
		var todayLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
		todayLbl.setText(oFF.XStringUtils.concatenate2("+", oFF.XInteger.convertToString(today)));
		todayLbl.setFontSize(oFF.UiCssLength.create(todaySizeCss));
		todayLbl.setFontColor(oFF.UiColor.RED);
	}
};
oFF.CoronaInfo.prototype.insertLargeInfoNumber = function(layout, label, total, today)
{
	this.insertInfoNumber(layout, label, total, today, "22px", "36px", "18px");
};
oFF.CoronaInfo.prototype.insertNormalInfoNumber = function(layout, label, total, today)
{
	this.insertInfoNumber(layout, label, total, today, "18px", "30px", "14px");
};
oFF.CoronaInfo.prototype.insertInfoText = function(layout, label, text, titleSizeCss, textSizeCss)
{
	layout.setDirection(oFF.UiFlexDirection.COLUMN);
	var titleLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	titleLbl.setText(label);
	titleLbl.setFontSize(oFF.UiCssLength.create(titleSizeCss));
	titleLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	titleLbl.setFontColor(oFF.UiColor.GREY);
	var textLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	textLbl.setText(text);
	textLbl.setFontSize(oFF.UiCssLength.create(textSizeCss));
};
oFF.CoronaInfo.prototype.insertSmallInfoText = function(layout, label, text)
{
	this.insertInfoText(layout, label, text, "12px", "18px");
};
oFF.CoronaInfo.prototype.isAllRegion = function(curRegion)
{
	return oFF.XString.isEqual(curRegion, "all");
};
oFF.CoronaInfo.prototype.createRegionToolbarMenu = function(regionBtn)
{
	var regionToolbarMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	regionToolbarMenu.setName("regionToolbarMenu");
	var regionSize = this.m_regionMap.size();
	for (var a = 0; a < regionSize; a++)
	{
		var key = this.m_regionMap.getKeysAsReadOnlyListOfString().get(a);
		var value = this.m_regionMap.getByKey(key);
		var tmpMenuItem = regionToolbarMenu.addNewItem();
		tmpMenuItem.setName(key);
		tmpMenuItem.setTag("regioMenuItem");
		tmpMenuItem.setText(value);
		tmpMenuItem.setSectionStart(oFF.XString.isEqual(key, "all"));
		tmpMenuItem.setIcon(oFF.XString.isEqual(key, this.m_selectedRegion) ? "accept" : "");
		tmpMenuItem.registerOnPress(this);
	}
	regionToolbarMenu.openAt(regionBtn);
};
oFF.CoronaInfo.prototype.onPress = function(event)
{
	var control = event.getControl();
	var controlParent = control.getParent();
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU && oFF.XString.isEqual(controlParent.getName(), "regionToolbarMenu"))
	{
		var region = control.getName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(region) && this.m_regionMap.containsKey(region))
		{
			this.m_selectedRegion = region;
			this.getCoronaData(region);
		}
		else
		{
			oFF.UiMessageUtils.showWarningToast(this.m_genesis, "Region does not exist!");
		}
	}
};

oFF.WasmDoom1 = function() {};
oFF.WasmDoom1.prototype = new oFF.DfUiProgram();
oFF.WasmDoom1.prototype._ff_c = "WasmDoom1";

oFF.WasmDoom1.DEFAULT_PROGRAM_NAME = "Doom1";
oFF.WasmDoom1.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.WasmDoom1.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.WasmDoom1.createNewVulcan = function()
{
	var prg = new oFF.WasmDoom1();
	prg.setup();
	return prg;
};
oFF.WasmDoom1.prototype.m_doom1Container = null;
oFF.WasmDoom1.prototype.newProgram = function()
{
	var prg = new oFF.WasmDoom1();
	prg.setup();
	return prg;
};
oFF.WasmDoom1.prototype.getProgramName = function()
{
	return oFF.WasmDoom1.DEFAULT_PROGRAM_NAME;
};
oFF.WasmDoom1.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
	this.m_doom1Container = oFF.XObjectExt.release(this.m_doom1Container);
};
oFF.WasmDoom1.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.WasmDoom1.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.WasmDoom1.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60vw", "60vh");
};
oFF.WasmDoom1.prototype.getMenuBarDisplayName = function()
{
	return oFF.WasmDoom1.DEFAULT_PROGRAM_NAME;
};
oFF.WasmDoom1.prototype.prepareProgramMetadata = function(metadata) {};
oFF.WasmDoom1.prototype.processArguments = function(args) {};
oFF.WasmDoom1.prototype.setupProgram = function()
{
	this.log("Setting up the doom1 program");
	return null;
};
oFF.WasmDoom1.prototype.buildUi = function(genesis)
{
	var doom1ResourcesSrc = oFF.XStringUtils.concatenate2("https://firefly.wdf.s", "ap.corp/resources/doom1/");
	this.m_doom1Container = genesis.newControl(oFF.UiType.WEB_ASSEMBLY);
	this.m_doom1Container.useMaxSpace();
	this.m_doom1Container.setSrc(doom1ResourcesSrc);
	this.m_doom1Container.registerOnError(this);
	genesis.setRoot(this.m_doom1Container);
	this.addMenuBarButton("Fullscreen", "sys-monitor", null,  function(controlEvent){
		this.m_doom1Container.fullscreen();
	}.bind(this));
	this.addMenuBarButton("Help", "hint", null,  function(controlEvent2){
		this.openHelpAlert();
	}.bind(this));
};
oFF.WasmDoom1.prototype.openHelpAlert = function()
{
	var helpAlert = this.m_genesis.newControl(oFF.UiType.ALERT);
	helpAlert.setName("doom1HelpAlert");
	helpAlert.setTitle("Help");
	helpAlert.setText("Doom1 WebAssembly port!");
	helpAlert.open();
};
oFF.WasmDoom1.prototype.onError = function(event)
{
	var msg = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_MSG, "Unknown error!");
	oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), msg);
};

oFF.FeApollo = function() {};
oFF.FeApollo.prototype = new oFF.DfUiProgram();
oFF.FeApollo.prototype._ff_c = "FeApollo";

oFF.FeApollo.DEFAULT_PROGRAM_NAME = "Apollo";
oFF.FeApollo.PARAM_PATH = "path";
oFF.FeApollo.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.FeApollo.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.FeApollo.createNewApollo = function()
{
	var prg = new oFF.FeApollo();
	prg.setup();
	return prg;
};
oFF.FeApollo.prototype.m_fileHandler = null;
oFF.FeApollo.prototype.m_directoryManager = null;
oFF.FeApollo.prototype.m_initialPath = null;
oFF.FeApollo.prototype.newProgram = function()
{
	var prg = new oFF.FeApollo();
	prg.setup();
	return prg;
};
oFF.FeApollo.prototype.getProgramName = function()
{
	return oFF.FeApollo.DEFAULT_PROGRAM_NAME;
};
oFF.FeApollo.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.FeApollo.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.FeApollo.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.FeApollo.prototype.getMenuBarDisplayName = function()
{
	return oFF.FeApollo.DEFAULT_PROGRAM_NAME;
};
oFF.FeApollo.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.FeApollo.PARAM_PATH, "Specify the path of the initial location to display", "Path to the working directory ", oFF.XValueType.STRING);
};
oFF.FeApollo.prototype.processArguments = function(args)
{
	var prgArgs = this.getArguments();
	var path = prgArgs.getStringByKey(oFF.FeApollo.PARAM_PATH);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(path) === true)
	{
		this.m_initialPath = path;
	}
};
oFF.FeApollo.prototype.setupProgram = function()
{
	this.m_directoryManager = oFF.FeApolloDirectoryManager.create();
	this.m_fileHandler = oFF.FeApolloFileHandler.createFileHandler(this);
	return this.m_directoryManager.initializeWithProcess(this.getProcess(), this.m_initialPath);
};
oFF.FeApollo.prototype.buildUi = function(genesis)
{
	var newFileExplorerView = oFF.FeApolloView.create(this.m_directoryManager, this.m_fileHandler, genesis, this);
	newFileExplorerView.setApolloListener(this);
	genesis.setRoot(newFileExplorerView.getMainLayout());
	this.addMenuBarButton("File", null, null,  function(controlEvent){
		newFileExplorerView.handleFileMenu(controlEvent.getControl());
	}.bind(this));
	this.addMenuBarButton("Edit", null, null,  function(controlEvent2){
		this.getGenesis().showInfoToast("Edit menu");
	}.bind(this));
	this.addMenuBarButton("View", null, null,  function(controlEvent3){
		newFileExplorerView.handleViewMenu(controlEvent3.getControl());
	}.bind(this));
	this.addMenuBarButton("Help", "hint", null,  function(controlEvent4){
		this.openHelpAlert();
	}.bind(this));
	this.setTitle(this.m_directoryManager.getRootDirectory().getName());
};
oFF.FeApollo.prototype.openHelpAlert = function()
{
	var helpAlert = this.getGenesis().newControl(oFF.UiType.ALERT);
	helpAlert.setName("feHelpAlert");
	helpAlert.setTitle("Help");
	helpAlert.setText("Apollo File Explorer v0.75!");
	helpAlert.open();
};
oFF.FeApollo.prototype.onApolloFileOpen = function(apolloFile) {};
oFF.FeApollo.prototype.onApolloDirectoryOpen = function(apolloDir)
{
	this.setTitle(apolloDir.getName());
};
oFF.FeApollo.prototype.onApolloMenuBarItemClick = function(itemName)
{
	if (oFF.XString.isEqual(itemName, "apolloToolbarMenuExit"))
	{
		this.exitNow(0);
	}
};
oFF.FeApollo.prototype.onChildFetched = function(extResult, result, fetchedChildren, customIdentifier)
{
	this.log("fetched");
	this.log(result.getHierarchyParentNode().getChildSetState().getName());
};

oFF.SuVulcan = function() {};
oFF.SuVulcan.prototype = new oFF.DfUiProgram();
oFF.SuVulcan.prototype._ff_c = "SuVulcan";

oFF.SuVulcan.DEFAULT_PROGRAM_NAME = "Vulcan";
oFF.SuVulcan.PARAM_VIEW = "view";
oFF.SuVulcan.prototype.m_viewMap = null;
oFF.SuVulcan.prototype.m_mainNavigationContainer = null;
oFF.SuVulcan.prototype.m_autoOpenViewName = null;
oFF.SuVulcan.prototype.newProgram = function()
{
	var prg = new oFF.SuVulcan();
	prg.setup();
	return prg;
};
oFF.SuVulcan.prototype.getProgramName = function()
{
	return oFF.SuVulcan.DEFAULT_PROGRAM_NAME;
};
oFF.SuVulcan.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
	this.m_autoOpenViewName = null;
	this.m_viewMap = oFF.XObjectExt.release(this.m_viewMap);
	this.m_mainNavigationContainer = oFF.XObjectExt.release(this.m_mainNavigationContainer);
};
oFF.SuVulcan.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuVulcan.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuVulcan.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60vw", "60vh");
};
oFF.SuVulcan.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuVulcan.DEFAULT_PROGRAM_NAME;
};
oFF.SuVulcan.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.SuVulcan.PARAM_VIEW, "Which view to open");
};
oFF.SuVulcan.prototype.processArguments = function(args)
{
	this.m_autoOpenViewName = args.getStringByKey(oFF.SuVulcan.PARAM_VIEW);
};
oFF.SuVulcan.prototype.setupProgram = function()
{
	this.m_viewMap = oFF.XHashMapByString.create();
	return null;
};
oFF.SuVulcan.prototype.buildUi = function(genesis)
{
	this.addMenuBarButton("Help", "hint", null,  function(controlEvent){
		this.openHelpAlert();
	}.bind(this));
	this.m_mainNavigationContainer = genesis.newControl(oFF.UiType.NAVIGATION_CONTAINER);
	this.m_mainNavigationContainer.useMaxSpace();
	this.m_mainNavigationContainer.registerOnBack(oFF.UiLambdaBackListener.create( function(event){
		this.updateViewArgument(null);
	}.bind(this)));
	var homePage = this.m_mainNavigationContainer.pushNewPage();
	homePage.useMaxSpace();
	homePage.setShowHeader(false);
	var homePageLayout = homePage.setNewContent(oFF.UiType.FLEX_LAYOUT);
	homePageLayout.useMaxSpace();
	homePageLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	homePageLayout.setDirection(oFF.UiFlexDirection.ROW);
	homePageLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	homePageLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_AROUND);
	homePageLayout.setWrap(oFF.UiFlexWrap.WRAP);
	this.createViewButtons(homePageLayout);
	genesis.setRoot(this.m_mainNavigationContainer);
	this.autoOpenInitialView();
};
oFF.SuVulcan.prototype.createViewButtons = function(parentLayout)
{
	oFF.XCollectionUtils.forEach(oFF.SuVulcanViewType.getAllTypes(),  function(viewType){
		var tileName = oFF.XStringUtils.concatenate3("futVulcan", viewType.getName(), "Tile");
		var viewTile = this.createCustomTile(tileName, viewType.getDisplayName(), viewType.getIcon(), viewType.getDescription(), viewType.getAccentColor(),  function(controlEvent){
			this.openView(viewType);
		}.bind(this));
		parentLayout.addItem(viewTile);
	}.bind(this));
};
oFF.SuVulcan.prototype.createCustomTile = function(name, text, icon, tooltip, tileColor, tilePressConsumer)
{
	var newTile = this.getGenesis().newControl(oFF.UiType.TILE);
	newTile.setName(name);
	newTile.setFrameType(oFF.UiFrameType.ONE_BY_ONE);
	newTile.setTileMode(oFF.UiTileMode.CONTENT_MODE);
	newTile.setMargin(oFF.UiCssBoxEdges.create("0.5rem"));
	newTile.setTooltip(tooltip);
	newTile.registerOnPress(oFF.UiLambdaPressListener.create(tilePressConsumer));
	var tileWrapper = newTile.setNewContent(oFF.UiType.FLEX_LAYOUT);
	tileWrapper.useMaxSpace();
	tileWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
	tileWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	tileWrapper.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	var tileIcon = tileWrapper.addNewItemOfType(oFF.UiType.ICON);
	tileIcon.setColor(tileColor);
	tileIcon.setIcon(icon);
	tileIcon.setIconSize(oFF.UiCssLength.create("75px"));
	tileIcon.setMargin(oFF.UiCssBoxEdges.create("0 0.75rem 1rem 0.75rem"));
	tileIcon.setEnabled(false);
	var tileLbl = tileWrapper.addNewItemOfType(oFF.UiType.LABEL);
	tileLbl.setText(text);
	tileLbl.useMaxWidth();
	tileLbl.setWrapping(true);
	tileLbl.setTextAlign(oFF.UiTextAlign.CENTER);
	tileLbl.setFontSize(oFF.UiCssLength.create("1.25rem"));
	return newTile;
};
oFF.SuVulcan.prototype.openHelpAlert = function()
{
	var helpAlert = this.m_genesis.newControl(oFF.UiType.ALERT);
	helpAlert.setName("futVulcanHelpAlert");
	helpAlert.setTitle("Help");
	helpAlert.setText("Firefly UI Toolit v0.4 alpha!");
	helpAlert.open();
};
oFF.SuVulcan.prototype.openView = function(viewType)
{
	var vulcanView = this.getViewByType(viewType);
	if (oFF.notNull(vulcanView))
	{
		this.m_mainNavigationContainer.pushPage(vulcanView.getView());
		this.updateViewArgument(vulcanView);
	}
};
oFF.SuVulcan.prototype.getViewByType = function(viewType)
{
	var vulcanView = this.m_viewMap.getByKey(viewType.getName());
	if (oFF.isNull(vulcanView))
	{
		vulcanView = oFF.SuVulcanViewFactory.create(viewType, this.getGenesis());
		this.m_viewMap.put(viewType.getName(), vulcanView);
	}
	return vulcanView;
};
oFF.SuVulcan.prototype.autoOpenInitialView = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_autoOpenViewName))
	{
		var tmpType = oFF.SuVulcanViewType.lookup(this.m_autoOpenViewName);
		if (oFF.notNull(tmpType))
		{
			this.openView(tmpType);
		}
	}
	this.m_autoOpenViewName = null;
};
oFF.SuVulcan.prototype.updateViewArgument = function(currentView)
{
	var prgArgs = this.getArguments();
	if (oFF.notNull(currentView))
	{
		var viewTypeName = currentView.getType().getName();
		prgArgs.putString(oFF.SuVulcan.PARAM_VIEW, viewTypeName);
	}
	else
	{
		prgArgs.remove(oFF.SuVulcan.PARAM_VIEW);
	}
	this.getProcess().notifyProcessEvent(oFF.ProcessEventType.START_CFG_CHANGED);
};

oFF.SuMinerva = function() {};
oFF.SuMinerva.prototype = new oFF.DfUiProgram();
oFF.SuMinerva.prototype._ff_c = "SuMinerva";

oFF.SuMinerva.DEFAULT_PROGRAM_NAME = "Minerva";
oFF.SuMinerva.PARAM_SRC = "src";
oFF.SuMinerva.prototype.m_mainLayout = null;
oFF.SuMinerva.prototype.m_imageContainer = null;
oFF.SuMinerva.prototype.m_src = null;
oFF.SuMinerva.prototype.m_file = null;
oFF.SuMinerva.prototype.newProgram = function()
{
	var prg = new oFF.SuMinerva();
	prg.setup();
	return prg;
};
oFF.SuMinerva.prototype.getProgramName = function()
{
	return oFF.SuMinerva.DEFAULT_PROGRAM_NAME;
};
oFF.SuMinerva.prototype.releaseObject = function()
{
	this.m_imageContainer = oFF.XObjectExt.release(this.m_imageContainer);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	this.m_file = oFF.XObjectExt.release(this.m_file);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuMinerva.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuMinerva.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("75vw", "75vh");
};
oFF.SuMinerva.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuMinerva.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuMinerva.DEFAULT_PROGRAM_NAME;
};
oFF.SuMinerva.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.DfProgram.PARAM_FILE, "Specify the file to open", "Path to the file ", oFF.XValueType.STRING);
	metadata.addOption(oFF.SuMinerva.PARAM_SRC, "Specify the source of the image to render", "URL or a base64 string ", oFF.XValueType.STRING);
};
oFF.SuMinerva.prototype.processArguments = function(args)
{
	var fileName = args.getStringByKey(oFF.DfProgram.PARAM_FILE);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fileName))
	{
		this.m_file = this.prepareFileByPath(fileName);
	}
	if (oFF.isNull(this.m_file))
	{
		this.m_src = args.getStringByKey(oFF.SuMinerva.PARAM_SRC);
	}
};
oFF.SuMinerva.prototype.setupProgram = function()
{
	return null;
};
oFF.SuMinerva.prototype.buildUi = function(genesis)
{
	this.addMenuBarButton("File", null, null,  function(controlEvent){
		this.presentFileMenu(controlEvent.getControl());
	}.bind(this));
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	genesis.setRoot(this.m_mainLayout);
	this.doStartup();
};
oFF.SuMinerva.prototype.doStartup = function()
{
	if (oFF.notNull(this.m_file))
	{
		this.renderImageByFile(this.m_file);
	}
	else if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_src))
	{
		this.renderImageBySrc(this.m_src);
	}
	else
	{
		this.setTitle("Image viewer");
		this.showImageSelectionView();
	}
};
oFF.SuMinerva.prototype.presentFileMenu = function(fileBtn)
{
	var fileMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	var openMenuItem = fileMenu.addNewItem();
	openMenuItem.setText("Open...");
	openMenuItem.setIcon("background");
	openMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.openFileFromFileSystem();
	}.bind(this)));
	var openByUrlMenuItem = fileMenu.addNewItem();
	openByUrlMenuItem.setText("Open from URL...");
	openByUrlMenuItem.setIcon("download");
	openByUrlMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.presentSrcInputPopup();
	}.bind(this)));
	var exitMenuItem = fileMenu.addNewItem();
	exitMenuItem.setText("Exit");
	exitMenuItem.setIcon("decline");
	exitMenuItem.setSectionStart(true);
	exitMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
		this.terminate();
	}.bind(this)));
	fileMenu.openAt(fileBtn);
};
oFF.SuMinerva.prototype.showImageSelectionView = function()
{
	this.m_mainLayout.clearItems();
	this.m_imageContainer = oFF.XObjectExt.release(this.m_imageContainer);
	var imageSelectionWrapper = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	imageSelectionWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
	imageSelectionWrapper.useMaxSpace();
	imageSelectionWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	imageSelectionWrapper.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	var openByFileSystem = imageSelectionWrapper.addNewItemOfType(oFF.UiType.BUTTON);
	openByFileSystem.setText("Select From Filesystem");
	openByFileSystem.setIcon("background");
	openByFileSystem.setMargin(oFF.UiCssBoxEdges.create("0 0 1rem 0"));
	openByFileSystem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.openFileFromFileSystem();
	}.bind(this)));
	var openByUrlBtn = imageSelectionWrapper.addNewItemOfType(oFF.UiType.BUTTON);
	openByUrlBtn.setText("Open from URL");
	openByUrlBtn.setIcon("download");
	openByUrlBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.presentSrcInputPopup();
	}.bind(this)));
};
oFF.SuMinerva.prototype.renderImage = function(src)
{
	if (oFF.isNull(this.m_imageContainer) || !this.m_mainLayout.getItems().contains(this.m_imageContainer))
	{
		this.m_mainLayout.clearItems();
		this.m_imageContainer = oFF.XObjectExt.release(this.m_imageContainer);
		this.m_imageContainer = this.m_mainLayout.addNewItemOfType(oFF.UiType.IMAGE);
		this.m_imageContainer.removeCssClass("sapMPointer");
		this.m_imageContainer.useMaxSpace();
		this.m_imageContainer.setImageMode(oFF.UiImageMode.BACKGROUND);
		this.m_imageContainer.setBackgroundSize("contain");
		this.m_imageContainer.setBackgroundPosition("center");
		this.m_imageContainer.registerOnLoadFinished(oFF.UiLambdaLoadFinishedListener.create( function(controlEvent){
			this.m_imageContainer.setBusy(false);
		}.bind(this)));
		this.m_imageContainer.registerOnError(oFF.UiLambdaErrorListener.create( function(controlEvent2){
			this.m_imageContainer.setBusy(false);
			this.displayError("Could not load image");
		}.bind(this)));
	}
	this.m_imageContainer.setBusy(true);
	this.m_imageContainer.setSrc(src);
};
oFF.SuMinerva.prototype.renderImageBySrc = function(src)
{
	this.m_src = src;
	this.m_file = null;
	this.setTitle(oFF.XString.substring(src, 0, oFF.XMath.min(oFF.XString.size(src), 100)));
	this.renderImage(src);
};
oFF.SuMinerva.prototype.renderImageByFile = function(file)
{
	this.m_file = file;
	this.m_src = null;
	var filePath = file.getUri().getPath();
	this.setTitle(filePath);
	this.renderImage(filePath);
};
oFF.SuMinerva.prototype.presentSrcInputPopup = function()
{
	var srcEntryPopup = oFF.UtInputPopup.create(this.getGenesis(), "Open image", "Enter the image url or base64 string");
	srcEntryPopup.setOkButtonText("Open");
	srcEntryPopup.setOkButtonType(oFF.UiButtonType.PRIMARY);
	srcEntryPopup.setInputPlaceholder("Url or base64 string");
	srcEntryPopup.setInputValue(this.m_src);
	srcEntryPopup.setInputConsumer( function(inputStr){
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inputStr))
		{
			this.renderImageBySrc(inputStr);
			this.updateParams();
		}
		else
		{
			this.getGenesis().showWarningToast("Please specify a url or base64 string");
		}
	}.bind(this));
	srcEntryPopup.open();
};
oFF.SuMinerva.prototype.openFileFromFileSystem = function()
{
	var reLoadConfig = oFF.SuResourceExplorerConfigWrapper.create();
	reLoadConfig.addExtensionFilter("png");
	reLoadConfig.setTitle("Select Image");
	reLoadConfig.setInitialPath(oFF.UtFileUtils.getParentDirPath(this.m_file));
	oFF.SuResourceExplorerPromise.loadFile(this.getProcess(), reLoadConfig).then( function(file){
		this.renderImageByFile(file);
		this.updateParams();
		return file;
	}.bind(this),  function(errorMsg){
		this.getGenesis().showErrorToast(errorMsg.getText());
	}.bind(this));
};
oFF.SuMinerva.prototype.displayError = function(message)
{
	this.log(message);
	this.m_mainLayout.clearItems();
	this.m_imageContainer = oFF.XObjectExt.release(this.m_imageContainer);
	var errorLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	errorLbl.setText("Error");
	errorLbl.setFontSize(oFF.UiCssLength.create("20px"));
	if (oFF.XStringUtils.isNotNullAndNotEmpty(message))
	{
		var messageLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		messageLbl.setText(message);
		messageLbl.setFontSize(oFF.UiCssLength.create("18px"));
		messageLbl.setMargin(oFF.UiCssBoxEdges.create("10px"));
		messageLbl.setFontColor(oFF.UiColor.RED);
	}
};
oFF.SuMinerva.prototype.prepareFileByPath = function(filePath)
{
	var file = null;
	if (oFF.notNull(filePath))
	{
		var process = this.getProcess();
		file = oFF.XFile.createWithVars(process, filePath);
		if (oFF.isNull(file) || file.hasErrors())
		{
			this.log2("Error while loading file: ", filePath);
		}
	}
	return file;
};
oFF.SuMinerva.prototype.updateParams = function()
{
	var prgArgs = this.getArguments();
	if (oFF.notNull(this.m_file))
	{
		this.updateFileParam(this.m_file);
		prgArgs.remove(oFF.SuMinerva.PARAM_SRC);
	}
	else if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_src))
	{
		this.updateFileParam(null);
		prgArgs.putString(oFF.SuMinerva.PARAM_SRC, this.m_src);
	}
	else
	{
		this.updateFileParam(null);
		prgArgs.remove(oFF.SuMinerva.PARAM_SRC);
	}
	this.getProcess().notifyProcessEvent(oFF.ProcessEventType.START_CFG_CHANGED);
};

oFF.SuTheia = function() {};
oFF.SuTheia.prototype = new oFF.DfUiProgram();
oFF.SuTheia.prototype._ff_c = "SuTheia";

oFF.SuTheia.LAST_VIDEO_ID_KEY = "lastVideoId";
oFF.SuTheia.DEFAULT_PROGRAM_NAME = "Theia";
oFF.SuTheia.PARAM_YT_VIDEO_ID = "ytVideoId";
oFF.SuTheia.prototype.m_mainLayout = null;
oFF.SuTheia.prototype.m_videoIdInput = null;
oFF.SuTheia.prototype.m_youTubePlayer = null;
oFF.SuTheia.prototype.m_initialVideoToPlay = null;
oFF.SuTheia.prototype.newProgram = function()
{
	var prg = new oFF.SuTheia();
	prg.setup();
	return prg;
};
oFF.SuTheia.prototype.getProgramName = function()
{
	return oFF.SuTheia.DEFAULT_PROGRAM_NAME;
};
oFF.SuTheia.prototype.releaseObject = function()
{
	this.m_youTubePlayer = oFF.XObjectExt.release(this.m_youTubePlayer);
	this.m_videoIdInput = oFF.XObjectExt.release(this.m_videoIdInput);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuTheia.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuTheia.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("45vw", "55vh");
};
oFF.SuTheia.prototype.isShowMenuBar = function()
{
	return false;
};
oFF.SuTheia.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuTheia.DEFAULT_PROGRAM_NAME;
};
oFF.SuTheia.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.SuTheia.PARAM_YT_VIDEO_ID, "The youtube video id or multiple video ids separated by comma to play", "a video id string", oFF.XValueType.STRING);
};
oFF.SuTheia.prototype.processArguments = function(args)
{
	this.m_initialVideoToPlay = args.getStringByKey(oFF.SuTheia.PARAM_YT_VIDEO_ID);
};
oFF.SuTheia.prototype.setupProgram = function()
{
	return null;
};
oFF.SuTheia.prototype.buildUi = function(genesis)
{
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	genesis.setRoot(this.m_mainLayout);
	this.createMainView();
	this.autoPlayIfNeeded();
};
oFF.SuTheia.prototype.createMainView = function()
{
	this.m_videoIdInput = this.m_mainLayout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_videoIdInput.setWidth(oFF.UiCssLength.create("50%"));
	this.m_videoIdInput.setMargin(oFF.UiCssBoxEdges.create("0 0 1rem 0"));
	this.m_videoIdInput.setPlaceholder("VideoId or VideoIds separated by commas");
	this.m_videoIdInput.setText(this.getLocalStorage().getStringByKeyExt(oFF.SuTheia.LAST_VIDEO_ID_KEY, ""));
	var playerConfigLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	playerConfigLayout.setDirection(oFF.UiFlexDirection.ROW);
	playerConfigLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	var hidePlayerLbl = playerConfigLayout.addNewItemOfType(oFF.UiType.LABEL);
	hidePlayerLbl.setText("Hide player:");
	var hidePlayerSwitch = playerConfigLayout.addNewItemOfType(oFF.UiType.SWITCH);
	hidePlayerSwitch.setOn(false);
	hidePlayerSwitch.registerOnChange(oFF.UiLambdaChangeListener.create( function(controlEvent){
		this.m_youTubePlayer.setPlayerHidden(hidePlayerSwitch.isOn());
	}.bind(this)));
	var loopLbl = playerConfigLayout.addNewItemOfType(oFF.UiType.LABEL);
	loopLbl.setText("Loop:");
	loopLbl.setMargin(oFF.UiCssBoxEdges.create("0 0 0 1rem"));
	var loopSwitch = playerConfigLayout.addNewItemOfType(oFF.UiType.SWITCH);
	loopSwitch.setOn(false);
	loopSwitch.registerOnChange(oFF.UiLambdaChangeListener.create( function(controlEvent2){
		this.m_youTubePlayer.setLoopEnabled(loopSwitch.isOn());
	}.bind(this)));
	var muteLbl = playerConfigLayout.addNewItemOfType(oFF.UiType.LABEL);
	muteLbl.setText("Mute:");
	muteLbl.setMargin(oFF.UiCssBoxEdges.create("0 0 0 1rem"));
	var muteSwitch = playerConfigLayout.addNewItemOfType(oFF.UiType.SWITCH);
	muteSwitch.setOn(false);
	muteSwitch.registerOnChange(oFF.UiLambdaChangeListener.create( function(controlEvent3){
		this.m_youTubePlayer.setMuted(muteSwitch.isOn());
	}.bind(this)));
	var playerControlLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	playerControlLayout.setDirection(oFF.UiFlexDirection.ROW);
	playerControlLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	playerControlLayout.setMargin(oFF.UiCssBoxEdges.create("0.5rem 0 0 0"));
	var playButton = playerControlLayout.addNewItemOfType(oFF.UiType.BUTTON);
	playButton.setText("Play");
	playButton.setIcon("play");
	playButton.setMargin(oFF.UiCssBoxEdges.create("0 1.5rem 0 0"));
	playButton.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent4){
		var tmpVideoId = this.m_videoIdInput.getText();
		this.playVideo(tmpVideoId);
		this.getLocalStorage().putString(oFF.SuTheia.LAST_VIDEO_ID_KEY, tmpVideoId);
		this.updateParams(tmpVideoId);
	}.bind(this)));
	var stopButton = playerControlLayout.addNewItemOfType(oFF.UiType.BUTTON);
	stopButton.setText("Stop");
	stopButton.setIcon("stop");
	stopButton.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent5){
		this.m_youTubePlayer.stop();
	}.bind(this)));
	this.m_youTubePlayer = oFF.SuYouTubePlayerView.create(this.getGenesis());
	this.m_youTubePlayer.getView().setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	this.m_youTubePlayer.setPlayerHidden(false);
	this.m_mainLayout.addItem(this.m_youTubePlayer.getView());
};
oFF.SuTheia.prototype.autoPlayIfNeeded = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_initialVideoToPlay))
	{
		this.m_videoIdInput.setText(this.m_initialVideoToPlay);
		this.playVideo(this.m_initialVideoToPlay);
		this.m_initialVideoToPlay = null;
	}
};
oFF.SuTheia.prototype.playVideo = function(videoId)
{
	this.m_youTubePlayer.playVideo(videoId);
};
oFF.SuTheia.prototype.updateParams = function(videoId)
{
	var prgArgs = this.getArguments();
	if (oFF.XStringUtils.isNullOrEmpty(videoId))
	{
		prgArgs.remove(oFF.SuTheia.PARAM_YT_VIDEO_ID);
	}
	else
	{
		prgArgs.putString(oFF.SuTheia.PARAM_YT_VIDEO_ID, videoId);
	}
	this.getProcess().notifyProcessEvent(oFF.ProcessEventType.START_CFG_CHANGED);
};

oFF.SuProgramLoader = function() {};
oFF.SuProgramLoader.prototype = new oFF.DfUiProgram();
oFF.SuProgramLoader.prototype._ff_c = "SuProgramLoader";

oFF.SuProgramLoader.RESURCES_DIR_NAME = "resources";
oFF.SuProgramLoader.DEFAULT_PROGRAM_NAME = "ProgramLoader";
oFF.SuProgramLoader.prototype.m_mainLayout = null;
oFF.SuProgramLoader.prototype.m_manifestFile = null;
oFF.SuProgramLoader.prototype.m_prgClassFile = null;
oFF.SuProgramLoader.prototype.newProgram = function()
{
	var prg = new oFF.SuProgramLoader();
	prg.setup();
	return prg;
};
oFF.SuProgramLoader.prototype.getProgramName = function()
{
	return oFF.SuProgramLoader.DEFAULT_PROGRAM_NAME;
};
oFF.SuProgramLoader.prototype.releaseObject = function()
{
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	this.m_manifestFile = null;
	this.m_prgClassFile = null;
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuProgramLoader.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuProgramLoader.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60vw", "60vh");
};
oFF.SuProgramLoader.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuProgramLoader.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuProgramLoader.DEFAULT_PROGRAM_NAME;
};
oFF.SuProgramLoader.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuProgramLoader.prototype.processArguments = function(args) {};
oFF.SuProgramLoader.prototype.setupProgram = function()
{
	return null;
};
oFF.SuProgramLoader.prototype.buildUi = function(genesis)
{
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	genesis.setRoot(this.m_mainLayout);
	this.createMainView();
};
oFF.SuProgramLoader.prototype.createMainView = function()
{
	var maifestSelectionLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	maifestSelectionLayout.useMaxWidth();
	maifestSelectionLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	var selectedManifestInput = maifestSelectionLayout.addNewItemOfType(oFF.UiType.INPUT);
	selectedManifestInput.setWidth(oFF.UiCssLength.create("25%"));
	selectedManifestInput.setMinWidth(oFF.UiCssLength.create("100px"));
	selectedManifestInput.setEditable(false);
	selectedManifestInput.setPlaceholder("Please select a program manifest...");
	var selectManifestBtn = maifestSelectionLayout.addNewItemOfType(oFF.UiType.BUTTON);
	selectManifestBtn.setText("Select manifest...");
	selectManifestBtn.setIcon("upload");
	selectManifestBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		var reSelectManifestConfig = oFF.SuResourceExplorerConfigWrapper.create();
		reSelectManifestConfig.addExtensionFilter("json");
		reSelectManifestConfig.setTitle("Select Program Manifest");
		oFF.SuResourceExplorerPromise.loadFile(this.getProcess(), reSelectManifestConfig).then( function(file){
			this.m_manifestFile = file;
			selectedManifestInput.setText(this.m_manifestFile.getName());
			return file;
		}.bind(this),  function(errorMsg){
			this.getGenesis().showErrorToast(errorMsg.getText());
		}.bind(this));
	}.bind(this)));
	var prgClassSelectionLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	prgClassSelectionLayout.useMaxWidth();
	prgClassSelectionLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	prgClassSelectionLayout.setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	var selectedPrgClassInput = prgClassSelectionLayout.addNewItemOfType(oFF.UiType.INPUT);
	selectedPrgClassInput.setWidth(oFF.UiCssLength.create("25%"));
	selectedPrgClassInput.setMinWidth(oFF.UiCssLength.create("100px"));
	selectedPrgClassInput.setEditable(false);
	selectedPrgClassInput.setPlaceholder("Please select a program class...");
	var selectProgramClassBtn = prgClassSelectionLayout.addNewItemOfType(oFF.UiType.BUTTON);
	selectProgramClassBtn.setText("Select program class...");
	selectProgramClassBtn.setIcon("upload");
	selectProgramClassBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
		var reSelectPrgClassConfig = oFF.SuResourceExplorerConfigWrapper.create();
		reSelectPrgClassConfig.addExtensionFilter("js");
		reSelectPrgClassConfig.setTitle("Select Program Class");
		oFF.SuResourceExplorerPromise.loadFile(this.getProcess(), reSelectPrgClassConfig).then( function(file2){
			this.m_prgClassFile = file2;
			selectedPrgClassInput.setText(this.m_prgClassFile.getName());
			return file2;
		}.bind(this),  function(errorMsg2){
			this.getGenesis().showErrorToast(errorMsg2.getText());
		}.bind(this));
	}.bind(this)));
	var loadProgramBtn = this.m_mainLayout.addNewItemOfType(oFF.UiType.BUTTON);
	loadProgramBtn.setText("Load program");
	loadProgramBtn.setIcon("media-play");
	loadProgramBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	loadProgramBtn.setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	loadProgramBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
		this.loadProgram();
	}.bind(this)));
};
oFF.SuProgramLoader.prototype.loadProgram = function()
{
	if (oFF.notNull(this.m_prgClassFile))
	{
		var prgClassLocation = this.m_prgClassFile.getUrl();
		var resroucesIndex = oFF.XString.indexOf(prgClassLocation, oFF.SuProgramLoader.RESURCES_DIR_NAME);
		if (oFF.XString.containsString(prgClassLocation, oFF.SuProgramLoader.RESURCES_DIR_NAME) && resroucesIndex !== -1)
		{
			var onlyResourcesPath = oFF.XString.substring(prgClassLocation, resroucesIndex + oFF.XString.size(oFF.SuProgramLoader.RESURCES_DIR_NAME), -1);
			var mimesPath = oFF.XStringUtils.concatenate2("${ff_mimes}", onlyResourcesPath);
			oFF.ModuleManager.registerDirect(this.m_prgClassFile.getName(), this.m_prgClassFile.getName(), false, this.getProcess().resolvePath(mimesPath), null, null);
			var prgModule = oFF.ModuleManager.getModuleDef(this.m_prgClassFile.getName());
			oFF.ModuleManager.getModuleLoader().processModuleLoad(this.getProcess(), prgModule, null, null);
		}
		else
		{
			this.getGenesis().showErrorToast("Program class needs to be located under resources");
			return;
		}
	}
	if (oFF.notNull(this.m_manifestFile))
	{
		var jsonContent = this.m_manifestFile.getFileContent().getJsonContent();
		if (oFF.notNull(jsonContent) && jsonContent.isStructure())
		{
			var tmpStruct = jsonContent.asStructure();
			var tmpManifest = oFF.ProgramManifest.createByJsonStructure(tmpStruct);
			oFF.ProgramRegistration.registerProgramByManifest(tmpManifest).then( function(manifest){
				this.getGenesis().showSuccessToast(oFF.XStringUtils.concatenate3("Program ", tmpManifest.getName(), " successfully registered!"));
				return manifest;
			}.bind(this),  function(errorMsg){
				this.getGenesis().showErrorToast(errorMsg.getText());
			}.bind(this));
		}
	}
	else
	{
		this.getGenesis().showWarningToast("Please select a program manifest!");
	}
};

oFF.SuMercury = function() {};
oFF.SuMercury.prototype = new oFF.DfUiProgram();
oFF.SuMercury.prototype._ff_c = "SuMercury";

oFF.SuMercury.DEFAULT_PROGRAM_NAME = "Mercury";
oFF.SuMercury.prototype.m_mainLayout = null;
oFF.SuMercury.prototype.m_searchableListView = null;
oFF.SuMercury.prototype.m_detailsContainer = null;
oFF.SuMercury.prototype.newProgram = function()
{
	var prg = new oFF.SuMercury();
	prg.setup();
	return prg;
};
oFF.SuMercury.prototype.getProgramName = function()
{
	return oFF.SuMercury.DEFAULT_PROGRAM_NAME;
};
oFF.SuMercury.prototype.releaseObject = function()
{
	this.m_detailsContainer = oFF.XObjectExt.release(this.m_detailsContainer);
	this.m_searchableListView = oFF.XObjectExt.release(this.m_searchableListView);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuMercury.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuMercury.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("75vw", "75vh");
};
oFF.SuMercury.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuMercury.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuMercury.DEFAULT_PROGRAM_NAME;
};
oFF.SuMercury.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.DfProgram.PARAM_FILE, "Specify the file to open", "Path to the file ", oFF.XValueType.STRING);
};
oFF.SuMercury.prototype.processArguments = function(args) {};
oFF.SuMercury.prototype.setupProgram = function()
{
	return null;
};
oFF.SuMercury.prototype.buildUi = function(genesis)
{
	this.setTitle("Program Manager");
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.m_mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.m_searchableListView = oFF.UtSearchableListView.create(genesis, null);
	this.m_searchableListView.setSearchFieldPlaceholder("Search program...");
	this.m_searchableListView.setListItemSelectedConsumer( function(listItem){
		oFF.XLogger.println("selected");
	}.bind(this));
	var searchableListWrapper = this.m_searchableListView.getView();
	searchableListWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	searchableListWrapper.setBorderColor(oFF.UiColor.GREY);
	searchableListWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_mainLayout.addItem(searchableListWrapper);
	this.m_detailsContainer = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_detailsContainer.useMaxHeight();
	this.m_detailsContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_detailsContainer.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_detailsContainer.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_detailsContainer.setWidth(oFF.UiCssLength.create("80%"));
	this.m_detailsContainer.setFlex("1 1 80%");
	this.m_detailsContainer.setBackgroundColor(oFF.UiColor.WHITE);
	this.m_detailsContainer.addNewItemOfType(oFF.UiType.TITLE).setText("Work in Progress").setTitleLevel(oFF.UiTitleLevel.H_3);
	this.m_detailsContainer.addNewItemOfType(oFF.UiType.IMAGE).setSrc(this.getProcess().resolvePath("${ff_mimes}/images/mercury/work-in-progress.png")).setSize(oFF.UiSize.createByCss("512px", "512px"));
	genesis.setRoot(this.m_mainLayout);
	this.doStartup();
};
oFF.SuMercury.prototype.doStartup = function()
{
	var listItems = oFF.XList.create();
	oFF.XCollectionUtils.forEach(oFF.ProgramRegistration.getOrderedAllEntries(),  function(prgManifest){
		if (prgManifest.getOutputContainerType() !== null && prgManifest.getOutputContainerType().isUiContainer())
		{
			var tmpListItem = this.getGenesis().newControl(oFF.UiType.LIST_ITEM);
			tmpListItem.setText(prgManifest.getDisplayName());
			tmpListItem.setTooltip(prgManifest.getDescription());
			tmpListItem.setCustomObject(prgManifest);
			tmpListItem.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create( function(controlEvent){
				this.showProgramContextMenu(prgManifest, controlEvent);
			}.bind(this)));
			listItems.add(tmpListItem);
		}
	}.bind(this));
	this.m_searchableListView.setListItems(listItems);
};
oFF.SuMercury.prototype.showProgramContextMenu = function(prgManifest, event)
{
	var tmpMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	var runPrgItem = tmpMenu.addNewItem();
	runPrgItem.setText("Run");
	runPrgItem.setIcon("play");
	runPrgItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.runProgramByManifest(prgManifest);
	}.bind(this)));
	tmpMenu.openAtPosition(event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_X, 0), event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_Y, 0));
};
oFF.SuMercury.prototype.runProgramByManifest = function(prgManifest)
{
	if (oFF.notNull(prgManifest))
	{
		var tmpRunner = oFF.ProgramRunner.createRunner(this.getProcess(), prgManifest.getProgramName());
		tmpRunner.runProgram().onCatch( function(errorMsg){
			this.getGenesis().showErrorToast(errorMsg.getText());
		}.bind(this));
	}
};

oFF.SuResourceExplorerTester = function() {};
oFF.SuResourceExplorerTester.prototype = new oFF.DfUiProgram();
oFF.SuResourceExplorerTester.prototype._ff_c = "SuResourceExplorerTester";

oFF.SuResourceExplorerTester.DEFAULT_PROGRAM_NAME = "ResourceExplorerTester";
oFF.SuResourceExplorerTester.prototype.rootLayout = null;
oFF.SuResourceExplorerTester.prototype.pressedBtn = null;
oFF.SuResourceExplorerTester.prototype.jsonBtn = null;
oFF.SuResourceExplorerTester.prototype.profileBtn = null;
oFF.SuResourceExplorerTester.prototype.jsonFormatBtn = null;
oFF.SuResourceExplorerTester.prototype.jsonTextArea = null;
oFF.SuResourceExplorerTester.prototype.profileComboBox = null;
oFF.SuResourceExplorerTester.prototype.onQAErase = null;
oFF.SuResourceExplorerTester.prototype.onOk = null;
oFF.SuResourceExplorerTester.prototype.busyMessageInput = null;
oFF.SuResourceExplorerTester.prototype.onOkError = null;
oFF.SuResourceExplorerTester.prototype.errorMessageInput = null;
oFF.SuResourceExplorerTester.prototype.onCancel = null;
oFF.SuResourceExplorerTester.prototype.onValidation = null;
oFF.SuResourceExplorerTester.prototype.onFilter = null;
oFF.SuResourceExplorerTester.prototype.clearLocalStorageRBG = null;
oFF.SuResourceExplorerTester.prototype.versionRBG = null;
oFF.SuResourceExplorerTester.prototype.apiRBG = null;
oFF.SuResourceExplorerTester.prototype.deviceModeRBG = null;
oFF.SuResourceExplorerTester.prototype.selectionModeRBG = null;
oFF.SuResourceExplorerTester.prototype.selectionTypeRBG = null;
oFF.SuResourceExplorerTester.prototype.filesystemRBG = null;
oFF.SuResourceExplorerTester.prototype.dialogModeRBG = null;
oFF.SuResourceExplorerTester.prototype.recentlyUsed = null;
oFF.SuResourceExplorerTester.prototype.newProgram = function()
{
	var program = new oFF.SuResourceExplorerTester();
	this.recentlyUsed = oFF.XList.create();
	this.recentlyUsed.add(oFF.XStringValue.create("sdk/production/datasources/B4S_BW/connection3/Query/datasource3.1.txt\""));
	program.setup();
	return program;
};
oFF.SuResourceExplorerTester.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuResourceExplorerTester.prototype.processArguments = function(args) {};
oFF.SuResourceExplorerTester.prototype.setupProgram = function()
{
	oFF.SuResourceExplorerLocalStorageManager.staticSetup(this.getProcess());
	var resourceTranslationMap = oFF.XHashMapOfStringByString.create();
	resourceTranslationMap.put("WONT_SEE_THIS_NAME", "this instead");
	resourceTranslationMap.put("/fancy%20dir/WONT_SEE_THIS_URL", "and this");
	oFF.SuResourceWrapper.setupStatic(resourceTranslationMap);
	return null;
};
oFF.SuResourceExplorerTester.prototype.buildUi = function(genesis)
{
	this.rootLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.rootLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.rootLayout.setPadding(oFF.UiCssBoxEdges.create("5px"));
	this.clearLocalStorageRBG = this.createRBGSection(this.rootLayout, "Clear Local Storage");
	this.clearLocalStorageRBG.setName("RETClearLocalStorageRBG");
	this.clearLocalStorageRBG.setColumnCount(2);
	this.clearLocalStorageRBG.addNewRadioButton().setText("Yes").setName("Yes");
	this.clearLocalStorageRBG.addNewRadioButton().setText("No").setName("No");
	this.clearLocalStorageRBG.setSelectedName("Yes");
	this.versionRBG = this.createRBGSection(this.rootLayout, "Version");
	this.versionRBG.setName("RETVersionRBG");
	this.versionRBG.setColumnCount(3);
	this.versionRBG.addNewRadioButton().setText("1(Beta)").setName("1");
	this.versionRBG.addNewRadioButton().setText("2(GA)").setName("2");
	this.versionRBG.addNewRadioButton().setText("3(Post-GA)").setName("3");
	this.versionRBG.setSelectedName("2");
	this.apiRBG = this.createRBGSection(this.rootLayout, "API call (only for version 2)");
	this.apiRBG.setName("RETAPIcallRBG");
	this.apiRBG.setColumnCount(2);
	this.apiRBG.addNewRadioButton().setText("local").setName("local");
	this.apiRBG.addNewRadioButton().setText("remote").setName("remote");
	this.apiRBG.setSelectedName("local");
	this.filesystemRBG = this.createRBGSection(this.rootLayout, "File system:");
	this.filesystemRBG.setName("RETFilesystemRBG");
	this.filesystemRBG.setColumnCount(4);
	this.filesystemRBG.addNewRadioButton().setText("Virtual").setName("vfs:");
	this.filesystemRBG.addNewRadioButton().setText("Dummy").setName("fsdummy:");
	this.filesystemRBG.addNewRadioButton().setText("Contentlib (apollo)").setName("fscontentlib://apollo");
	this.filesystemRBG.addNewRadioButton().setText("Olap (apollo)").setName("fsolapcatalog://apollo");
	this.filesystemRBG.setSelectedName("vfs:");
	this.deviceModeRBG = this.createRBGSection(this.rootLayout, "Open in...");
	this.deviceModeRBG.setName("RETDeviceModeRBG");
	this.deviceModeRBG.setColumnCount(2);
	this.deviceModeRBG.addNewRadioButton().setText("Window").setName("window");
	this.deviceModeRBG.addNewRadioButton().setText("Dialog").setName("dialog");
	this.deviceModeRBG.setSelectedName("dialog");
	this.dialogModeRBG = this.createRBGSection(this.rootLayout, "Dialog mode:");
	this.dialogModeRBG.setName("RETDialogModeRGB");
	this.dialogModeRBG.setColumnCount(2);
	this.dialogModeRBG.addNewRadioButton().setText("Open").setName(oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN);
	this.dialogModeRBG.addNewRadioButton().setText("Save").setName(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE);
	this.dialogModeRBG.setSelectedName(oFF.SuResourceExplorerDialogModeConfig.MODE_OPEN);
	this.selectionModeRBG = this.createRBGSection(this.rootLayout, "Selection mode:");
	this.selectionModeRBG.setName("RETSelectionModeRBG");
	this.selectionModeRBG.setColumnCount(2);
	this.selectionModeRBG.addNewRadioButton().setText("Selection").setName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_SELECTION);
	this.selectionModeRBG.addNewRadioButton().setText("Button").setName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON);
	this.selectionModeRBG.setSelectedName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON);
	this.selectionTypeRBG = this.createRBGSection(this.rootLayout, "Selection type:");
	this.selectionTypeRBG.setName("RETSelectionTypeRBG");
	this.selectionTypeRBG.setColumnCount(2);
	this.selectionTypeRBG.addNewRadioButton().setText("File").setName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE);
	this.selectionTypeRBG.addNewRadioButton().setText("Directory").setName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY);
	this.selectionTypeRBG.setSelectedName(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE);
	var jsonSection = this.rootLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	jsonSection.setDirection(oFF.UiFlexDirection.ROW);
	this.jsonTextArea = jsonSection.addNewItemOfType(oFF.UiType.TEXT_AREA);
	this.jsonTextArea.setName("RETJsonText");
	var json = oFF.XStringBuffer.create();
	json.append("{}");
	this.jsonTextArea.setText(json.toString());
	this.formatJSONTxt();
	this.jsonTextArea.setWidth(oFF.UiCssLength.create("100%"));
	this.jsonTextArea.setHeight(oFF.UiCssLength.createExt(350, oFF.UiCssSizeUnit.PIXEL));
	this.jsonFormatBtn = jsonSection.addNewItemOfType(oFF.UiType.BUTTON);
	this.jsonFormatBtn.setText("Format JSON");
	this.jsonFormatBtn.registerOnPress(this);
	this.jsonBtn = jsonSection.addNewItemOfType(oFF.UiType.BUTTON);
	this.jsonBtn.setName("RTEBtnInitWithJSON");
	this.jsonBtn.setText("Init with JSON");
	this.jsonBtn.registerOnPress(this);
	var profileSelection = this.rootLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	profileSelection.setDirection(oFF.UiFlexDirection.ROW);
	this.profileComboBox = profileSelection.addNewItemOfType(oFF.UiType.COMBO_BOX);
	this.profileComboBox.setName("RETComboInitWithProfile");
	this.profileComboBox.addNewItem().setName("RETProfileDetailsFull").setText("Details, Quick access and toolbar").setValue(oFF.SuResourceExplorerConfig.PROFILE_DETAILS);
	this.profileComboBox.addNewItem().setName("RETProfileDatasource").setText("Datasource").setValue(oFF.SuResourceExplorerConfig.PROFILE_DATASOURCE);
	this.profileComboBox.addNewItem().setName("RETProfileTree").setText("Tree Only").setValue(oFF.SuResourceExplorerConfig.PROFILE_TREE_ONLY);
	this.profileComboBox.addNewItem().setName("RETProfileTiles").setText("Tiles Only").setValue(oFF.SuResourceExplorerConfig.PROFILE_TILES_ONLY);
	this.profileComboBox.addNewItem().setName("RETProfileDetails").setText("Details Only").setValue(oFF.SuResourceExplorerConfig.PROFILE_DETAILS_ONLY);
	this.profileComboBox.addNewItem().setName("RETProfileFull").setText("Tree Nav, Details and Tiles View, Toolbar and Quick access").setValue(oFF.SuResourceExplorerConfig.PROFILE_FULL);
	this.profileComboBox.setSelectedItemByIndex(4);
	this.profileBtn = profileSelection.addNewItemOfType(oFF.UiType.BUTTON);
	this.profileBtn.setName("RTEBtnInitWithProfile");
	this.profileBtn.setText("Init with Profile");
	this.profileBtn.registerOnPress(this);
	var callbacks = this.rootLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	callbacks.setDirection(oFF.UiFlexDirection.COLUMN);
	var onOkWithBusy = callbacks.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.onOk = this.createCheckBox(onOkWithBusy, "onOk", "On dialog OK");
	this.busyMessageInput = onOkWithBusy.addNewItemOfType(oFF.UiType.INPUT);
	this.busyMessageInput.setName("REBusyMessage");
	var onOkWithError = callbacks.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.onOkError = this.createCheckBox(onOkWithError, "onOkError", "On dialog OK with Error");
	this.errorMessageInput = onOkWithError.addNewItemOfType(oFF.UiType.INPUT);
	this.errorMessageInput.setName("REErrorMessage");
	this.onCancel = this.createCheckBox(callbacks, "onCancel", "On dialog cancel");
	this.onValidation = this.createCheckBox(callbacks, "onValidation", "On validation");
	this.onFilter = this.createCheckBox(callbacks, "onFilter", "On filter");
	this.onQAErase = this.createCheckBox(callbacks, "onQAErase", "On Quick Access Erase");
};
oFF.SuResourceExplorerTester.prototype.createRBGSection = function(root, label)
{
	var section = root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	section.setDirection(oFF.UiFlexDirection.ROW);
	section.addNewItemOfType(oFF.UiType.LABEL).setText(label);
	return section.addNewItemOfType(oFF.UiType.RADIO_BUTTON_GROUP);
};
oFF.SuResourceExplorerTester.prototype.createCheckBox = function(container, name, text)
{
	var checkBox = container.addNewItemOfType(oFF.UiType.CHECKBOX);
	checkBox.setName(name);
	checkBox.setText(text);
	return checkBox;
};
oFF.SuResourceExplorerTester.prototype.getProgramName = function()
{
	return oFF.SuResourceExplorerTester.DEFAULT_PROGRAM_NAME;
};
oFF.SuResourceExplorerTester.prototype.onPress = function(event)
{
	this.pressedBtn = event.getControl();
	this.formatJSONTxt();
	if (this.pressedBtn === this.jsonFormatBtn)
	{
		return;
	}
	this.runApp();
};
oFF.SuResourceExplorerTester.prototype.runApp = function()
{
	if (oFF.XString.isEqual(this.clearLocalStorageRBG.getSelectedName(), "Yes"))
	{
		oFF.SuResourceExplorerLocalStorageManager.clearAll();
	}
	var fileSystemManager = this.getProcess().getFileSystemManager();
	var targetFsUri = oFF.XUri.createFromUrl(this.filesystemRBG.getSelectedName());
	this.rootLayout.setBusy(true);
	fileSystemManager.processFetchFileSystemExt(oFF.SyncType.NON_BLOCKING, this, null, targetFsUri, true);
};
oFF.SuResourceExplorerTester.prototype.onFileSystemFetched = function(extResult, fileSystem, customIdentifier)
{
	this.rootLayout.setBusy(false);
	if (extResult.hasErrors())
	{
		this.errorMsg(extResult.getFirstError().getStringRepresentation());
		return;
	}
	this.runAppStep2();
};
oFF.SuResourceExplorerTester.prototype.runAppStep2 = function()
{
	var programContainerType = oFF.XString.isEqual(this.deviceModeRBG.getSelectedName(), "window") ? oFF.ProgramContainerType.WINDOW : oFF.ProgramContainerType.DIALOG;
	var jsonTxt = this.jsonTextArea.getText();
	var profileTxt = null;
	if (!oFF.XStringUtils.isNotNullAndNotEmpty(jsonTxt))
	{
		jsonTxt = null;
	}
	if (this.pressedBtn === this.profileBtn)
	{
		if (this.profileComboBox.getSelectedItem() === null)
		{
			return;
		}
		profileTxt = this.profileComboBox.getSelectedItem().getValue();
	}
	var tmpRunner = oFF.ProgramRunner.createRunner(this.getProcess(), oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME);
	tmpRunner.setContainerType(programContainerType);
	tmpRunner.setArgument(oFF.SuResourceExplorer.PARAM_CONFIG, this.appendDialogModeConfig(jsonTxt));
	tmpRunner.setObjectArgument(oFF.SuResourceExplorer.PARAM_CALLBACKS, this.createListener());
	tmpRunner.setArgument(oFF.SuResourceExplorer.PARAM_PROFILE, profileTxt);
	tmpRunner.runProgram().onCatch( function(errorMsg){
		this.errorMsg(errorMsg.getText());
	}.bind(this));
};
oFF.SuResourceExplorerTester.prototype.appendDialogModeConfig = function(json)
{
	var jsonStructure = oFF.JsonParserFactory.createFromString(oFF.isNull(json) ? "{}" : json).asStructure();
	jsonStructure.putString(oFF.SuResourceExplorerConfig.VERSION, this.versionRBG.getSelectedName());
	if (oFF.XString.isEqual(this.versionRBG.getSelectedName(), "2"))
	{
		var wrapper = oFF.SuResourceExplorerConfigWrapper.create();
		wrapper.getData(true).setApi(this.apiRBG.getSelectedName());
		oFF.SuConfigWrapperBase.deepMerge(wrapper.generateConfig(), jsonStructure);
	}
	var dialogModeStructure = jsonStructure.containsKey(oFF.SuResourceExplorerConfig.DIALOG_MODE) ? jsonStructure.getStructureByKey(oFF.SuResourceExplorerConfig.DIALOG_MODE) : jsonStructure.putNewStructure(oFF.SuResourceExplorerConfig.DIALOG_MODE);
	dialogModeStructure.putString("mode", this.dialogModeRBG.getSelectedName());
	var selectionStructure = dialogModeStructure.putNewStructure("selection");
	selectionStructure.putString("resType", this.selectionTypeRBG.getSelectedName());
	selectionStructure.putString("mode", this.selectionModeRBG.getSelectedName());
	return jsonStructure.getStringRepresentation();
};
oFF.SuResourceExplorerTester.prototype.createListener = function()
{
	return oFF.SuResourceExplorerListener.create(this.createOnOkListener(), this.createOnCancelListener(), this.createOnValidationListener(), this.createOnQAChangeListener(), this.createOnFilterListener());
};
oFF.SuResourceExplorerTester.prototype.createOnOkListener = function()
{
	if (this.onOk.isChecked() || this.onOkError.isChecked())
	{
		return  function(resourceInfo, dialog){
			var tmpResourceInfo = resourceInfo;
			if (oFF.notNull(tmpResourceInfo))
			{
				var msg = oFF.XStringUtils.concatenate2("resource selected:", resourceInfo.getName());
				msg = tmpResourceInfo.toString();
				this.infoMsg(msg);
				if (this.onOkError.isChecked())
				{
					var errorMsg = oFF.XStringUtils.isNullOrEmpty(this.errorMessageInput.getText()) ? "Error" : this.errorMessageInput.getText();
					dialog.showErrorMessage(errorMsg);
				}
				else
				{
					if (!oFF.XStringUtils.isNullOrEmpty(this.busyMessageInput.getText()))
					{
						dialog.setBusyText(this.busyMessageInput.getText());
					}
					else
					{
						dialog.close();
					}
				}
			}
			else
			{
				this.errorMsg("Selection null");
				dialog.showErrorMessage("Selection null");
			}
		}.bind(this);
	}
	else
	{
		return  function(resourceInfo, dialog){
			dialog.close();
		}.bind(this);
	}
};
oFF.SuResourceExplorerTester.prototype.createOnValidationListener = function()
{
	if (this.onValidation.isChecked())
	{
		return  function(file){
			var tmpFile = file;
			var isValid = oFF.notNull(tmpFile) && tmpFile.isLeaf();
			var message = oFF.XStringUtils.concatenate2("Validation result:", oFF.XBoolean.convertToString(isValid));
			if (isValid)
			{
				this.infoMsg(message);
				this.recentlyUsed.add(oFF.XStringValue.create(file.getUrl()));
			}
			else
			{
				this.warnMsg(message);
			}
			return isValid;
		}.bind(this);
	}
	return null;
};
oFF.SuResourceExplorerTester.prototype.createOnFilterListener = function()
{
	if (this.onFilter.isChecked())
	{
		return  function(file, ctx){
			var tmpFile = file;
			var nameToCheck;
			if (!ctx.isDatasource())
			{
				nameToCheck = "sys";
			}
			else
			{
				if (oFF.SuResourceWrapper.isResourceOlapSystem(file))
				{
					nameToCheck = "gipsy";
				}
				else if (oFF.SuResourceWrapper.isResourceOlapDatasource(file))
				{
					nameToCheck = "LIQUID_SALES_AV1";
				}
				else
				{
					return oFF.XBooleanValue.create(true);
				}
			}
			return oFF.XBooleanValue.create(oFF.notNull(tmpFile) && oFF.XString.isEqual(tmpFile.getName(), nameToCheck));
		}.bind(this);
	}
	return null;
};
oFF.SuResourceExplorerTester.prototype.createOnCancelListener = function()
{
	if (this.onCancel.isChecked())
	{
		return  function(){
			this.infoMsg("Cancel clicked");
		}.bind(this);
	}
	return null;
};
oFF.SuResourceExplorerTester.prototype.createOnQAChangeListener = function()
{
	if (this.onQAErase.isChecked())
	{
		return  function(category, fileNameList){
			this.infoMsg(oFF.XStringUtils.concatenate2("Quick access category changed:", category.getString()));
		}.bind(this);
	}
	return null;
};
oFF.SuResourceExplorerTester.prototype.infoMsg = function(msg)
{
	this.getGenesis().showInfoToast(msg);
};
oFF.SuResourceExplorerTester.prototype.errorMsg = function(msg)
{
	this.getGenesis().showErrorToast(msg);
};
oFF.SuResourceExplorerTester.prototype.warnMsg = function(msg)
{
	this.getGenesis().showWarningToast(msg);
};
oFF.SuResourceExplorerTester.prototype.formatJSONTxt = function()
{
	try
	{
		var jsonTxt = this.jsonTextArea.getText();
		var jsonStructure = oFF.JsonParserFactory.createFromString(jsonTxt).asStructure();
		var jsonFormatted = oFF.PrUtils.serialize(jsonStructure, true, true, 1);
		this.jsonTextArea.setText(jsonFormatted);
	}
	catch (except)
	{
		this.errorMsg(oFF.XStringUtils.concatenate2("JSON parse error: ", ""));
	}
};

oFF.SqlUi = function() {};
oFF.SqlUi.prototype = new oFF.DfUiProgram();
oFF.SqlUi.prototype._ff_c = "SqlUi";

oFF.SqlUi.prototype.drv = null;
oFF.SqlUi.prototype.m_combo = null;
oFF.SqlUi.prototype.m_connectbtn = null;
oFF.SqlUi.prototype.output = null;
oFF.SqlUi.prototype.area = null;
oFF.SqlUi.prototype.m_querybtn = null;
oFF.SqlUi.prototype.m_updatebtn = null;
oFF.SqlUi.prototype.m_hierrarchyTree = null;
oFF.SqlUi.prototype.newProgram = function()
{
	var newObj = new oFF.SqlUi();
	newObj.setup();
	return newObj;
};
oFF.SqlUi.prototype.getProgramName = function()
{
	return "sqlui";
};
oFF.SqlUi.prototype.createGrid = function(set)
{
	var meta = set.getMetaData();
	var model = oFF.PrFactory.createStructure();
	var rows = 1;
	model.putInteger("ColCount", meta.size());
	var cells = model.putNewList("Cells");
	for (var col2 = 0; col2 < meta.size(); col2++)
	{
		var cellTarget2 = cells.addNewStructure();
		cellTarget2.putString("Type", "Text");
		cellTarget2.putString("Value", meta.get(col2));
		cellTarget2.putString("Color", "#AABB00");
	}
	while (set.next())
	{
		for (var col = 0; col < meta.size(); col++)
		{
			var cellTarget = cells.addNewStructure();
			cellTarget.putString("Type", "Text");
			cellTarget.putString("Value", set.getStringAt(col));
			cellTarget.putString("Color", "#AABBCC");
		}
		rows++;
	}
	model.putInteger("RowCount", rows);
	return model;
};
oFF.SqlUi.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SqlUi.prototype.processArguments = function(args) {};
oFF.SqlUi.prototype.setupProgram = function()
{
	return null;
};
oFF.SqlUi.prototype.buildUi = function(genesis)
{
	var root = genesis.newRoot(oFF.UiType.VERTICAL_LAYOUT);
	this.m_combo = root.addNewItemOfType(oFF.UiType.COMBO_BOX);
	this.m_combo.setName("systemName");
	this.m_combo.setPlaceholder("SystemName");
	this.m_combo.setWidth(oFF.UiCssLength.create("100%"));
	this.m_combo.registerOnEnter(this);
	var landscape = this.getApplication().getSystemLandscape();
	var systems = landscape.getSystemNames();
	for (var i = 0; i < systems.size(); i++)
	{
		var desc = landscape.getSystemDescription(systems.get(i));
		if (desc.getSystemType() === oFF.SystemType.INA_SQL)
		{
			this.m_combo.addNewItem().setText(systems.get(i));
		}
	}
	this.m_connectbtn = root.addNewItemOfType(oFF.UiType.BUTTON).registerOnPress(this).setText("Connect").setSize(oFF.UiSize.createByCss("100%", "auto"));
	this.m_hierrarchyTree = root.addNewItemOfType(oFF.UiType.TREE);
	this.m_hierrarchyTree.setName("feSqlTree");
	this.m_hierrarchyTree.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	var rootItem = this.m_hierrarchyTree.addNewItem();
	rootItem.setText("Schemas");
	this.m_hierrarchyTree = rootItem;
	this.output = root.addNewItemOfType(oFF.UiType.VERTICAL_LAYOUT);
	this.area = root.addNewItemOfType(oFF.UiType.TEXT_AREA);
	this.area.setSize(oFF.UiSize.createByCss("100%", "50px"));
	this.m_querybtn = root.addNewItemOfType(oFF.UiType.BUTTON).registerOnPress(this).setText("Exec Query").setSize(oFF.UiSize.createByCss("100%", "auto"));
	this.m_updatebtn = root.addNewItemOfType(oFF.UiType.BUTTON).registerOnPress(this).setText("Exec Update").setSize(oFF.UiSize.createByCss("100%", "auto"));
};
oFF.SqlUi.prototype.setBusy2 = function(busy)
{
	this.m_combo.setEnabled(!busy);
	this.m_connectbtn.setEnabled(!busy);
	this.area.setEnabled(!busy);
	this.m_querybtn.setEnabled(!busy);
	this.m_updatebtn.setEnabled(!busy);
};
oFF.SqlUi.prototype.onPress = function(event)
{
	if (event.getControl().isEqualTo(this.m_connectbtn))
	{
		this.onEnter(event);
	}
	else
	{
		this.setBusy2(true);
		if (event.getControl().isEqualTo(this.m_querybtn))
		{
			this.drv.processExecuteQuery(oFF.SyncType.NON_BLOCKING, this, null, this.area.getText());
		}
		else
		{
			this.drv.processExecuteUpdate(oFF.SyncType.NON_BLOCKING, this, null, this.area.getText());
		}
	}
};
oFF.SqlUi.prototype.onUpdated = function(extResult, data, customIdentifier)
{
	this.output.addNewItemOfType(oFF.UiType.LABEL).setText(this.area.getText());
	if (oFF.isNull(data) || data.getInteger() !== 0)
	{
		var errors = this.drv.getErrors();
		for (var i = 0, size = errors.size(); i < size; i++)
		{
			this.output.addNewItemOfType(oFF.UiType.LABEL).setText(errors.get(i).getStringRepresentation());
		}
	}
	else
	{
		this.output.addNewItemOfType(oFF.UiType.LABEL).setText("Database Updated");
	}
	this.setBusy2(false);
};
oFF.SqlUi.prototype.onQueryResult = function(extResult, data, customIdentifier)
{
	var res = data;
	this.output.addNewItemOfType(oFF.UiType.LABEL).setText(this.area.getText());
	if (oFF.notNull(data))
	{
		var grid = this.output.addNewItemOfType(oFF.UiType.VIZ_GRID);
		grid.setModelJson(this.createGrid(res));
	}
	else
	{
		var errors = this.drv.getErrors();
		for (var i = 0, size = errors.size(); i < size; i++)
		{
			this.output.addNewItemOfType(oFF.UiType.LABEL).setText(errors.get(i).getStringRepresentation());
		}
	}
	this.setBusy2(false);
};
oFF.SqlUi.prototype.onEnter = function(event)
{
	try
	{
		this.setBusy2(true);
		var selectedItem = this.m_combo.getSelectedItem();
		this.drv = oFF.SqlDriverFactory.create(oFF.notNull(selectedItem) ? oFF.XStringUtils.concatenate2("ina_sql=", selectedItem.getText()) : "org.sqlite.JDBC", this.getApplication().getConnectionPool());
		this.drv.open(oFF.XUri.create());
		var result = this.drv.processGetSchemas(oFF.SyncType.BLOCKING, null, null).getData();
		this.m_hierrarchyTree.clear();
		while (result.next())
		{
			var rootItem = this.m_hierrarchyTree.addNewItem();
			rootItem.setText(result.getStringAt(0));
			var node = new oFF.SqlSchemaNode();
			node.catalog = result.getStringAt(1);
			node.schema = result.getStringAt(0);
			rootItem.registerOnDoubleClick(node);
			rootItem.setCustomObject(this.drv);
		}
	}
	catch (th)
	{
		this.output.addNewItemOfType(oFF.UiType.LABEL).setText("Failed to connect / load MetaData:");
	}
	this.setBusy2(false);
};

oFF.SleMetis = function() {};
oFF.SleMetis.prototype = new oFF.DfUiProgram();
oFF.SleMetis.prototype._ff_c = "SleMetis";

oFF.SleMetis.DEFAULT_PROGRAM_NAME = "Metis";
oFF.SleMetis.USER_SPECIFIED_SYSTEMS_KEY = "metis_userSpecifiedSystems";
oFF.SleMetis.METIS_SYSTEM_SEPARATOR = "/.sys./";
oFF.SleMetis.s_userSpecifiedSystems = null;
oFF.SleMetis.ANY_SYSTEM_TYPE = "Any System Type";
oFF.SleMetis.ALL_CONNECTION_PARAMETERS = null;
oFF.SleMetis.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SleMetis.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SleMetis.initUserSpecifiedSystems = function(application)
{
	oFF.SleMetis.s_userSpecifiedSystems = null;
	if (oFF.isNull(oFF.SleMetis.s_userSpecifiedSystems))
	{
		oFF.SleMetis.s_userSpecifiedSystems = oFF.XList.create();
		var userSpecifiedSystems = application.getProcess().getLocalStorage().getStringByKeyExt(oFF.SleMetis.USER_SPECIFIED_SYSTEMS_KEY, "");
		var serializedSystemDescs = oFF.XStringTokenizer.splitString(userSpecifiedSystems, oFF.SleMetis.METIS_SYSTEM_SEPARATOR);
		if (oFF.notNull(serializedSystemDescs))
		{
			for (var i = 0; i < serializedSystemDescs.size(); i++)
			{
				var serializedSysDesc = serializedSystemDescs.get(i);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(serializedSysDesc))
				{
					var tmpSysProps = oFF.XProperties.create();
					tmpSysProps.deserialize(serializedSysDesc);
					var newSysDesc = oFF.SystemDescription.create(application.getSystemLandscape(), null, tmpSysProps);
					oFF.SleMetis.s_userSpecifiedSystems.add(newSysDesc);
				}
			}
		}
	}
	var systemLandscape = application.getSystemLandscape();
	if (oFF.notNull(systemLandscape))
	{
		for (var j = 0; j < oFF.SleMetis.s_userSpecifiedSystems.size(); j++)
		{
			var systemDesc = oFF.SleMetis.s_userSpecifiedSystems.get(j);
			systemLandscape.setSystemByDescription(systemDesc);
		}
	}
};
oFF.SleMetis.prototype.m_metisImporter = null;
oFF.SleMetis.prototype.m_systemsList = null;
oFF.SleMetis.prototype.m_searchInput = null;
oFF.SleMetis.prototype.m_searchPropsInput = null;
oFF.SleMetis.prototype.m_systemTypeDropDown = null;
oFF.SleMetis.prototype.m_currentSystemListItems = null;
oFF.SleMetis.prototype.m_layoutTabBar = null;
oFF.SleMetis.prototype.m_formLayout = null;
oFF.SleMetis.prototype.m_mainTabLayout = null;
oFF.SleMetis.prototype.m_bwTabLayout = null;
oFF.SleMetis.prototype.m_authTabLayout = null;
oFF.SleMetis.prototype.m_sacTabLayout = null;
oFF.SleMetis.prototype.m_allParamsTabLayout = null;
oFF.SleMetis.prototype.m_customPropertiesLayout = null;
oFF.SleMetis.prototype.m_formToolbar = null;
oFF.SleMetis.prototype.m_allFormItems = null;
oFF.SleMetis.prototype.m_allFormItemsMap = null;
oFF.SleMetis.prototype.m_customPropertiesMap = null;
oFF.SleMetis.prototype.m_systemNameFormItem = null;
oFF.SleMetis.prototype.m_systemDescriptionFormItem = null;
oFF.SleMetis.prototype.m_clientFormItem = null;
oFF.SleMetis.prototype.m_urlFormItem = null;
oFF.SleMetis.prototype.m_secureUrlFormItem = null;
oFF.SleMetis.prototype.m_systemTypeFormItem = null;
oFF.SleMetis.prototype.m_timeoutFormItem = null;
oFF.SleMetis.prototype.m_sessionCarrierTypeFormItem = null;
oFF.SleMetis.prototype.m_authTypeFormItem = null;
oFF.SleMetis.prototype.m_languageFormItem = null;
oFF.SleMetis.prototype.m_userFormItem = null;
oFF.SleMetis.prototype.m_passwordFormItem = null;
oFF.SleMetis.prototype.m_connectionTypeFormItem = null;
oFF.SleMetis.prototype.m_isConnectedFormItem = null;
oFF.SleMetis.prototype.m_isNeedCredentialFormItem = null;
oFF.SleMetis.prototype.m_createdByFormItem = null;
oFF.SleMetis.prototype.m_createdDateFormItem = null;
oFF.SleMetis.prototype.m_lastChangedDateFormItem = null;
oFF.SleMetis.prototype.m_systemLandscape = null;
oFF.SleMetis.prototype.m_isEditMode = false;
oFF.SleMetis.prototype.m_selectedItem = null;
oFF.SleMetis.prototype.m_selectedSystemType = null;
oFF.SleMetis.prototype.newProgram = function()
{
	var prg = new oFF.SleMetis();
	prg.setup();
	return prg;
};
oFF.SleMetis.prototype.getProgramName = function()
{
	return oFF.SleMetis.DEFAULT_PROGRAM_NAME;
};
oFF.SleMetis.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
	this.m_systemLandscape = null;
	this.m_selectedItem = null;
	this.m_selectedSystemType = null;
	this.m_metisImporter = oFF.XObjectExt.release(this.m_metisImporter);
	this.m_systemsList = oFF.XObjectExt.release(this.m_systemsList);
	this.m_layoutTabBar = oFF.XObjectExt.release(this.m_layoutTabBar);
	this.m_formLayout = oFF.XObjectExt.release(this.m_formLayout);
	this.m_mainTabLayout = oFF.XObjectExt.release(this.m_mainTabLayout);
	this.m_bwTabLayout = oFF.XObjectExt.release(this.m_bwTabLayout);
	this.m_authTabLayout = oFF.XObjectExt.release(this.m_authTabLayout);
	this.m_sacTabLayout = oFF.XObjectExt.release(this.m_sacTabLayout);
	this.m_allParamsTabLayout = oFF.XObjectExt.release(this.m_allParamsTabLayout);
	this.m_customPropertiesLayout = oFF.XObjectExt.release(this.m_customPropertiesLayout);
	this.m_formToolbar = oFF.XObjectExt.release(this.m_formToolbar);
	this.m_allFormItems.clear();
	this.m_allFormItems = oFF.XObjectExt.release(this.m_allFormItems);
	this.m_allFormItemsMap.clear();
	this.m_allFormItemsMap = oFF.XObjectExt.release(this.m_allFormItemsMap);
	this.m_customPropertiesMap.clear();
	this.m_customPropertiesMap = oFF.XObjectExt.release(this.m_customPropertiesMap);
	this.m_systemNameFormItem = oFF.XObjectExt.release(this.m_systemNameFormItem);
	this.m_systemDescriptionFormItem = oFF.XObjectExt.release(this.m_systemDescriptionFormItem);
	this.m_clientFormItem = oFF.XObjectExt.release(this.m_clientFormItem);
	this.m_urlFormItem = oFF.XObjectExt.release(this.m_urlFormItem);
	this.m_secureUrlFormItem = oFF.XObjectExt.release(this.m_secureUrlFormItem);
	this.m_systemTypeFormItem = oFF.XObjectExt.release(this.m_systemTypeFormItem);
	this.m_timeoutFormItem = oFF.XObjectExt.release(this.m_timeoutFormItem);
	this.m_sessionCarrierTypeFormItem = oFF.XObjectExt.release(this.m_sessionCarrierTypeFormItem);
	this.m_authTypeFormItem = oFF.XObjectExt.release(this.m_authTypeFormItem);
	this.m_languageFormItem = oFF.XObjectExt.release(this.m_languageFormItem);
	this.m_userFormItem = oFF.XObjectExt.release(this.m_userFormItem);
	this.m_passwordFormItem = oFF.XObjectExt.release(this.m_passwordFormItem);
	this.m_createdByFormItem = oFF.XObjectExt.release(this.m_createdByFormItem);
	this.m_createdDateFormItem = oFF.XObjectExt.release(this.m_createdDateFormItem);
	this.m_lastChangedDateFormItem = oFF.XObjectExt.release(this.m_lastChangedDateFormItem);
	this.m_currentSystemListItems.clear();
	this.m_currentSystemListItems = oFF.XObjectExt.release(this.m_currentSystemListItems);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.clear();
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS = oFF.XObjectExt.release(oFF.SleMetis.ALL_CONNECTION_PARAMETERS);
};
oFF.SleMetis.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.SleMetis.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SleMetis.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60vw", "60vh");
};
oFF.SleMetis.prototype.getMenuBarDisplayName = function()
{
	return oFF.SleMetis.DEFAULT_PROGRAM_NAME;
};
oFF.SleMetis.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SleMetis.prototype.processArguments = function(args) {};
oFF.SleMetis.prototype.setupProgram = function()
{
	this.m_currentSystemListItems = oFF.XList.create();
	this.m_allFormItems = oFF.XList.create();
	this.m_allFormItemsMap = oFF.XHashMapByString.create();
	this.m_customPropertiesMap = oFF.XHashMapByString.create();
	this.m_systemLandscape = this.getProcess().getSystemLandscape();
	oFF.SleMetis.initUserSpecifiedSystems(this.getApplication());
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS = oFF.XListOfString.create();
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.NAME);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.DESCRIPTION);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.HOST);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SECURE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SYSTEM_TYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.AUTHENTICATION_TYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CLIENT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.USER);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PASSWORD);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.IS_CONNECTED);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PROXY_HOST);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PROXY_PORT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PROXY_TYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PROXY_AUTHORIZATION);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.URL);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PORT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PATH);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ALIAS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CONTENT_TYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PROTOCOL);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.TOKEN_VALUE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.WEBDISPATCHER_URI);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PREFLIGHT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.PREFIX);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SYSTYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ORIGIN);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.TIMEOUT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.IS_CSRF_REQUIRED);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.IS_CONTEXT_ID_REQUIRED);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.KEEP_ALIVE_INTERVAL);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.KEEP_ALIVE_DELAY);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.LANGUAGE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.EQS_PATTERNS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.TAGS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SESSION_CARRIER_TYPE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CORRELATION_ID_ACTIVE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SAP_PASSPORT_ACTIVE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ENABLE_TESTS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ENFORCE_TESTS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.X509CERTIFICATE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SECURE_LOGIN_PROFILE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SQL_DRIVER_JAVA);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SQL_CONNECT_JAVA);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPING_SYSTEM_NAME);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPINGS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CONTEXTS);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.DEFINITION);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SCC_VIRTUAL_HOST);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.SCC_PORT);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPING_SERIALIZATION_TABLE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ORGANIZATION_TOKEN);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ELEMENT_TOKEN);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.USER_TOKEN);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.TENANT_ID);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.TENANT_ROOT_PACKAGE);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.INTERNAL_USER);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.ASSOCIATED_HANA_SYSTEM);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CACHE_HINTS_ENABLED);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.CACHE_HINT_LEAVE_THROUGH);
	oFF.SleMetis.ALL_CONNECTION_PARAMETERS.add(oFF.ConnectionParameters.OEM_APPLICATION_ID);
	return null;
};
oFF.SleMetis.prototype.buildUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setName("sleMetisMainLayout");
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundColor(oFF.UiColor.create("#f9fafc"));
	var sideBarWrapper = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	sideBarWrapper.setName("sleMetisSystemSearchWrapper");
	sideBarWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
	sideBarWrapper.setHeight(oFF.UiCssLength.create("100%"));
	sideBarWrapper.setWidth(oFF.UiCssLength.create("300px"));
	sideBarWrapper.setFlex("0 1 auto");
	this.m_searchInput = sideBarWrapper.addNewItemOfType(oFF.UiType.SEARCH_FIELD);
	this.m_searchInput.setName("sleMetisSystemListSearchField");
	this.m_searchInput.setPlaceholder("Search system...");
	this.m_searchInput.setPadding(oFF.UiCssBoxEdges.create("5px"));
	this.m_searchInput.setHeight(oFF.UiCssLength.create("40px"));
	this.m_searchInput.registerOnSearch(this);
	this.m_searchInput.registerOnLiveChange(this);
	this.m_searchInput.setDebounceTime(1000);
	this.m_systemTypeDropDown = sideBarWrapper.addNewItemOfType(oFF.UiType.DROPDOWN);
	this.m_systemTypeDropDown.setName("sleMetisSystemTypeDropDown");
	this.m_systemTypeDropDown.setFlex("0 0 auto");
	this.m_systemTypeDropDown.setMargin(oFF.UiCssBoxEdges.create("0px 5px 5px 5px"));
	this.m_systemTypeDropDown.registerOnSelect(this);
	this.m_selectedSystemType = this.m_systemTypeDropDown.addNewItem().setText(oFF.SleMetis.ANY_SYSTEM_TYPE);
	var systemListWrapper = sideBarWrapper.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	systemListWrapper.setName("sleMetisSystemListWrapper");
	systemListWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
	systemListWrapper.setHeight(oFF.UiCssLength.create("calc(100% - 67px)"));
	systemListWrapper.setWidth(oFF.UiCssLength.create("100%"));
	systemListWrapper.setFlex("1 1 300px ");
	this.m_systemsList = systemListWrapper.addNewItemOfType(oFF.UiType.LIST);
	this.m_systemsList.setName("sleMetisSystemList");
	this.m_systemsList.useMaxWidth();
	this.m_systemsList.setHeight(oFF.UiCssLength.create("auto"));
	this.m_systemsList.setOverflow(oFF.UiOverflow.AUTO);
	this.m_systemsList.registerOnSelect(this);
	this.m_systemsList.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.m_systemsList.setBorderWidth(oFF.UiCssBoxEdges.create("0px"));
	var systemListFormSpacer = mainLayout.addNewItemOfType(oFF.UiType.SPACER);
	systemListFormSpacer.setWidth(oFF.UiCssLength.create("1px"));
	systemListFormSpacer.setHeight(oFF.UiCssLength.create("100%"));
	systemListFormSpacer.setBackgroundColor(oFF.UiColor.GREY);
	var formWrapper = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	formWrapper.useMaxHeight();
	formWrapper.setWidth(oFF.UiCssLength.create("80%"));
	formWrapper.setFlex("1 1 80%");
	formWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_formToolbar = formWrapper.addNewItemOfType(oFF.UiType.OVERFLOW_TOOLBAR);
	this.m_formToolbar.setHeight(oFF.UiCssLength.create("40px"));
	this.m_formToolbar.setVisible(false);
	var toolbarLayout = this.m_formToolbar.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	toolbarLayout.setDirection(oFF.UiFlexDirection.ROW_REVERSE);
	toolbarLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	toolbarLayout.useMaxSpace();
	toolbarLayout.setBackgroundColor(oFF.UiColor.create("rgba(128, 128, 128, 0.15)"));
	var formSaveBtn = toolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	formSaveBtn.setName("formSaveBtn");
	formSaveBtn.setButtonType(oFF.UiButtonType.ACCEPT);
	formSaveBtn.setText("Save");
	formSaveBtn.setIcon("save");
	formSaveBtn.registerOnPress(this);
	toolbarLayout.addNewItemOfType(oFF.UiType.SPACER).setWidth(oFF.UiCssLength.create("10px"));
	var formCancelBtn = toolbarLayout.addNewItemOfType(oFF.UiType.BUTTON);
	formCancelBtn.setName("formCancelBtn");
	formCancelBtn.setButtonType(oFF.UiButtonType.DESTRUCTIVE);
	formCancelBtn.setText("Cancel");
	formCancelBtn.setIcon("cancel");
	formCancelBtn.registerOnPress(this);
	this.m_layoutTabBar = formWrapper.addNewItemOfType(oFF.UiType.ICON_TAB_BAR);
	this.m_mainTabLayout = this.createTabLayout(this.m_layoutTabBar, "General");
	this.m_bwTabLayout = this.createTabLayout(this.m_layoutTabBar, "BW");
	this.m_authTabLayout = this.createTabLayout(this.m_layoutTabBar, "Authentication");
	this.m_sacTabLayout = this.createTabLayout(this.m_layoutTabBar, "SAC");
	var advancedTabLayout = this.createTabLayout(this.m_layoutTabBar, "Advanced");
	this.m_searchPropsInput = advancedTabLayout.addNewItemOfType(oFF.UiType.SEARCH_FIELD);
	this.m_searchPropsInput.setName("sleMetisAdvancedPropertiesSearchField");
	this.m_searchPropsInput.setPlaceholder("Filter properties...");
	this.m_searchPropsInput.setPadding(oFF.UiCssBoxEdges.create("5px"));
	this.m_searchPropsInput.setHeight(oFF.UiCssLength.create("40px"));
	this.m_searchPropsInput.registerOnSearch(this);
	this.m_searchPropsInput.registerOnLiveChange(this);
	this.m_searchPropsInput.setDebounceTime(1000);
	this.m_customPropertiesLayout = advancedTabLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_customPropertiesLayout.setName("sleMetisAdvancedCustomPropertiesLayout");
	this.m_customPropertiesLayout.setWrap(oFF.UiFlexWrap.WRAP);
	this.m_customPropertiesLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_customPropertiesLayout.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_customPropertiesLayout.setAlignContent(oFF.UiFlexAlignContent.START);
	this.m_customPropertiesLayout.setWidth(oFF.UiCssLength.create("100%"));
	this.m_allParamsTabLayout = advancedTabLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_allParamsTabLayout.setName("sleMetisAdvancedAllPropertiesLayout");
	this.m_allParamsTabLayout.setWrap(oFF.UiFlexWrap.WRAP);
	this.m_allParamsTabLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_allParamsTabLayout.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_allParamsTabLayout.setAlignContent(oFF.UiFlexAlignContent.START);
	this.m_allParamsTabLayout.setWidth(oFF.UiCssLength.create("100%"));
	genesis.setRoot(mainLayout);
	this.addMenuBarButton("Edit", null, null,  function(controlEvent){
		this.createEditMenu(controlEvent.getControl());
	}.bind(this));
	this.addMenuBarButton("Tools", null, null,  function(controlEvent2){
		this.createToolsMenu(controlEvent2.getControl());
	}.bind(this));
	this.prepareSystemForm();
	this.loadSystems();
	this.updateSystemList();
	this.loadSystemTypes();
	this.selectFirstSystemInList();
	this.m_isEditMode = false;
};
oFF.SleMetis.prototype.createTabLayout = function(layoutTabBar, name)
{
	var tabItem = layoutTabBar.addNew(oFF.UiType.ICON_TAB_BAR_ITEM);
	tabItem.setName(name);
	tabItem.setText(name);
	var layout = tabItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
	layout.setName(oFF.XStringUtils.concatenate3("sleMetis", name, "TabLayout"));
	layout.setWrap(oFF.UiFlexWrap.WRAP);
	layout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	layout.setAlignItems(oFF.UiFlexAlignItems.START);
	layout.setAlignContent(oFF.UiFlexAlignContent.START);
	tabItem.setContent(layout);
	return layout;
};
oFF.SleMetis.prototype.updateSystemList = function()
{
	var tmpListItems = oFF.XList.create();
	var systemType = this.m_selectedSystemType.getText();
	var systemItemsIterator = this.m_currentSystemListItems.getIterator();
	while (systemItemsIterator.hasNext())
	{
		var tmpSystemItem = systemItemsIterator.next();
		var tmpSystemType = tmpSystemItem.getSystemDescription().getSystemType().getName();
		if (oFF.XString.isEqual(systemType, oFF.SleMetis.ANY_SYSTEM_TYPE) || oFF.XString.isEqual(tmpSystemType, systemType))
		{
			tmpListItems.add(tmpSystemItem.getListItem());
		}
	}
	this.m_systemsList.clearItems();
	this.m_systemsList.addAllItems(tmpListItems);
	tmpListItems.clear();
};
oFF.SleMetis.prototype.loadSystemTypes = function()
{
	var systemTypes = oFF.XHashSetOfString.create();
	if (oFF.notNull(this.m_systemLandscape))
	{
		var allSystemNames = this.m_systemLandscape.getSystemNames();
		if (oFF.notNull(allSystemNames) && allSystemNames.hasElements())
		{
			var allSystemNamesIterator = allSystemNames.getIterator();
			while (allSystemNamesIterator.hasNext())
			{
				var systemName = allSystemNamesIterator.next();
				var systemDesc = this.m_systemLandscape.getSystemDescription(systemName);
				systemTypes.add(systemDesc.getSystemType().getName());
			}
		}
	}
	var systemTypesIterator = systemTypes.getIterator();
	while (systemTypesIterator.hasNext())
	{
		var dropdownItem = this.m_systemTypeDropDown.addNewItem();
		dropdownItem.setText(systemTypesIterator.next());
	}
};
oFF.SleMetis.prototype.loadSystems = function()
{
	if (oFF.notNull(this.m_systemsList))
	{
		if (oFF.notNull(this.m_systemLandscape))
		{
			var allSystemNames = this.m_systemLandscape.getSystemNames();
			if (oFF.notNull(allSystemNames) && allSystemNames.hasElements())
			{
				this.m_currentSystemListItems.clear();
				var allSystemNamesIterator = allSystemNames.getIterator();
				while (allSystemNamesIterator.hasNext())
				{
					var systemName = allSystemNamesIterator.next();
					var systemDesc = this.m_systemLandscape.getSystemDescription(systemName);
					var tmpSystemItem = oFF.SleMetisSystemItem.createSystemItem(systemName, this.m_systemsList.newItem(), systemDesc, false);
					this.m_currentSystemListItems.add(tmpSystemItem);
					if (oFF.SleMetis.s_userSpecifiedSystems.contains(systemDesc))
					{
						tmpSystemItem.setIsUserSpecified(true);
					}
				}
			}
		}
	}
};
oFF.SleMetis.prototype.filterSystemList = function(searchText, clearButtonPressed)
{
	if (clearButtonPressed === false)
	{
		var systemType = this.m_selectedSystemType.getText();
		this.m_systemsList.clearItems();
		for (var a = 0; a < this.m_currentSystemListItems.size() - 1; a++)
		{
			var tmpSystemItem = this.m_currentSystemListItems.get(a);
			var tmpSystemType = tmpSystemItem.getSystemDescription().getSystemType().getName();
			var isOfSystemTypeSelected = oFF.XString.isEqual(systemType, oFF.SleMetis.ANY_SYSTEM_TYPE) || oFF.XString.isEqual(tmpSystemType, systemType);
			if (oFF.XString.containsString(oFF.XString.toLowerCase(tmpSystemItem.getText()), oFF.XString.toLowerCase(searchText)) && isOfSystemTypeSelected)
			{
				this.m_systemsList.addItem(tmpSystemItem.getListItem());
			}
		}
	}
	else
	{
		this.updateSystemList();
	}
	if (oFF.notNull(this.m_selectedItem) && this.m_systemsList.getItems().contains(this.m_selectedItem.getListItem()))
	{
		this.m_systemsList.setSelectedItem(this.m_selectedItem.getListItem());
	}
};
oFF.SleMetis.prototype.filterAdvancedProperties = function(searchText)
{
	if (oFF.notNull(this.m_allParamsTabLayout))
	{
		this.updateCurrentSystemCustomProperties(searchText);
		var allItemKeysIterator = this.m_allFormItemsMap.getKeysAsIteratorOfString();
		while (allItemKeysIterator.hasNext())
		{
			var itemKey = allItemKeysIterator.next();
			var formItem = this.m_allFormItemsMap.getByKey(itemKey);
			if (oFF.notNull(formItem) && oFF.XString.containsString(oFF.XString.toLowerCase(itemKey), oFF.XString.toLowerCase(searchText)))
			{
				formItem.setVisible(true);
			}
			else
			{
				formItem.setVisible(false);
			}
		}
	}
};
oFF.SleMetis.prototype.isSystemListFiltered = function()
{
	if (this.m_systemsList.getItemCount() !== this.m_currentSystemListItems.size() || oFF.XStringUtils.isNotNullAndNotEmpty(this.m_searchInput.getText()))
	{
		return true;
	}
	return false;
};
oFF.SleMetis.prototype.selectFirstSystemInList = function()
{
	if (oFF.notNull(this.m_systemsList) && this.m_systemsList.hasItems())
	{
		var tmpListItem = this.m_systemsList.getItem(0);
		tmpListItem.setSelected(true);
		var systemItem = tmpListItem.getCustomObject();
		this.showSystemDetails(systemItem);
		this.m_selectedItem = systemItem;
		this.updateCurrentSystemCustomProperties(null);
		this.updateSystemSpecificTabs(systemItem.getSystemDescription());
	}
};
oFF.SleMetis.prototype.addNewFormElement = function(layout, text, inputType, cssWidth, breakLine)
{
	var newFormItem = oFF.SleMetisFormItem.createFormItem(layout, text, inputType, cssWidth, this);
	if (breakLine === true)
	{
		var breakLineSpacer = layout.addNewItemOfType(oFF.UiType.SPACER);
		breakLineSpacer.setWidth(oFF.UiCssLength.create("100%"));
		breakLineSpacer.setHeight(oFF.UiCssLength.create("0"));
		breakLineSpacer.setFlex("1 1 100%");
	}
	this.m_allFormItems.add(newFormItem);
	return newFormItem;
};
oFF.SleMetis.prototype.addNewFormElementAllTab = function(connectionParameterName)
{
	var newFormItem = this.addNewFormElement(this.m_allParamsTabLayout, connectionParameterName, oFF.UiInputType.TEXT, "100%", true);
	this.m_allFormItemsMap.put(connectionParameterName, newFormItem);
	return newFormItem;
};
oFF.SleMetis.prototype.prepareSystemForm = function()
{
	if (oFF.notNull(this.m_mainTabLayout))
	{
		this.m_systemNameFormItem = this.addNewFormElement(this.m_mainTabLayout, "System name", oFF.UiInputType.TEXT, "200px", false);
		this.m_systemDescriptionFormItem = this.addNewFormElement(this.m_mainTabLayout, "Description", oFF.UiInputType.TEXT, "200px", false);
		this.m_systemTypeFormItem = this.addNewFormElement(this.m_mainTabLayout, "System type", oFF.UiInputType.TEXT, "200px", true);
		this.m_urlFormItem = this.addNewFormElement(this.m_mainTabLayout, "URL", oFF.UiInputType.URL, "600px", true);
		this.m_secureUrlFormItem = this.addNewFormElement(this.m_mainTabLayout, "Secure URL", oFF.UiInputType.URL, "600px", true);
		this.m_languageFormItem = this.addNewFormElement(this.m_mainTabLayout, "Language", oFF.UiInputType.TEXT, "200px", false);
		this.m_timeoutFormItem = this.addNewFormElement(this.m_mainTabLayout, "Timeout", oFF.UiInputType.NUMBER, "200px", false);
		this.m_sessionCarrierTypeFormItem = this.addNewFormElement(this.m_mainTabLayout, "Session carrier type", oFF.UiInputType.TEXT, "200px", true);
	}
	if (oFF.notNull(this.m_bwTabLayout))
	{
		this.m_clientFormItem = this.addNewFormElement(this.m_bwTabLayout, "Client", oFF.UiInputType.NUMBER, "600px", true);
	}
	if (oFF.notNull(this.m_authTabLayout))
	{
		this.m_authTypeFormItem = this.addNewFormElement(this.m_authTabLayout, "Authentication Type", oFF.UiInputType.TEXT, "600px", true);
		this.m_userFormItem = this.addNewFormElement(this.m_authTabLayout, "User", oFF.UiInputType.TEXT, "600px", true);
		this.m_passwordFormItem = this.addNewFormElement(this.m_authTabLayout, "Password", oFF.UiInputType.PASSWORD, "600px", true);
	}
	if (oFF.notNull(this.m_sacTabLayout))
	{
		this.m_connectionTypeFormItem = this.addNewFormElement(this.m_sacTabLayout, "Connection type", oFF.UiInputType.TEXT, "600px", true);
		this.m_createdByFormItem = this.addNewFormElement(this.m_sacTabLayout, "Created by", oFF.UiInputType.TEXT, "600px", true);
		this.m_createdDateFormItem = this.addNewFormElement(this.m_sacTabLayout, "Created at", oFF.UiInputType.TEXT, "600px", true);
		this.m_lastChangedDateFormItem = this.addNewFormElement(this.m_sacTabLayout, "Modified at", oFF.UiInputType.TEXT, "600px", true);
		this.m_isConnectedFormItem = this.addNewFormElement(this.m_sacTabLayout, "Connected", oFF.UiInputType.TEXT, "600px", true);
		this.m_isNeedCredentialFormItem = this.addNewFormElement(this.m_sacTabLayout, "Needs credentials", oFF.UiInputType.TEXT, "600px", true);
	}
	if (oFF.notNull(this.m_allParamsTabLayout))
	{
		var connectionParametersIterator = oFF.SleMetis.ALL_CONNECTION_PARAMETERS.getIterator();
		while (connectionParametersIterator.hasNext())
		{
			var connectionParameter = connectionParametersIterator.next();
			this.addNewFormElementAllTab(connectionParameter);
		}
	}
};
oFF.SleMetis.prototype.showSystemDetails = function(systemItem)
{
	var tmpSystemDescription = systemItem.getSystemDescription();
	if (oFF.notNull(tmpSystemDescription))
	{
		this.m_systemNameFormItem.setText(tmpSystemDescription.getSystemName());
		this.m_systemDescriptionFormItem.setText(tmpSystemDescription.getSystemText());
		this.m_systemTypeFormItem.setText(tmpSystemDescription.getSystemType().getName());
		var url = tmpSystemDescription.getProperties().getByKey(oFF.ConnectionParameters.URL);
		if (oFF.isNull(url) || oFF.XString.isEqual(url, ""))
		{
			url = tmpSystemDescription.getUrlWithoutAuthentication();
		}
		this.m_urlFormItem.setText(url);
		var secureUrl = tmpSystemDescription.getProperties().getByKey(oFF.ConnectionParameters.SECURE);
		if ((oFF.isNull(secureUrl) || oFF.XString.isEqual(secureUrl, "")) && tmpSystemDescription.getProtocolType() === oFF.ProtocolType.HTTPS)
		{
			secureUrl = tmpSystemDescription.getUrlWithoutAuthentication();
		}
		this.m_secureUrlFormItem.setText(secureUrl);
		this.m_clientFormItem.setText(tmpSystemDescription.getClient());
		this.m_userFormItem.setText(tmpSystemDescription.getUser());
		this.m_passwordFormItem.setText(tmpSystemDescription.getPassword());
		this.m_authTypeFormItem.setText(tmpSystemDescription.getAuthenticationType() !== null ? tmpSystemDescription.getAuthenticationType().getName() : "");
		this.m_languageFormItem.setText(tmpSystemDescription.getLanguage());
		this.m_timeoutFormItem.setText(oFF.XInteger.convertToString(tmpSystemDescription.getTimeout()));
		this.m_sessionCarrierTypeFormItem.setText(tmpSystemDescription.getSessionCarrierType() !== null ? tmpSystemDescription.getSessionCarrierType().getName() : "");
		this.m_createdByFormItem.setText(tmpSystemDescription.getCreatedBy() !== null ? tmpSystemDescription.getCreatedBy().getName() : "");
		this.m_createdDateFormItem.setText(tmpSystemDescription.getCreatedDate() !== null ? tmpSystemDescription.getCreatedDate().toIso8601Format() : "");
		this.m_lastChangedDateFormItem.setText(tmpSystemDescription.getLastChangedDate() !== null ? tmpSystemDescription.getLastChangedDate().toIso8601Format() : "");
		this.m_connectionTypeFormItem.setText(tmpSystemDescription.getProperties().getByKey(oFF.ConnectionParameters.FPA_CONNECTION_TYPE));
		this.m_isConnectedFormItem.setText(tmpSystemDescription.getProperties().getByKey(oFF.ConnectionParameters.FPA_IS_CONNECTED));
		this.m_isNeedCredentialFormItem.setText(tmpSystemDescription.getProperties().getByKey(oFF.ConnectionParameters.FPA_IS_NEED_CREDENTIAL));
		if (oFF.notNull(oFF.SleMetis.ALL_CONNECTION_PARAMETERS))
		{
			var connectionParametersIterator = oFF.SleMetis.ALL_CONNECTION_PARAMETERS.getIterator();
			while (connectionParametersIterator.hasNext())
			{
				var connectionParameter = connectionParametersIterator.next();
				this.m_allFormItemsMap.getByKey(connectionParameter).setText(tmpSystemDescription.getProperties().getByKey(connectionParameter));
			}
		}
	}
	else
	{
		this.m_systemNameFormItem.setText("");
		this.m_systemDescriptionFormItem.setText("");
		this.m_systemTypeFormItem.setText("");
		this.m_urlFormItem.setText("");
		this.m_secureUrlFormItem.setText("");
		this.m_clientFormItem.setText("");
		this.m_userFormItem.setText("");
		this.m_passwordFormItem.setText("");
		this.m_authTypeFormItem.setText("");
		this.m_languageFormItem.setText("");
		this.m_timeoutFormItem.setText("");
		this.m_sessionCarrierTypeFormItem.setText("");
		this.clearAllFormItems();
	}
};
oFF.SleMetis.prototype.clearAllFormItems = function()
{
	if (oFF.notNull(oFF.SleMetis.ALL_CONNECTION_PARAMETERS))
	{
		var connectionParametersIterator = oFF.SleMetis.ALL_CONNECTION_PARAMETERS.getIterator();
		while (connectionParametersIterator.hasNext())
		{
			var connectionParameter = connectionParametersIterator.next();
			this.m_allFormItemsMap.getByKey(connectionParameter).setText("");
		}
	}
};
oFF.SleMetis.prototype.setFormItemEditable = function(formItem, editable, required)
{
	formItem.setEditable(editable);
	formItem.setRequired(required ? editable : false);
	if (editable === false)
	{
		formItem.setValid();
	}
};
oFF.SleMetis.prototype.setEditMode = function(editable)
{
	this.m_isEditMode = editable;
	this.setFormItemEditable(this.m_systemNameFormItem, editable, true);
	this.setFormItemEditable(this.m_systemDescriptionFormItem, editable, false);
	this.setFormItemEditable(this.m_systemTypeFormItem, editable, false);
	this.setFormItemEditable(this.m_clientFormItem, editable, false);
	this.setFormItemEditable(this.m_urlFormItem, editable, true);
	this.setFormItemEditable(this.m_secureUrlFormItem, editable, false);
	this.setFormItemEditable(this.m_userFormItem, editable, false);
	this.setFormItemEditable(this.m_passwordFormItem, editable, false);
	this.setFormItemEditable(this.m_authTypeFormItem, editable, true);
	this.setFormItemEditable(this.m_languageFormItem, editable, false);
	this.setFormItemEditable(this.m_timeoutFormItem, editable, false);
	this.setFormItemEditable(this.m_sessionCarrierTypeFormItem, editable, false);
};
oFF.SleMetis.prototype.isFormEditMode = function()
{
	return this.m_isEditMode;
};
oFF.SleMetis.prototype.validateSystemForm = function()
{
	var isFormValid = true;
	var allFormItems = this.m_allFormItems.getIterator();
	while (allFormItems.hasNext())
	{
		var tmpFormItem = allFormItems.next();
		if (tmpFormItem.isRequired() && oFF.XStringUtils.isNullOrEmpty(tmpFormItem.getText()))
		{
			tmpFormItem.setInvalid();
			isFormValid = false;
		}
		else
		{
			tmpFormItem.setValid();
		}
	}
	if (isFormValid === false)
	{
		this.getGenesis().showErrorToast("Some form entries are invalid! Cannot save!");
		return false;
	}
	var existingSystemDesc = this.m_systemLandscape.getSystemDescription(this.m_systemNameFormItem.getText());
	if (oFF.notNull(existingSystemDesc))
	{
		this.getGenesis().showErrorToast("A system with the specified name already exists in the system landscape!");
		return false;
	}
	return true;
};
oFF.SleMetis.prototype.updateNewSystemNameInList = function(newName)
{
	if (this.isFormEditMode())
	{
		var tmpSystemItem = this.m_currentSystemListItems.get(0);
		tmpSystemItem.setText(newName);
	}
};
oFF.SleMetis.prototype.saveAndCreateNewSystem = function()
{
	var isFormValid = this.validateSystemForm();
	if (isFormValid)
	{
		this.setEditMode(false);
		this.m_formToolbar.setVisible(false);
		var newSystemDescProps = oFF.XProperties.create();
		newSystemDescProps.put(oFF.ConnectionParameters.NAME, this.m_systemNameFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.DESCRIPTION, this.m_systemDescriptionFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.SYSTEM_TYPE, this.m_systemTypeFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.URL, this.m_urlFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.SECURE, this.m_secureUrlFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.CLIENT, this.m_clientFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.USER, this.m_userFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.PASSWORD, this.m_passwordFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.AUTHENTICATION_TYPE, this.m_authTypeFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.LANGUAGE, this.m_languageFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.TIMEOUT, this.m_timeoutFormItem.getText());
		newSystemDescProps.put(oFF.ConnectionParameters.SESSION_CARRIER_TYPE, this.m_sessionCarrierTypeFormItem.getText());
		var newSysDesc = oFF.SystemDescription.create(this.m_systemLandscape, this.m_systemNameFormItem.getText(), newSystemDescProps);
		this.m_systemLandscape.setSystemByDescription(newSysDesc);
		var tmpSystemItem = this.m_currentSystemListItems.get(0);
		tmpSystemItem.setSystemDescription(newSysDesc);
		tmpSystemItem.setIsUserSpecified(true);
		tmpSystemItem.setIsInEdit(false);
		this.getGenesis().showSuccessToast("New system description successfully created!");
		this.saveSystemInLocalStorage(newSysDesc);
	}
};
oFF.SleMetis.prototype.cancelNewSystemCreate = function()
{
	this.setEditMode(false);
	this.m_formToolbar.setVisible(false);
	this.m_currentSystemListItems.removeAt(0);
	this.updateSystemList();
	this.selectFirstSystemInList();
};
oFF.SleMetis.prototype.createEditMenu = function(editBtn)
{
	var editToolbarMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	editToolbarMenu.setName("editToolbarMenu");
	editToolbarMenu.addNewItem().setName("editToolbarMenuAddBtn").setText("Add").setIcon("add").registerOnPress(this);
	editToolbarMenu.addNewItem().setName("editToolbarMenuImportBtn").setText("Import").setIcon("cause").registerOnPress(this);
	editToolbarMenu.addNewItem().setName("editToolbarMenuClearUserSystemsBtn").setText("Clear user systems").setIcon("delete").registerOnPress(this);
	editToolbarMenu.openAt(editBtn);
};
oFF.SleMetis.prototype.createToolsMenu = function(toolsBtn)
{
	var toolsToolbarMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	toolsToolbarMenu.setName("toolsToolbarMenu");
	toolsToolbarMenu.addNewItem().setName("toolsToolbarMenuConnectBtn").setText("Connection Test").setIcon("connected").registerOnPress(this).setEnabled(!this.isFormEditMode() && oFF.notNull(this.m_selectedItem));
	toolsToolbarMenu.openAt(toolsBtn);
};
oFF.SleMetis.prototype.performAddNewSystem = function()
{
	this.setEditMode(true);
	this.m_formToolbar.setVisible(true);
	var newSystemItem = oFF.SleMetisSystemItem.createSystemItem("new system", this.m_systemsList.newItem(), null, true);
	newSystemItem.setIsInEdit(true);
	this.m_currentSystemListItems.insert(0, newSystemItem);
	this.updateSystemList();
	this.selectFirstSystemInList();
	this.m_systemNameFormItem.focus();
};
oFF.SleMetis.prototype.openMetisImporter = function()
{
	if (oFF.isNull(this.m_metisImporter))
	{
		this.m_metisImporter = oFF.SleMetisImporter.createNewMetisImporter(this.getApplication(), this.m_genesis, this);
	}
	this.m_metisImporter.open();
};
oFF.SleMetis.prototype.performClearUserSystems = function()
{
	this.clearUSerSpecifiedSystemsFromLocalStorage();
	var itemsToRemove = oFF.XList.create();
	var systemItemsIterator = this.m_currentSystemListItems.getIterator();
	while (systemItemsIterator.hasNext())
	{
		var tmpSystemItem = systemItemsIterator.next();
		var tmpListItem = tmpSystemItem.getListItem();
		var tmpSysDesc = tmpSystemItem.getSystemDescription();
		if (tmpSystemItem.isUserSpecified())
		{
			this.m_systemLandscape.removeSystem(tmpSysDesc.getSystemName());
			this.m_systemsList.removeItem(tmpListItem);
			itemsToRemove.add(tmpSystemItem);
		}
	}
	for (var a = 0; a < itemsToRemove.size(); a++)
	{
		this.m_currentSystemListItems.removeElement(itemsToRemove.get(a));
	}
	itemsToRemove.clear();
	this.updateSystemList();
	this.selectFirstSystemInList();
	oFF.SleMetis.s_userSpecifiedSystems.clear();
	this.getGenesis().showInfoToast("User specified systems removed!");
};
oFF.SleMetis.prototype.performConnectionTest = function()
{
	if (oFF.isNull(this.m_selectedItem) && this.m_selectedItem.getSystemDescription() !== null)
	{
		this.getGenesis().showWarningToast("Please select a system!");
	}
	else
	{
		var systemDesc = this.m_selectedItem.getSystemDescription();
		var connectionTestDlgManifest = this.getProcess().getKernel().getProgramManifest(oFF.SuConnectionTestDialog.DEFAULT_PROGRAM_NAME);
		var connectionTestDlgStartCfg = oFF.ProgramStartCfg.create(this.getProcess(), connectionTestDlgManifest.getName(), null, null);
		var prgArgs = connectionTestDlgStartCfg.getArguments();
		prgArgs.putString(oFF.SuConnectionTestDialog.PARAM_SYSTEM, systemDesc.getName());
		connectionTestDlgStartCfg.setIsCreatingChildProcess(true);
		connectionTestDlgStartCfg.processExecution(oFF.SyncType.NON_BLOCKING, null, null);
	}
};
oFF.SleMetis.prototype.updateCurrentSystemCustomProperties = function(inputSearchText)
{
	var searchText = inputSearchText;
	if (oFF.isNull(searchText))
	{
		searchText = oFF.notNull(this.m_searchPropsInput) ? this.m_searchPropsInput.getText() : "";
	}
	if (oFF.notNull(this.m_selectedItem))
	{
		this.m_customPropertiesMap.clear();
		this.m_customPropertiesLayout.clearItems();
		var systemDescriptionProperties = this.m_selectedItem.getSystemDescription().getProperties();
		var propertyKeysIterator = systemDescriptionProperties.getKeysAsIteratorOfString();
		while (propertyKeysIterator.hasNext())
		{
			var propertyKey = propertyKeysIterator.next();
			if (oFF.notNull(this.m_allFormItemsMap) && !this.m_allFormItemsMap.containsKey(propertyKey) && oFF.XString.containsString(oFF.XString.toLowerCase(propertyKey), oFF.XString.toLowerCase(searchText)))
			{
				var newFormItem = this.addNewFormElement(this.m_customPropertiesLayout, propertyKey, oFF.UiInputType.TEXT, "100%", true);
				newFormItem.setText(systemDescriptionProperties.getByKey(propertyKey));
				this.m_customPropertiesMap.put(propertyKey, newFormItem);
			}
		}
	}
};
oFF.SleMetis.prototype.saveSystemInLocalStorage = function(sysDesc)
{
	var tempSystemProps = sysDesc.getProperties();
	var serializedSystemDesc = tempSystemProps.serialize();
	var userSpecifiedSystems = this.getApplication().getProcess().getLocalStorage().getStringByKeyExt(oFF.SleMetis.USER_SPECIFIED_SYSTEMS_KEY, "");
	userSpecifiedSystems = oFF.XStringUtils.concatenate3(userSpecifiedSystems, oFF.SleMetis.METIS_SYSTEM_SEPARATOR, serializedSystemDesc);
	this.getApplication().getProcess().getLocalStorage().putString(oFF.SleMetis.USER_SPECIFIED_SYSTEMS_KEY, userSpecifiedSystems);
	oFF.SleMetis.s_userSpecifiedSystems.add(sysDesc);
};
oFF.SleMetis.prototype.clearUSerSpecifiedSystemsFromLocalStorage = function()
{
	this.getApplication().getProcess().getLocalStorage().putString(oFF.SleMetis.USER_SPECIFIED_SYSTEMS_KEY, "");
};
oFF.SleMetis.prototype.onPress = function(event)
{
	var control = event.getControl();
	var controlParent = control.getParent();
	if (oFF.XString.isEqual(control.getName(), "formCancelBtn"))
	{
		this.cancelNewSystemCreate();
		return;
	}
	else if (oFF.XString.isEqual(control.getName(), "formSaveBtn"))
	{
		this.saveAndCreateNewSystem();
		return;
	}
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU)
	{
		if (oFF.XString.isEqual(controlParent.getName(), "editToolbarMenu"))
		{
			switch (control.getName())
			{
				case "editToolbarMenuAddBtn":
					this.performAddNewSystem();
					break;

				case "editToolbarMenuImportBtn":
					this.openMetisImporter();
					break;

				case "editToolbarMenuClearUserSystemsBtn":
					this.performClearUserSystems();
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "toolsToolbarMenu"))
		{
			switch (control.getName())
			{
				case "toolsToolbarMenuConnectBtn":
					this.performConnectionTest();
					break;

				default:
			}
		}
	}
};
oFF.SleMetis.prototype.onMetisImportSuccess = function()
{
	this.log("System landscape import success");
	this.loadSystems();
	if (this.isSystemListFiltered())
	{
		this.filterSystemList(this.m_searchInput.getText(), false);
	}
	else
	{
		this.updateSystemList();
	}
};
oFF.SleMetis.prototype.onSelect = function(event)
{
	if (oFF.XString.isEqual(event.getControl().getName(), "sleMetisSystemTypeDropDown"))
	{
		var selectedSystemTypeItem = event.getSelectedItem();
		this.m_selectedSystemType = selectedSystemTypeItem;
		this.filterSystemList(this.m_searchInput.getText(), false);
	}
	else
	{
		var selectedListItem = event.getSelectedItem();
		var systemItem = selectedListItem.getCustomObject();
		this.showSystemDetails(systemItem);
		this.m_selectedItem = systemItem;
		this.updateSystemSpecificTabs(systemItem.getSystemDescription());
		this.updateCurrentSystemCustomProperties(null);
		if (this.isFormEditMode())
		{
			this.cancelNewSystemCreate();
		}
	}
};
oFF.SleMetis.prototype.updateSystemSpecificTabs = function(systemDescription)
{
	var bwTab = this.m_layoutTabBar.getItemByName("BW");
	var sacTab = this.m_layoutTabBar.getItemByName("SAC");
	bwTab.setVisible(false);
	sacTab.setVisible(false);
	if (systemDescription.getSystemType() === oFF.SystemType.BW)
	{
		bwTab.setVisible(true);
	}
	if (systemDescription.getProperties().getStringByKey(oFF.ConnectionParameters.FPA_IS_CONNECTED) !== null)
	{
		sacTab.setVisible(true);
	}
};
oFF.SleMetis.prototype.onLiveChange = function(event)
{
	var control = event.getControl();
	if (control === this.m_searchInput)
	{
		this.filterSystemList(event.getControl().getText(), false);
	}
};
oFF.SleMetis.prototype.onSearch = function(event)
{
	var didPressClearButton = event.getParameters().getBooleanByKeyExt(oFF.UiEventParams.PARAM_CLEAR_BUTTON_PRESSED, false);
	var searchText = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_SEARCH_TEXT, "");
	if (event.getControl() === this.m_searchPropsInput)
	{
		this.filterAdvancedProperties(searchText);
		return;
	}
	if (event.getControl() === this.m_searchInput)
	{
		this.filterSystemList(searchText, didPressClearButton);
		return;
	}
};
oFF.SleMetis.prototype.onMetisFormItemLiveChange = function(formItem)
{
	if (formItem === this.m_systemNameFormItem)
	{
		this.updateNewSystemNameInList(this.m_systemNameFormItem.getText());
		return;
	}
};

oFF.SuAthena = function() {};
oFF.SuAthena.prototype = new oFF.DfUiProgram();
oFF.SuAthena.prototype._ff_c = "SuAthena";

oFF.SuAthena.DEFAULT_PROGRAM_NAME = "Athena";
oFF.SuAthena.FILE_MENU_NAME = "athenaFileMenubarMenu";
oFF.SuAthena.FILE_MENU_NEW_NAME = "athenaMenubarMenuNew";
oFF.SuAthena.FILE_MENU_OPEN_NAME = "athenaMenubarMenuOpen";
oFF.SuAthena.FILE_MENU_SAVE_NAME = "athenaMenubarMenuSave";
oFF.SuAthena.FILE_MENU_SAVE_AS_NAME = "athenaMenubarMenuSaveAs";
oFF.SuAthena.EDIT_MENU_NAME = "athenaEditMenubarMenu";
oFF.SuAthena.EDIT_MENU_DISCARD_CHANGES_NAME = "athenaMenubarMenuDiscardChanges";
oFF.SuAthena.CONTENT_TYPE_MENU_NAME = "athenaContentTypeMenubarMenu";
oFF.SuAthena.CONTENT_TYPE_MENU_ITEM_TAG = "athenaContentTypeMenubarMenuItem";
oFF.SuAthena.CODE_TYPES = "abap,abc,actionscript,ada,apache_conf,applescript,asciidoc,assembly_x86,autohotkey,batchfile,bro,c9search,c_cpp,cirru,clojure,cobol,coffee,coldfusion,csharp,css,curly,d,dart,diff,django,dockerfile,dot,drools,eiffel,ejs,elixir,elm,erlang,forth,fortran,ftl,gcode,gherkin,gitignore,glsl,gobstones,golang,groovy,haml,handlebars,haskell,haskell_cabal,haxe,hjson,html,html_elixir,html_ruby,ini,io,jack,jade,java,javascript,json,jsoniq,jsp,jsx,julia,kotlin,latex,lean,less,liquid,lisp,live_script,livescript,logiql,lsl,lua,luapage,lucene,makefile,markdown,mask,matlab,mavens_mate_log,maze,mel,mips_assembler,mipsassembler,mushcode,mysql,nix,nsis,objectivec,ocaml,pascal,perl,pgsql,php,plain_text,powershell,praat,prolog,properties,protobuf,python,r,razor,rdoc,rhtml,rst,ruby,rust,sass,scad,scala,scheme,scss,sh,sjs,smarty,snippets,soy_template,space,sql,sqlserver,stylus,svg,swift,swig,tcl,tex,text,textile,toml,tsx,twig,typescript,vala,vbscript,velocity,verilog,vhdl,wollok,xml,xquery,yaml,terraform,slim,redshift,red,puppet,php_laravel_blade,mixal,jssm,fsharp,edifact,csp,cssound_score,cssound_orchestra,cssound_document";
oFF.SuAthena.PARAM_TYPE = "type";
oFF.SuAthena.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SuAthena.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SuAthena.prototype.m_file = null;
oFF.SuAthena.prototype.m_initialValue = null;
oFF.SuAthena.prototype.m_codeType = null;
oFF.SuAthena.prototype.m_codeEditor = null;
oFF.SuAthena.prototype.m_codeTypes = null;
oFF.SuAthena.prototype.m_isModified = false;
oFF.SuAthena.prototype.newProgram = function()
{
	var prg = new oFF.SuAthena();
	prg.setup();
	return prg;
};
oFF.SuAthena.prototype.getProgramName = function()
{
	return oFF.SuAthena.DEFAULT_PROGRAM_NAME;
};
oFF.SuAthena.prototype.releaseObject = function()
{
	this.m_file = null;
	this.m_codeEditor = oFF.XObjectExt.release(this.m_codeEditor);
	this.m_codeTypes = oFF.XObjectExt.release(this.m_codeTypes);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuAthena.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuAthena.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60%", "60%");
};
oFF.SuAthena.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuAthena.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuAthena.DEFAULT_PROGRAM_NAME;
};
oFF.SuAthena.prototype.canTerminate = function()
{
	var canTerminate = true;
	if (this.isModified())
	{
		this.presentExitConfirmPopup("Unsaved changes!", "Your unsaved changes will be lost! Are you sure that you want to exit?");
		canTerminate = false;
	}
	return canTerminate;
};
oFF.SuAthena.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.DfProgram.PARAM_FILE, "Specify the file to open", "Path to the file ", oFF.XValueType.STRING);
	metadata.addOption(oFF.SuAthena.PARAM_TYPE, "Specify the content type of the file", "The content type as a string ", oFF.XValueType.STRING);
};
oFF.SuAthena.prototype.processArguments = function(args)
{
	var fileName = args.getStringByKey(oFF.DfProgram.PARAM_FILE);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fileName))
	{
		this.prepareFileByPath(fileName);
	}
	var contentType = args.getStringByKey(oFF.SuAthena.PARAM_TYPE);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(contentType))
	{
		this.setContentType(contentType);
	}
};
oFF.SuAthena.prototype.setupProgram = function()
{
	this.m_initialValue = "";
	if (oFF.XStringUtils.isNullOrEmpty(this.m_codeType))
	{
		this.setContentType("text");
	}
	this.m_isModified = false;
	this.m_codeTypes = oFF.XStringTokenizer.splitString(oFF.SuAthena.CODE_TYPES, ",");
	return null;
};
oFF.SuAthena.prototype.buildUi = function(genesis)
{
	this.m_codeEditor = genesis.newRoot(oFF.UiType.CODE_EDITOR);
	this.m_codeEditor.useMaxSpace();
	this.m_codeEditor.setCodeType(this.m_codeType);
	this.m_codeEditor.registerOnLiveChange(this);
	this.m_codeEditor.registerOnFileDrop(this);
	this.m_codeEditor.focus();
	this.addMenuBarButton("File", null, null,  function(controlEvent){
		this.createFileMenu(controlEvent.getControl());
	}.bind(this));
	this.addMenuBarButton("Edit", null, null,  function(controlEvent2){
		this.createEditMenu(controlEvent2.getControl());
	}.bind(this));
	this.addMenuBarButton("Editor", null, null,  function(controlEvent3){
		this.createEditorMenu(controlEvent3.getControl());
	}.bind(this));
	if (oFF.notNull(this.m_file))
	{
		this.loadFileContent(this.m_file);
	}
	else
	{
		this.newDocument();
	}
};
oFF.SuAthena.prototype.prepareFileByPath = function(filePath)
{
	if (oFF.notNull(filePath))
	{
		var process = this.getProcess();
		var file = oFF.XFile.createWithVars(process, filePath);
		if (oFF.isNull(file) || file.hasErrors())
		{
			this.log2("Error while loading file: ", filePath);
			return;
		}
		this.setFile(file);
	}
};
oFF.SuAthena.prototype.setContentType = function(type)
{
	this.m_codeType = type;
	if (oFF.notNull(this.m_codeEditor))
	{
		this.m_codeEditor.setCodeType(this.m_codeType);
	}
	this.updateContentTypeParam(type);
};
oFF.SuAthena.prototype.setFile = function(file)
{
	this.m_file = file;
};
oFF.SuAthena.prototype.loadFileContent = function(file)
{
	if (oFF.notNull(file) && oFF.notNull(this.m_codeEditor))
	{
		this.m_codeEditor.setBusy(true);
		file.processLoad(oFF.SyncType.NON_BLOCKING, this, null, oFF.CompressionType.NONE);
	}
};
oFF.SuAthena.prototype.newDocument = function()
{
	if (oFF.notNull(this.m_codeEditor))
	{
		this.m_codeEditor.setText("");
	}
	this.m_initialValue = "";
	this.updateDocumentModifiedState("");
	this.setTitle("untitled");
	this.m_file = oFF.XObjectExt.release(this.m_file);
};
oFF.SuAthena.prototype.setNewEditorContentByFile = function(file)
{
	this.m_file = file;
	var stringContent = file.getFileContent().getString();
	this.m_codeEditor.setText(stringContent);
	this.m_initialValue = stringContent;
	this.setTitle(file.getName());
};
oFF.SuAthena.prototype.openFile = function()
{
	var reLoadConfig = oFF.SuResourceExplorerConfigWrapper.create();
	reLoadConfig.setTitle("Select File");
	reLoadConfig.setInitialPath(oFF.UtFileUtils.getParentDirPath(this.m_file));
	oFF.SuResourceExplorerPromise.loadFile(this.getProcess(), reLoadConfig).then( function(file){
		this.setNewEditorContentByFile(file);
		this.updateFileParam(file);
		return file;
	}.bind(this),  function(errorMsg){
		this.getGenesis().showErrorToast(errorMsg.getText());
	}.bind(this));
};
oFF.SuAthena.prototype.saveContentToCurrentFile = function()
{
	if (oFF.notNull(this.m_file))
	{
		var editorContent = this.m_codeEditor.getText() !== null ? this.m_codeEditor.getText() : "";
		var fileContent = oFF.XContent.createStringContent(oFF.ContentType.TEXT, editorContent);
		oFF.UtFilePromise.saveContent(this.m_file, fileContent).then( function(resultFile){
			this.getGenesis().showSuccessToast(oFF.XStringUtils.concatenate2("Saved at ", resultFile.getUri().getPath()));
			this.m_initialValue = this.m_codeEditor.getText();
			this.updateDocumentModifiedState(this.m_codeEditor.getText());
			return resultFile;
		}.bind(this),  function(errorMsg){
			this.getGenesis().showErrorToast(errorMsg.getText());
		}.bind(this));
	}
	else
	{
		this.getGenesis().showErrorToast("Cannot save, missing file!");
	}
};
oFF.SuAthena.prototype.saveContentAs = function()
{
	var fileNameToSave = "new_file.txt";
	if (oFF.notNull(this.m_file))
	{
		fileNameToSave = this.m_file.getName();
	}
	var editorContent = this.m_codeEditor.getText() !== null ? this.m_codeEditor.getText() : "";
	var fileContent = oFF.XContent.createStringContent(oFF.ContentType.TEXT, editorContent);
	var reSaveConfig = oFF.SuResourceExplorerConfigWrapper.create();
	reSaveConfig.setTitle("Save As...");
	reSaveConfig.getDialogMode(true).setSaveNewResourceName(fileNameToSave);
	reSaveConfig.setInitialPath(oFF.UtFileUtils.getParentDirPath(this.m_file));
	oFF.SuResourceExplorerPromise.saveContent(this.getProcess(), fileContent, reSaveConfig).then( function(file){
		this.m_file = file;
		this.updateFileParam(file);
		this.setTitle(file.getName());
		this.getGenesis().showSuccessToast("File saved!");
		return file;
	}.bind(this),  function(errorMsg){
		this.getGenesis().showErrorToast(errorMsg.getText());
	}.bind(this));
};
oFF.SuAthena.prototype.updateDocumentModifiedState = function(curValue)
{
	var oldModified = this.m_isModified;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(curValue))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_initialValue))
		{
			if (oFF.XString.isEqual(this.m_initialValue, curValue))
			{
				this.m_isModified = false;
			}
			else
			{
				this.m_isModified = true;
			}
		}
		else
		{
			this.m_isModified = true;
		}
	}
	else if (oFF.XStringUtils.isNullOrEmpty(curValue))
	{
		if (oFF.XStringUtils.isNullOrEmpty(this.m_initialValue))
		{
			this.m_isModified = false;
		}
		else
		{
			this.m_isModified = true;
		}
	}
	if (oldModified !== this.m_isModified)
	{
		this.markDocumentModified();
	}
};
oFF.SuAthena.prototype.markDocumentModified = function()
{
	if (this.m_isModified && !oFF.XString.startsWith(this.getTitle(), "*"))
	{
		var modifiedTitle = oFF.XStringUtils.concatenate2("*", this.getTitle());
		this.setTitle(modifiedTitle);
	}
	else if (!this.m_isModified && oFF.XString.startsWith(this.getTitle(), "*"))
	{
		var defaultTitle = oFF.XString.substring(this.getTitle(), 1, -1);
		this.setTitle(defaultTitle);
	}
};
oFF.SuAthena.prototype.isModified = function()
{
	return this.m_isModified;
};
oFF.SuAthena.prototype.discardDocumentChanges = function()
{
	if (oFF.notNull(this.m_codeEditor))
	{
		this.m_codeEditor.setText(this.m_initialValue);
		this.updateDocumentModifiedState(this.m_codeEditor.getText());
	}
};
oFF.SuAthena.prototype.beautifyContent = function()
{
	if (oFF.notNull(this.m_codeEditor))
	{
		this.m_codeEditor.prettyPrint();
	}
};
oFF.SuAthena.prototype.updateContentTypeParam = function(contentType)
{
	var prgArgs = this.getArguments();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(contentType))
	{
		prgArgs.putString(oFF.SuAthena.PARAM_TYPE, contentType);
	}
	else
	{
		prgArgs.remove(oFF.SuAthena.PARAM_TYPE);
	}
	this.getProcess().notifyProcessEvent(oFF.ProcessEventType.START_CFG_CHANGED);
};
oFF.SuAthena.prototype.createFileMenu = function(fileBtn)
{
	var fileMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	fileMenu.setName(oFF.SuAthena.FILE_MENU_NAME);
	fileMenu.addNewItem().setName(oFF.SuAthena.FILE_MENU_NEW_NAME).setText("New").setIcon("document").registerOnPress(this);
	fileMenu.addNewItem().setName(oFF.SuAthena.FILE_MENU_OPEN_NAME).setText("Open...").setIcon("open-folder").registerOnPress(this).setEnabled(true);
	fileMenu.addNewItem().setName(oFF.SuAthena.FILE_MENU_SAVE_NAME).setText("Save").setIcon("save").registerOnPress(this).setSectionStart(true).setEnabled(oFF.notNull(this.m_file));
	fileMenu.addNewItem().setName(oFF.SuAthena.FILE_MENU_SAVE_AS_NAME).setText("Save as...").setIcon("save").registerOnPress(this);
	fileMenu.openAt(fileBtn);
};
oFF.SuAthena.prototype.createEditMenu = function(editBtn)
{
	var editMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	editMenu.setName(oFF.SuAthena.EDIT_MENU_NAME);
	editMenu.addNewItem().setName(oFF.SuAthena.EDIT_MENU_DISCARD_CHANGES_NAME).setText("Discard changes").setIcon("eraser").registerOnPress(this);
	editMenu.openAt(editBtn);
};
oFF.SuAthena.prototype.createEditorMenu = function(editorBtn)
{
	var editorMenu = this.m_genesis.newControl(oFF.UiType.MENU);
	var contentTypeMenuItem = editorMenu.addNewItem().setName(oFF.SuAthena.CONTENT_TYPE_MENU_NAME).setText("Content Type").setIcon("syntax");
	this.createContentTypeSubMenu(contentTypeMenuItem);
	editorMenu.addNewItem().setText("Beautify Content").setIcon("source-code").registerOnPress(oFF.UiLambdaPressListener.create( function(control2){
		this.beautifyContent();
	}.bind(this)));
	editorMenu.openAt(editorBtn);
};
oFF.SuAthena.prototype.createContentTypeSubMenu = function(contentTypeMenuItem)
{
	if (oFF.notNull(contentTypeMenuItem))
	{
		if (oFF.notNull(this.m_codeTypes))
		{
			oFF.XCollectionUtils.forEachString(this.m_codeTypes,  function(codeType){
				contentTypeMenuItem.addNewItem().setTag(oFF.SuAthena.CONTENT_TYPE_MENU_ITEM_TAG).setText(codeType).setIcon(oFF.XString.isEqual(codeType, this.m_codeType) ? "accept" : null).registerOnPress(this);
			}.bind(this));
		}
	}
};
oFF.SuAthena.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.log("File loaded!");
	if (extResult.isValid())
	{
		if (oFF.notNull(fileContent) && oFF.notNull(this.m_codeEditor))
		{
			this.setNewEditorContentByFile(file);
		}
	}
	else
	{
		this.getGenesis().showErrorToast(oFF.XStringUtils.concatenate2("Could not load file! ", extResult.getSummary()));
	}
	this.m_codeEditor.setBusy(false);
};
oFF.SuAthena.prototype.onPress = function(event)
{
	var control = event.getControl();
	var controlParent = control.getParent();
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU && oFF.XString.isEqual(controlParent.getName(), oFF.SuAthena.FILE_MENU_NAME))
	{
		switch (control.getName())
		{
			case oFF.SuAthena.FILE_MENU_NEW_NAME:
				this.newDocument();
				break;

			case oFF.SuAthena.FILE_MENU_OPEN_NAME:
				this.openFile();
				break;

			case oFF.SuAthena.FILE_MENU_SAVE_NAME:
				this.saveContentToCurrentFile();
				break;

			case oFF.SuAthena.FILE_MENU_SAVE_AS_NAME:
				this.saveContentAs();
				break;

			default:
		}
	}
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU && oFF.XString.isEqual(controlParent.getName(), oFF.SuAthena.EDIT_MENU_NAME))
	{
		switch (control.getName())
		{
			case oFF.SuAthena.EDIT_MENU_DISCARD_CHANGES_NAME:
				this.discardDocumentChanges();
				break;

			default:
		}
	}
	if (oFF.notNull(controlParent) && controlParent.getUiType() === oFF.UiType.MENU_ITEM && oFF.XString.isEqual(controlParent.getName(), oFF.SuAthena.CONTENT_TYPE_MENU_NAME))
	{
		var tmpItem = control;
		this.setContentType(tmpItem.getText());
	}
};
oFF.SuAthena.prototype.onLiveChange = function(event)
{
	var newValue = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_VALUE, null);
	this.updateDocumentModifiedState(newValue);
};
oFF.SuAthena.prototype.onFileDrop = function(event)
{
	var fileContent = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_FILE_CONTENT, null);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fileContent))
	{
		this.m_codeEditor.setText(fileContent);
		this.updateDocumentModifiedState(this.m_codeEditor.getText());
	}
};

oFF.SuWeatherFetcher = function() {};
oFF.SuWeatherFetcher.prototype = new oFF.DfUiProgram();
oFF.SuWeatherFetcher.prototype._ff_c = "SuWeatherFetcher";

oFF.SuWeatherFetcher.CURRENT_WEATHER_WALLDORF_ENDPOINT = "https://api.open-meteo.com/v1/forecast?latitude=49.3064&longitude=8.6428&current_weather=true";
oFF.SuWeatherFetcher.DEFAULT_PROGRAM_NAME = "WeatherFetcher";
oFF.SuWeatherFetcher.prototype.m_mainLayout = null;
oFF.SuWeatherFetcher.prototype.m_weatherInterpretationCodesList = null;
oFF.SuWeatherFetcher.prototype.newProgram = function()
{
	var prg = new oFF.SuWeatherFetcher();
	prg.setup();
	return prg;
};
oFF.SuWeatherFetcher.prototype.getProgramName = function()
{
	return oFF.SuWeatherFetcher.DEFAULT_PROGRAM_NAME;
};
oFF.SuWeatherFetcher.prototype.releaseObject = function()
{
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.SuWeatherFetcher.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.SuWeatherFetcher.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("50%", "50%");
};
oFF.SuWeatherFetcher.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.SuWeatherFetcher.prototype.getMenuBarDisplayName = function()
{
	return "Weather";
};
oFF.SuWeatherFetcher.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuWeatherFetcher.prototype.processArguments = function(args) {};
oFF.SuWeatherFetcher.prototype.setupProgram = function()
{
	this.m_weatherInterpretationCodesList = oFF.XHashMapOfStringByString.create();
	this.m_weatherInterpretationCodesList.put("0", "Clear sky");
	this.m_weatherInterpretationCodesList.put("1", "Mainly clear");
	this.m_weatherInterpretationCodesList.put("2", "Partly cloudy");
	this.m_weatherInterpretationCodesList.put("3", "Overcast");
	this.m_weatherInterpretationCodesList.put("45", "Fog");
	this.m_weatherInterpretationCodesList.put("48", "Depositing rime fog");
	this.m_weatherInterpretationCodesList.put("51", "Light drizzle");
	this.m_weatherInterpretationCodesList.put("53", "Moderate drizzle");
	this.m_weatherInterpretationCodesList.put("55", "Dense drizzle");
	this.m_weatherInterpretationCodesList.put("56", "Light freezing drizzle");
	this.m_weatherInterpretationCodesList.put("57", "Dense freezing drizzle");
	this.m_weatherInterpretationCodesList.put("61", "Slight rain");
	this.m_weatherInterpretationCodesList.put("63", "Moderate rain");
	this.m_weatherInterpretationCodesList.put("65", "Heavy rain");
	this.m_weatherInterpretationCodesList.put("66", "Light freezing rain");
	this.m_weatherInterpretationCodesList.put("67", "Heavy freezing rain");
	this.m_weatherInterpretationCodesList.put("71", "Slight snow fall");
	this.m_weatherInterpretationCodesList.put("73", "Moderate snow fall");
	this.m_weatherInterpretationCodesList.put("75", "Heavy snow fall");
	this.m_weatherInterpretationCodesList.put("77", "Snow grains");
	this.m_weatherInterpretationCodesList.put("80", "Slight rain showers");
	this.m_weatherInterpretationCodesList.put("81", "Moderate rain showers");
	this.m_weatherInterpretationCodesList.put("82", "Violent rain showers");
	this.m_weatherInterpretationCodesList.put("85", "Slight snow showers");
	this.m_weatherInterpretationCodesList.put("86", "Heavy snow showers");
	this.m_weatherInterpretationCodesList.put("95", "Thunderstorms");
	this.m_weatherInterpretationCodesList.put("96", "Thunderstorms with slight hail");
	this.m_weatherInterpretationCodesList.put("99", "Thunderstorms with heavy hail");
	return null;
};
oFF.SuWeatherFetcher.prototype.buildUi = function(genesis)
{
	this.setTitle("Current weather in Walldorf");
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	genesis.setRoot(this.m_mainLayout);
	this.addMenuBarButton("Refresh", "refresh", null,  function(controlEvent2){
		this.retrieveCurrentWeather();
	}.bind(this));
	this.retrieveCurrentWeather();
};
oFF.SuWeatherFetcher.prototype.retrieveCurrentWeather = function()
{
	this.m_mainLayout.clearItems();
	this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_mainLayout.setBusy(true);
	var loadingLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	loadingLbl.setText("Loading...");
	loadingLbl.setFontSize(oFF.UiCssLength.create("18px"));
	loadingLbl.setMargin(oFF.UiCssBoxEdges.create("20px"));
	oFF.UtFetch.fetch(oFF.SuWeatherFetcher.CURRENT_WEATHER_WALLDORF_ENDPOINT, this.getProcess()).then( function(result){
		this.displayCurrentWeather(result);
		return result;
	}.bind(this), null).onCatch( function(reason){
		this.displayError(reason.getText());
	}.bind(this)).onFinally( function(){
		this.m_mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
		this.m_mainLayout.setBusy(false);
	}.bind(this));
};
oFF.SuWeatherFetcher.prototype.displayCurrentWeather = function(curWeather)
{
	this.m_mainLayout.clearItems();
	var curWeatherStruct = curWeather.getStructureByKey("current_weather");
	if (oFF.notNull(curWeatherStruct) && curWeatherStruct.hasElements())
	{
		var curTemp = curWeatherStruct.getDoubleByKeyExt("temperature", -11111);
		var curTempStr = oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(curTemp), "\u00B0C");
		this.addNewWeatherEntry(this.m_mainLayout, "Temperature:", curTempStr);
		var curWindSpeed = curWeatherStruct.getDoubleByKeyExt("windspeed", -11111);
		var curWindSpeedStr = oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(curWindSpeed), " m/s");
		this.addNewWeatherEntry(this.m_mainLayout, "Wind speed:", curWindSpeedStr);
		var curWindDir = curWeatherStruct.getDoubleByKeyExt("winddirection", -11111);
		var curWindDirStr = oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(curWindDir), "\u00B0");
		this.addNewWeatherEntry(this.m_mainLayout, "Wind direction:", curWindDirStr);
		var weatherCode = curWeatherStruct.getDoubleByKeyExt("weathercode", -11111);
		var weatherDescStr = this.m_weatherInterpretationCodesList.getByKey(oFF.XDouble.convertToString(weatherCode));
		if (oFF.XStringUtils.isNullOrEmpty(weatherDescStr))
		{
			weatherDescStr = "Unknown";
		}
		weatherDescStr = oFF.XStringUtils.concatenate4(weatherDescStr, " (", oFF.XDouble.convertToString(weatherCode), ")");
		this.addNewWeatherEntry(this.m_mainLayout, "Condition:", weatherDescStr);
	}
};
oFF.SuWeatherFetcher.prototype.displayError = function(message)
{
	this.log(message);
	this.m_mainLayout.clearItems();
	var errorLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	errorLbl.setText("Failed to retrieve the data!");
	errorLbl.setFontSize(oFF.UiCssLength.create("20px"));
	if (oFF.XStringUtils.isNotNullAndNotEmpty(message))
	{
		var messageLbl = this.m_mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		messageLbl.setText(message);
		messageLbl.setFontSize(oFF.UiCssLength.create("18px"));
		messageLbl.setMargin(oFF.UiCssBoxEdges.create("10px"));
		messageLbl.setFontColor(oFF.UiColor.RED);
	}
};
oFF.SuWeatherFetcher.prototype.addNewWeatherEntry = function(mainLayout, label, value)
{
	var itemWrapperLayout = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	itemWrapperLayout.useMaxWidth();
	itemWrapperLayout.setDirection(oFF.UiFlexDirection.ROW);
	itemWrapperLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	itemWrapperLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	itemWrapperLayout.setMargin(oFF.UiCssBoxEdges.create("0.5rem"));
	var itemLabelLbl = itemWrapperLayout.addNewItemOfType(oFF.UiType.LABEL);
	itemLabelLbl.setText(label);
	itemLabelLbl.setFontSize(oFF.UiCssLength.create("18px"));
	itemLabelLbl.setMargin(oFF.UiCssBoxEdges.create("0 0.5rem 0 0"));
	var itemValueLbl = itemWrapperLayout.addNewItemOfType(oFF.UiType.LABEL);
	itemValueLbl.setText(value);
	itemValueLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	itemValueLbl.setFontSize(oFF.UiCssLength.create("18px"));
};

oFF.SuCalendarDialog = function() {};
oFF.SuCalendarDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuCalendarDialog.prototype._ff_c = "SuCalendarDialog";

oFF.SuCalendarDialog.DEFAULT_PROGRAM_NAME = "CalendarDialog";
oFF.SuCalendarDialog.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SuCalendarDialog.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SuCalendarDialog.createNewCalendarDialogProgram = function()
{
	var prg = new oFF.SuCalendarDialog();
	prg.setup();
	return prg;
};
oFF.SuCalendarDialog.prototype.m_uiModel = null;
oFF.SuCalendarDialog.prototype.m_monthView = null;
oFF.SuCalendarDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuCalendarDialog();
	prg.setup();
	return prg;
};
oFF.SuCalendarDialog.prototype.getProgramName = function()
{
	return oFF.SuCalendarDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuCalendarDialog.prototype.releaseObject = function()
{
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuCalendarDialog.prototype.getLogSeverity = function()
{
	return oFF.DfUiDialogProgram.prototype.getLogSeverity.call( this );
};
oFF.SuCalendarDialog.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuCalendarDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuCalendarDialog.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.SuCalendarDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("330px", "220px");
};
oFF.SuCalendarDialog.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuCalendarDialog.prototype.processArguments = function(args) {};
oFF.SuCalendarDialog.prototype.setupProgram = function()
{
	this.setTitle("Calendar");
	return null;
};
oFF.SuCalendarDialog.prototype.buildUi = function(genesis)
{
	this.m_uiModel = oFF.MonthUiModel.create();
	this.createCalendarView();
	genesis.setRoot(this.m_monthView.getRoot());
};
oFF.SuCalendarDialog.prototype.replaceCalendarDialogContent = function(view)
{
	this.getGenesis().setRoot(view.getRoot());
};
oFF.SuCalendarDialog.prototype.addOneMonth = function()
{
	this.m_uiModel.addOneMonth();
	this.m_monthView.refreshContent();
};
oFF.SuCalendarDialog.prototype.subtractOneMonth = function()
{
	this.m_uiModel.subtractOneMonth();
	this.m_monthView.refreshContent();
};
oFF.SuCalendarDialog.prototype.getYear = function()
{
	return this.m_uiModel.getYear();
};
oFF.SuCalendarDialog.prototype.selectMonth = function(year, month)
{
	this.m_uiModel = oFF.XObjectExt.release(this.m_uiModel);
	this.m_uiModel = oFF.MonthUiModel.createWithYearAndMonth(year, month);
	this.createCalendarView();
	this.getGenesis().setRoot(this.m_monthView.getRoot());
};
oFF.SuCalendarDialog.prototype.selectYear = function(year)
{
	var month = this.m_uiModel.getMonth();
	this.m_uiModel = oFF.XObjectExt.release(this.m_uiModel);
	this.m_uiModel = oFF.MonthUiModel.createWithYearAndMonth(year, month);
	this.createCalendarView();
	this.getGenesis().setRoot(this.m_monthView.getRoot());
};
oFF.SuCalendarDialog.prototype.createCalendarView = function()
{
	this.m_monthView = oFF.FlexMonthView.create(this.getGenesis(), this.m_uiModel, true);
	var addMonthListener = oFF.AddMonthListener.create(this);
	var subtractMonthListener = oFF.SubtractMonthListener.create(this);
	var openMonthSelectionListener = oFF.OpenMonthSelectionViewListener.create(this.getGenesis(), this);
	var openYearSelectionListener = oFF.OpenYearSelectionViewListener.create(this.getGenesis(), this, oFF.YearSelectionUiModel.create(this.getYear()));
	this.m_monthView.registerAddMonthListener(addMonthListener);
	this.m_monthView.registerSubtractMonthListener(subtractMonthListener);
	this.m_monthView.registerOpenMonthSelectionListener(openMonthSelectionListener);
	this.m_monthView.registerOpenYearSelectionListener(openYearSelectionListener);
};

oFF.SuConnectionTestDialog = function() {};
oFF.SuConnectionTestDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuConnectionTestDialog.prototype._ff_c = "SuConnectionTestDialog";

oFF.SuConnectionTestDialog.DEFAULT_PROGRAM_NAME = "ConnectionTestDialog";
oFF.SuConnectionTestDialog.GREY_COLOR = "#7f8c8d";
oFF.SuConnectionTestDialog.GREEN_COLOR = "#27ae60";
oFF.SuConnectionTestDialog.RED_COLOR = "#c0392b";
oFF.SuConnectionTestDialog.ORANGE_COLOR = "#d35400";
oFF.SuConnectionTestDialog.PARAM_SYSTEM = "system";
oFF.SuConnectionTestDialog.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SuConnectionTestDialog.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SuConnectionTestDialog.createNewTestDialogProgram = function()
{
	var prg = new oFF.SuConnectionTestDialog();
	prg.setup();
	return prg;
};
oFF.SuConnectionTestDialog.prototype.m_testButton = null;
oFF.SuConnectionTestDialog.prototype.m_resultLayout = null;
oFF.SuConnectionTestDialog.prototype.m_statusLbl = null;
oFF.SuConnectionTestDialog.prototype.m_systemInfoText = null;
oFF.SuConnectionTestDialog.prototype.m_serverResponseText = null;
oFF.SuConnectionTestDialog.prototype.m_serverMetadataText = null;
oFF.SuConnectionTestDialog.prototype.m_systemName = null;
oFF.SuConnectionTestDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuConnectionTestDialog();
	prg.setup();
	return prg;
};
oFF.SuConnectionTestDialog.prototype.getProgramName = function()
{
	return oFF.SuConnectionTestDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuConnectionTestDialog.prototype.releaseObject = function()
{
	this.m_statusLbl = oFF.XObjectExt.release(this.m_statusLbl);
	this.m_systemInfoText = oFF.XObjectExt.release(this.m_systemInfoText);
	this.m_serverResponseText = oFF.XObjectExt.release(this.m_serverResponseText);
	this.m_serverMetadataText = oFF.XObjectExt.release(this.m_serverMetadataText);
	this.m_resultLayout = oFF.XObjectExt.release(this.m_resultLayout);
	this.m_testButton = oFF.XObjectExt.release(this.m_testButton);
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuConnectionTestDialog.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.SuConnectionTestDialog.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuConnectionTestDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuConnectionTestDialog.prototype.getDialogButtons = function(genesis)
{
	this.m_testButton = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	this.m_testButton.setName("suConnectionTestDialogTestBtn");
	this.m_testButton.setText("Test");
	this.m_testButton.setButtonType(oFF.UiButtonType.PRIMARY);
	this.m_testButton.setEnabled(false);
	this.m_testButton.registerOnPress(this);
	var closeBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	closeBtn.setName("suConnectionTestDialogCloseBtn");
	closeBtn.setText("Close");
	closeBtn.registerOnPress(this);
	var tmpList = oFF.XList.create();
	tmpList.add(this.m_testButton);
	tmpList.add(closeBtn);
	return tmpList;
};
oFF.SuConnectionTestDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("600px", "750px");
};
oFF.SuConnectionTestDialog.prototype.onContainerAfterOpen = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_systemName))
	{
		this.prepareTest();
		this.startTest();
	}
};
oFF.SuConnectionTestDialog.prototype.onContainerAfterClose = function()
{
	this.testFinished();
};
oFF.SuConnectionTestDialog.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.SuConnectionTestDialog.PARAM_SYSTEM, "The system name which should be tested.");
};
oFF.SuConnectionTestDialog.prototype.processArguments = function(args)
{
	this.m_systemName = args.getStringByKeyExt(oFF.SuConnectionTestDialog.PARAM_SYSTEM, null);
};
oFF.SuConnectionTestDialog.prototype.setupProgram = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_systemName))
	{
		this.setTitle(oFF.XStringUtils.concatenate2("Connection test - ", this.m_systemName));
	}
	else
	{
		this.setTitle("Missing system!");
	}
	return null;
};
oFF.SuConnectionTestDialog.prototype.buildUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setPadding(oFF.UiCssBoxEdges.create("20px"));
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_statusLbl = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	this.m_statusLbl.setName("suConnectionTestStatusLbl");
	this.m_statusLbl.setWidth(oFF.UiCssLength.create("auto"));
	this.m_statusLbl.setFontSize(oFF.UiCssLength.create("16px"));
	this.m_statusLbl.setPadding(oFF.UiCssBoxEdges.create("10px"));
	this.m_statusLbl.setFontColor(oFF.UiColor.WHITE);
	this.m_statusLbl.setWrapping(true);
	this.m_statusLbl.setCornerRadius(oFF.UiCssBoxEdges.create("5px"));
	this.m_statusLbl.setTextAlign(oFF.UiTextAlign.CENTER);
	this.m_resultLayout = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_resultLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var statusSystemInfoSpacer = this.m_resultLayout.addNewItemOfType(oFF.UiType.SPACER);
	statusSystemInfoSpacer.setHeight(oFF.UiCssLength.create("10px"));
	var systemInfoLbl = this.m_resultLayout.addNewItemOfType(oFF.UiType.LABEL);
	systemInfoLbl.setText("System info:");
	this.m_systemInfoText = this.m_resultLayout.addNewItemOfType(oFF.UiType.TEXT);
	this.m_systemInfoText.setName("suConnectionTestSystemInfoText");
	this.m_systemInfoText.setWidth(oFF.UiCssLength.create("auto"));
	this.m_systemInfoText.setHeight(oFF.UiCssLength.create("85px"));
	var systemInfoResponseSpacer = this.m_resultLayout.addNewItemOfType(oFF.UiType.SPACER);
	systemInfoResponseSpacer.setHeight(oFF.UiCssLength.create("10px"));
	var serverResponseLbl = this.m_resultLayout.addNewItemOfType(oFF.UiType.LABEL);
	serverResponseLbl.setText("Server response:");
	this.m_serverResponseText = this.m_resultLayout.addNewItemOfType(oFF.UiType.TEXT);
	this.m_serverResponseText.setName("suConnectionTestServerResponseText");
	this.m_serverResponseText.setWidth(oFF.UiCssLength.create("auto"));
	this.m_serverResponseText.setHeight(oFF.UiCssLength.create("220px"));
	var responseMetadataSpacer = this.m_resultLayout.addNewItemOfType(oFF.UiType.SPACER);
	responseMetadataSpacer.setHeight(oFF.UiCssLength.create("10px"));
	var serverMetadataLbl = this.m_resultLayout.addNewItemOfType(oFF.UiType.LABEL);
	serverMetadataLbl.setText("Server metadata:");
	this.m_serverMetadataText = this.m_resultLayout.addNewItemOfType(oFF.UiType.TEXT);
	this.m_serverMetadataText.setName("suConnectionTestServerMetadataText");
	this.m_serverMetadataText.setWidth(oFF.UiCssLength.create("auto"));
	this.m_serverMetadataText.setHeight(oFF.UiCssLength.create("260px"));
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_systemName))
	{
		this.prepareTest();
	}
	else
	{
		this.setStatusLabelWarning("Missing system. Please specify a system!");
	}
	genesis.setRoot(mainLayout);
};
oFF.SuConnectionTestDialog.prototype.startTest = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_systemName))
	{
		var doesSystemExist = this.getApplication().getSystemLandscape().existsSystemName(this.m_systemName);
		if (doesSystemExist)
		{
			var connectionPool = this.getApplication().getConnectionPool();
			var connContainer = connectionPool.getConnection(this.m_systemName);
			this.generateSystemInfo(connContainer.getSystemDescription());
			if (oFF.XStringUtils.isNullOrEmpty(connContainer.getSystemDescription().getSystemType().getServerInfoPath()))
			{
				this.setStatusLabelWarning("Invalid system! Please try again!");
				this.testFinished();
			}
			else
			{
				connContainer.getServerMetadataExt(oFF.SyncType.NON_BLOCKING, this, null, oFF.HttpSemanticRequestType.CHECK_CONNECTION);
			}
		}
		else
		{
			this.setStatusLabelWarning("Could not find a system with the specified name!");
			this.testFinished();
		}
	}
	else
	{
		this.setStatusLabelWarning("Missing system name! Cannot test!");
		this.testFinished();
	}
};
oFF.SuConnectionTestDialog.prototype.setStatusLabel = function(text, bgColor)
{
	this.m_statusLbl.setBackgroundColor(bgColor);
	this.m_statusLbl.setText(text);
	this.m_systemInfoText.setBackgroundColor(bgColor.newColorWithAlpha(0.2));
};
oFF.SuConnectionTestDialog.prototype.setStatusLabelInfo = function(text)
{
	this.setStatusLabel(text, oFF.UiColor.create(oFF.SuConnectionTestDialog.GREY_COLOR));
};
oFF.SuConnectionTestDialog.prototype.setStatusLabelSuccess = function(text)
{
	this.setStatusLabel(text, oFF.UiColor.create(oFF.SuConnectionTestDialog.GREEN_COLOR));
};
oFF.SuConnectionTestDialog.prototype.setStatusLabelError = function(text)
{
	this.setStatusLabel(text, oFF.UiColor.create(oFF.SuConnectionTestDialog.RED_COLOR));
};
oFF.SuConnectionTestDialog.prototype.setStatusLabelWarning = function(text)
{
	this.setStatusLabel(text, oFF.UiColor.create(oFF.SuConnectionTestDialog.ORANGE_COLOR));
};
oFF.SuConnectionTestDialog.prototype.generateSystemInfo = function(systemDesc)
{
	if (oFF.notNull(systemDesc))
	{
		var systemInfoStrBuffer = oFF.XStringBuffer.create();
		systemInfoStrBuffer.append("[Url]: ");
		systemInfoStrBuffer.appendLine(systemDesc.getUrlWithoutAuthentication());
		systemInfoStrBuffer.append("[Server info path]: ");
		systemInfoStrBuffer.appendLine(systemDesc.getSystemType().getServerInfoPath());
		systemInfoStrBuffer.append("[System type]: ");
		systemInfoStrBuffer.appendLine(systemDesc.getSystemType().getName());
		systemInfoStrBuffer.append("[User]: ");
		systemInfoStrBuffer.append(systemDesc.getUser());
		this.m_systemInfoText.setText(systemInfoStrBuffer.toString());
	}
	else
	{
		this.m_systemInfoText.setText("No system description found!");
	}
};
oFF.SuConnectionTestDialog.prototype.generateServerResponse = function(extResult)
{
	if (oFF.notNull(extResult))
	{
		var responseStrBuffer = oFF.XStringBuffer.create();
		if (extResult.getClientStatusCode() !== 0)
		{
			responseStrBuffer.append("[Status code]: ");
			responseStrBuffer.appendLine(oFF.XInteger.convertToString(extResult.getClientStatusCode()));
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(extResult.getServerStatusDetails()))
		{
			responseStrBuffer.append("[Status]: ");
			responseStrBuffer.appendLine(extResult.getServerStatusDetails());
		}
		if (extResult.hasErrors())
		{
			responseStrBuffer.append(extResult.getSummary());
		}
		else if (extResult.getData() !== null)
		{
			responseStrBuffer.append("[Raw]: ");
			responseStrBuffer.append(extResult.getData().toString());
		}
		this.m_serverResponseText.setText(responseStrBuffer.toString());
	}
	else
	{
		this.m_serverResponseText.setText("Something went terribly wrong...");
	}
};
oFF.SuConnectionTestDialog.prototype.generateServerMetadata = function(serverMetadata)
{
	if (oFF.notNull(serverMetadata))
	{
		var metadataStrBuffer = oFF.XStringBuffer.create();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getBuildTime()))
		{
			metadataStrBuffer.append("[Build time]: ");
			metadataStrBuffer.appendLine(serverMetadata.getBuildTime());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getClient()))
		{
			metadataStrBuffer.append("[Client]: ");
			metadataStrBuffer.appendLine(serverMetadata.getClient());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getId()))
		{
			metadataStrBuffer.append("[Id]: ");
			metadataStrBuffer.appendLine(serverMetadata.getId());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getOrcaPublicUrl()))
		{
			metadataStrBuffer.append("[Orca publication url]: ");
			metadataStrBuffer.appendLine(serverMetadata.getOrcaPublicUrl());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getOrcaUserName()))
		{
			metadataStrBuffer.append("[Orca username]: ");
			metadataStrBuffer.appendLine(serverMetadata.getOrcaUserName());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getTenantId()))
		{
			metadataStrBuffer.append("[Tenant id]: ");
			metadataStrBuffer.appendLine(serverMetadata.getTenantId());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getType()))
		{
			metadataStrBuffer.append("[Type]: ");
			metadataStrBuffer.appendLine(serverMetadata.getType());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getUserLanguage()))
		{
			metadataStrBuffer.append("[User language]: ");
			metadataStrBuffer.appendLine(serverMetadata.getUserLanguage());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getVersion()))
		{
			metadataStrBuffer.append("[Version]: ");
			metadataStrBuffer.appendLine(serverMetadata.getVersion());
		}
		metadataStrBuffer.append("[Services]: ");
		metadataStrBuffer.appendLine(serverMetadata.getServices().toString());
		if (oFF.XStringUtils.isNotNullAndNotEmpty(serverMetadata.getReentranceTicket()))
		{
			metadataStrBuffer.append("[Reentrance ticket]: ");
			metadataStrBuffer.appendLine(serverMetadata.getReentranceTicket());
		}
		this.m_serverMetadataText.setText(metadataStrBuffer.toString());
	}
	else
	{
		this.m_serverResponseText.setText("Missing server metadata!");
	}
};
oFF.SuConnectionTestDialog.prototype.prepareTest = function()
{
	this.m_systemInfoText.setBackgroundColor(null);
	this.m_serverResponseText.setText("");
	this.m_serverMetadataText.setText("");
	this.m_resultLayout.setBusy(true);
	this.m_testButton.setEnabled(false);
	this.setStatusLabelInfo(oFF.XStringUtils.concatenate3("Connecting to ", this.m_systemName, "..."));
};
oFF.SuConnectionTestDialog.prototype.testFinished = function()
{
	this.m_resultLayout.setBusy(false);
	this.m_testButton.setEnabled(true);
};
oFF.SuConnectionTestDialog.prototype.testSuccess = function(serverMetadata)
{
	this.setStatusLabelSuccess("Connection success!");
	this.generateServerMetadata(serverMetadata);
};
oFF.SuConnectionTestDialog.prototype.testFailed = function()
{
	this.setStatusLabelError("Connection failed!");
	this.m_serverMetadataText.setText("Could not retrieve server metadata...");
};
oFF.SuConnectionTestDialog.prototype.onPress = function(event)
{
	switch (event.getControl().getName())
	{
		case "suConnectionTestDialogTestBtn":
			this.prepareTest();
			this.startTest();
			break;

		case "suConnectionTestDialogCloseBtn":
			this.exitNow(0);
			break;

		default:
	}
};
oFF.SuConnectionTestDialog.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	if (extResult.isValid() && oFF.notNull(serverMetadata))
	{
		this.testSuccess(serverMetadata);
	}
	else
	{
		this.testFailed();
	}
	this.generateServerResponse(extResult);
	this.testFinished();
};

oFF.UiCredentialsDialogPrg = function() {};
oFF.UiCredentialsDialogPrg.prototype = new oFF.DfUiDialogProgram();
oFF.UiCredentialsDialogPrg.prototype._ff_c = "UiCredentialsDialogPrg";

oFF.UiCredentialsDialogPrg.DEFAULT_PROGRAM_NAME = "CredentialsDialog";
oFF.UiCredentialsDialogPrg.PARAM_TITLE = "title";
oFF.UiCredentialsDialogPrg.PARAM_SYSTEM = "system";
oFF.UiCredentialsDialogPrg.PARAM_LISTENER = "listener";
oFF.UiCredentialsDialogPrg.USER_INPUT = "credDialogUserInput";
oFF.UiCredentialsDialogPrg.PASS_INPUT = "credDialogPassInput";
oFF.UiCredentialsDialogPrg.CONN_LABEL = "credDialogConnLabel";
oFF.UiCredentialsDialogPrg.SYS_LABEL = "credDialogSysLabel";
oFF.UiCredentialsDialogPrg.LOGIN_BTN = "credDialogLoginBtn";
oFF.UiCredentialsDialogPrg.CANCEL_BTN = "credDialogCancelBtn";
oFF.UiCredentialsDialogPrg.DESC_SECTION = "credDialogDescSection";
oFF.UiCredentialsDialogPrg.ERROR_MESSAGE_STRIP = "credDialogErrorMessageStrip";
oFF.UiCredentialsDialogPrg.prototype.m_form = null;
oFF.UiCredentialsDialogPrg.prototype.m_errorMessageStrip = null;
oFF.UiCredentialsDialogPrg.prototype.m_userInput = null;
oFF.UiCredentialsDialogPrg.prototype.m_passwordInput = null;
oFF.UiCredentialsDialogPrg.prototype.m_systemDescription = null;
oFF.UiCredentialsDialogPrg.prototype.m_listener = null;
oFF.UiCredentialsDialogPrg.prototype.newProgram = function()
{
	var prg = new oFF.UiCredentialsDialogPrg();
	prg.setup();
	return prg;
};
oFF.UiCredentialsDialogPrg.prototype.getProgramName = function()
{
	return oFF.UiCredentialsDialogPrg.DEFAULT_PROGRAM_NAME;
};
oFF.UiCredentialsDialogPrg.prototype.getContainerName = function()
{
	return this.getProgramName();
};
oFF.UiCredentialsDialogPrg.prototype.onContainerAfterOpen = function()
{
	if (oFF.notNull(this.m_userInput))
	{
		this.m_userInput.focus();
	}
};
oFF.UiCredentialsDialogPrg.prototype.onContainerAfterClose = function()
{
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onCancel();
	}
};
oFF.UiCredentialsDialogPrg.prototype.releaseObject = function()
{
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.UiCredentialsDialogPrg.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.UiCredentialsDialogPrg.PARAM_TITLE, "The dialog title");
	metadata.addParameter(oFF.UiCredentialsDialogPrg.PARAM_SYSTEM, "The system description");
	metadata.addParameter(oFF.UiCredentialsDialogPrg.PARAM_LISTENER, "Listener with onLogin and onCancel");
};
oFF.UiCredentialsDialogPrg.prototype.processArguments = function(args)
{
	this.setTitle(args.getStringByKeyExt(oFF.UiCredentialsDialogPrg.PARAM_TITLE, this.getLocalizedText(oFF.UiCredentialsDialogI18n.TITLE)));
	this.m_systemDescription = args.getXObjectByKey(oFF.UiCredentialsDialogPrg.PARAM_SYSTEM);
	this.m_listener = args.getXObjectByKey(oFF.UiCredentialsDialogPrg.PARAM_LISTENER);
};
oFF.UiCredentialsDialogPrg.prototype.setupProgram = function()
{
	return null;
};
oFF.UiCredentialsDialogPrg.prototype.getDialogButtons = function(genesis)
{
	var loginBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	loginBtn.setName(oFF.UiCredentialsDialogPrg.LOGIN_BTN);
	loginBtn.setText(this.getLocalizedText(oFF.UiCommonI18n.OK));
	loginBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	loginBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event1){
		this.onLogin();
	}.bind(this)));
	var cancelBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	cancelBtn.setName(oFF.UiCredentialsDialogPrg.CANCEL_BTN);
	cancelBtn.setText(this.getLocalizedText(oFF.UiCommonI18n.CANCEL));
	cancelBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event2){
		if (oFF.notNull(this.m_listener))
		{
			this.m_listener.onCancel();
		}
		this.exitNow(0);
	}.bind(this)));
	var tmpList = oFF.XList.create();
	tmpList.add(loginBtn);
	tmpList.add(cancelBtn);
	return tmpList;
};
oFF.UiCredentialsDialogPrg.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("30rem", "auto");
};
oFF.UiCredentialsDialogPrg.prototype.buildLabel = function(section, name, text, fontWeight)
{
	var formLabel = section.addFormLabel(name, text, text);
	formLabel.setFontWeight(fontWeight);
	return formLabel;
};
oFF.UiCredentialsDialogPrg.prototype.buildInput = function(name, labelText, inputText, isPassword)
{
	var uiInputType = isPassword ? oFF.UiInputType.PASSWORD : oFF.UiInputType.TEXT;
	var input = this.m_form.addInput(name, inputText, labelText, "", uiInputType, null);
	input.setRequired(true);
	input.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
	if (isPassword)
	{
		input.setAutoComplete(false);
	}
	return input;
};
oFF.UiCredentialsDialogPrg.prototype.buildUi = function(genesis)
{
	this.m_form = oFF.UiForm.create(genesis);
	this.m_form.setItemEnterPressedConsumer( function(tmpItem){
		this.onLogin();
	}.bind(this));
	this.m_form.setGap(oFF.UiCssGap.create("15px"));
	var formView = this.m_form.getView();
	formView.setPadding(oFF.UiCssBoxEdges.create("1.5rem"));
	formView.setDirection(oFF.UiFlexDirection.COLUMN);
	formView.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	this.m_errorMessageStrip = formView.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	this.m_errorMessageStrip.setName(oFF.UiCredentialsDialogPrg.ERROR_MESSAGE_STRIP);
	this.m_errorMessageStrip.setText(this.getLocalization().getText(oFF.UiCredentialsDialogI18n.ERROR_WRONG_CREDENTIALS));
	this.m_errorMessageStrip.setMessageType(oFF.UiMessageType.ERROR);
	this.m_errorMessageStrip.setShowIcon(true);
	this.m_errorMessageStrip.setShowCloseButton(true);
	this.m_errorMessageStrip.setVisible(false);
	var descSection = this.m_form.addFormSection(oFF.UiCredentialsDialogPrg.DESC_SECTION, "", false);
	this.buildLabel(descSection, oFF.UiCredentialsDialogPrg.CONN_LABEL, this.getLocalizedText(oFF.UiCredentialsDialogI18n.CONNECTION_LABEL_VALUE), oFF.UiFontWeight.BOLD);
	this.buildLabel(descSection, oFF.UiCredentialsDialogPrg.SYS_LABEL, this.m_systemDescription.getName(), oFF.UiFontWeight.NORMAL);
	descSection.setGap(oFF.UiCssGap.create("0.25rem"));
	this.m_userInput = this.buildInput(oFF.UiCredentialsDialogPrg.USER_INPUT, this.getLocalizedText(oFF.UiCredentialsDialogI18n.USERNAME_LABEL_VALUE), "", false);
	this.m_userInput.setCustomRequiredText(this.getLocalizedText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_USERNAME));
	this.m_passwordInput = this.buildInput(oFF.UiCredentialsDialogPrg.PASS_INPUT, this.getLocalizedText(oFF.UiCredentialsDialogI18n.PASSWORD_LABEL_VALUE), "", true);
	this.m_passwordInput.setCustomRequiredText(this.getLocalizedText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_PASSWORD));
	genesis.setRoot(formView);
};
oFF.UiCredentialsDialogPrg.prototype.notifyAuthenticationFailed = function(listener, invalidCredentials)
{
	if (invalidCredentials === true)
	{
		this.m_errorMessageStrip.setVisible(true);
	}
	this.m_listener = listener;
	this.setBusy(false);
};
oFF.UiCredentialsDialogPrg.prototype.notifyAuthenticationSuccessful = function()
{
	if (oFF.notNull(this.m_systemDescription))
	{
		this.m_systemDescription.setConnected(true);
		this.m_systemDescription.setUser(this.getUsername());
		this.m_systemDescription.setPassword(this.getPassword());
	}
	this.exitNow(0);
};
oFF.UiCredentialsDialogPrg.prototype.exit = function()
{
	this.exitNow(0);
};
oFF.UiCredentialsDialogPrg.prototype.getLocalizedText = function(key)
{
	return this.getLocalization().getText(key);
};
oFF.UiCredentialsDialogPrg.prototype.getUsername = function()
{
	return this.m_form.getJsonModel().getStringByKey(oFF.UiCredentialsDialogPrg.USER_INPUT);
};
oFF.UiCredentialsDialogPrg.prototype.getPassword = function()
{
	return this.m_form.getJsonModel().getStringByKey(oFF.UiCredentialsDialogPrg.PASS_INPUT);
};
oFF.UiCredentialsDialogPrg.prototype.onLogin = function()
{
	if (this.m_passwordInput.isEmpty())
	{
		this.m_passwordInput.setInvalid(this.getLocalizedText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_PASSWORD));
		this.m_passwordInput.focus();
	}
	if (this.m_userInput.isEmpty())
	{
		this.m_userInput.setInvalid(this.getLocalizedText(oFF.UiCredentialsDialogI18n.ERROR_INVALID_USERNAME));
		this.m_userInput.focus();
	}
	if (!this.m_userInput.isEmpty() && !this.m_passwordInput.isEmpty())
	{
		if (oFF.notNull(this.m_listener))
		{
			this.m_errorMessageStrip.setVisible(false);
			this.setBusy(true);
			var newUser = this.getUsername();
			var newPassword = this.getPassword();
			this.m_listener.onLogin(newUser, newPassword);
		}
	}
};

oFF.SuExportDialog = function() {};
oFF.SuExportDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuExportDialog.prototype._ff_c = "SuExportDialog";

oFF.SuExportDialog.DEFAULT_PROGRAM_NAME = "ExportDialog";
oFF.SuExportDialog.PARAM_EXPORT_TYPE = "exportType";
oFF.SuExportDialog.DEFAULT_PROGRAM_WIDTH = "30vw";
oFF.SuExportDialog.DEFAULT_PROGRAM_HEIGHT = "auto";
oFF.SuExportDialog.PARAM_FILE_NAME = "exportFileName";
oFF.SuExportDialog.FULL = "FULL";
oFF.SuExportDialog.prototype.m_root = null;
oFF.SuExportDialog.prototype.m_exportView = null;
oFF.SuExportDialog.prototype.m_exportType = null;
oFF.SuExportDialog.prototype.m_paramFileName = null;
oFF.SuExportDialog.prototype.m_okHandler = null;
oFF.SuExportDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuExportDialog();
	prg.setup();
	return prg;
};
oFF.SuExportDialog.prototype.releaseObject = function()
{
	this.m_exportView = oFF.XObjectExt.release(this.m_exportView);
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuExportDialog.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.SuExportDialog.PARAM_EXPORT_TYPE, "The export type");
	metadata.addParameter(oFF.SuExportDialog.PARAM_FILE_NAME, "The export file name");
};
oFF.SuExportDialog.prototype.processArguments = function(args)
{
	this.m_exportType = args.getStringByKey(oFF.SuExportDialog.PARAM_EXPORT_TYPE);
	this.m_paramFileName = args.getStringByKey(oFF.SuExportDialog.PARAM_FILE_NAME);
};
oFF.SuExportDialog.prototype.setupProgram = function()
{
	return null;
};
oFF.SuExportDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss(oFF.SuExportDialog.DEFAULT_PROGRAM_WIDTH, oFF.SuExportDialog.DEFAULT_PROGRAM_HEIGHT);
};
oFF.SuExportDialog.prototype.getView = function(genesis)
{
	if (oFF.XString.isEqual(oFF.BaseExportConfig.CSV_EXPORT, this.m_exportType))
	{
		this.setTitle(this.getLocalization().getText(oFF.SuExportI18n.CSV_EXPORT_TITLE));
		return oFF.SuExportCsvView.create(genesis, oFF.CsvConfig.createDefault(oFF.PrFactory.createStructure(), this.m_paramFileName));
	}
	else if (oFF.XString.isEqual(oFF.BaseExportConfig.PDF_EXPORT, this.m_exportType))
	{
		this.setTitle(this.getLocalization().getText(oFF.SuExportI18n.PDF_EXPORT_TITLE));
		return oFF.SuExportPDFView.create(genesis, oFF.PdfConfig.createDefault(oFF.PrFactory.createStructure(), this.m_paramFileName));
	}
	else if (oFF.XString.isEqual(oFF.BaseExportConfig.XLSX_EXPORT, this.m_exportType))
	{
		this.setTitle(this.getLocalization().getText(oFF.SuExportI18n.XLSX_EXPORT_TITLE));
		return oFF.SuExportSpreadSheetView.create(genesis, oFF.XlsConfig.createDefault(oFF.PrFactory.createStructure(), this.m_paramFileName));
	}
	else if (oFF.XString.isEqual(oFF.SuExportDialog.FULL, this.m_exportType))
	{
		this.setTitle("Export");
		return oFF.SuExportFullOptionsView.create(genesis, this.m_paramFileName);
	}
	return null;
};
oFF.SuExportDialog.prototype.buildUi = function(genesis)
{
	this.m_root = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_root.setPadding(oFF.UiCssBoxEdges.create("1.5rem"));
	this.m_exportView = this.getView(genesis);
	if (oFF.isNull(this.m_exportView))
	{
		genesis.showErrorToast("No valid export type parameter chosen");
		this.terminate();
	}
	this.m_root.addItem(this.m_exportView.getView());
	genesis.setRoot(this.m_root);
};
oFF.SuExportDialog.prototype.getDialogButtons = function(genesis)
{
	var okButton = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	okButton.setName("OK");
	okButton.setText(this.getLocalization().getText(oFF.SuExportI18n.EXPORT_BUTTON));
	okButton.setButtonType(oFF.UiButtonType.PRIMARY);
	okButton.registerOnPress(oFF.UiLambdaPressListener.create( function(event1){
		if (oFF.notNull(this.m_okHandler))
		{
			var config = this.m_exportView.getConfig();
			this.m_okHandler(config);
		}
		this.exitNow(0);
	}.bind(this)));
	var cancelBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	cancelBtn.setName("CANCEL");
	cancelBtn.setText(this.getLocalization().getText(oFF.SuExportI18n.CANCEL_BUTTON));
	cancelBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event2){
		this.exitNow(0);
	}.bind(this)));
	var tmpList = oFF.XList.create();
	tmpList.add(okButton);
	tmpList.add(cancelBtn);
	return tmpList;
};
oFF.SuExportDialog.prototype.getProgramName = function()
{
	return oFF.SuExportDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuExportDialog.prototype.setOkHandler = function(handler)
{
	this.m_okHandler = handler;
};

oFF.SuJavadocDialog = function() {};
oFF.SuJavadocDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuJavadocDialog.prototype._ff_c = "SuJavadocDialog";

oFF.SuJavadocDialog.JAVA_DOC_URL = "";
oFF.SuJavadocDialog.DEFAULT_PROGRAM_NAME = "JavadocDialog";
oFF.SuJavadocDialog.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SuJavadocDialog.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SuJavadocDialog.createNewJavadocDialogProgram = function()
{
	var prg = new oFF.SuJavadocDialog();
	prg.setup();
	return prg;
};
oFF.SuJavadocDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuJavadocDialog();
	prg.setup();
	return prg;
};
oFF.SuJavadocDialog.prototype.getProgramName = function()
{
	return oFF.SuJavadocDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuJavadocDialog.prototype.releaseObject = function()
{
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuJavadocDialog.prototype.getLogSeverity = function()
{
	return oFF.DfUiDialogProgram.prototype.getLogSeverity.call( this );
};
oFF.SuJavadocDialog.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuJavadocDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuJavadocDialog.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.SuJavadocDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("90vw", "80vh");
};
oFF.SuJavadocDialog.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuJavadocDialog.prototype.processArguments = function(args) {};
oFF.SuJavadocDialog.prototype.setupProgram = function()
{
	oFF.SuJavadocDialog.JAVA_DOC_URL = oFF.XStringUtils.concatenate5("https", "://fir", "efly.w", "df.sa", "p.corp/apidoc/");
	this.setTitle("Firefly Javadoc");
	return null;
};
oFF.SuJavadocDialog.prototype.buildUi = function(genesis)
{
	var javaDocHtml = genesis.newControl(oFF.UiType.HTML);
	javaDocHtml.setName("javaDocHtmlFrame");
	javaDocHtml.setWidth(oFF.UiCssLength.create("100%"));
	javaDocHtml.setHeight(oFF.UiCssLength.create("100%"));
	javaDocHtml.setValue(oFF.SuJavadocDialog.JAVA_DOC_URL);
	genesis.setRoot(javaDocHtml);
};

oFF.SuSettingsDialog = function() {};
oFF.SuSettingsDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuSettingsDialog.prototype._ff_c = "SuSettingsDialog";

oFF.SuSettingsDialog.DEFAULT_PROGRAM_NAME = "SettingsDialog";
oFF.SuSettingsDialog.PARAM_SETTINGS = "settings";
oFF.SuSettingsDialog.prototype.m_mainLayout = null;
oFF.SuSettingsDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuSettingsDialog();
	prg.setup();
	return prg;
};
oFF.SuSettingsDialog.prototype.getProgramName = function()
{
	return oFF.SuSettingsDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuSettingsDialog.prototype.releaseObject = function()
{
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuSettingsDialog.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.SuSettingsDialog.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuSettingsDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuSettingsDialog.prototype.getDialogButtons = function(genesis)
{
	var applyAndCloseBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	applyAndCloseBtn.setText("Apply and Close");
	applyAndCloseBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	applyAndCloseBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event){
		this.terminate();
	}.bind(this)));
	var cancelBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	cancelBtn.setText("Cancel");
	cancelBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event2){
		this.terminate();
	}.bind(this)));
	var tmpList = oFF.XList.create();
	tmpList.add(applyAndCloseBtn);
	tmpList.add(cancelBtn);
	return tmpList;
};
oFF.SuSettingsDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("30vw", "30vh");
};
oFF.SuSettingsDialog.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.SuSettingsDialog.PARAM_SETTINGS, "The settings to show");
};
oFF.SuSettingsDialog.prototype.processArguments = function(args) {};
oFF.SuSettingsDialog.prototype.setupProgram = function()
{
	this.setTitle("Global settings!");
	return null;
};
oFF.SuSettingsDialog.prototype.buildUi = function(genesis)
{
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.setPadding(oFF.UiCssBoxEdges.create("20px"));
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	var setingsList = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	setingsList.addNewItemOfType(oFF.UiType.LABEL).setText("settings list");
	var settingsContent = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	settingsContent.addNewItemOfType(oFF.UiType.LABEL).setText("settings content");
	genesis.setRoot(this.m_mainLayout);
};

oFF.SuUiDriverInfoDialog = function() {};
oFF.SuUiDriverInfoDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuUiDriverInfoDialog.prototype._ff_c = "SuUiDriverInfoDialog";

oFF.SuUiDriverInfoDialog.DEFAULT_PROGRAM_NAME = "UiDriverInfoDialog";
oFF.SuUiDriverInfoDialog.prototype.m_form = null;
oFF.SuUiDriverInfoDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuUiDriverInfoDialog();
	prg.setup();
	return prg;
};
oFF.SuUiDriverInfoDialog.prototype.getProgramName = function()
{
	return oFF.SuUiDriverInfoDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuUiDriverInfoDialog.prototype.releaseObject = function()
{
	this.m_form = oFF.XObjectExt.release(this.m_form);
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuUiDriverInfoDialog.prototype.getLogSeverity = function()
{
	return oFF.DfUiDialogProgram.prototype.getLogSeverity.call( this );
};
oFF.SuUiDriverInfoDialog.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.SuUiDriverInfoDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("200px", "400px");
};
oFF.SuUiDriverInfoDialog.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuUiDriverInfoDialog.prototype.processArguments = function(args) {};
oFF.SuUiDriverInfoDialog.prototype.setupProgram = function()
{
	this.setTitle("Ui Driver information");
	return null;
};
oFF.SuUiDriverInfoDialog.prototype.buildUi = function(genesis)
{
	this.m_form = oFF.UiForm.create(genesis);
	this.m_form.addInput(null, this.getUiManager().getDriverInfo().getFrameworkName(), "Ui Framework", null, null, null);
	this.m_form.addInput(null, this.getUiManager().getDriverInfo().getFrameworkVersion(), "Ui Framework Version", null, null, null);
	this.m_form.addInput(null, oFF.XInteger.convertToString(this.getUiManager().getDriverInfo().getAllIconNames().size()), "Number of available icons", null, null, null);
	this.m_form.addInput(null, this.getUiManager().getDriverInfo().getClientLang(), "Client language", null, null, null);
	this.m_form.addInput(null, this.getUiManager().getDeviceInfo().getType().getName(), "Device", null, null, null);
	this.m_form.addInput(null, oFF.XDouble.convertToString(this.getUiManager().getDeviceInfo().getScreenScale()), "Screen scale", null, null, null);
	this.m_form.getView().setPadding(oFF.UiCssBoxEdges.create("20px"));
	genesis.setRoot(this.m_form.getView());
};

oFF.SuUserProfileDialog = function() {};
oFF.SuUserProfileDialog.prototype = new oFF.DfUiDialogProgram();
oFF.SuUserProfileDialog.prototype._ff_c = "SuUserProfileDialog";

oFF.SuUserProfileDialog.THREE_COL_ITEMS_FLEX = "33%";
oFF.SuUserProfileDialog.TWO_COL_ITEMS_FLEX = "50%";
oFF.SuUserProfileDialog.DEFAULT_PROGRAM_NAME = "UserProfileDialog";
oFF.SuUserProfileDialog.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SuUserProfileDialog.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SuUserProfileDialog.prototype.m_userProfile = null;
oFF.SuUserProfileDialog.prototype.newProgram = function()
{
	var prg = new oFF.SuUserProfileDialog();
	prg.setup();
	return prg;
};
oFF.SuUserProfileDialog.prototype.getProgramName = function()
{
	return oFF.SuUserProfileDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuUserProfileDialog.prototype.releaseObject = function()
{
	this.m_userProfile = null;
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuUserProfileDialog.prototype.getLogSeverity = function()
{
	return oFF.DfUiDialogProgram.prototype.getLogSeverity.call( this );
};
oFF.SuUserProfileDialog.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuUserProfileDialog.DEFAULT_PROGRAM_NAME;
};
oFF.SuUserProfileDialog.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.SuUserProfileDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("60%", "60vh");
};
oFF.SuUserProfileDialog.prototype.prepareProgramMetadata = function(metadata) {};
oFF.SuUserProfileDialog.prototype.processArguments = function(args) {};
oFF.SuUserProfileDialog.prototype.setupProgram = function()
{
	this.m_userProfile = this.getArguments().getXObjectByKey("userProfile");
	if (oFF.isNull(this.m_userProfile))
	{
		this.m_userProfile = this.getProcess().getUserProfile();
	}
	if (oFF.notNull(this.m_userProfile))
	{
		this.setTitle(oFF.XStringUtils.concatenate2("User profile for ", this.m_userProfile.getFullName()));
	}
	else
	{
		this.setTitle("Unknown user");
	}
	return null;
};
oFF.SuUserProfileDialog.prototype.buildUi = function(genesis)
{
	var userInfoWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	userInfoWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	userInfoWrapperLayout.useMaxWidth();
	var loginWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	loginWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	loginWrapperLayout.useMaxWidth();
	var addrPersonWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	addrPersonWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	addrPersonWrapperLayout.useMaxWidth();
	var addrWorkCenterWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	addrWorkCenterWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	addrWorkCenterWrapperLayout.useMaxWidth();
	var addrCommunicationWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	addrCommunicationWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	addrCommunicationWrapperLayout.useMaxWidth();
	var addrCompanyWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	addrCompanyWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	addrCompanyWrapperLayout.useMaxWidth();
	var defaultWrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	defaultWrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	defaultWrapperLayout.useMaxWidth();
	var verticalLayout = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	var verticalAddressLayout = genesis.newControl(oFF.UiType.VERTICAL_LAYOUT);
	var parameterTable = genesis.newControl(oFF.UiType.TABLE);
	var rolesTable = genesis.newControl(oFF.UiType.TABLE);
	var profilesTable = genesis.newControl(oFF.UiType.TABLE);
	var groupsTable = genesis.newControl(oFF.UiType.TABLE);
	var personalizationTable = genesis.newControl(oFF.UiType.TABLE);
	var dlgCloseButton = genesis.newControl(oFF.UiType.BUTTON);
	dlgCloseButton.setName("closeUserProfileBtn");
	dlgCloseButton.setText("Close");
	dlgCloseButton.registerOnPress(this);
	if (oFF.isNull(this.m_userProfile))
	{
		this.createDummyUserProfile();
	}
	if (oFF.notNull(this.m_userProfile))
	{
		userInfoWrapperLayout.setName("userInfoWrapperLayout");
		var userInfoRow1 = this.addRowLayout(userInfoWrapperLayout);
		this.addImageCol3(userInfoRow1, this.m_userProfile.getThumbnailPhotoEncoded());
		this.addLabelCol3(userInfoRow1, this.m_userProfile.getFullName());
		this.addLabelCol3(userInfoRow1, "");
		var userInfoRow2 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow2, "");
		this.addLabelCol3(userInfoRow2, "First Name");
		this.addLabelCol3(userInfoRow2, this.m_userProfile.getFirstName());
		var userInfoRow3 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow3, "");
		this.addLabelCol3(userInfoRow3, "Last Name");
		this.addLabelCol3(userInfoRow3, this.m_userProfile.getLastName());
		var userInfoRow4 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow4, "");
		this.addLabelCol3(userInfoRow4, "Email");
		this.addLabelCol3(userInfoRow4, this.m_userProfile.getEmailAddress());
		var userInfoRow5 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow5, "");
		this.addLabelCol3(userInfoRow5, "Phone number");
		this.addLabelCol3(userInfoRow5, this.m_userProfile.getPhoneNumber());
		var userInfoRow6 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow6, "");
		this.addLabelCol3(userInfoRow6, "Mobile number");
		this.addLabelCol3(userInfoRow6, this.m_userProfile.getMobilePhoneNumber());
		var userInfoRow7 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow7, "");
		this.addLabelCol3(userInfoRow7, "Department");
		this.addLabelCol3(userInfoRow7, this.m_userProfile.getDepartment());
		var userInfoRow8 = this.addRowLayout(userInfoWrapperLayout);
		this.addLabelCol3(userInfoRow8, "");
		this.addLabelCol3(userInfoRow8, "Room number");
		this.addLabelCol3(userInfoRow8, this.m_userProfile.getRoomNumber());
		loginWrapperLayout.setName("loginMatrixLayout");
		var loginRow1 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow1, "Alias:");
		this.addLabelCol2(loginRow1, this.m_userProfile.getSAPName());
		var loginRow2 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow2, "User Type:");
		this.addLabelCol2(loginRow2, this.m_userProfile.getSamaAccountType());
		var loginRow3 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow3, "Manager:");
		this.addLabelCol2(loginRow3, this.m_userProfile.getManagerPersonNumber());
		var loginRow4 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow4, "Password:");
		this.addLabelCol2(loginRow4, "**************************************");
		var loginRow5 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow5, "Repeat Password:");
		this.addLabelCol2(loginRow5, "**************************************");
		var loginRow6 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow6, "Password Status:");
		this.addLabelCol2(loginRow6, "Productive Password");
		var loginRow7 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow7, "Valid from:");
		this.addLabelCol2(loginRow7, "01.01.1990");
		var loginRow8 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow8, "Valid to:");
		this.addLabelCol2(loginRow8, "31.12.9999");
		var loginRow9 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow9, "Account no.:");
		this.addLabelCol2(loginRow9, this.m_userProfile.getPersonNumber());
		var loginRow10 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow10, "Cost Center:");
		this.addLabelCol2(loginRow10, this.m_userProfile.getCostCenter());
		var loginRow11 = this.addRowLayout(loginWrapperLayout);
		this.addLabelCol2(loginRow11, "Unix Home Directory:");
		this.addLabelCol2(loginRow11, this.m_userProfile.getUnixHomeDirectory());
		verticalAddressLayout.addItem(addrPersonWrapperLayout);
		addrPersonWrapperLayout.setName("addrPersonWrapperLayout");
		this.addSection(addrPersonWrapperLayout, "Person", true);
		var addressPersonRow1 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow1, "Title:");
		this.addLabelCol2(addressPersonRow1, this.m_userProfile.getDescription());
		var addressPersonRow2 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow2, "Last Name:");
		this.addLabelCol2(addressPersonRow2, this.m_userProfile.getLastName());
		var addressPersonRow3 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow3, "First Name:");
		this.addLabelCol2(addressPersonRow3, this.m_userProfile.getFirstName());
		var addressPersonRow4 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow4, "Academic Title:");
		this.addLabelCol2(addressPersonRow4, this.m_userProfile.getTitle());
		var addressPersonRow5 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow5, "Full Name:");
		this.addLabelCol2(addressPersonRow5, this.m_userProfile.getFullName());
		var addressPersonRow6 = this.addRowLayout(addrPersonWrapperLayout);
		this.addLabelCol2(addressPersonRow6, "Language:");
		this.addLabelCol2(addressPersonRow6, this.m_userProfile.getLanguage());
		verticalAddressLayout.addItem(addrWorkCenterWrapperLayout);
		addrWorkCenterWrapperLayout.setName("addrWorkCenterMatrixLayout");
		this.addSection(addrWorkCenterWrapperLayout, "Work Center", false);
		var addressWorkCenterRow1 = this.addRowLayout(addrWorkCenterWrapperLayout);
		this.addLabelCol2(addressWorkCenterRow1, "Function:");
		this.addLabelCol2(addressWorkCenterRow1, this.m_userProfile.getDescription());
		var addressWorkCenterRow2 = this.addRowLayout(addrWorkCenterWrapperLayout);
		this.addLabelCol2(addressWorkCenterRow2, "Department:");
		this.addLabelCol2(addressWorkCenterRow2, this.m_userProfile.getDepartment());
		var addressWorkCenterRow3 = this.addRowLayout(addrWorkCenterWrapperLayout);
		this.addLabelCol2(addressWorkCenterRow3, "Room Number:");
		this.addLabelCol2(addressWorkCenterRow3, this.m_userProfile.getRoomNumber());
		var addressWorkCenterRow4 = this.addRowLayout(addrWorkCenterWrapperLayout);
		this.addLabelCol2(addressWorkCenterRow4, "Floor:");
		var floor = null;
		var roomNumber = this.m_userProfile.getRoomNumber();
		if (oFF.notNull(roomNumber) && oFF.XString.containsString(roomNumber, ",") && oFF.XString.containsString(roomNumber, "."))
		{
			floor = oFF.XString.substring(roomNumber, oFF.XString.lastIndexOf(roomNumber, ",") + 1, oFF.XString.lastIndexOf(roomNumber, "."));
		}
		this.addLabelCol2(addressWorkCenterRow4, floor);
		var addressWorkCenterRow5 = this.addRowLayout(addrWorkCenterWrapperLayout);
		this.addLabelCol2(addressWorkCenterRow5, "Building Code:");
		var buildingCode = null;
		if (oFF.notNull(roomNumber) && oFF.XString.containsString(roomNumber, ","))
		{
			buildingCode = oFF.XString.substring(roomNumber, 0, oFF.XString.lastIndexOf(roomNumber, ","));
		}
		this.addLabelCol2(addressWorkCenterRow5, buildingCode);
		verticalAddressLayout.addItem(addrCommunicationWrapperLayout);
		addrCommunicationWrapperLayout.setName("addrCommunicationWrapperLayout");
		this.addSection(addrCommunicationWrapperLayout, "Communication", false);
		var addressCommunicationRow1 = this.addRowLayout(addrCommunicationWrapperLayout);
		this.addLabelCol2(addressCommunicationRow1, "Telephone:");
		this.addLabelCol2(addressCommunicationRow1, this.m_userProfile.getPhoneNumber());
		var addressCommunicationRow2 = this.addRowLayout(addrCommunicationWrapperLayout);
		this.addLabelCol2(addressCommunicationRow2, "Cell Phone:");
		this.addLabelCol2(addressCommunicationRow2, this.m_userProfile.getMobilePhoneNumber());
		var addressCommunicationRow3 = this.addRowLayout(addrCommunicationWrapperLayout);
		this.addLabelCol2(addressCommunicationRow3, "Fax:");
		this.addLabelCol2(addressCommunicationRow3, this.m_userProfile.getFaxNumber());
		var addressCommunicationRow4 = this.addRowLayout(addrCommunicationWrapperLayout);
		this.addLabelCol2(addressCommunicationRow4, "Email Address:");
		this.addLabelCol2(addressCommunicationRow4, this.m_userProfile.getEmailAddress());
		var addressCommunicationRow5 = this.addRowLayout(addrCommunicationWrapperLayout);
		this.addLabelCol2(addressCommunicationRow5, "Telephone Assistant:");
		this.addLabelCol2(addressCommunicationRow5, this.m_userProfile.getTelephoneAssistant());
		verticalAddressLayout.addItem(addrCompanyWrapperLayout);
		addrCompanyWrapperLayout.setName("addrCompanyWrapperLayout");
		this.addSection(addrCompanyWrapperLayout, "Company", false);
		var addressCompanyRow1 = this.addRowLayout(addrCompanyWrapperLayout);
		this.addLabelCol2(addressCompanyRow1, "Company:");
		this.addLabelCol2(addressCompanyRow1, this.m_userProfile.getCompany());
		defaultWrapperLayout.setName("defaultWrapperLayout");
		var defaultRow1 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow1, "Language:");
		this.addLabelCol2(defaultRow1, this.m_userProfile.getLanguage());
		var defaultRow2 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow2, "Data Access Language:");
		this.addLabelCol2(defaultRow2, this.m_userProfile.getDataAccessLanguage());
		var defaultRow3 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow3, "Date Formatting:");
		this.addLabelCol2(defaultRow3, this.m_userProfile.getDateFormatting());
		var defaultRow4 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow4, "Time Formatting:");
		this.addLabelCol2(defaultRow4, this.m_userProfile.getTimeFormatting());
		var defaultRow5 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow5, "Number Formatting:");
		this.addLabelCol2(defaultRow5, this.m_userProfile.getDecimalFormatExample());
		var defaultRow6 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow6, "Scale Formatting:");
		this.addLabelCol2(defaultRow6, this.m_userProfile.getScaleFormatting());
		var defaultRow7 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow7, "Currency Position:");
		this.addLabelCol2(defaultRow7, this.m_userProfile.getCurrencyPosition());
		var defaultRow8 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow8, "Default Application:");
		this.addLabelCol2(defaultRow8, this.m_userProfile.getMainApplication());
		var defaultRow9 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow9, "Clean up notification:");
		this.addLabelCol2(defaultRow9, this.m_userProfile.getCleanUpNotification());
		var defaultRow10 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow10, "Email notification:");
		this.addLabelCol2(defaultRow10, this.m_userProfile.getEmailSystemNotification());
		var defaultRow11 = this.addRowLayout(defaultWrapperLayout);
		this.addLabelCol2(defaultRow11, "");
		this.addLabelCol2(defaultRow11, this.m_userProfile.getEmailProductUpdateNotification());
	}
	parameterTable.setTitle("Parameters");
	parameterTable.addNewColumn().setTitle("SET/GET Parameter ID");
	parameterTable.addNewColumn().setTitle("Parameter Value");
	parameterTable.addNewColumn().setTitle("Short Description");
	var parameterTableRow1 = parameterTable.addNewRow();
	parameterTableRow1.addNewCell().setText("");
	var parameterTableRow2 = parameterTable.addNewRow();
	parameterTableRow2.addNewCell().setText("");
	var parameterTableRow3 = parameterTable.addNewRow();
	parameterTableRow3.addNewCell().setText("");
	var parameterTableRow4 = parameterTable.addNewRow();
	parameterTableRow4.addNewCell().setText("");
	var parameterTableRow5 = parameterTable.addNewRow();
	parameterTableRow5.addNewCell().setText("");
	var parameterTableRow6 = parameterTable.addNewRow();
	parameterTableRow6.addNewCell().setText("");
	var parameterTableRow7 = parameterTable.addNewRow();
	parameterTableRow7.addNewCell().setText("");
	var parameterTableRow8 = parameterTable.addNewRow();
	parameterTableRow8.addNewCell().setText("");
	var parameterTableRow9 = parameterTable.addNewRow();
	parameterTableRow9.addNewCell().setText("");
	var parameterTableRow10 = parameterTable.addNewRow();
	parameterTableRow10.addNewCell().setText("");
	rolesTable.setTitle("Role Assignments");
	rolesTable.addNewColumn().setTitle("Status");
	rolesTable.addNewColumn().setTitle("Role");
	rolesTable.addNewColumn().setTitle("Role Type");
	rolesTable.addNewColumn().setTitle("Start Date");
	rolesTable.addNewColumn().setTitle("End Date");
	rolesTable.addNewColumn().setTitle("Short Role Description");
	rolesTable.addNewColumn().setTitle("Indirect Assignment");
	var rolesTableRow1 = rolesTable.addNewRow();
	rolesTableRow1.addNewCell().setText("");
	var rolesTableRow2 = rolesTable.addNewRow();
	rolesTableRow2.addNewCell().setText("");
	var rolesTableRow3 = rolesTable.addNewRow();
	rolesTableRow3.addNewCell().setText("");
	var rolesTableRow4 = rolesTable.addNewRow();
	rolesTableRow4.addNewCell().setText("");
	var rolesTableRow5 = rolesTable.addNewRow();
	rolesTableRow5.addNewCell().setText("");
	var rolesTableRow6 = rolesTable.addNewRow();
	rolesTableRow6.addNewCell().setText("");
	var rolesTableRow7 = rolesTable.addNewRow();
	rolesTableRow7.addNewCell().setText("");
	var rolesTableRow8 = rolesTable.addNewRow();
	rolesTableRow8.addNewCell().setText("");
	var rolesTableRow9 = rolesTable.addNewRow();
	rolesTableRow9.addNewCell().setText("");
	var rolesTableRow10 = rolesTable.addNewRow();
	rolesTableRow10.addNewCell().setText("");
	profilesTable.setTitle("Assigned Authorization Profiles");
	profilesTable.addNewColumn().setTitle("Profile");
	profilesTable.addNewColumn().setTitle("Type");
	profilesTable.addNewColumn().setTitle("Text");
	var profilesTableRow1 = profilesTable.addNewRow();
	profilesTableRow1.addNewCell().setText("");
	var profilesTableRow2 = profilesTable.addNewRow();
	profilesTableRow2.addNewCell().setText("");
	var profilesTableRow3 = profilesTable.addNewRow();
	profilesTableRow3.addNewCell().setText("");
	var profilesTableRow4 = profilesTable.addNewRow();
	profilesTableRow4.addNewCell().setText("");
	var profilesTableRow5 = profilesTable.addNewRow();
	profilesTableRow5.addNewCell().setText("");
	var profilesTableRow6 = profilesTable.addNewRow();
	profilesTableRow6.addNewCell().setText("");
	var profilesTableRow7 = profilesTable.addNewRow();
	profilesTableRow7.addNewCell().setText("");
	var profilesTableRow8 = profilesTable.addNewRow();
	profilesTableRow8.addNewCell().setText("");
	var profilesTableRow9 = profilesTable.addNewRow();
	profilesTableRow9.addNewCell().setText("");
	var profilesTableRow10 = profilesTable.addNewRow();
	profilesTableRow10.addNewCell().setText("");
	groupsTable.setTitle("User Group Assignments");
	groupsTable.addNewColumn().setTitle("User group");
	groupsTable.addNewColumn().setTitle("User Group Description");
	var groupsTableRow1 = groupsTable.addNewRow();
	groupsTableRow1.addNewCell().setText("");
	var groupsTableRow2 = groupsTable.addNewRow();
	groupsTableRow2.addNewCell().setText("");
	var groupsTableRow3 = groupsTable.addNewRow();
	groupsTableRow3.addNewCell().setText("");
	var groupsTableRow4 = groupsTable.addNewRow();
	groupsTableRow4.addNewCell().setText("");
	var groupsTableRow5 = groupsTable.addNewRow();
	groupsTableRow5.addNewCell().setText("");
	var groupsTableRow6 = groupsTable.addNewRow();
	groupsTableRow6.addNewCell().setText("");
	var groupsTableRow7 = groupsTable.addNewRow();
	groupsTableRow7.addNewCell().setText("");
	var groupsTableRow8 = groupsTable.addNewRow();
	groupsTableRow8.addNewCell().setText("");
	var groupsTableRow9 = groupsTable.addNewRow();
	groupsTableRow9.addNewCell().setText("");
	var groupsTableRow10 = groupsTable.addNewRow();
	groupsTableRow10.addNewCell().setText("");
	personalizationTable.setTitle("Personalization");
	personalizationTable.addNewColumn().setTitle("Description");
	personalizationTable.addNewColumn().setTitle("Personalization object key");
	var personalizationTableRow1 = personalizationTable.addNewRow();
	personalizationTableRow1.addNewCell().setText("");
	var personalizationTableRow2 = personalizationTable.addNewRow();
	personalizationTableRow2.addNewCell().setText("");
	var personalizationTableRow3 = personalizationTable.addNewRow();
	personalizationTableRow3.addNewCell().setText("");
	var personalizationTableRow4 = personalizationTable.addNewRow();
	personalizationTableRow4.addNewCell().setText("");
	var personalizationTableRow5 = personalizationTable.addNewRow();
	personalizationTableRow5.addNewCell().setText("");
	var personalizationTableRow6 = personalizationTable.addNewRow();
	personalizationTableRow6.addNewCell().setText("");
	var personalizationTableRow7 = personalizationTable.addNewRow();
	personalizationTableRow7.addNewCell().setText("");
	var personalizationTableRow8 = personalizationTable.addNewRow();
	personalizationTableRow8.addNewCell().setText("");
	var personalizationTableRow9 = personalizationTable.addNewRow();
	personalizationTableRow9.addNewCell().setText("");
	var personalizationTableRow10 = personalizationTable.addNewRow();
	personalizationTableRow10.addNewCell().setText("");
	var userInfoHeaderWrapper = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	userInfoHeaderWrapper.useMaxSpace();
	userInfoHeaderWrapper.setPadding(oFF.UiCssBoxEdges.create("10px"));
	userInfoHeaderWrapper.addItem(userInfoWrapperLayout);
	verticalLayout.addItem(userInfoHeaderWrapper);
	var defaultTabStrip = genesis.newControl(oFF.UiType.ICON_TAB_BAR);
	defaultTabStrip.setName("defaultTabStrip");
	defaultTabStrip.useMaxWidth();
	defaultTabStrip.setHeight(oFF.UiCssLength.create("400px"));
	var tabStripItem1 = defaultTabStrip.addNewItem();
	tabStripItem1.setName("TabStripItem2");
	tabStripItem1.setText("Logon Data");
	tabStripItem1.setIcon("visits");
	tabStripItem1.setContent(loginWrapperLayout);
	var tabStripItem2 = defaultTabStrip.addNewItem();
	tabStripItem2.setName("TabStripItem2");
	tabStripItem2.setText("Address ");
	tabStripItem2.setIcon("business-card");
	tabStripItem2.setContent(verticalAddressLayout);
	var tabStripItem3 = defaultTabStrip.addNewItem();
	tabStripItem3.setName("TabStripItem2");
	tabStripItem3.setText("Defaults");
	tabStripItem3.setIcon("action-settings");
	tabStripItem3.setContent(defaultWrapperLayout);
	var tabStripItem4 = defaultTabStrip.addNewItem();
	tabStripItem4.setName("TabStripItem2");
	tabStripItem4.setText("Parameters");
	tabStripItem4.setIcon("customize");
	tabStripItem4.setContent(parameterTable);
	var tabStripItem5 = defaultTabStrip.addNewItem();
	tabStripItem5.setName("TabStripItem2");
	tabStripItem5.setText("Roles");
	tabStripItem5.setIcon("role");
	tabStripItem5.setContent(rolesTable);
	var tabStripItem6 = defaultTabStrip.addNewItem();
	tabStripItem6.setName("TabStripItem2");
	tabStripItem6.setText("Profiles");
	tabStripItem6.setIcon("customer");
	tabStripItem6.setContent(profilesTable);
	var tabStripItem7 = defaultTabStrip.addNewItem();
	tabStripItem7.setName("TabStripItem2");
	tabStripItem7.setText("Groups");
	tabStripItem7.setIcon("group");
	tabStripItem7.setContent(groupsTable);
	var tabStripItem8 = defaultTabStrip.addNewItem();
	tabStripItem8.setName("TabStripItem2");
	tabStripItem8.setText("Personalization");
	tabStripItem8.setIcon("account");
	tabStripItem8.setContent(personalizationTable);
	verticalLayout.addItem(defaultTabStrip);
	genesis.setRoot(verticalLayout);
};
oFF.SuUserProfileDialog.prototype.createDummyUserProfile = function()
{
	if (oFF.isNull(this.m_userProfile))
	{
		var tmpUserProfile = oFF.UserProfile.create();
		tmpUserProfile.setFullName("Albert Einstein");
		tmpUserProfile.setFirstName("Albert");
		tmpUserProfile.setLastName("Einstein");
		tmpUserProfile.setEmailAddress("albert.einstein@sap.com");
		tmpUserProfile.setDepartment("Area 51");
		tmpUserProfile.setRoomNumber("panic room");
		tmpUserProfile.setSAPName("");
		tmpUserProfile.setSamaAccountType("Dialog");
		this.m_userProfile = tmpUserProfile;
	}
};
oFF.SuUserProfileDialog.prototype.addRowLayout = function(layout)
{
	var tmpRowLayout = layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	tmpRowLayout.useMaxWidth();
	tmpRowLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	tmpRowLayout.setPadding(oFF.UiCssBoxEdges.create("0px 0xp 8px 0px"));
	return tmpRowLayout;
};
oFF.SuUserProfileDialog.prototype.addImage = function(layout, imgSrc, flex)
{
	var tmpImageWrapper = layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	tmpImageWrapper.setFlex(flex);
	var tmpImage = tmpImageWrapper.addNewItemOfType(oFF.UiType.IMAGE);
	tmpImage.setHeight(oFF.UiCssLength.create("80px"));
	tmpImage.setWidth(oFF.UiCssLength.create("80px"));
	tmpImage.setCornerRadius(oFF.UiCssBoxEdges.create("50%"));
	tmpImage.setSrc(imgSrc);
	return tmpImage;
};
oFF.SuUserProfileDialog.prototype.addImageCol3 = function(layout, imgSrc)
{
	return this.addImage(layout, imgSrc, oFF.SuUserProfileDialog.THREE_COL_ITEMS_FLEX);
};
oFF.SuUserProfileDialog.prototype.addSection = function(layout, text, isFirst)
{
	var tmpLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLbl.setName(oFF.XString.replace(text, " ", ""));
	tmpLbl.setText(text);
	tmpLbl.setFontSize(oFF.UiCssLength.create("14px"));
	tmpLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	if (!isFirst)
	{
		tmpLbl.setMargin(oFF.UiCssBoxEdges.create("16px 0px 0px 0px"));
	}
	tmpLbl.setFlex("100%");
	var separatorLine = layout.addNewItemOfType(oFF.UiType.SPACER);
	separatorLine.setBackgroundColor(oFF.UiColor.GREY);
	separatorLine.setHeight(oFF.UiCssLength.create("1px"));
	separatorLine.setWidth(oFF.UiCssLength.create("100%"));
	separatorLine.setMargin(oFF.UiCssBoxEdges.create("4px 0px 8px 0px"));
	return tmpLbl;
};
oFF.SuUserProfileDialog.prototype.addLabel = function(layout, text, flex)
{
	var tmpLbl = layout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLbl.setText(text);
	tmpLbl.setFlex(flex);
	return tmpLbl;
};
oFF.SuUserProfileDialog.prototype.addLabelCol3 = function(layout, text)
{
	return this.addLabel(layout, text, oFF.SuUserProfileDialog.THREE_COL_ITEMS_FLEX);
};
oFF.SuUserProfileDialog.prototype.addLabelCol2 = function(layout, text)
{
	return this.addLabel(layout, text, oFF.SuUserProfileDialog.TWO_COL_ITEMS_FLEX);
};
oFF.SuUserProfileDialog.prototype.onPress = function(event)
{
	this.exitNow(0);
};

oFF.SuResourceExplorer = function() {};
oFF.SuResourceExplorer.prototype = new oFF.DfUiDialogProgram();
oFF.SuResourceExplorer.prototype._ff_c = "SuResourceExplorer";

oFF.SuResourceExplorer.PARAM_CONFIG = "config";
oFF.SuResourceExplorer.PARAM_PROFILE = "profile";
oFF.SuResourceExplorer.PARAM_CALLBACKS = "callbacks";
oFF.SuResourceExplorer.OK_BUTTON = "suREOkBtn";
oFF.SuResourceExplorer.CANCEL_BUTTON = "suRECancelBtn";
oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME = "ResourceExplorer";
oFF.SuResourceExplorer.DEFAULT_PROGRAM_WIDTH = "60vw";
oFF.SuResourceExplorer.DEFAULT_PROGRAM_HEIGHT = "60vh";
oFF.SuResourceExplorer.prototype.m_statusIndicator = null;
oFF.SuResourceExplorer.prototype.m_view = null;
oFF.SuResourceExplorer.prototype.m_defaultTitle = null;
oFF.SuResourceExplorer.prototype.m_listener = null;
oFF.SuResourceExplorer.prototype.m_okBtn = null;
oFF.SuResourceExplorer.prototype.m_cancelBtn = null;
oFF.SuResourceExplorer.prototype.m_newConfirmPopup = null;
oFF.SuResourceExplorer.prototype.m_store = null;
oFF.SuResourceExplorer.prototype.m_validSelection = false;
oFF.SuResourceExplorer.prototype.m_rootResource = null;
oFF.SuResourceExplorer.prototype.m_resourceNavigationHelper = null;
oFF.SuResourceExplorer.prototype.m_config = null;
oFF.SuResourceExplorer.prototype.m_connectionList = null;
oFF.SuResourceExplorer.prototype.m_recentlyUsedDataProvider = null;
oFF.SuResourceExplorer.prototype.m_resourceExplorerRecentlyUsedCallback = null;
oFF.SuResourceExplorer.prototype.m_controlToFocus = null;
oFF.SuResourceExplorer.prototype.newProgram = function()
{
	var prg = new oFF.SuResourceExplorer();
	prg.m_defaultTitle = oFF.UiLocalizationCenter.getCenter().getText(oFF.SuResourceExplorerI18n.DEFAULT_PROGRAM_TITLE_RESOURCE);
	prg.setup();
	return prg;
};
oFF.SuResourceExplorer.prototype.getProgramName = function()
{
	return oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME;
};
oFF.SuResourceExplorer.prototype.releaseObject = function()
{
	this.m_view = oFF.XObjectExt.release(this.m_view);
	this.m_newConfirmPopup = oFF.XObjectExt.release(this.m_newConfirmPopup);
	this.m_controlToFocus = null;
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.SuResourceExplorer.prototype.isResizeAllowed = function()
{
	this.setUpConfig();
	return this.m_config.getDialogMode().isResizable();
};
oFF.SuResourceExplorer.prototype.getDialogButtons = function(genesis)
{
	var dialogButtons = oFF.XList.create();
	this.setUpConfig();
	var dialogConfig = this.m_config.getDialogMode();
	var okLabel = dialogConfig.getOkBtnLabel() !== null ? dialogConfig.getOkBtnLabel() : this.getLocalization().getText(oFF.UiCommonI18n.OK);
	var cancelLabel = dialogConfig.getCancelBtnLabel() !== null ? dialogConfig.getCancelBtnLabel() : this.getLocalization().getText(oFF.UiCommonI18n.CANCEL);
	this.m_okBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	this.m_okBtn.setName(oFF.SuResourceExplorer.OK_BUTTON);
	this.m_okBtn.setText(okLabel);
	this.m_okBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	this.m_okBtn.registerOnPress(this);
	dialogButtons.add(this.m_okBtn);
	this.m_cancelBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	this.m_cancelBtn.setName(oFF.SuResourceExplorer.CANCEL_BUTTON);
	this.m_cancelBtn.setText(cancelLabel);
	this.m_cancelBtn.registerOnPress(this);
	dialogButtons.add(this.m_cancelBtn);
	return dialogButtons;
};
oFF.SuResourceExplorer.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.SuResourceExplorer.prototype.getMenuBarDisplayName = function()
{
	return oFF.SuResourceExplorer.DEFAULT_PROGRAM_NAME;
};
oFF.SuResourceExplorer.prototype.getConfig = function()
{
	return this.m_config;
};
oFF.SuResourceExplorer.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.SuResourceExplorer.PARAM_PROFILE, "The config profile");
	metadata.addParameter(oFF.SuResourceExplorer.PARAM_CONFIG, "The explorer view configuration");
	metadata.addParameter(oFF.SuResourceExplorer.PARAM_CALLBACKS, "The callbacks to be called during explorer view interaction");
};
oFF.SuResourceExplorer.prototype.processArguments = function(args) {};
oFF.SuResourceExplorer.prototype.setupProgram = function()
{
	this.m_rootResource = oFF.SuResourceNavigationHelper.getFileSystemRoot(this.getProcess());
	var setupPromise = oFF.XPromise.create( function(resolve, reject){
		var reject2 = reject;
		var initPromise = this.initRootResource();
		initPromise.then( function(resultRootResource){
			var initProgramPromise = this.initProgram();
			if (oFF.isNull(initProgramPromise))
			{
				resolve(oFF.XBooleanValue.create(true));
			}
			else
			{
				initProgramPromise.then( function(resultProgram){
					resolve(oFF.XBooleanValue.create(true));
					return resultProgram;
				}.bind(this), reject2);
			}
			return resultRootResource;
		}.bind(this), reject2);
	}.bind(this));
	return setupPromise;
};
oFF.SuResourceExplorer.prototype.initRootResource = function()
{
	var initPromise = oFF.XPromise.create( function(resolve, reject){
		var reject2 = reject;
		oFF.SuResourceWrapper.create(this.m_rootResource).promiseFetchMetadata().then( function(rootResourceMd){
			resolve(oFF.XBooleanValue.create(true));
			return rootResourceMd;
		}.bind(this), reject2);
	}.bind(this));
	return initPromise;
};
oFF.SuResourceExplorer.prototype.initProgram = function()
{
	try
	{
		this.m_listener = this.getArguments().getXObjectByKeyExt(oFF.SuResourceExplorer.PARAM_CALLBACKS, oFF.SuResourceExplorerListener.createEmpty());
		this.m_resourceNavigationHelper = oFF.SuResourceNavigationHelper.create(this.m_rootResource);
		this.setUpConfig();
		if (this.m_config.isVersion(oFF.SuResourceExplorerConfig.VERSION_3))
		{
			oFF.SuResourceExplorerLocalStorageManager.staticSetup(this.getProcess());
		}
		oFF.SuResourceWrapper.setupStaticByConfig(this.m_config);
		var rootPath = this.m_config.getRootPath();
		var initialPath = this.m_config.getInitialPath();
		this.setUpStore(rootPath, initialPath);
		this.m_resourceExplorerRecentlyUsedCallback = oFF.SuResourceExplorerRecentlyUsedCallback.create(this.m_listener);
		var ctx = oFF.SuResourceExplorerContext.create(this.m_config.isDatasourceNavigationEnabled(), this.isSave());
		var filterManager = oFF.SuResourceFilterManager.create(this.m_config, this.m_listener.getFilterFn(), ctx);
		if (this.m_config.isDatasourceNavigationEnabled())
		{
			return this.setupDatasourcePicker(filterManager);
		}
		else
		{
			return this.setupResourceExplorer(filterManager);
		}
	}
	catch (t)
	{
		return oFF.XPromise.reject(oFF.XError.create(oFF.XException.getStackTrace(t, 0)));
	}
};
oFF.SuResourceExplorer.prototype.setupResourceExplorer = function(filterManager)
{
	var fileHandler = oFF.FeApolloFileHandler.createFileHandler(this);
	this.m_view = oFF.SuResourceExplorerView.create(this.m_config, this.m_resourceNavigationHelper, this.m_store, fileHandler, filterManager);
	return null;
};
oFF.SuResourceExplorer.prototype.setupDatasourcePicker = function(filterManager)
{
	return oFF.XPromise.create( function(res, rej){
		this.m_recentlyUsedDataProvider = oFF.SuRecentlyUsedDataProviderFactory.create(this).createProvider();
		var datasourceConfig = oFF.SuDatasourceNavigationConfig.createFromConfig(this.m_config, this.m_resourceNavigationHelper, this.m_recentlyUsedDataProvider);
		var onChildrenFetched =  function(result){
			var resultTmp = result;
			if (!resultTmp.hasErrors())
			{
				var resultset = resultTmp.getData().getCachedChildrenResultset();
				this.m_connectionList = oFF.XStream.of(resultset.getChildFiles()).filter( function(resourceToFilter){
					return oFF.SuDataSourceNavigationHelper.isConnectionVisibleByConfig(resourceToFilter, null, filterManager, datasourceConfig);
				}.bind(this)).collect(oFF.XStreamCollector.toList());
				this.m_view = oFF.SuDatasourcePickerView.create(this.m_config, datasourceConfig, this.m_resourceNavigationHelper, this.m_store, filterManager, this.m_connectionList);
				res(oFF.XBooleanValue.create(true));
			}
			else
			{
				oFF.SuDataSourceNavigationHelper.handleErrorMsg(this.getGenesis(), resultTmp);
				res(oFF.XBooleanValue.create(false));
			}
			return result;
		}.bind(this);
		oFF.SuResourceWrapper.create(datasourceConfig.getRootResource()).promiseFetchChildren(null).then(onChildrenFetched,  function(err){
			rej(err);
		}.bind(this));
	}.bind(this));
};
oFF.SuResourceExplorer.prototype.setUpConfig = function()
{
	if (oFF.isNull(this.m_config))
	{
		var prgArgs = this.getArguments();
		var profile = prgArgs.getStringByKeyExt(oFF.SuResourceExplorer.PARAM_PROFILE, null);
		var configJSON = prgArgs.getStringByKeyExt(oFF.SuResourceExplorer.PARAM_CONFIG, null);
		var userProfile = this.getProcess().getUserProfile();
		var config;
		if (this.isDefaultConfig(profile, configJSON) && this.isWindow())
		{
			config = oFF.SuResourceExplorerConfig.createWindowDefault(userProfile);
		}
		else if (oFF.notNull(profile))
		{
			config = oFF.SuResourceExplorerConfig.createByProfile(profile, configJSON, this.isDialog(), userProfile);
		}
		else
		{
			config = oFF.SuResourceExplorerConfig.createByJSON(configJSON, this.isDialog(), userProfile);
		}
		this.m_config = config;
	}
};
oFF.SuResourceExplorer.prototype.isDefaultConfig = function(profile, configJSON)
{
	return oFF.isNull(profile) && oFF.isNull(configJSON);
};
oFF.SuResourceExplorer.prototype.buildUi = function(genesis)
{
	if (this.isDialog() && !this.m_config.getDialogMode().isSelectionMode(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_BUTTON))
	{
		this.m_okBtn.setVisible(false);
	}
	var mainUIContainer = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainUIContainer.setName("reMainContainer");
	mainUIContainer.addCssClass("ffReMainContainer");
	this.m_statusIndicator = genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR);
	this.m_statusIndicator.setText("Wait...");
	this.m_statusIndicator.setName("reStatusIndicator");
	this.m_statusIndicator.useMaxSpace();
	this.m_view.renderView(genesis);
	mainUIContainer.addItem(this.m_view.getView());
	mainUIContainer.addItem(this.m_statusIndicator);
	genesis.setRoot(mainUIContainer);
	this.updateStatusIndicator();
	this.updateView(this.m_store.getState());
	this.m_store.subscribe(this);
};
oFF.SuResourceExplorer.prototype.getDefaultContainerSize = function()
{
	this.setUpConfig();
	var configCssWidth = this.m_config.getDialogWidth();
	var configCssHeight = this.m_config.getDialogHeight();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(configCssWidth) || oFF.XStringUtils.isNotNullAndNotEmpty(configCssHeight))
	{
		return oFF.UiSize.createByCss(configCssWidth, configCssHeight);
	}
	return oFF.UiSize.createByCss(oFF.SuResourceExplorer.DEFAULT_PROGRAM_WIDTH, oFF.SuResourceExplorer.DEFAULT_PROGRAM_HEIGHT);
};
oFF.SuResourceExplorer.prototype.getContainerCssClass = function()
{
	this.setUpConfig();
	var cssClassClass = oFF.XStringBuffer.create();
	cssClassClass.append("ffSuResourceExplorer");
	if (this.isDialog())
	{
		if (this.isSaveDialog())
		{
			cssClassClass.append(" ffReDialogSave");
		}
		else
		{
			cssClassClass.append(" ffReDialogOpen");
		}
	}
	else
	{
		cssClassClass.append(" ffReWindow");
	}
	if (this.m_config.isDatasourceNavigationEnabled())
	{
		cssClassClass.append(" ffReDatasourcePicker");
	}
	return cssClassClass.toString();
};
oFF.SuResourceExplorer.prototype.onContainerAfterOpen = function()
{
	if (oFF.notNull(this.m_controlToFocus))
	{
		this.m_controlToFocus.focus();
		if (this.m_controlToFocus.getUiType() === oFF.UiType.INPUT)
		{
			var input = this.m_controlToFocus;
			input.selectText(0, oFF.XString.size(input.getText()));
		}
	}
};
oFF.SuResourceExplorer.prototype.onContainerAfterClose = function()
{
	if (this.isWindow())
	{
		if (oFF.notNull(this.m_listener))
		{
			this.m_listener.onClose();
		}
	}
};
oFF.SuResourceExplorer.prototype.isDatasourcePicker = function()
{
	return this.m_config.isDatasourceNavigationEnabled();
};
oFF.SuResourceExplorer.prototype.setFocus = function(control)
{
	this.m_controlToFocus = control;
};
oFF.SuResourceExplorer.prototype.updateUI = function(state)
{
	if (state.isNew() || state.getLastAction().is(oFF.SuResourceExplorerAction.SET_STATUS))
	{
		this.updateStatusIndicator();
	}
	this.updateTitle(state);
	if (oFF.notNull(this.m_okBtn))
	{
		this.m_okBtn.setEnabled(this.isOkBtnEnabled());
	}
};
oFF.SuResourceExplorer.prototype.isOkBtnEnabled = function()
{
	return this.m_validSelection && !this.m_store.isStatus(oFF.SuResourceExplorerState.STATUS_SUBMIT) && !this.m_store.isStatus(oFF.SuResourceExplorerState.STATUS_SUBMITTING);
};
oFF.SuResourceExplorer.prototype.updateStatusIndicator = function()
{
	var isReady = false;
	var isError = false;
	var statusMsg = "";
	var i18nProvider = oFF.UiLocalizationCenter.getCenter();
	switch (this.m_store.getState().getStatus())
	{
		case oFF.SuResourceExplorerState.STATUS_READY:
			isReady = true;
			break;

		case oFF.SuResourceExplorerState.STATUS_SUBMIT:
			isReady = true;
			break;

		case oFF.SuResourceExplorerState.STATUS_INITING:
			statusMsg = i18nProvider.getText(oFF.SuResourceExplorerI18n.PROGRAM_STATUS_INIT_TEXT);
			break;

		case oFF.SuResourceExplorerState.STATUS_SUBMITTING:
			statusMsg = "";
			break;

		case oFF.SuResourceExplorerState.STATUS_INIT_ERROR:
			statusMsg = i18nProvider.getTextWithPlaceholder(oFF.SuResourceExplorerI18n.PROGRAM_STATUS_ERROR_TEXT, "");
			isError = true;
			break;
	}
	this.m_statusIndicator.setVisible(!isReady);
	if (isError)
	{
		this.m_statusIndicator.addCssClass(oFF.SuResourceExplorerStyle.STATUS_ERROR_CSSCLASS);
	}
	else
	{
		this.m_statusIndicator.removeCssClass(oFF.SuResourceExplorerStyle.STATUS_ERROR_CSSCLASS);
	}
	this.m_statusIndicator.setText(statusMsg);
	this.m_view.getView().setBusy(!isReady);
	this.m_view.getView().setVisible(isReady);
};
oFF.SuResourceExplorer.prototype.updateTitle = function(state)
{
	var title = this.m_config.getTitle();
	if (oFF.isNull(title))
	{
		var resource = state.getSelectedResource() !== null ? state.getSelectedResource() : state.getBrowsedResource();
		title = oFF.isNull(resource) ? this.m_defaultTitle : oFF.SuResourceWrapper.create(resource).getTranslatedDisplayName();
	}
	this.setTitle(title);
};
oFF.SuResourceExplorer.prototype.isSaveDialog = function()
{
	return this.isDialog() && this.isSave();
};
oFF.SuResourceExplorer.prototype.isSave = function()
{
	return this.m_config.getDialogMode().isMode(oFF.SuResourceExplorerDialogModeConfig.MODE_SAVE);
};
oFF.SuResourceExplorer.prototype.isDialog = function()
{
	return this.getResolvedProgramContainerType() === oFF.ProgramContainerType.DIALOG;
};
oFF.SuResourceExplorer.prototype.isWindow = function()
{
	return this.getResolvedProgramContainerType() === oFF.ProgramContainerType.WINDOW;
};
oFF.SuResourceExplorer.prototype.setUpStore = function(rootPath, initialPath)
{
	var rootDir = oFF.isNull(rootPath) ? this.m_rootResource : this.m_resourceNavigationHelper.getResourceByPath(rootPath);
	var initialState = oFF.SuResourceExplorerState.create();
	if (oFF.notNull(initialPath))
	{
		var resourceWrapper = oFF.SuResourceWrapper.createByPath(this.getProcess(), initialPath, oFF.SuResourceWrapper.RESOURCE_NODE_TYPE_FOLDER);
		this.m_store = oFF.SuResourceExplorerStore.create(this, initialState, rootDir);
		resourceWrapper.processFetchMetadata(this.onResourceMetadataSuccess(), this.onResourceMetadataError());
	}
	else
	{
		initialState.setBrowsedResource(rootDir);
		initialState.setStatus(oFF.SuResourceExplorerState.STATUS_READY);
		this.m_store = oFF.SuResourceExplorerStore.create(this, initialState, rootDir);
	}
};
oFF.SuResourceExplorer.prototype.onResourceMetadataSuccess = function()
{
	return  function(resource, metadata){
		if (resource.hasErrors())
		{
			this.onInitError(resource.getSummary());
		}
		if (resource.isExistingMd())
		{
			this.m_store.setBrowsedResource(resource);
		}
		else
		{
			this.logWarning2("Resource not found :", resource.getUrl());
			this.m_store.setBrowsedResource(this.m_store.getRootResource());
		}
		this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_READY);
	}.bind(this);
};
oFF.SuResourceExplorer.prototype.onResourceMetadataError = function()
{
	return  function(messages){
		this.onInitError(messages.getSummary());
	}.bind(this);
};
oFF.SuResourceExplorer.prototype.onInitError = function(message)
{
	this.logWarning2("Error during the initial path file metadata fetching:", message);
	this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_INIT_ERROR);
};
oFF.SuResourceExplorer.prototype.onValidation = function(state)
{
	var selectedResource = state.getSelectedResource();
	var browsedResource = state.getBrowsedResource();
	var resourceInfoValid = true;
	var hasWriteAccess = true;
	if (this.isSaveDialog())
	{
		var resourceInfo = state.getResourceInfo();
		resourceInfoValid = oFF.notNull(resourceInfo) && resourceInfo.isValid();
	}
	var validSelection = this.m_listener.onValidation(state.getSelectedResource());
	if (oFF.notNull(validSelection))
	{
		this.m_validSelection = validSelection.getBoolean();
	}
	else
	{
		if (this.isDatasourcePicker())
		{
			switch (this.m_store.getResourceViewerMode())
			{
				case oFF.SuResourceExplorerStore.RECENTLY_USED_VIEWER:
					this.m_validSelection = this.m_store.getResourceInfo() !== null;
					break;

				default:
					this.m_validSelection = oFF.notNull(selectedResource);
					break;
			}
		}
		else
		{
			if (this.m_config.getDialogMode().isSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE))
			{
				this.m_validSelection = oFF.notNull(selectedResource) && !oFF.SuResourceWrapper.create(selectedResource).isResourceDirectory();
			}
			else if (this.m_config.getDialogMode().isSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY))
			{
				this.m_validSelection = oFF.notNull(browsedResource) && oFF.SuResourceWrapper.create(browsedResource).isResourceDirectory();
			}
		}
	}
	this.m_validSelection = resourceInfoValid && this.m_validSelection && hasWriteAccess;
};
oFF.SuResourceExplorer.prototype.getResourceBySelectionType = function()
{
	var state = this.m_store.getState();
	if (!this.m_store.isResourceViewerMode(oFF.SuResourceExplorerStore.RECENTLY_USED_VIEWER))
	{
		if (this.m_config.getDialogMode().isSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_FILE))
		{
			return oFF.XPromise.resolve(state.getSelectedResource());
		}
		else if (this.m_config.getDialogMode().isSelectionType(oFF.SuResourceExplorerDialogModeConfig.SELECTION_TYPE_DIRECTORY))
		{
			return oFF.XPromise.resolve(state.getBrowsedResource());
		}
	}
	else
	{
		var resourceInfo = this.m_store.getResourceInfo();
		if (oFF.notNull(resourceInfo))
		{
			var connectionResource = oFF.SuDataSourceNavigationHelper.getConnectionByName(this.m_connectionList, resourceInfo.getString(oFF.SuResourceInfo.SYSTEM_NAME));
			if (!connectionResource.isPresent())
			{
				this.m_store.setSelectedResource(null);
				return oFF.XPromise.reject(oFF.XError.create(oFF.XStringUtils.concatenate2("Invalid connection: ", resourceInfo.getString(oFF.SuResourceInfo.TYPE))));
			}
			return oFF.XPromise.create( function(resolve, reject){
				oFF.SuDataSourceNavigationHelper.processFetchDatasource(connectionResource.get(), resourceInfo.getString(oFF.SuResourceInfo.OBJECT_NAME),  function(datasourceResource){
					if (oFF.isNull(datasourceResource))
					{
						var msg = oFF.SuDataSourceNavigationHelper.showNotFoundErrorMsg(this.getGenesis(), resourceInfo.getString(oFF.SuResourceInfo.OBJECT_NAME));
						reject(oFF.XError.create(msg));
					}
					else
					{
						this.m_store.setSelectedResource(datasourceResource);
						resolve(datasourceResource);
					}
				}.bind(this),  function(messages){
					oFF.SuDataSourceNavigationHelper.handleErrorMsg(this.getGenesis(), messages);
					reject(oFF.XError.create(messages.getSummary()));
				}.bind(this));
			}.bind(this));
		}
	}
	oFF.noSupport();
};
oFF.SuResourceExplorer.prototype.checkSelection = function(state)
{
	if (this.m_config.getDialogMode().isSelectionMode(oFF.SuResourceExplorerDialogModeConfig.SELECTION_MODE_SELECTION) && this.m_validSelection)
	{
		this.performSubmit(state.getSelectedResource());
	}
};
oFF.SuResourceExplorer.prototype.createResourceInfo = function(resource)
{
	var info = null;
	if (this.m_store.getState().getResourceInfo() === null)
	{
		info = oFF.SuResourceInfo.createByResource(resource);
	}
	else
	{
		var resourceWrapper = oFF.SuResourceWrapper.create(resource);
		var isDirectory = resourceWrapper.isResourceDirectory();
		info = oFF.SuResourceInfo.createClone(this.m_store.getState().getResourceInfo());
		if (!this.isSave())
		{
			info.setIsDirectory(isDirectory);
		}
		var url = oFF.SuResourceWrapper.getResourceUrlWithoutFinalSlash(resource);
		if (!this.m_config.isDatasourceNavigationEnabled() && isDirectory)
		{
			url = oFF.XStringUtils.concatenate3(url, oFF.SuResourceWrapper.PATH_SEPARATOR, info.getName());
		}
		info.setUrl(url);
	}
	return info;
};
oFF.SuResourceExplorer.prototype.isRecentlyUsedCallbackSet = function()
{
	return this.m_listener.getQuickAccessChangeFn() !== null;
};
oFF.SuResourceExplorer.prototype.onUpdateRecentlyUsedList = function(list)
{
	this.m_resourceExplorerRecentlyUsedCallback.onUpdateRecentlyUsedList(list);
};
oFF.SuResourceExplorer.prototype.onAddToRecentlyUsed = function(datasource)
{
	this.m_resourceExplorerRecentlyUsedCallback.onAddToRecentlyUsed(datasource);
};
oFF.SuResourceExplorer.prototype.getRecentlyUsedDatasources = function(list)
{
	return this.m_resourceExplorerRecentlyUsedCallback.getRecentlyUsedDatasources(list);
};
oFF.SuResourceExplorer.prototype.addToRecentlyUsed = function(dataSourceToSave)
{
	if (oFF.notNull(this.m_recentlyUsedDataProvider))
	{
		this.m_recentlyUsedDataProvider.add(dataSourceToSave);
	}
};
oFF.SuResourceExplorer.prototype.onPress = function(event)
{
	var controlName = event.getControl().getName();
	switch (controlName)
	{
		case oFF.SuResourceExplorer.OK_BUTTON:
			if (this.isOkBtnEnabled())
			{
				this.submitSelection();
			}
			break;

		case oFF.SuResourceExplorer.CANCEL_BUTTON:
			if (oFF.notNull(this.m_listener))
			{
				this.m_listener.onClose();
			}
			this.close();
			break;

		default:
			oFF.noSupport();
	}
};
oFF.SuResourceExplorer.prototype.performSubmit = function(resource)
{
	if (this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_SUBMITTING))
	{
		if (oFF.notNull(resource))
		{
			this.callOnSubmitCallback(resource);
		}
		else
		{
			this.m_view.getView().setBusy(true);
			this.getResourceBySelectionType().then( function(resourceBySelection){
				this.callOnSubmitCallback(resourceBySelection);
				return resourceBySelection;
			}.bind(this),  function(err){
				if (!this.isReleased() && oFF.notNull(this.m_view))
				{
					this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_READY);
				}
			}.bind(this));
		}
	}
};
oFF.SuResourceExplorer.prototype.callOnSubmitCallback = function(resource)
{
	var info = this.createResourceInfo(resource);
	this.m_listener.onSubmit(info, this);
};
oFF.SuResourceExplorer.prototype.submitSelection = function()
{
	if (!this.m_validSelection)
	{
		return;
	}
	if (this.isSaveDialog())
	{
		var folder = this.m_store.getBrowsedResource();
		var resourceName = this.m_store.getResourceInfo().getName();
		var resourceType = this.m_config.getResourceType();
		var existingResource = oFF.SuResourceCRUDManager.getResourceExistsInDirectory(folder, resourceName, resourceType);
		if (oFF.notNull(existingResource))
		{
			this.showOverwriteResourcePopup(existingResource);
			return;
		}
	}
	this.performSubmit(null);
};
oFF.SuResourceExplorer.prototype.showOverwriteResourcePopup = function(existingResource)
{
	if (oFF.isNull(this.m_newConfirmPopup))
	{
		var title = this.getLocalization().getText(oFF.UiCommonI18n.WARNING);
		var question = oFF.UiLocalizationCenter.getCenter().getText(oFF.SuResourceExplorerI18n.OVERWRITE_POPUP_QUESTION);
		var confirmButtonText = this.getLocalization().getText(oFF.UiCommonI18n.OVERWRITE);
		this.m_newConfirmPopup = oFF.UtConfirmPopup.create(this.getGenesis(), title, question);
		this.m_newConfirmPopup.setConfirmButtonText(confirmButtonText);
		this.m_newConfirmPopup.setConfirmButtonIcon("sys-enter-2");
		this.m_newConfirmPopup.setConfirmButtonType(oFF.UiButtonType.DESTRUCTIVE);
		this.m_newConfirmPopup.setConfirmProcedure( function(){
			this.performSubmit(existingResource);
		}.bind(this));
		this.m_newConfirmPopup.setCloseProcedure( function(){
			if (!this.m_store.isStatus(oFF.SuResourceExplorerState.STATUS_SUBMITTING))
			{
				this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_READY);
			}
		}.bind(this));
	}
	this.m_newConfirmPopup.open();
};
oFF.SuResourceExplorer.prototype.accept = function(state)
{
	if (!this.isTerminated())
	{
		this.updateView(state);
	}
};
oFF.SuResourceExplorer.prototype.close = function()
{
	this.terminate();
};
oFF.SuResourceExplorer.prototype.showErrorMessage = function(message)
{
	return this.doShowMessage(oFF.SuReMessage.createError(message));
};
oFF.SuResourceExplorer.prototype.hideMessage = function()
{
	return this.doShowMessage(null);
};
oFF.SuResourceExplorer.prototype.setBusyText = function(text)
{
	this.m_statusIndicator.setText(text);
};
oFF.SuResourceExplorer.prototype.doShowMessage = function(message)
{
	if (this.m_store.getState().isNew() || this.m_store.isStatus(oFF.SuResourceExplorerState.STATUS_SUBMITTING))
	{
		this.m_store.setStatus(oFF.SuResourceExplorerState.STATUS_READY);
	}
	if (this.m_config.isMessageAreaEnabled())
	{
		this.m_store.setMessage(message);
		return true;
	}
	return false;
};
oFF.SuResourceExplorer.prototype.updateView = function(state)
{
	if (state.getLastAction().is(oFF.SuResourceExplorerAction.SET_STATUS) && this.m_store.isStatus(oFF.SuResourceExplorerState.STATUS_SUBMIT))
	{
		this.submitSelection();
	}
	if (!this.isTerminated())
	{
		this.onValidation(state);
		this.updateUI(state);
		this.checkSelection(state);
	}
};
oFF.SuResourceExplorer.prototype.isTerminated = function()
{
	if (this.isReleased())
	{
		return true;
	}
	if (this.getProcess() === null)
	{
		return true;
	}
	return false;
};

oFF.SystemUiModule = function() {};
oFF.SystemUiModule.prototype = new oFF.DfModule();
oFF.SystemUiModule.prototype._ff_c = "SystemUiModule";

oFF.SystemUiModule.s_module = null;
oFF.SystemUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.SystemUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.UiProgramModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ExportModule.getInstance());
		oFF.SystemUiModule.s_module = oFF.DfModule.startExt(new oFF.SystemUiModule());
		oFF.FeApolloFileExtension.staticSetup();
		oFF.SuVulcanViewType.staticSetup();
		oFF.SuVulcanSampleRegistration.staticSetup();
		oFF.SuVulcanSampleType.staticSetup();
		oFF.SuVulcanSampleRegistration.registerSample(new oFF.SuVulcanSimpleButtonSample());
		oFF.SuVulcanSampleRegistration.registerSample(new oFF.SuVulcanCredentialsDialogSample());
		oFF.SuVulcanSampleRegistration.registerSample(new oFF.SuVulcanSideNavigationViewSample());
		oFF.SuResourceExplorerI18n.staticSetup();
		oFF.UiCredentialsDialogI18n.staticSetup();
		oFF.SuExportI18n.staticSetup();
		oFF.SuFilterType.staticSetup();
		oFF.ProgramRegistration.setProgramFactory(new oFF.FeApollo());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SleMetis());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuAthena());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuVulcan());
		oFF.ProgramRegistration.setProgramFactory(new oFF.WasmDoom1());
		oFF.ProgramRegistration.setProgramFactory(new oFF.CoronaInfo());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuWeatherFetcher());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuMinerva());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuMercury());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuTheia());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuUserProfileDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuJavadocDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuCalendarDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuConnectionTestDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuExportDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuResourceExplorer());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuResourceExplorerTester());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuUiDriverInfoDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.UiCredentialsDialogPrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SuSettingsDialog());
		oFF.ProgramRegistration.setProgramFactory(new oFF.Chronos());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysCredentialsProviderPrg());
		oFF.DfModule.stopExt(oFF.SystemUiModule.s_module);
	}
	return oFF.SystemUiModule.s_module;
};
oFF.SystemUiModule.prototype.getName = function()
{
	return "ff3100.system.ui";
};

oFF.SystemUiModule.getInstance();

return sap.firefly;
	} );