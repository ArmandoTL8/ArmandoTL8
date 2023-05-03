function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define(["sap/sac/df/firefly/ff2200.ui"], function (oFF) {
  "use strict";

  if (!sap.firefly.ui) {
    sap.firefly["ui"] = {};
  } // get the url params


  var urlParams = undefined;
  sap.firefly.ui.isDebugEnabled = false; // ie11 does not support URLSearchParams so make sure that it is available

  if (window && 'URLSearchParams' in window) {
    urlParams = new URLSearchParams(window.location.search);

    if (urlParams) {
      sap.firefly.ui.isDebugEnabled = urlParams.get("ff-ui-debug") && urlParams.get("ff-ui-debug") === "true" || false;
    }
  } //---=== Lib loaders below are located in sap.firefly.LibLoader.js. Empty methods to prevent crashes ===---
  //--- sapui5 dynamic lib loader ---


  sap.firefly.loadUi5LibIfNeeded = function (ui5Lib) {}; //--- external lib loader ---


  sap.firefly.loadExternalLibrary = function (libUrl) {};

  sap.firefly.loadExternalCssStyles = function (stylesUrl) {};

  sap.firefly.loadSacTableIfNeeded = function (location) {};

  sap.firefly.loadHighchartsIfNeeded = function () {};

  sap.firefly.loadValLibIfNeeded = function (location) {};

  sap.firefly.loadGridLayoutsIfNeeded = function () {};

  sap.firefly.ui.Log = function () {
    console.log("Log");
  }; // https://flatuicolors.com/palette/de


  sap.firefly.ui.Log.Colors = {
    RED: "#fc5c65",
    GREEN: "#26de81",
    BLUE: "#45aaf2",
    DARK_BLUE: "#4b6584",
    ORANGE: "#fd9644",
    GREY: "#778ca3",
    DARK_GREY: "#6a6b6b",
    YELLOW: "#fed330",
    BLACK: "#262626",
    WHITE: "#eeeeee"
  }; //public stuff

  sap.firefly.ui.Log.logInfo = function (logMsg) {
    logMsg = "[FireflyUi]: " + logMsg;

    if (jQuery && jQuery.sap && jQuery.sap.log) {
      jQuery.sap.log.info(logMsg);
    } else {
      console.log(logMsg);
    }
  };

  sap.firefly.ui.Log.logWarning = function (logMsg) {
    logMsg = "[FireflyUi]: " + logMsg;

    if (jQuery && jQuery.sap && jQuery.sap.log) {
      jQuery.sap.log.warning(logMsg);
    } else {
      console.warn(logMsg);
    }
  };

  sap.firefly.ui.Log.logError = function (logMsg) {
    logMsg = "[FireflyUi]: " + logMsg;

    if (jQuery && jQuery.sap && jQuery.sap.log) {
      jQuery.sap.log.error(logMsg);
    } else {
      console.error(logMsg);
    }
  };

  sap.firefly.ui.Log.setLogLevel = function (level) {
    if (jQuery && jQuery.sap && jQuery.sap.log) {
      jQuery.sap.log.setLevel(level);
    }

    sap.firefly.ui.Log = function () {
      console.log("Log");
    }; // https://flatuicolors.com/palette/de


    sap.firefly.ui.Log.Colors = {
      RED: "#fc5c65",
      GREEN: "#26de81",
      BLUE: "#45aaf2",
      DARK_BLUE: "#4b6584",
      ORANGE: "#fd9644",
      GREY: "#778ca3",
      DARK_GREY: "#6a6b6b",
      YELLOW: "#fed330",
      BLACK: "#262626",
      WHITE: "#eeeeee"
    }; //public stuff

    sap.firefly.ui.Log.logInfo = function (logMsg) {
      logMsg = "[FireflyUi]: " + logMsg;

      if (jQuery && jQuery.sap && jQuery.sap.log) {
        jQuery.sap.log.info(logMsg);
      } else {
        console.log(logMsg);
      }
    };

    sap.firefly.ui.Log.logWarning = function (logMsg) {
      logMsg = "[FireflyUi]: " + logMsg;

      if (jQuery && jQuery.sap && jQuery.sap.log) {
        jQuery.sap.log.warning(logMsg);
      } else {
        console.warn(logMsg);
      }
    };

    sap.firefly.ui.Log.logError = function (logMsg) {
      logMsg = "[FireflyUi]: " + logMsg;

      if (jQuery && jQuery.sap && jQuery.sap.log) {
        jQuery.sap.log.error(logMsg);
      } else {
        console.error(logMsg);
      }
    };

    sap.firefly.ui.Log.setLogLevel = function (level) {
      if (jQuery && jQuery.sap && jQuery.sap.log) {
        jQuery.sap.log.setLevel(level);
      }
    };

    sap.firefly.ui.Log.printColoredConsoleText = function (text, color, bgColor, extraCss) {
      color = color ? color : "unset";
      bgColor = bgColor ? bgColor : "unset";
      text = "%c[FireflyUi]:%c " + text;
      messageCss = "background: " + bgColor + "; color: " + color;

      if (extraCss) {
        messageCss = messageCss + extraCss;
      }

      console.log(text, "background: #3867d6; color: #fff", messageCss);
    };

    sap.firefly.ui.Log.logDebug = function (logMsg, color, bgColor) {
      if (sap.firefly.ui.isDebugEnabled) {
        this.printColoredConsoleText(logMsg, color, bgColor);
      }
    };

    sap.firefly.ui.Log.logCritical = function (logMsg) {
      console.error("%c[FireflyUi]:%c " + logMsg, "background: #cc0000; color: #fff", "background: unset; color: unset");
    };
  };

  sap.firefly.ui.Log.printColoredConsoleText = function (text, color, bgColor, extraCss) {
    color = color ? color : "unset";
    bgColor = bgColor ? bgColor : "unset";
    text = "%c[FireflyUi]:%c " + text;
    messageCss = "background: " + bgColor + "; color: " + color;

    if (extraCss) {
      messageCss = messageCss + extraCss;
    }

    console.log(text, "background: #3867d6; color: #fff", messageCss);
  };

  sap.firefly.ui.Log.logDebug = function (logMsg, color, bgColor) {
    if (sap.firefly.ui.isDebugEnabled === true) {
      this.printColoredConsoleText(logMsg, color, bgColor);
    }
  };

  sap.firefly.ui.Log.logCritical = function (logMsg) {
    console.error("%c[FireflyUi]:%c " + logMsg, "background: #cc0000; color: #fff", "background: unset; color: unset");
  };

  sap.firefly.ui.Tools = function () {
    console.log("Tools");
  }; //public stuff


  sap.firefly.ui.Tools.getUi5ControlById = function (id) {
    var ui5Control = null;

    if (id && sap && sap.ui) {
      ui5Control = sap.ui.getCore().byId(id);
    }

    return ui5Control;
  };

  sap.firefly.ui.Tools.getFfUxControlById = function (id) {
    sap.firefly.ui.Tools = function () {
      console.log("Tools");
    }; //public stuff


    sap.firefly.ui.Tools.getUi5ControlById = function (id) {
      var ui5Control = null;

      if (id && sap && sap.ui) {
        ui5Control = sap.ui.getCore().byId(id);
      }

      return ui5Control;
    };

    sap.firefly.ui.Tools.getFfUxControlById = function (id) {
      var ffUxControl = null;

      if (id && sap.firefly && sap.firefly.UxGeneric) {
        var ui5Control = sap.firefly.ui.Tools.getUi5ControlById(id);

        if (ui5Control) {
          ffUxControl = sap.firefly.UxGeneric.getUxControl(ui5Control);
        }
      }

      return ffUxControl;
    };

    sap.firefly.ui.Tools.sanitizeHTML = function (html) {
      if (window && window.html && window.html.sanitize) {
        return window.html.sanitize(html);
      }

      if (jQuery && jQuery.sap && jQuery.sap.encodeHTML) {
        return jQuery.sap.encodeHTML(html);
      }

      throw 'Failed to sanitize HTML! Make sure that the neccessary sanitizer packages are available!';
    };

    sap.firefly.ui.Tools.printUi5DebugInfo = function () {
      if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
        sap.firefly.ui.Log._logUiInfoMessage("Number of instantiated ui5 controls: " + sap.ui.core.Element.registry.size);

        var numberOfEvents = 0;
        sap.ui.core.Element.registry.forEach(function (control) {
          if (control.mEventRegistry) {
            Object.values(control.mEventRegistry).forEach(function (events) {
              if (events) {
                numberOfEvents = numberOfEvents + events.length;
              }
            });
          }
        });

        var allUi5Zombies = sap.firefly.ui.Tools._getUi5Zombies(true);

        var parentlessUi5Zombies = sap.firefly.ui.Tools._getUi5Zombies(false);

        sap.firefly.ui.Log._logUiInfoMessage("Number of all ui5 control events: " + numberOfEvents);

        sap.firefly.ui.Log._logUiInfoMessage("Number of Zombies: ".concat(allUi5Zombies.length, " [").concat(parentlessUi5Zombies.length, "]"));
      }
    };

    sap.firefly.ui.Tools.destroyUi5Zombies = function () {
      if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
        sap.firefly.ui.Log._logUiWarningMessage("Warning! This is experimental and should be used with caution!");

        sap.firefly.ui.Log._logUiInfoMessage("Destroying zombies...");

        var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(false);

        ui5Zombies.forEach(function (control) {
          control.destroy();
        });

        sap.firefly.ui.Log._logUiInfoMessage("Destroyed parentless " + ui5Zombies.length + " zombie controls!");
      }
    };

    sap.firefly.ui.Tools.listUi5Zombies = function (listAll) {
      if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
        if (listAll) {
          sap.firefly.ui.Log._logUiInfoMessage("Listing all zombie controls...");
        } else {
          sap.firefly.ui.Log._logUiInfoMessage("Listing parentless zombie controls...");
        }

        var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(listAll);

        console.log(ui5Zombies);
      }
    };

    sap.firefly.ui.Tools.listFfZombies = function (listAll) {
      if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
        if (listAll) {
          sap.firefly.ui.Log._logUiInfoMessage("Listing all firefly zombie controls...");
        } else {
          sap.firefly.ui.Log._logUiInfoMessage("Listing firefly parentless zombie controls...");
        }

        var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(listAll);

        var ffZombies = [];
        ui5Zombies.forEach(function (control) {
          var ffUxControl = sap.firefly.UxGeneric.getUxControl(control);

          if (ffUxControl && (listAll || !ffUxControl.getParent())) {
            ffZombies.push(control);
          }
        });
        console.log(ffZombies);
      }
    }; //private stuff


    sap.firefly.ui.Tools._getUi5Zombies = function (listAll) {
      var ui5Zombies = [];

      if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
        sap.ui.core.Element.registry.forEach(function (control) {
          if (control && !control.getDomRef() && !control.getUIArea()) {
            if (listAll || !control.getParent()) {
              ui5Zombies.push(control);
            }
          }
        });
      }

      return ui5Zombies;
    };

    var ffUxControl = null;

    if (id && sap.firefly && sap.firefly.UxGeneric) {
      var ui5Control = sap.firefly.ui.Tools.getUi5ControlById(id);

      if (ui5Control) {
        ffUxControl = sap.firefly.UxGeneric.getUxControl(ui5Control);
      }
    }

    return ffUxControl;
  };

  sap.firefly.ui.Tools.sanitizeHTML = function (html) {
    if (window && window.html && window.html.sanitize) {
      return window.html.sanitize(html);
    }

    if (jQuery && jQuery.sap && jQuery.sap.encodeHTML) {
      return jQuery.sap.encodeHTML(html);
    }

    throw 'Failed to sanitize HTML! Make sure that the neccessary sanitizer packages are available!';
  };

  sap.firefly.ui.Tools.printUi5DebugInfo = function () {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
      sap.firefly.ui.Log._logUiInfoMessage("Number of instantiated ui5 controls: " + sap.ui.core.Element.registry.size);

      var numberOfEvents = 0;
      sap.ui.core.Element.registry.forEach(function (control) {
        if (control.mEventRegistry) {
          Object.values(control.mEventRegistry).forEach(function (events) {
            if (events) {
              numberOfEvents = numberOfEvents + events.length;
            }
          });
        }
      });

      var allUi5Zombies = sap.firefly.ui.Tools._getUi5Zombies(true);

      var parentlessUi5Zombies = sap.firefly.ui.Tools._getUi5Zombies(false);

      sap.firefly.ui.Log._logUiInfoMessage("Number of all ui5 control events: " + numberOfEvents);

      sap.firefly.ui.Log._logUiInfoMessage("Number of Zombies: ".concat(allUi5Zombies.length, " [").concat(parentlessUi5Zombies.length, "]"));
    }
  };

  sap.firefly.ui.Tools.destroyUi5Zombies = function () {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
      sap.firefly.ui.Log._logUiWarningMessage("Warning! This is experimental and should be used with caution!");

      sap.firefly.ui.Log._logUiInfoMessage("Destroying zombies...");

      var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(false);

      ui5Zombies.forEach(function (control) {
        control.destroy();
      });

      sap.firefly.ui.Log._logUiInfoMessage("Destroyed parentless " + ui5Zombies.length + " zombie controls!");
    }
  };

  sap.firefly.ui.Tools.listUi5Zombies = function (listAll) {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
      if (listAll) {
        sap.firefly.ui.Log._logUiInfoMessage("Listing all zombie controls...");
      } else {
        sap.firefly.ui.Log._logUiInfoMessage("Listing parentless zombie controls...");
      }

      var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(listAll);

      console.log(ui5Zombies);
    }
  };

  sap.firefly.ui.Tools.listFfZombies = function (listAll) {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
      if (listAll) {
        sap.firefly.ui.Log._logUiInfoMessage("Listing all firefly zombie controls...");
      } else {
        sap.firefly.ui.Log._logUiInfoMessage("Listing firefly parentless zombie controls...");
      }

      var ui5Zombies = sap.firefly.ui.Tools._getUi5Zombies(listAll);

      var ffZombies = [];
      ui5Zombies.forEach(function (control) {
        var ffUxControl = sap.firefly.UxGeneric.getUxControl(control);

        if (ffUxControl && (listAll || !ffUxControl.getParent())) {
          ffZombies.push(control);
        }
      });
      console.log(ffZombies);
    }
  }; //private stuff


  sap.firefly.ui.Tools._getUi5Zombies = function (listAll) {
    var ui5Zombies = [];

    if (sap && sap.ui && sap.ui.core && sap.ui.core.Element && sap.ui.core.Element.registry) {
      sap.ui.core.Element.registry.forEach(function (control) {
        if (control && !control.getDomRef() && !control.getUIArea()) {
          if (listAll || !control.getParent()) {
            ui5Zombies.push(control);
          }
        }
      });
    }

    return ui5Zombies;
  };

  sap.firefly.ui.Log._logUiInfoMessage = function (logMsg) {
    this.printColoredConsoleText(logMsg, sap.firefly.ui.Log.Colors.WHITE, sap.firefly.ui.Log.Colors.DARK_GREY, ";font-weight:bold;padding:2px");
  };

  sap.firefly.ui.Log._logUiWarningMessage = function (logMsg) {
    this.printColoredConsoleText(logMsg, sap.firefly.ui.Log.Colors.DARK_BLUE, sap.firefly.ui.Log.Colors.ORANGE, ";font-weight:bold;padding:2px");
  };

  sap.firefly.ui.Ui5LayoutDataUtils = function () {
    console.log("Ui5LayoutDataUtils");
  };

  sap.firefly.ui.Ui5LayoutDataUtils.createNativeLayoutData = function (ffLayoutData) {
    var nativeLayoutData = null;

    if (ffLayoutData && sap && sap.m && sap.ui && sap.ui.core) {
      var ffLayoutDataType = ffLayoutData.getLayoutDataType();
      var nativeJsonSettings = ffLayoutData.getLayoutDataJson().convertToNative();

      if (ffLayoutDataType == sap.firefly.UiLayoutDataType.OVERFLOW_TOOLBAR) {
        nativeLayoutData = new sap.m.OverflowToolbarLayoutData(nativeJsonSettings);
      } else if (ffLayoutDataType == sap.firefly.UiLayoutDataType.RESPONSIVE_COLUMN_ITEM) {
        nativeLayoutData = new sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData(nativeJsonSettings);
      } else {
        nativeLayoutData = new sap.ui.core.LayoutData(nativeJsonSettings);
      }
    }

    return nativeLayoutData;
  };

  sap.firefly.ui.Ui5LayoutDataUtils.createNativeGridLayout = function (ffGridLayout) {
    var nativeGridLayout = null;

    if (ffGridLayout && sap && sap.f && sap.ui && sap.ui.layout && sap.ui.layout.cssgrid) {
      var ffGridLayoutType = ffGridLayout.getGridLayoutType();
      var nativeJsonSettings = ffGridLayout.getGridLayoutJson().convertToNative();

      if (ffGridLayoutType == sap.firefly.UiGridLayoutType.BASIC) {
        nativeGridLayout = new sap.ui.layout.cssgrid.GridBasicLayout(nativeJsonSettings);
      }
    }

    return nativeGridLayout;
  };

  sap.firefly.ui.Ui5ConstantUtils = function () {
    console.log("Ui5ConstantUtils");
  };

  sap.firefly.ui.Ui5ConstantUtils.parseTitleLevel = function (ffConstant) {
    var ui5TitleLevel = null;

    if (ffConstant === sap.firefly.UiTitleLevel.AUTO) {
      ui5TitleLevel = sap.ui.core.TitleLevel.Auto;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_1) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H1;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_2) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H2;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_3) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H3;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_4) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H4;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_5) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H5;
    } else if (ffConstant === sap.firefly.UiTitleLevel.H_6) {
      ui5TitleLevel = sap.ui.core.TitleLevel.H6;
    }

    return ui5TitleLevel;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseToolbarDesign = function (ffConstant) {
    var ui5ToolbarDesign = null;

    if (ffConstant === sap.firefly.UiToolbarDesign.AUTO) {
      ui5ToolbarDesign = sap.m.ToolbarDesign.Auto;
    } else if (ffConstant === sap.firefly.UiToolbarDesign.INFO) {
      ui5ToolbarDesign = sap.m.ToolbarDesign.Info;
    } else if (ffConstant === sap.firefly.UiToolbarDesign.SOLID) {
      ui5ToolbarDesign = sap.m.ToolbarDesign.Solid;
    } else if (ffConstant === sap.firefly.UiToolbarDesign.TRANSPARENT) {
      ui5ToolbarDesign = sap.m.ToolbarDesign.Transparent;
    }

    return ui5ToolbarDesign;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseTextAlign = function (ffConstant) {
    var ui5TextAlign = null;

    if (ffConstant === sap.firefly.UiTextAlign.LEFT) {
      ui5TextAlign = sap.ui.core.TextAlign.Left;
    } else if (ffConstant === sap.firefly.UiTextAlign.RIGHT) {
      ui5TextAlign = sap.ui.core.TextAlign.Right;
    } else if (ffConstant === sap.firefly.UiTextAlign.CENTER) {
      ui5TextAlign = sap.ui.core.TextAlign.Center;
    }

    return ui5TextAlign;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseImageMode = function (ffConstant) {
    var ui5ImageMode = null;

    if (ffConstant === sap.firefly.UiImageMode.BACKGROUND) {
      ui5ImageMode = sap.m.ImageMode.Background;
    } else if (ffConstant === sap.firefly.UiImageMode.IMAGE) {
      ui5ImageMode = sap.m.ImageMode.Image;
    }

    return ui5ImageMode;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseAvatarSize = function (ffConstant) {
    var ui5AvatarSize = null;

    if (ffConstant) {
      ui5AvatarSize = sap.m.AvatarSize[ffConstant.getName()];
    }

    return ui5AvatarSize;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseAvatarShape = function (ffConstant) {
    var ui5AvatarShape = null;

    if (ffConstant) {
      ui5AvatarShape = sap.m.AvatarShape[ffConstant.getName()];
    }

    return ui5AvatarShape;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseAvatarColor = function (ffConstant) {
    var ui5AvatarColor = null;

    if (ffConstant) {
      ui5AvatarColor = sap.m.AvatarColor[ffConstant.getName()];
    }

    return ui5AvatarColor;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseValueState = function (ffConstant) {
    var ui5ValueState = null;

    if (ffConstant === sap.firefly.UiValueState.NONE) {
      ui5ValueState = sap.ui.core.ValueState.None;
    } else if (ffConstant === sap.firefly.UiValueState.ERROR) {
      ui5ValueState = sap.ui.core.ValueState.Error;
    } else if (ffConstant === sap.firefly.UiValueState.INFORMATION) {
      ui5ValueState = sap.ui.core.ValueState.Information;
    } else if (ffConstant === sap.firefly.UiValueState.SUCCESS) {
      ui5ValueState = sap.ui.core.ValueState.Success;
    } else if (ffConstant === sap.firefly.UiValueState.WARNING) {
      ui5ValueState = sap.ui.core.ValueState.Warning;
    }

    return ui5ValueState;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseListSeparators = function (ffConstant) {
    var ui5ListSeparators = null;

    if (ffConstant === sap.firefly.UiListSeparators.ALL) {
      ui5ListSeparators = sap.m.ListSeparators.All;
    } else if (ffConstant === sap.firefly.UiListSeparators.INNER) {
      ui5ListSeparators = sap.m.ListSeparators.Inner;
    } else if (ffConstant === sap.firefly.UiListSeparators.NONE) {
      ui5ListSeparators = sap.m.ListSeparators.None;
    }

    return ui5ListSeparators;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseSelectionMode = function (ffConstant) {
    var ui5SelectionMode = null;

    if (ffConstant === sap.firefly.UiSelectionMode.NONE) {
      ui5SelectionMode = sap.m.ListMode.None;
    } else if (ffConstant === sap.firefly.UiSelectionMode.SINGLE_SELECT) {
      ui5SelectionMode = sap.m.ListMode.SingleSelect;
    } else if (ffConstant === sap.firefly.UiSelectionMode.SINGLE_SELECT_MASTER) {
      ui5SelectionMode = sap.m.ListMode.SingleSelectMaster;
    } else if (ffConstant === sap.firefly.UiSelectionMode.SINGLE_SELECT_LEFT) {
      ui5SelectionMode = sap.m.ListMode.SingleSelectLeft;
    } else if (ffConstant === sap.firefly.UiSelectionMode.MULTI_SELECT) {
      ui5SelectionMode = sap.m.ListMode.MultiSelect;
    } else if (ffConstant === sap.firefly.UiSelectionMode.DELETE) {
      ui5SelectionMode = sap.m.ListMode.Delete;
    }

    return ui5SelectionMode;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseIllustratedMessageSize = function (ffConstant) {
    var ui5IllustratedMessageSize = null;

    if (ffConstant === sap.firefly.UiIllustratedMessageSize.AUTO) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Auto;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageSize.BASE) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Base;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageSize.DIALOG) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Dialog;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageSize.DOT) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Dot;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageSize.SCENE) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Scene;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageSize.SPOT) {
      ui5IllustratedMessageSize = sap.m.IllustratedMessageSize.Spot;
    }

    return ui5IllustratedMessageSize;
  };

  sap.firefly.ui.Ui5ConstantUtils.parseIllustratedMessageType = function (ffConstant) {
    var ui5IllustratedMessageType = null;

    if (ffConstant === sap.firefly.UiIllustratedMessageType.ADD_COLUMN) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.AddColumn;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.ADD_PEOPLE) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.AddPeople;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.BALLOON_SKY) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.BalloonSky;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.BEFORE_SEARCH) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.BeforeSearch;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.CONNECTION) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.Connection;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.EMPTY_CALENDAR) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.EmptyCalendar;
    } else if (ffConstant === sap.firefly.UiIllustratedMessageType.NO_SEARCH_RESULTS) {
      ui5IllustratedMessageType = sap.m.IllustratedMessageType.NoSearchResults;
    }

    return ui5IllustratedMessageType;
  };
  /**
   * If this is a ui5 delivery
   * @returns {boolean} if this library is used in Ui5 dist
   */


  sap.firefly.isUi5 = function () {
    return true;
  };

  sap.ui.core.Control.extend("sap.firefly.XtUi5SacTableGrid", {
    metadata: {
      properties: {
        width: "string",
        height: "string",
        backgroundColor: "string",
        modelJson: "object",
        noDataText: "string"
      },
      aggregations: {},
      defaultAggregation: "",
      events: {
        onCellClick: {
          parameters: {
            cell: {
              type: "object"
            }
          }
        },
        onCellContextMenu: {
          parameters: {
            cell: {
              type: "object"
            }
          }
        },
        onDrillIconClick: {
          parameters: {
            cell: {
              type: "object"
            }
          }
        },
        onSelectionChange: {
          parameters: {
            cell: {
              type: "object"
            }
          }
        },
        onResize: {
          parameters: {
            size: {
              type: "object"
            }
          }
        },
        onCellIconClick: {
          parameters: {
            cell: {
              type: "object"
            }
          }
        },
        onCellDropped: {
          parameters: {
            dragAndDrop: {
              type: "object"
            }
          }
        },
        onExternalElementDropped: {
          parameters: {
            dragAndDrop: {
              type: "object"
            }
          }
        },
        onTableModelUpdated: {
          parameters: {}
        },
        onDataLimitReached: {
          parameters: {
            scrollTop: {
              type: "number"
            }
          }
        },
        onColumnResize: {
          parameters: {
            newSizes: {
              type: "array"
            }
          }
        },
        onRowResize: {
          parameters: {
            newSizes: {
              type: "array"
            }
          }
        }
      }
    },
    m_sacTable: null,
    m_widgetContainer: null,
    m_clickEventId: null,
    m_containerSize: null,
    m_lastSelectionChangedAreaSerialized: null,
    m_hasNewDataToRender: null,
    //ui control stuff
    // ======================================
    init: function init() {
      var _this = this;

      // make sure that the library is loaded
      this._checkReactTableAvailable();

      this.m_hasNewDataToRender = false; // prepare the widget container

      this.m_widgetContainer = document.createElement("div");
      this.m_widgetContainer.style.height = "100%";
      this.m_widgetContainer.style.width = "100%";
      this.m_widgetContainer.style.overflow = "auto";
      this.m_widgetContainer.className = "reactTableComponent ff-sacgrid-wrapper";
      this.m_containerSize = {};
      this.m_containerSize.width = this.m_widgetContainer.offsetWidth;
      this.m_containerSize.height = this.m_widgetContainer.offsetHeight; // register on the resize handler

      sap.ui.core.ResizeHandler.register(this.m_widgetContainer, function (params) {
        var size = params.size; // check if this is the first rendering

        var wasInitial = params.size.width > 0 && params.size.height > 0 && _this.m_containerSize.width == 0 && _this.m_containerSize.height == 0;
        _this.m_containerSize = params.size; // if first and not onresize handler then rerender autmaitcally

        if (wasInitial || !_this.mEventRegistry.onResize) {
          _this.rerender();
        } //if first and/or a onreisze handler is present then fire the event but do not rerender, should be done manually


        if (wasInitial && _this.mEventRegistry.onResize || _this.mEventRegistry.onResize) {
          _this.fireOnResize(_this.m_containerSize);
        }
      });
    },
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        // wrapper start
        oRm.openStart("div", oControl); // add class

        oRm["class"]("ff-sac-grid"); // attributes
        // tooltip

        var tooltip = oControl.getTooltip();

        if (tooltip != null) {
          oRm.attr("title", tooltip);
        } // styles
        // width / height


        var width = oControl.getWidth();
        var height = oControl.getHeight();

        if (width != null) {
          oRm.style("width", width);
        }

        if (height != null) {
          oRm.style("height", height);
        } // background color


        var bgColor = oControl.getBackgroundColor();

        if (bgColor != null) {
          oRm.style("background-color", bgColor);
        } // close main container tag


        oRm.openEnd(); // wrapper end

        oRm.close("div");
      }
    },
    onAfterRendering: function onAfterRendering() {
      this._rerenderTable();
    },
    // property methods extension
    // ======================================
    setModelJson: function setModelJson(modelJson) {
      this.m_hasNewDataToRender = true;
      modelJson = this._addDynamicInfoToModelIfNeeded(modelJson);

      this._setTableModelInternal(modelJson);

      return this;
    },
    // public methods
    // ======================================
    enableDragDrop: function enableDragDrop(externalData) {
      if (this.m_sacTable) {
        this.m_sacTable.enableDragDrop(externalData);
      }
    },
    disableDragDrop: function disableDragDrop() {
      if (this.m_sacTable) {
        this.m_sacTable.disableDragDrop();
      }
    },
    // helpers
    // ======================================
    _setTableModelInternal: function _setTableModelInternal(modelJson) {
      //check whether this is a partial update
      if (this._isPartial(modelJson)) {
        //if partial append the new rows to the old model
        this._appendLocalModel(modelJson);
      } else if (this._isInitialWithPrefill(modelJson)) {
        //if initial with prefill then prefill all table data with dummy rows and replace the model
        this._prefillTableDataWithDummyRows(modelJson);

        this.setProperty("modelJson", modelJson, true); // prevent rerendering
      } else {
        // if full update then replace the whole model
        this.setProperty("modelJson", modelJson, true); // prevent rerendering
      }

      this._updateTableData(); // trigger the rendering manually

    },
    _appendLocalModel: function _appendLocalModel(newModel) {
      var curModel = this.getModelJson();

      if (curModel && newModel) {
        // remove unecessary rows if present (can happen during grid settings change)
        if (newModel.totalRowsDiff) {
          if (newModel.totalRowsDiff < 0) {
            var rowsToRemove = Math.abs(newModel.totalRowsDiff);

            for (var a = 0; a < rowsToRemove; a++) {
              curModel.rows.pop();
            }
          }
        } // append new rows to the local model


        var newRows = newModel.rows;

        if (newRows && curModel.rows) {
          newRows.forEach(function (row, i) {
            curModel.rows[row.row] = row;
          });
        } //we do not need rows anymore for the next step so delete it


        delete newModel.rows; // copy everything expect rows from new model to old model

        var newKeys = Object.keys(newModel);

        for (var i = 0; i < newKeys.length; i++) {
          var tmpKey = newKeys[i];
          curModel[tmpKey] = newModel[tmpKey];
        }
      }
    },
    _rerenderTable: function _rerenderTable() {
      // appeand the previously created container to the sapui5 custom control
      this.getDomRef().appendChild(this.m_widgetContainer); // check if the sactable library is loaded!

      this._checkReactTableAvailable(); // now adjust the table model with the actaul control sizes


      this._adjustModelWithNewTableSize(); // render table data if any present


      this._updateTableData();
    },
    _updateTableData: function _updateTableData() {
      var _this2 = this;

      // render
      var modelToRender = this.getModelJson();

      if (modelToRender) {
        this._createTableInstanceIfNeeded();

        if (this.m_sacTable) {
          if (this.m_hasNewDataToRender === true) {
            this.m_sacTable.updateTableData(modelToRender, function () {
              _this2.fireOnTableModelUpdated();

              _this2.m_hasNewDataToRender = false;
            }, this._isScrollToTop(modelToRender));

            if (this.m_sacTable.table) {
              if (this._isPartial(modelToRender)) {
                this.m_sacTable.reapplyScrollPosition();
              }
            }
          } else {
            this.m_sacTable.reapplyScrollPosition();
          }
        }
      } else {
        this._showNoDataMessage(this.getNoDataText());

        this.fireOnTableModelUpdated();
      }
    },
    _createTableInstanceIfNeeded: function _createTableInstanceIfNeeded() {
      var _this3 = this;

      if (!this.m_sacTable && this.m_widgetContainer) {
        // -----===== see TableData.ts for all possible properties and events =====-----
        var tableCallbacks = {
          onRenderComplete: function onRenderComplete() {//    console.log("finished!");
          },
          onCellSelected: function onCellSelected() {//using selection changed instead
            //    var params = {};
            //    params.selectionArea = this.m_sacTable.table.selectionArea;
            //    this.fireOnSelectionChange(params);
            //  console.log("onCellSelected");
            //  console.log(this.m_sacTable.table.selectionArea);
          },
          onUpdateNewLineMemberCell: function onUpdateNewLineMemberCell() {//  console.log("onUpdateNewLineMemberCell")
          },
          onCellMouseDown: function onCellMouseDown(params) {
            //console.log("onCellMouseDown");
            // is selectedCell missing then we probably clicked on the title, fire selectionChange event with an empty value
            if (!params.selectedCell) {
              var tmpParams = {};
              tmpParams.selectionArea = {};

              _this3.fireOnSelectionChange(tmpParams);
            } // generate cell id of clicked cell combination of button row and col


            _this3.m_clickEventId = params.event.button + params.row + params.col;
          },
          onCellMouseUp: function onCellMouseUp(params) {
            //console.log("onCellMouseUp");
            // generate cell id of released cell
            var tmpCellId = params.event.button + params.row + params.col;

            if (_this3.m_clickEventId === tmpCellId && params.event && params.event.button === 0) {
              // 0 === left click
              params.selectionArea = _this3.m_sacTable.table.selectionArea;

              _this3.fireOnCellClick(params);
            }

            _this3.m_clickEventId = null;
          },
          onContextMenu: function onContextMenu(params) {
            //    console.log("onContextMenu");
            //    console.log(params);
            _this3.fireOnCellContextMenu(params); // fire the event


            if (params && params.event) {
              params.event.preventDefault(); // prevent browser context menu
            }
          },
          onCellMouseEnter: function onCellMouseEnter() {//          console.log("onCellMouseEnter")
          },
          onCellMouseLeave: function onCellMouseLeave() {//    console.log("onCellMouseLeave")
          },
          onCellMouseOver: function onCellMouseOver() {//    console.log("onCellMouseOver")
          },
          onCellKeyDown: function onCellKeyDown() {//        console.log("onCellKeyDown")
          },
          onCellKeyUp: function onCellKeyUp() {//      console.log("onCellKeyUp")
          },
          onDrillIconClicked: function onDrillIconClicked(params) {
            //    console.log("onDrillIconClicked")
            _this3.fireOnDrillIconClick(params);
          },
          onCellEdit: function onCellEdit() {//      console.log("onCellEdit")
          },
          onSelectedRegionChanged: function onSelectedRegionChanged(params) {
            // fires twice on mouse down and on mouse up
            //this.fireOnSelectionChange(params);
            //  console.log("onSelectedRegionChanged");
            //  console.log(params);
            //  console.log(this.m_clickEventId);
            // prevent of sending the same event twice
            var curSelectionAreaSerialized = JSON.stringify(params);

            if (curSelectionAreaSerialized !== _this3.m_lastSelectionChangedAreaSerialized) {
              _this3.m_lastSelectionChangedAreaSerialized = curSelectionAreaSerialized;
              var newParams = {};
              newParams.selection = params;

              _this3.fireOnSelectionChange(newParams); //  console.log("selectionChanged " + curSelectionAreaSerialized);

            }
          },
          onCellIconClicked: function onCellIconClicked(params) {
            //  console.log("onCellIconClicked");
            //  console.log(params);
            _this3.fireOnCellIconClick(params);
          },
          onCellDropped: function onCellDropped(params) {
            //console.log("onCellDropped");
            //console.log(params);
            _this3.fireOnCellDropped(params);
          },
          onExternalElementDropped: function onExternalElementDropped(params) {
            //console.log("onExternalElementDropped");
            //console.log(params);
            _this3.fireOnExternalElementDropped(params);
          },
          onReloadLimitReachedVertically: function onReloadLimitReachedVertically(scrollTop, scrollDown) {
            //console.log(scrollTop);
            //console.log(scrollDown);
            //console.log("rows please!");
            var eventParams = {};
            eventParams.scrollTop = scrollTop;

            _this3.fireOnDataLimitReached(eventParams);

            _this3.m_hasNewDataToRender = true;

            _this3._updateTableData();
          },
          onReloadLimitReachedHorizontally: function onReloadLimitReachedHorizontally(scrollLeft, scrollRight) {
            //console.log(scrollLeft);
            //console.log(scrollRight);
            //console.log("columns please!");
            var eventParams = {};
            eventParams.scrollLeft = scrollLeft;

            _this3.fireOnDataLimitReached(eventParams);

            _this3._updateTableData();
          },
          onColumnWidthChanged: function onColumnWidthChanged(params) {
            //console.log("onColumnWidthChanged");
            //console.log(params);
            var eventParams = {};
            eventParams.newSizes = [];

            if (params && params.length > 0) {
              eventParams.newSizes = params;
            }

            _this3.fireOnColumnResize(eventParams);
          },
          onRowHeightChanged: function onRowHeightChanged(params) {
            //console.log("onRowHeightChanged");
            //console.log(params);
            var eventParams = {};
            eventParams.newSizes = [];

            if (params && params.length > 0) {
              eventParams.newSizes = params;
            }

            _this3.fireOnRowResize(eventParams);
          }
        };

        var reactTable = this._getReactTableClass();

        this.m_sacTable = new reactTable(this._getDummyTableData(), this.m_widgetContainer, tableCallbacks);
      }
    },
    // update the table model width dynamic information
    _addDynamicInfoToModelIfNeeded: function _addDynamicInfoToModelIfNeeded(tableModel) {
      if (tableModel && !tableModel.ffAdjusted) {
        //mark adjusted
        tableModel.ffAdjusted = true; //total size

        tableModel.totalHeight = tableModel.totalHeight ? tableModel.totalHeight : this._calculateTotalRowHeight(tableModel);
        tableModel.totalWidth = tableModel.totalWidth ? tableModel.totalWidth : this._calculateTotalColumnWidth(tableModel); //widget size

        tableModel.widgetHeight = this._getContainerHeight();
        tableModel.widgetWidth = this._getContainerWidth(); //id

        tableModel.id = this.getId();

        if (tableModel.title) {
          tableModel.title.tableId = this.getId();
        } //feature toggles


        if (!tableModel.featureToggles) {
          tableModel.featureToggles = {};
        }
      }

      return tableModel;
    },
    _adjustModelWithNewTableSize: function _adjustModelWithNewTableSize() {
      var tableModel = this.getModelJson();

      if (tableModel) {
        //widget size
        tableModel.widgetHeight = this._getContainerHeight();
        tableModel.widgetWidth = this._getContainerWidth();
      }
    },
    _calculateTotalRowHeight: function _calculateTotalRowHeight(tableModel) {
      var totalHeight = 0;

      if (tableModel && tableModel.rows) {
        for (var i = 0; i < tableModel.rows.length; i++) {
          var rowHeight = tableModel.rows[i].height ? tableModel.rows[i].height : 0;
          totalHeight = totalHeight + rowHeight;
        }
      }

      return totalHeight;
    },
    _calculateTotalColumnWidth: function _calculateTotalColumnWidth(tableModel) {
      var totalWidth = 0;

      if (tableModel && tableModel.columnSettings) {
        for (var i = 0; i < tableModel.columnSettings.length; i++) {
          var columnWidth = tableModel.columnSettings[i].width ? tableModel.columnSettings[i].width : 0;
          totalWidth = totalWidth + columnWidth;
        }
      }

      return totalWidth;
    },
    _showNoDataMessage: function _showNoDataMessage(message) {
      if (this.m_sacTable) {
        this.m_sacTable.removeTable();
        this.m_sacTable = null;
      } //clear all children


      this.m_widgetContainer.textContent = ""; // no data div

      var noDataDiv = document.createElement("div");
      noDataDiv.style.height = "100%";
      noDataDiv.style.display = "flex";
      noDataDiv.style.alignItems = "center";
      noDataDiv.style.justifyContent = "center";
      noDataDiv.style.fontSize = "20px";
      noDataDiv.style.fontWeight = "bold";
      noDataDiv.textContent = message;
      this.m_widgetContainer.appendChild(noDataDiv);
    },
    _getDummyTableData: function _getDummyTableData() {
      // see DefaultTableData.ts for initial model
      var initialTableModel = {
        id: "",
        widgetHeight: 0,
        widgetWidth: 0,
        classesToIgnore: [],
        showGrid: true,
        showCoordinateHeader: false,
        rows: [],
        columnSettings: [],
        totalHeight: 0,
        totalWidth: 0,
        hasFixedRowsCols: false,
        //scrollLimitVertical: 0.9,
        dataRegionStartCol: 0,
        dataRegionStartRow: 0,
        dataRegionEndCol: 0,
        dataRegionEndRow: 0,
        dataRegionCornerCol: 0,
        dataRegionCornerRow: 0,
        lastRowIndex: 0,
        dimensionCellCoordinatesInHeader: {},
        rowHeightSetting: "Compact",
        scrollPosition: {
          x: 0,
          y: 0
        }
      };
      return initialTableModel;
    },
    _prefillTableDataWithDummyRows: function _prefillTableDataWithDummyRows(tableModel) {
      if (tableModel && tableModel.rows) {
        var totalRows = tableModel.partial.totalRows;
        var rowSize = tableModel.partial.rowHeight || 0;
        var startIndex = 0;

        if (tableModel.rows.length > 0) {
          var rowCount = tableModel.rows.length;
          startIndex = tableModel.rows[rowCount - 1].row + 1;
          rowSize = rowSize === 0 ? tableModel.rows[rowCount - 1].height : rowSize;
        } // preflll a maximum of 1,1 million rows due to performance reasons


        for (var a = startIndex; a < Math.min(totalRows, 1100000); a++) {
          var dummyRow = {};
          dummyRow.height = rowSize;
          dummyRow.cells = [];
          dummyRow.row = a;
          tableModel.rows.push(dummyRow);
        }
      }
    },
    _isPartial: function _isPartial(model) {
      if (model && model.partial && model.partial === true) {
        return true;
      }

      return false;
    },
    _isInitialWithPrefill: function _isInitialWithPrefill(model) {
      if (model && model.partial && model.partial.totalRows && model.partial.rowHeight) {
        return true;
      }

      return false;
    },
    _isScrollToTop: function _isScrollToTop(model) {
      if (model && model.scrollToTop && model.scrollToTop === true) {
        model.scrollToTop = false; // after the first scroll to top, reset the property since we only want to scroll once!

        return true;
      }

      return false;
    },
    _checkReactTableAvailable: function _checkReactTableAvailable() {
      if (!window.sactable && !window.ReactTable && !window.SACGridRendering && !window.sapSacGrid) {
        throw new Error("Missing ReactTable library. Did you load the library?");
        sap.firefly.ui.Log.logError("Missing ReactTable library. Did you load the library?");
        return;
      }
    },
    _getReactTableClass: function _getReactTableClass() {
      if (!window) {
        return null;
      }

      if (window.sapSacGrid) {
        return window.sapSacGrid.ReactTable;
      }

      if (window.SACGridRendering) {
        return window.SACGridRendering.ReactTable;
      }

      if (window.ReactTable) {
        return window.ReactTable.ReactTable;
      }

      if (window.sactable) {
        return window.sactable.ReactTable;
      }

      return null;
    },
    _getContainerHeight: function _getContainerHeight(model) {
      // if we have no container size yet, use the widget container to get the size
      if (!this.m_containerSize.height || this.m_containerSize.height === 0) {
        if (this.m_widgetContainer) {
          return this.m_widgetContainer.offsetHeight;
        }
      }

      return this.m_containerSize.height - 1; // be graceful to prevent scrollbar flicker bug
    },
    _getContainerWidth: function _getContainerWidth(model) {
      // if we have no container size yet, use the widget container to get the size
      if (!this.m_containerSize.width || this.m_containerSize.width === 0) {
        if (this.m_widgetContainer) {
          return this.m_widgetContainer.offsetWidth;
        }
      }

      return this.m_containerSize.width - 1; // be graceful to prevent scrollbar flicker bug
    }
  }); // ==========================================================================
  // == CUSTOM SAPUI5 CONTROL FOR CONTENT WRAPPING, ACTS AS PROXY INTO SAPUI5
  // == very fast rendering
  // ==========================================================================

  sap.ui.core.Control.extend("sap.firefly.XtUi5ContentWrapper", {
    metadata: {
      properties: {
        "backgroundColor": "string",
        "tooltip": "string",
        "width": "sap.ui.core.CSSSize",
        "height": "sap.ui.core.CSSSize",
        "position": "string"
      },
      aggregations: {
        content: {
          type: "sap.ui.core.Control",
          multiple: true
        }
      },
      events: {
        afterRendering: {
          enablePreventDefault: true
        }
      }
    },
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        // WRAPPER start
        oRm.openStart("div", oControl); // add class

        oRm["class"]("ff-content-wrapper"); // attributes
        // tooltip

        var tooltip = oControl.getTooltip();

        if (tooltip != null) {
          oRm.attr("title", tooltip);
        } // styles
        // position (default relative)


        var position = oControl.getPosition();

        if (position != null) {
          oRm.style("position", position);
        } // width / height


        var width = oControl.getWidth();
        var height = oControl.getHeight();

        if (width != null) {
          oRm.style("width", width);
        }

        if (height != null) {
          oRm.style("height", height);
        } // background color


        var bgColor = oControl.getBackgroundColor();

        if (bgColor != null) {
          oRm.style("background-color", bgColor);
        } // close main container tag


        oRm.openEnd(); // add children (content)

        var aContent = oControl.getContent();
        aContent.forEach(function (tmpContent) {
          oRm.renderControl(tmpContent); // render the child control
        }); // WRAPPER end

        oRm.close("div");
      }
    },
    onAfterRendering: function onAfterRendering() {
      var myself = this;
      this.fireAfterRendering();
    }
  });
  sap.ui.core.Control.extend("sap.firefly.XtUi5InteractiveSplitter", {
    metadata: {
      properties: {
        orientation: {
          type: "sap.ui.core.Orientation",
          defaultValue: sap.ui.core.Orientation.Horizontal
        },
        height: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '100%'
        },
        width: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '100%'
        },
        contentState: {
          type: "object",
          defaultValue: {}
        },
        enableTabReordering: {
          type: "boolean",
          defaultValue: true
        }
      },
      aggregations: {
        items: {
          type: "sap.firefly.XtUi5InteractiveSplitterItem",
          multiple: true
        }
      },
      defaultAggregation: "items",
      events: {
        stateChange: {
          parameters: {
            newContentState: {
              type: "object"
            }
          }
        }
      }
    },
    //#############################################
    //# UI5 lifecycle methods
    //#############################################
    onBeforeRendering: function onBeforeRendering() {
      var _this4 = this;

      var oContentState = this.getContentState();
      var aItems = this.getItems(); // Do not overwrite content state if there exists only one item
      // We need the previous state to apply item positions on item re-addition

      if (aItems.length === 1) {
        var isHorizontal = this.getOrientation() === sap.ui.core.Orientation.Horizontal;
        var sPropertyName = isHorizontal ? "width" : "height";
        aItems[0].resetProperty(sPropertyName);

        if (oContentState.state && oContentState.state.length > 1) {
          // Reset width / height of every state based on splitter orientation.
          oContentState.state.forEach(function (oState) {
            return _this4._fnUpdateStateProperty(oState, sPropertyName, "");
          });
          this.fireEvent("stateChange", {
            newContentState: oContentState
          });
        }
      } else if (aItems.length > 1) {
        if (this._fnIsContentStateValid(oContentState)) {
          // Sort once before use.
          oContentState.state.sort(function (a, b) {
            return a.position - b.position;
          }); // Update items aggregation with content state information.

          oContentState.state.forEach(function (oState) {
            return _this4._fnApplyContentState(oState);
          });
        } else {
          // Generate content state for items configured with state names.
          oContentState = this._fnGenerateContentState();
        }

        this.setContentState(oContentState);
      }
    },
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        var _this5 = this;

        var isHorizontal = oControl.getOrientation() === sap.ui.core.Orientation.Horizontal;
        oRm.openStart("div", oControl)["class"]("ff-interactive-splitter-root-container").style("display", "flex").style("flex-flow", isHorizontal ? "row" : "column").style("height", oControl.getHeight()).style("width", oControl.getWidth()).openEnd();
        var aItems = oControl.getItems(); // Iterate through items aggregation and render content controls.

        aItems.forEach(function (oSplitterItem, nIndex) {
          // Copy over necessary properties for rendering the content control.
          oSplitterItem.containerIndex = nIndex;
          oSplitterItem.showDragHandle = aItems.length > 1 && oControl.getEnableTabReordering();
          oSplitterItem.orientation = oControl.getOrientation();
          oRm.renderControl(oSplitterItem);

          if (nIndex < aItems.length - 1) {
            _this5.renderGutter(oRm, oControl, nIndex);
          }
        });
        oRm.close("div"); // Root container div end
      },
      renderGutter: function renderGutter(oRm, oControl, nIndex) {
        var isHorizontal = oControl.getOrientation() === sap.ui.core.Orientation.Horizontal; //--Gutter

        oRm.openStart("div").attr("role", "separator").attr("id", oControl.getId() + "--Gutter" + nIndex).attr("data-gutter-index", nIndex).attr("aria-orientation", isHorizontal ? "vertical" : "horizontal").attr("tabindex", 0)["class"](isHorizontal ? "ff-interactive-horizontal-splitter-gutter" : "ff-interactive-vertical-splitter-gutter").openEnd(); //--Gutter handle

        oRm.openStart("div")["class"](isHorizontal ? "ff-interactive-horizontal-splitter-gutter-decoration-before" : "ff-interactive-vertical-splitter-gutter-decoration-before").openEnd().close("div");
        oRm.openStart("div")["class"](isHorizontal ? "ff-interactive-horizontal-splitter-gutter-grip" : "ff-interactive-vertical-splitter-gutter-grip").openEnd().icon(isHorizontal ? "sap-icon://vertical-grip" : "sap-icon://horizontal-grip", isHorizontal ? ["ff-interactive-horizontal-splitter-gutter-grip-icon"] : ["ff-interactive-vertical-splitter-gutter-grip-icon"]).close("div");
        oRm.openStart("div")["class"](isHorizontal ? "ff-interactive-horizontal-splitter-gutter-decoration-after" : "ff-interactive-vertical-splitter-gutter-decoration-after").openEnd().close("div"); //--Gutter handle end

        oRm.close("div"); //--Gutter end
      }
    },
    onAfterRendering: function onAfterRendering() {
      this.addInteractions();
      this.setupDragHandleOnHover();
    },
    exit: function exit() {
      this.removeInteractions();
    },
    //#############################################
    //# Item aggregation methods
    //#############################################
    addItem: function addItem(oItem) {
      return this.addAggregation("items", oItem);
    },
    insertItem: function insertItem(oItem, iIndex) {
      return this.insertAggregation("items", oItem, iIndex);
    },
    getItemById: function getItemById(sId) {
      return this.getItems().find(function (oItem) {
        return oItem.getId() === sId;
      });
    },
    swapItems: function swapItems(oItemOne, oItemTwo) {
      var aItems = this.getItems();
      var nItemOneIndex = aItems.indexOf(oItemOne);
      var nItemTwoIndex = aItems.indexOf(oItemTwo);

      if (nItemOneIndex !== -1 && nItemTwoIndex !== -1 && nItemOneIndex !== nItemTwoIndex) {
        this.removeItem(oItemOne);
        this.removeItem(oItemTwo); // Insert item with the lower index first.

        if (nItemOneIndex < nItemTwoIndex) {
          this.insertItem(oItemTwo, nItemOneIndex);
          this.insertItem(oItemOne, nItemTwoIndex);
        } else {
          this.insertItem(oItemOne, nItemTwoIndex);
          this.insertItem(oItemTwo, nItemOneIndex);
        }
      } else {
        sap.firefly.ui.Log.logDebug("Invalid item index detected. Unable to swap splitter items.");
      }
    },
    removeItem: function removeItem(oItem) {
      return this.removeAggregation("items", oItem);
    },
    clearItems: function clearItems() {
      return this.removeAllAggregation("items");
    },
    //#############################################
    //# property setter/getter methods
    //#############################################
    setContentState: function setContentState(oValue) {
      if (oValue && oValue.orientation && oValue.state) {
        this.setProperty("contentState", oValue);
      } else {
        sap.firefly.ui.Log.logDebug("Splitter content state is invalid, hence ignored.");
      }
    },
    //#############################################
    //# Delayed drag handle display on hover
    //#############################################
    setupDragHandleOnHover: function setupDragHandleOnHover() {
      var hoverDurationInMs = 800;
      $("div.ff-interactive-splitter-content-drag-handle").hover(function () {
        setTimeout(function () {
          // Check whether the hover is still valid after the specified duration
          if ($(this).is(":hover")) {
            $(this).addClass('ff-interactive-splitter-content-drag-handle-on-hover');
          }
        }.bind(this), hoverDurationInMs);
      }, function () {
        $(this).removeClass('ff-interactive-splitter-content-drag-handle-on-hover');
      });
    },
    //#############################################
    //# Event listeners
    //#############################################
    addInteractions: function addInteractions() {
      if (!window.interact) {
        sap.firefly.ui.Log.logError("Could not find interact.js library. Interaction with splitter control will not be possible!");
        return;
      }

      var aItems = this.getItems(); // Iterate through content state and set event listeners for corresponding DOM elements.

      for (var nIndex = 0; nIndex < aItems.length; nIndex++) {
        if (nIndex < aItems.length - 1) {
          /**
           * Resize of content containers in case of gutter drag.
           */
          var sGutterId = this._fnEscapeDots(this.getId()) + "--Gutter" + nIndex;
          var isHorizontal = this.getOrientation() === sap.ui.core.Orientation.Horizontal;
          var sGutterStyleClass = isHorizontal ? '.ff-interactive-horizontal-splitter-gutter' : '.ff-interactive-vertical-splitter-gutter';
          var oGutter = $("#" + sGutterId + sGutterStyleClass)[0];

          if (oGutter) {
            interact(oGutter).unset();
            interact(oGutter).draggable({
              // keep the element within the area of its parent
              modifiers: [interact.modifiers.restrictRect({
                restriction: 'parent'
              })],
              cursorChecker: function cursorChecker() {
                return isHorizontal ? 'col-resize' : 'row-resize';
              },
              autoScroll: false,
              listeners: {
                move: isHorizontal ? this._fnOnHorizontalResize.bind(this) : this._fnOnVerticalResize.bind(this),
                end: isHorizontal ? this._fnOnHorizontalResizeEnd.bind(this) : this._fnOnVerticalResizeEnd.bind(this)
              }
            });
          }
        }
        /**
         * Drag support for content to other content containers.
         */


        var oItem = aItems[nIndex];
        var oSplitterContent = $("#" + this._fnEscapeDots(oItem.getId()) + '>section.ff-interactive-splitter-content')[0];

        if (oSplitterContent) {
          interact(oSplitterContent).unset();
          interact(oSplitterContent).draggable({
            allowFrom: '.ff-interactive-splitter-content-drag-handle-on-hover',
            modifiers: [interact.modifiers.restrictRect({
              // Content move to be restricted within root container
              restriction: '.ff-interactive-splitter-root-container',
              elementRect: {
                top: 0,
                left: 0.85,
                bottom: 0.15,
                right: 0.15
              }
            })],
            autoScroll: true,
            listeners: {
              move: this.contentDragListener,
              end: function end(event) {
                var oTarget = event.target; // Reset the border

                oTarget.style.border = ""; // reset overflow:auto on parent content container

                $(oTarget).parent()[0].style.overflow = 'auto'; // reset the position within current / new content container

                oTarget.style.transform = 'translate(0)';
                oTarget.setAttribute('data-x', 0);
                oTarget.setAttribute('data-y', 0); // reset the z-index

                oTarget.style.zIndex = "0";
              }
            }
          });
        }
        /**
         * Drop support for content container to accept content and display styling.
         */


        var oSplitterItem = $("#" + this._fnEscapeDots(oItem.getId()) + ".ff-interactive-splitter-content-container")[0];

        if (oSplitterItem) {
          interact(oSplitterItem).unset();
          interact(oSplitterItem).dropzone({
            // only accept content elements from the current control for drop
            accept: 'div[id="' + this.getId() + '"]>div>.ff-interactive-splitter-content',
            // Just the mouse pointer needs to overlap the drop zone
            overlap: 'pointer',
            ondropactivate: function ondropactivate(event) {
              // add active dropzone borders
              event.target.classList.add('ff-interactive-splitter-content-container-drop-active');
            },
            ondropdeactivate: function ondropdeactivate(event) {
              // remove active dropzone borders and background color on content container
              event.target.classList.remove('ff-interactive-splitter-content-container-drop-active');
              event.target.classList.remove('ff-interactive-splitter-content-container-drop-target');
            },
            ondragenter: function ondragenter(event) {
              // show the possibility of a drop with a background color on content container
              event.target.classList.add('ff-interactive-splitter-content-container-drop-target');
            },
            ondragleave: function ondragleave(event) {
              // restore default background color
              event.target.classList.remove('ff-interactive-splitter-content-container-drop-target');
            },
            ondrop: this.contentDropListener.bind(this)
          });
        }
      }
    },
    removeInteractions: function removeInteractions() {
      if (!interact) {
        sap.firefly.ui.Log.logError("Could not find interact.js library. Interaction with splitter control will be not possible!");
        return;
      }

      var aItems = this.getItems();

      for (var nIndex = 0; nIndex < aItems.length; nIndex++) {
        if (nIndex < aItems.length - 1) {
          // Remove resize relevant interact.js event listeners
          var sGutterId = this._fnEscapeDots(this.getId()) + "--Gutter" + nIndex;
          var sGutterStyleClass = this.getOrientation() === sap.ui.core.Orientation.Horizontal ? '.ff-interactive-horizontal-splitter-gutter' : '.ff-interactive-vertical-splitter-gutter';
          var oGutter = $("#" + sGutterId + sGutterStyleClass)[0];

          if (oGutter) {
            interact(oGutter).unset();
          }
        } // Remove drag and drop relevant interact.js event listeners


        var sItemId = this._fnEscapeDots(aItems[nIndex].getId());

        var oSplitterContent = $("#" + sItemId + '>section.ff-interactive-splitter-content')[0];

        if (oSplitterContent) {
          interact(oSplitterContent).unset();
        }

        var oSplitterItem = $("#" + sItemId + ".ff-interactive-splitter-content-container")[0];

        if (oSplitterItem) {
          interact(oSplitterItem).unset();
        }
      }
    },
    _fnFireResizeEvents: function _fnFireResizeEvents(aContentContainers) {
      if (aContentContainers && aContentContainers.length) {
        var aItems = this.getItems();
        aContentContainers.forEach(function (oContentContainer) {
          var oSplitterItem = aItems.find(function (item) {
            return item.getId() === oContentContainer.id;
          });

          if (oSplitterItem) {
            oSplitterItem.fireEvent("resize", {
              size: {
                width: oContentContainer.style.width,
                height: oContentContainer.style.height
              }
            });
          }
        });
      }
    },

    /**
     * Event handler for horizontal content resize by gutter drag
     * @param {object} event The gutter move event
     */
    _fnOnHorizontalResize: function _fnOnHorizontalResize(event) {
      var oTarget = event.target;

      var nChangeInX = this._fnConvertWidthToPercentage(event.dx);

      var nGutterIndex = parseInt(oTarget.getAttribute("data-gutter-index"));

      var aContainers = this._fnGetAdjacentContainers(nGutterIndex);

      if (!aContainers) {
        return;
      }

      var _aContainers = _slicedToArray(aContainers, 2),
          oLeftContentContainer = _aContainers[0],
          oRightContentContainer = _aContainers[1]; // Compute new widths


      var nLeftContentWidth = this._fnTrimPercentage(this._fnGetDomElementWidth(oLeftContentContainer));

      var nNewLeftWidth = parseFloat((nLeftContentWidth + nChangeInX).toFixed(2));

      var nLeftMinWidth = this._fnConvertWidthToPercentage(oLeftContentContainer.style.minWidth);

      var nLeftMaxWidth = this._fnConvertWidthToPercentage(oLeftContentContainer.style.maxWidth);

      var nRightContentWidth = this._fnTrimPercentage(this._fnGetDomElementWidth(oRightContentContainer));

      var nNewRightWidth = parseFloat((nRightContentWidth - nChangeInX).toFixed(2));

      var nRightMinWidth = this._fnConvertWidthToPercentage(oRightContentContainer.style.minWidth);

      var nRightMaxWidth = this._fnConvertWidthToPercentage(oRightContentContainer.style.maxWidth); // Update widths only if they are within the min and max widths of the container


      if (nNewLeftWidth >= nLeftMinWidth && nNewLeftWidth <= nLeftMaxWidth && nNewRightWidth >= nRightMinWidth && nNewRightWidth <= nRightMaxWidth) {
        oLeftContentContainer.style.width = nNewLeftWidth + '%';
        oRightContentContainer.style.width = nNewRightWidth + '%'; // translate the gutter element

        oTarget.style.transform = 'translate(' + nChangeInX + '%, 0%)';
      }
    },

    /**
     * Event handler for vertical content resize by gutter drag
     * @param {object} event The gutter move event
     */
    _fnOnVerticalResize: function _fnOnVerticalResize(event) {
      var oTarget = event.target;

      var nChangeInY = this._fnConvertHeightToPercentage(event.dy);

      var nGutterIndex = parseInt(oTarget.getAttribute("data-gutter-index"));

      var aContainers = this._fnGetAdjacentContainers(nGutterIndex);

      if (!aContainers) {
        return;
      }

      var _aContainers2 = _slicedToArray(aContainers, 2),
          oTopContentContainer = _aContainers2[0],
          oBottomContentContainer = _aContainers2[1]; // Compute new heights


      var nTopContentHeight = this._fnTrimPercentage(this._fnGetDomElementHeight(oTopContentContainer));

      var nNewTopHeight = parseFloat((nTopContentHeight + nChangeInY).toFixed(2));

      var nTopMinHeight = this._fnConvertHeightToPercentage(oTopContentContainer.style.minHeight);

      var nTopMaxHeight = this._fnConvertHeightToPercentage(oTopContentContainer.style.maxHeight);

      var nBottomContentHeight = this._fnTrimPercentage(this._fnGetDomElementHeight(oBottomContentContainer));

      var nNewBottomHeight = parseFloat((nBottomContentHeight - nChangeInY).toFixed(2));

      var nBottomMinHeight = this._fnConvertHeightToPercentage(oBottomContentContainer.style.minHeight);

      var nBottomMaxHeight = this._fnConvertHeightToPercentage(oBottomContentContainer.style.maxHeight); // Update height only if they are within the min and max height of the container


      if (nNewTopHeight >= nTopMinHeight && nNewTopHeight <= nTopMaxHeight && nNewBottomHeight >= nBottomMinHeight && nNewBottomHeight <= nBottomMaxHeight) {
        oTopContentContainer.style.height = nNewTopHeight + '%';
        oBottomContentContainer.style.height = nNewBottomHeight + '%'; // translate the gutter element

        oTarget.style.transform = 'translate(0%,' + nChangeInY + '%)';
      }
    },
    _fnOnResizeEnd: function _fnOnResizeEnd(oTarget, sPropertyName) {
      var nGutterIndex = parseInt(oTarget.getAttribute("data-gutter-index"));

      var aContainers = this._fnGetAdjacentContainers(nGutterIndex);

      if (!aContainers) {
        return;
      }

      var _aContainers3 = _slicedToArray(aContainers, 2),
          oContainer1 = _aContainers3[0],
          oContainer2 = _aContainers3[1]; // Update UI5 properties (makes it slow if done during drag operation)


      var oSplitterItem1 = this.getItemById(oContainer1.id);
      oSplitterItem1.setProperty(sPropertyName, oContainer1.style[sPropertyName]);
      var oSplitterItem2 = this.getItemById(oContainer2.id);
      oSplitterItem2.setProperty(sPropertyName, oContainer2.style[sPropertyName]); // Update content state

      var bItem1StateModified = this._fnUpdateContentState(oSplitterItem1, sPropertyName, oContainer1.style[sPropertyName]);

      var bItem2StateModified = this._fnUpdateContentState(oSplitterItem2, sPropertyName, oContainer2.style[sPropertyName]);

      if (bItem1StateModified || bItem2StateModified) {
        // Fire the stateChange event for tracking the new property values
        this._fnFireStateChangeEvent();
      } // Fire resize events on the splitter items


      this._fnFireResizeEvents([oContainer1, oContainer2]);
    },
    _fnOnHorizontalResizeEnd: function _fnOnHorizontalResizeEnd(event) {
      this._fnOnResizeEnd(event.target, "width");
    },
    _fnOnVerticalResizeEnd: function _fnOnVerticalResizeEnd(event) {
      this._fnOnResizeEnd(event.target, "height");
    },

    /**
     * Event handler for drag of content from its initial position
     * @param {object} event The content move event
     */
    contentDragListener: function contentDragListener(event) {
      var oTarget = event.target; // Set a 1px border around the content

      oTarget.style.borderWidth = "1px";
      oTarget.style.borderStyle = "solid";
      oTarget.style.borderColor = "rgb(203, 194, 194)"; // Disable overflow:auto on parent content container to allow drag across containers.

      $(oTarget).parent()[0].style.overflow = ''; // keep the dragged position in the data-x/data-y attributes

      var x = (parseFloat(oTarget.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(oTarget.getAttribute('data-y')) || 0) + event.dy; // translate the element

      oTarget.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; // update the position attributes

      oTarget.setAttribute('data-x', x);
      oTarget.setAttribute('data-y', y); // set a higher z-index to be visible above other controls during drag

      oTarget.style.zIndex = "2";
    },

    /**
     * Event handler for drop of content into a content container
     * @param {object} event The content drop event
     */
    contentDropListener: function contentDropListener(event) {
      var oSourceContent = event.relatedTarget;
      var oSourceContainer = $(oSourceContent).parent()[0];
      var nSourceIndex = parseInt(oSourceContainer.getAttribute("data-container-index"));
      var oSourceSplitterItem = this.getItemById(oSourceContainer.id);
      var oTargetContainer = event.target;
      var nTargetIndex = parseInt(oTargetContainer.getAttribute("data-container-index"));
      var oTargetSplitterItem = this.getItemById(oTargetContainer.id); // Reset background

      event.target.classList.remove('ff-interactive-splitter-content-container-drop-target');

      if (oSourceSplitterItem && oTargetSplitterItem && oSourceSplitterItem !== oTargetSplitterItem) {
        this.swapItems(oSourceSplitterItem, oTargetSplitterItem); // Update content state

        var sPropertyName = "position";

        var bTargetStateModified = this._fnUpdateContentState(oTargetSplitterItem, sPropertyName, nSourceIndex);

        var bSourceStateModified = this._fnUpdateContentState(oSourceSplitterItem, sPropertyName, nTargetIndex);

        if (bTargetStateModified || bSourceStateModified) {
          // Fire the stateChange event for tracking the new positions
          this._fnFireStateChangeEvent();
        }
      } // On drop, remove the on-hover drag handle and setup for next time (needed as hover is not fired without redefinition)


      $('div.ff-interactive-splitter-content-drag-handle.ff-interactive-splitter-content-drag-handle-on-hover').removeClass('ff-interactive-splitter-content-drag-handle-on-hover');
      this.setupDragHandleOnHover();
    },
    //#############################################
    //# Content container helper functions
    //#############################################
    _fnCalculateContainerWidth: function _fnCalculateContainerWidth(sWidth) {
      if (sWidth) {
        return this._fnConvertWidthToPercentage(sWidth) + "%";
      }

      return ""; // Do not provide a default width if not available.
    },
    _fnCalculateContainerHeight: function _fnCalculateContainerHeight(sHeight) {
      if (sHeight) {
        return this._fnConvertHeightToPercentage(sHeight) + "%";
      }

      return ""; // Do not provide a default height if not available.
    },
    _fnGetAdjacentContainers: function _fnGetAdjacentContainers(nIndex) {
      var oRootContainer = $("#" + this._fnEscapeDots(this.getId()));
      var oContainer1 = oRootContainer.find('div[data-container-index=' + nIndex + ']')[0];
      var nIndex2 = nIndex + 1;
      var oContainer2 = oRootContainer.find('div[data-container-index=' + nIndex2 + ']')[0];

      if (!oContainer1 || !oContainer2) {
        sap.firefly.ui.Log.logDebug("Unable to determine contents for resize.");
        return null;
      }

      return [oContainer1, oContainer2];
    },
    //#############################################
    //# JQuery getters
    //#############################################
    _fnGetDomElementWidth: function _fnGetDomElementWidth(oControl) {
      if (oControl) {
        var sWidth = oControl.style && oControl.style.width ? oControl.style.width : $(oControl)[0].offsetWidth;
        return this._fnConvertWidthToPercentage(sWidth) + "%";
      }

      return "0%";
    },
    _fnGetDomElementHeight: function _fnGetDomElementHeight(oControl) {
      if (oControl) {
        var sHeight = oControl.style && oControl.style.height ? oControl.style.height : $(oControl)[0].offsetHeight;
        return this._fnConvertHeightToPercentage(sHeight) + "%";
      }

      return "0%";
    },
    //#############################################
    //# State management functions
    //#############################################
    _fnIsContentStateValid: function _fnIsContentStateValid(oContentState) {
      var aItems = this.getItems();
      var bIsValid = !!oContentState && !!aItems && !!oContentState.state && oContentState.numberOfViews === aItems.length && oContentState.orientation === this.getOrientation();

      if (bIsValid) {
        // Check whether every entry in the content state corresponds to a splitter item and its position is within the size of the items aggregation
        bIsValid = oContentState.state.every(function (oState) {
          return aItems.find(function (oItem) {
            return oItem.getStateName() === oState.tag;
          }) && oState.position < aItems.length;
        });
      }

      return bIsValid;
    },
    _fnGenerateContentState: function _fnGenerateContentState() {
      var _this6 = this;

      var aStates = [];
      var aItems = this.getItems();
      aItems.forEach(function (oItem, nIndex) {
        var sStateName = oItem.getStateName();

        if (sStateName) {
          aStates.push({
            tag: sStateName,
            position: nIndex,
            width: _this6._fnCalculateContainerWidth(oItem.getWidth()),
            height: _this6._fnCalculateContainerHeight(oItem.getHeight())
          });
        }
      });
      return {
        orientation: this.getOrientation(),
        numberOfViews: aItems.length,
        state: aStates
      };
    },
    _fnApplyContentState: function _fnApplyContentState(oState) {
      if (!oState) {
        sap.firefly.ui.Log.logDebug("Cannot apply empty content state. ");
        return;
      }

      var aItems = this.getItems();
      var oItem = aItems.find(function (oItem) {
        return oItem.getStateName() === oState.tag;
      });

      if (!oItem) {
        sap.firefly.ui.Log.logDebug("Unable to retrieve splitter item with state name : ".concat(oState.tag, "."));
        return;
      }

      if (oState.width) {
        oItem.setWidth(oState.width);
      }

      if (oState.height) {
        oItem.setHeight(oState.height);
      }

      if (aItems.indexOf(oItem) !== oState.position) {
        this.removeItem(oItem);
        this.insertItem(oItem, oState.position);
      }
    },
    _fnUpdateStateProperty: function _fnUpdateStateProperty(oState, sPropertyKey, sNewValue) {
      var bStateModified = !!oState && oState.hasOwnProperty(sPropertyKey);

      if (bStateModified) {
        oState[sPropertyKey] = sNewValue;
      } else {
        sap.firefly.ui.Log.logDebug("Cannot update value for unknown property : ".concat(sPropertyKey, " of content state."));
      }

      return bStateModified;
    },
    _fnUpdateContentState: function _fnUpdateContentState(oItem, sPropertyKey, sNewValue) {
      var bContentStateModified = false;
      var oContentState = this.getContentState();
      var sStateName = !!oItem && oItem.getStateName();

      if (sStateName) {
        var oState = oContentState.state.find(function (oControlData) {
          return oControlData.tag === sStateName;
        });
        bContentStateModified = this._fnUpdateStateProperty(oState, sPropertyKey, sNewValue);
      }

      return bContentStateModified;
    },
    _fnFireStateChangeEvent: function _fnFireStateChangeEvent() {
      var oContentState = this.getContentState();
      this.fireEvent("stateChange", {
        newContentState: oContentState
      });
    },
    //#############################################
    //# Utility functions
    //#############################################
    _fnTrimPercentage: function _fnTrimPercentage(sValue) {
      return parseFloat(sValue.replace(/[% ]/g, ''));
    },
    _fnTrimPx: function _fnTrimPx(sValue) {
      var nReturnValue = 0;

      if (sValue) {
        if (sValue.endsWith("px")) {
          sValue = sValue.substring(0, sValue.length - 2);
        }

        sValue = parseInt(sValue);

        if (!isNaN(sValue)) {
          nReturnValue = sValue;
        }
      }

      return nReturnValue;
    },
    _fnConvertWidthToPercentage: function _fnConvertWidthToPercentage(sValue) {
      var fValue;

      if (!isNaN(sValue)) {
        fValue = sValue;
      } else {
        if (sValue) {
          if (sValue.endsWith("%")) {
            return this._fnTrimPercentage(sValue);
          } else if (sValue.endsWith("px")) {
            fValue = this._fnTrimPx(sValue);
          }
        } else {
          return 0;
        }
      }

      var oDomRef = this.getDomRef();
      var nTotalWidth = oDomRef ? oDomRef.offsetWidth : window.innerWidth;
      return parseFloat((fValue * 100 / nTotalWidth).toFixed(2));
    },
    _fnConvertHeightToPercentage: function _fnConvertHeightToPercentage(sValue) {
      var fValue;

      if (!isNaN(sValue)) {
        fValue = sValue;
      } else {
        if (sValue) {
          if (sValue.endsWith("%")) {
            return this._fnTrimPercentage(sValue);
          } else if (sValue.endsWith("px")) {
            fValue = this._fnTrimPx(sValue);
          }
        } else {
          return 0;
        }
      }

      var oDomRef = this.getDomRef();
      var nTotalHeight = oDomRef ? oDomRef.offsetHeight : window.innerHeight;
      return parseFloat((fValue * 100 / nTotalHeight).toFixed(2));
    },
    _fnEscapeDots: function _fnEscapeDots(sControlId) {
      return sControlId ? sControlId.replace(/\./g, '\\.') : "";
    }
  });
  sap.ui.core.Control.extend("sap.firefly.XtUi5InteractiveSplitterItem", {
    metadata: {
      properties: {
        height: {
          type: "sap.ui.core.CSSSize"
        },
        minHeight: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '0%'
        },
        maxHeight: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '100%'
        },
        width: {
          type: "sap.ui.core.CSSSize"
        },
        minWidth: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '0%'
        },
        maxWidth: {
          type: "sap.ui.core.CSSSize",
          defaultValue: '100%'
        },
        stateName: {
          type: "string"
        }
      },
      aggregations: {
        content: {
          type: "sap.ui.core.Control",
          multiple: false
        }
      },
      defaultAggregation: "content",
      events: {
        resize: {
          parameters: {
            size: {
              width: "sap.ui.core.CSSSize",
              height: "sap.ui.core.CSSSize"
            }
          }
        }
      }
    },
    //#############################################
    //# UI5 lifecycle methods
    //#############################################
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        // Create content container for each content
        //--Content container will act as a drop target for contents
        oRm.openStart("div", oControl).attr("data-container-index", oControl.containerIndex).style("overflow", "auto")["class"]("ff-interactive-splitter-content-container");

        if (oControl.orientation === sap.ui.core.Orientation.Horizontal) {
          oRm["class"]("ff-interactive-horizontal-splitter-content-container").style("height", oControl.getHeight()).style("min-width", oControl.getMinWidth()).style("max-width", oControl.getMaxWidth());
          var oWidth = oControl.getWidth();

          if (oWidth) {
            oRm.style("flex", "0 0 auto");
            oRm.style("width", oWidth);
          } else {
            oRm.style("flex", "auto");
          }
        } else if (oControl.orientation === sap.ui.core.Orientation.Vertical) {
          oRm["class"]("ff-interactive-vertical-splitter-content-container").style("width", oControl.getWidth()).style("min-height", oControl.getMinHeight()).style("max-height", oControl.getMaxHeight());
          var oHeight = oControl.getHeight();

          if (oHeight) {
            oRm.style("flex", "0 0 auto");
            oRm.style("height", oHeight);
          } else {
            oRm.style("flex", "auto");
          }
        } else {
          sap.firefly.ui.Log.logError("Could not retrieve orientation of splitter item!");
        }

        oRm.openEnd();
        var oContentControl = oControl.getContent();
        this.renderContent(oRm, oControl, oContentControl);
        oRm.close("div"); //--End of Content container
      },
      renderContent: function renderContent(oRm, oControl, oContentControl) {
        oRm.openStart("section")["class"]("ff-interactive-splitter-content").openEnd();

        if (oControl.showDragHandle) {
          this.renderContentDragHandle(oRm); //--Content drag handle
        }

        oRm.renderControl(oContentControl) // Render the child control
        .close("section");
      },
      renderContentDragHandle: function renderContentDragHandle(oRm) {
        oRm.openStart("div")["class"]("ff-interactive-splitter-content-drag-handle").attr("draggable", "true").openEnd().text("• • •").close("div");
      }
    },
    //#############################################
    //# Content aggregation methods
    //#############################################
    addContent: function addContent(oContent) {
      return this.setAggregation("content", oContent);
    },
    removeContent: function removeContent() {
      return this.removeAggregation("content");
    }
  });

  sap.firefly.UxGeneric = function () {
    sap.firefly.DfUiContext.call(this);
    this._ff_c = "UxGeneric"; // variables

    this.m_nativeControl = null;
    this.m_propertyFunctions = null;
    this.m_dragInfo = null; // a control can have both drag info and drop info and they are in the same aggregation so keep track of them

    this.m_dropInfo = null;
  };

  sap.firefly.UxGeneric.prototype = new sap.firefly.DfUiContext();

  sap.firefly.UxGeneric.linkFfAndUi5Controls = function (nativeUi5Control, ffControl) {
    // link the ff control and the uicontrol usng the data "ffItem" property
    if (nativeUi5Control && ffControl) {
      nativeUi5Control.data("ffItem", ffControl);
    }
  };

  sap.firefly.UxGeneric.getUxControl = function (nativeControl) {
    // get the firefly ux control which is stored on the native control as a property
    if (nativeControl) {
      return nativeControl.data("ffItem");
    }

    return null;
  };

  sap.firefly.UxGeneric.getUi5IconUri = function (icon) {
    if (icon) {
      // make sure the icon is an sapui5 icon uri
      if (!sap.ui.core.IconPool.isIconURI(icon)) {
        icon = "sap-icon://" + icon;
      } //make sure the icon actaully exists


      var iconUri = sap.ui.core.IconPool.getIconURI(icon);

      if (!iconUri) {
        iconUri = icon;
      }

      return iconUri;
    }

    return icon;
  }; // ********************************************
  // *** protocol *******************************
  // ********************************************


  sap.firefly.UxGeneric.prototype.initializeNative = function () {
    sap.firefly.ui.Log.logDebug("[CREATE CONTROL] " + this.getId() + " | initializing control of type " + this.getUiType().getName(), sap.firefly.ui.Log.Colors.BLUE);
    sap.firefly.DfUiContext.prototype.initializeNative.call(this);
  };

  sap.firefly.UxGeneric.prototype.releaseObject = function () {
    sap.firefly.ui.Log.logDebug("[RELEASE CONTROL] " + this.getId() + " | destroying control!", sap.firefly.ui.Log.Colors.RED);
    sap.firefly.DfUiContext.prototype.releaseObject.call(this); // remove all browser events, those are not automatically removed

    this.detachAllBrowserEvents(); // destroy the native control and remove reference

    if (this.m_nativeControl && this.m_nativeControl.destroy !== null) {
      this.m_nativeControl.destroy();
    }

    this.m_nativeControl = null;
  };

  sap.firefly.UxGeneric.prototype.getNativeControl = function () {
    return this.m_nativeControl;
  };

  sap.firefly.UxGeneric.prototype.getJQueryObject = function () {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return $(this.getNativeControl().getDomRef());
    }

    return $();
  };

  sap.firefly.UxGeneric.prototype.getJQueryObject = function () {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return $(this.getNativeControl().getDomRef());
    }

    return $();
  }; // ********************************************
  // *** control helpers ************************
  // ********************************************


  sap.firefly.UxGeneric.prototype.setNativeControl = function (nativeControl) {
    this.m_nativeControl = nativeControl;

    if (nativeControl !== null) {
      // save the firefly ux item on the native ui5 control as reference
      sap.firefly.UxGeneric.linkFfAndUi5Controls(nativeControl, this); // adjust the busy indicator delay

      if (nativeControl.setBusyIndicatorDelay !== undefined) {
        nativeControl.setBusyIndicatorDelay(10); // default is 1000, set it to lower value
      } // apply a custom firefly css class to each control
      //  this._applyFireflyCssClass(nativeControl); //TODO: is the way to generate the css class efficient?
      // apply the content density classes from ui5, for mobile or desktop, depending on the browser


      this.applyContentDensity(nativeControl); // reset the property functions list

      this.m_propertyFunctions = {}; // register for the on after rendering event

      nativeControl.addDelegate({
        onAfterRendering: this.onAfterControlRendering.bind(this)
      });
    }
  }; //apply content density based on the style class desktop/mobile


  sap.firefly.UxGeneric.prototype.applyContentDensity = function (nativeControl) {
    if (nativeControl && nativeControl.addStyleClass !== undefined) {
      if (this.getUiStyleClass().isTypeOf(sap.firefly.UiStyleClass.DESKTOP)) {
        nativeControl.addStyleClass("sapUiSizeCompact");
        nativeControl.removeStyleClass("sapUiSizeCozy");
      } else {
        nativeControl.addStyleClass("sapUiSizeCozy");
        nativeControl.removeStyleClass("sapUiSizeCompact");
      }
    }
  }; //try to set the specified property value on the native control if it exists


  sap.firefly.UxGeneric.prototype.setProperty = function (property, value) {
    var setter = "set" + property.charAt(0).toUpperCase() + property.slice(1);

    if (this.m_nativeControl && typeof this.m_nativeControl[setter] == "function") {
      this.m_nativeControl[setter](value);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.rerenderNativeControl = function () {
    if (this.getNativeControl() && this.getNativeControl().invalidate) {
      this.getNativeControl().invalidate();
    }
  };

  sap.firefly.UxGeneric.prototype.getNativeDropInfo = function () {
    return this.m_dropInfo;
  };

  sap.firefly.UxGeneric.prototype.getNativeDragInfo = function () {
    return this.m_dragInfo;
  }; //apply custom firefly css class

  /*
  TODO: WIP, find most efficient way to generate the class name
  sap.firefly.UxGeneric.prototype._applyFireflyCssClass = function(nativeControl) {
    if (nativeControl && nativeControl.addStyleClass !== undefined) {
      const controlType = this.getUiType().getName();
      let controlTypeKebapCase = controlType.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(); // convert to kebap case
      controlTypeKebapCase = `ff-${controlTypeKebapCase}`; // add ff- prefix
      nativeControl.addStyleClass(controlTypeKebapCase);
    }
  };
  */
  // =======================================================


  sap.firefly.UxGeneric.prototype.onAfterControlRendering = function () {
    var element = this.getNativeControl().getDomRef();
    this.applyCustomCssStyling(element);
    this.applyCustomAttributes(element);
    this.applyCustomCssProperties(element);
  };

  sap.firefly.UxGeneric.prototype.applyCustomCssStyling = function () {// implemented by child controls if styling modification is necessary
  };

  sap.firefly.UxGeneric.prototype.applyCustomAttributes = function () {// implemented by child controls if attribute modification is necessary
  };

  sap.firefly.UxGeneric.prototype.applyCustomCssProperties = function () {
    // should not be overriden by child controls, override property specific  methods instead
    // loop through all the set property functions and call them
    if (this.m_propertyFunctions) {
      var propFnNames = Object.keys(this.m_propertyFunctions);
      var propFnsLength = propFnNames.length;

      for (var i = 0; i < propFnsLength; i++) {
        var propName = propFnNames[i];
        var propFn = this.m_propertyFunctions[propName].propFn;
        var cssValue = this.m_propertyFunctions[propName].cssValue;

        this._runPropFunction(propFn, cssValue);
      }
    }
  }; // =======================================================
  // ********************************************
  // *** Event overrides ************************
  // ********************************************
  //TODO: only on button right now for testing!

  /*
  sap.firefly.UxGeneric.prototype.registerOnPress = function(listener) {
    sap.firefly.DfUiContext.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().attachPress( this.handlePress.bind(this));
    return this;
  };
  */


  sap.firefly.UxGeneric.prototype.registerOnContextMenu = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnContextMenu.call(this, listener);
    this.getNativeControl().oncontextmenu = null;

    if (listener) {
      this.getNativeControl().oncontextmenu = this.handleContextMenu.bind(this);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnHover = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnHover.call(this, listener);
    this.getNativeControl().detachBrowserEvent("mouseenter", this.handleHover, this);

    if (listener) {
      this.getNativeControl().attachBrowserEvent("mouseenter", this.handleHover, this);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnHoverEnd = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnHoverEnd.call(this, listener);
    this.getNativeControl().detachBrowserEvent("mouseleave", this.handleHoverEnd, this);

    if (listener) {
      this.getNativeControl().attachBrowserEvent("mouseleave", this.handleHoverEnd, this);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnKeyDown = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnKeyDown.call(this, listener);
    this.getNativeControl().detachBrowserEvent("keydown", this.handleKeyDown, this);

    if (listener) {
      this.getNativeControl().attachBrowserEvent("keydown", this.handleKeyDown, this);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnKeyUp = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnKeyUp.call(this, listener);
    this.getNativeControl().detachBrowserEvent("keyup", this.handleKeyUp, this);

    if (listener) {
      this.getNativeControl().attachBrowserEvent("keyup", this.handleKeyUp, this);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnFileDrop = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnFileDrop.call(this, listener);

    this._addFileDropHandling();

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnDrop = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnDrop.call(this, listener);

    this._addControlDropHandling();

    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnDragStart = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnDragStart.call(this, listener);
    return this;
  };

  sap.firefly.UxGeneric.prototype.registerOnDragEnd = function (listener) {
    sap.firefly.DfUiContext.prototype.registerOnDragEnd.call(this, listener);
    return this;
  }; // ********************************************
  // *** Generic Event handlers *****************
  // ********************************************


  sap.firefly.UxGeneric.prototype.handlePress = function (oEvent, parameters) {
    if (this.getListenerOnPress() !== null) {
      this.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(this, parameters));
    }
  };

  sap.firefly.UxGeneric.prototype.handleClick = function (oEvent, parameters) {
    if (this.getListenerOnClick() !== null) {
      oEvent.stopPropagation(); // if two elements overlap only fire the event on the top most one!

      var newParameters = parameters || sap.firefly.XProperties.create();

      if (oEvent && oEvent.clientX && oEvent.clientY) {
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_X, oEvent.clientX);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_Y, oEvent.clientY);
      }

      this.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(this, parameters));
    }
  };

  sap.firefly.UxGeneric.prototype.handleContextMenu = function (oEvent, parameters) {
    if (this.getListenerOnContextMenu() !== null) {
      oEvent.preventDefault(); // prevent opening the browser context menu

      oEvent.stopPropagation(); // if two elements overlap only fire the event on the top most one!

      var newParameters = parameters || sap.firefly.XProperties.create();

      if (oEvent && oEvent.clientX && oEvent.clientY) {
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_X, oEvent.clientX);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_Y, oEvent.clientY);
      }

      this.getListenerOnContextMenu().onContextMenu(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  };

  sap.firefly.UxGeneric.prototype.handleHover = function (oEvent, parameters) {
    if (this.getListenerOnHover() !== null) {
      this.getListenerOnHover().onHover(sap.firefly.UiControlEvent.create(this, parameters));
    }
  };

  sap.firefly.UxGeneric.prototype.handleHoverEnd = function (oEvent, parameters) {
    if (this.getListenerOnHoverEnd() !== null) {
      this.getListenerOnHoverEnd().onHoverEnd(sap.firefly.UiControlEvent.create(this, parameters));
    }
  };

  sap.firefly.UxGeneric.prototype.handleKeyDown = function (oEvent, parameters) {
    if (this.getListenerOnKeyDown() !== null) {
      this.getListenerOnKeyDown().onKeyDown(this._createKeyBoardEventFromJsEvent(oEvent));
    }
  };

  sap.firefly.UxGeneric.prototype.handleKeyUp = function (oEvent, parameters) {
    if (this.getListenerOnKeyUp() !== null) {
      this.getListenerOnKeyUp().onKeyUp(this._createKeyBoardEventFromJsEvent(oEvent));
    }
  };

  sap.firefly.UxGeneric.prototype.handleValueHelpRequest = function (oEvent, parameters) {
    if (this.getListenerOnValueHelpRequest() !== null) {
      var isFromSuggestion = oEvent.getParameters().fromSuggestions;

      if (!isFromSuggestion) {
        this.getListenerOnValueHelpRequest().onValueHelpRequest(sap.firefly.UiControlEvent.create(this, parameters));
      }
    }
  }; // ********************************************
  // ************* Event helpers ****************
  // ********************************************


  sap.firefly.UxGeneric.prototype.detachAllBrowserEvents = function () {
    if (this.getNativeControl() && this.getNativeControl().detachBrowserEvent) {
      this.getNativeControl().detachBrowserEvent("mouseenter", this.handleHover, this);
      this.getNativeControl().detachBrowserEvent("mouseleave", this.handleHoverEnd, this);
      this.getNativeControl().detachBrowserEvent("keydown", this.handleKeyDown, this);
      this.getNativeControl().detachBrowserEvent("keyup", this.handleKeyUp, this);
    }
  };

  sap.firefly.UxGeneric.prototype._createKeyBoardEventFromJsEvent = function (oEvent) {
    var newKeyboardEvent = sap.firefly.UiKeyboardEvent.create(this);

    if (oEvent) {
      newKeyboardEvent.setKeyboardData(oEvent.altKey, oEvent.ctrlKey, oEvent.metaKey, oEvent.shiftKey, oEvent.originalEvent.repeat, oEvent.code, oEvent.key);
    }

    return newKeyboardEvent;
  }; // ********************************************
  // *** Properties *****************************
  // ********************************************


  sap.firefly.UxGeneric.prototype.getTooltip = function () {
    return sap.firefly.DfUiContext.prototype.getTooltip.call(this);
  };

  sap.firefly.UxGeneric.prototype.setTooltip = function (value) {
    sap.firefly.DfUiContext.prototype.setTooltip.call(this, value); // since ui5 only accepts a string as tooltip or an configurable object inheriting from sap.ui.core.TooltipBase
    // make sure the value is either a string or null/undefined

    if (value !== null && value !== undefined) value = value.toString();
    this.setProperty("tooltip", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getText = function () {
    return sap.firefly.DfUiContext.prototype.getText.call(this);
  };

  sap.firefly.UxGeneric.prototype.setText = function (value) {
    sap.firefly.DfUiContext.prototype.setText.call(this, value);
    this.setProperty("text", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getDescription = function () {
    return sap.firefly.DfUiContext.prototype.getDescription.call(this);
  };

  sap.firefly.UxGeneric.prototype.setDescription = function (value) {
    sap.firefly.DfUiContext.prototype.setDescription.call(this, value);
    this.setProperty("description", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getTitle = function () {
    return sap.firefly.DfUiContext.prototype.getTitle.call(this);
  };

  sap.firefly.UxGeneric.prototype.setTitle = function (value) {
    sap.firefly.DfUiContext.prototype.setTitle.call(this, value);
    this.setProperty("title", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getIcon = function () {
    return sap.firefly.DfUiContext.prototype.getIcon.call(this);
  };

  sap.firefly.UxGeneric.prototype.setIcon = function (value) {
    sap.firefly.DfUiContext.prototype.setIcon.call(this, value);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(value);
    this.setProperty("icon", iconUri);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getActiveIcon = function () {
    return sap.firefly.DfUiContext.prototype.getActiveIcon.call(this);
  };

  sap.firefly.UxGeneric.prototype.setActiveIcon = function (value) {
    sap.firefly.DfUiContext.prototype.setActiveIcon.call(this, value);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(value);
    this.setProperty("activeIcon", iconUri);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getLabel = function () {
    return sap.firefly.DfUiContext.prototype.getLabel.call(this);
  };

  sap.firefly.UxGeneric.prototype.setLabel = function (value) {
    sap.firefly.DfUiContext.prototype.setLabel.call(this, value);
    this.setProperty("label", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isRequired = function () {
    return sap.firefly.DfUiContext.prototype.isRequired.call(this);
  };

  sap.firefly.UxGeneric.prototype.setRequired = function (value) {
    sap.firefly.DfUiContext.prototype.setRequired.call(this, value);
    this.setProperty("required", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getValue = function () {
    return sap.firefly.DfUiContext.prototype.getValue.call(this);
  };

  sap.firefly.UxGeneric.prototype.setValue = function (value) {
    sap.firefly.DfUiContext.prototype.setValue.call(this, value);
    this.setProperty("value", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isSelected = function () {
    return sap.firefly.DfUiContext.prototype.isSelected.call(this);
  };

  sap.firefly.UxGeneric.prototype.setSelected = function (value) {
    sap.firefly.DfUiContext.prototype.setSelected.call(this, value);
    this.setProperty("selected", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isEnabled = function () {
    return sap.firefly.DfUiContext.prototype.isEnabled.call(this);
  };

  sap.firefly.UxGeneric.prototype.setEnabled = function (value) {
    sap.firefly.DfUiContext.prototype.setEnabled.call(this, value);
    this.setProperty("enabled", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isExpanded = function () {
    return sap.firefly.DfUiContext.prototype.isExpanded.call(this);
  };

  sap.firefly.UxGeneric.prototype.setExpanded = function (value) {
    sap.firefly.DfUiContext.prototype.setExpanded.call(this, value);
    this.setProperty("expanded", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isVisible = function () {
    return sap.firefly.DfUiContext.prototype.isVisible.call(this);
  };

  sap.firefly.UxGeneric.prototype.setVisible = function (value) {
    sap.firefly.DfUiContext.prototype.setVisible.call(this, value);
    this.setProperty("visible", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isBusy = function () {
    return sap.firefly.DfUiContext.prototype.isBusy.call(this);
  };

  sap.firefly.UxGeneric.prototype.setBusy = function (value) {
    sap.firefly.DfUiContext.prototype.setBusy.call(this, value);
    this.setProperty("busy", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getBusyDelay = function () {
    return sap.firefly.DfUiContext.prototype.getBusyDelay.call(this);
  };

  sap.firefly.UxGeneric.prototype.setBusyDelay = function (value) {
    sap.firefly.DfUiContext.prototype.setBusyDelay.call(this, value);
    this.setProperty("busyIndicatorDelay", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.setBusyIndicatorSize = function (value) {
    sap.firefly.DfUiContext.prototype.setBusyIndicatorSize.call(this, value);
    var ui5BusyIndicatorSize = sap.ui.core.BusyIndicatorSize.Medium;

    if (value === sap.firefly.UiBusyIndicatorSize.AUTO) {
      ui5BusyIndicatorSize = sap.ui.core.BusyIndicatorSize.Auto;
    } else if (value === sap.firefly.UiBusyIndicatorSize.LARGE) {
      ui5BusyIndicatorSize = sap.ui.core.BusyIndicatorSize.Large;
    } else if (value === sap.firefly.UiBusyIndicatorSize.MEDIUM) {
      ui5BusyIndicatorSize = sap.ui.core.BusyIndicatorSize.Medium;
    } else if (value === sap.firefly.UiBusyIndicatorSize.SMALL) {
      ui5BusyIndicatorSize = sap.ui.core.BusyIndicatorSize.Small;
    }

    this.setProperty("busyIndicatorSize", ui5BusyIndicatorSize);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getBusyIndicatorSize = function () {
    return sap.firefly.DfUiContext.prototype.getBusyIndicatorSize.call(this);
  };

  sap.firefly.UxGeneric.prototype.setBackgroundDesign = function (value) {
    sap.firefly.DfUiContext.prototype.setBackgroundDesign.call(this, value);
    var ui5BackgroundDesign = sap.m.BackgroundDesign.Translucent;

    if (value === sap.firefly.UiBackgroundDesign.SOLID) {
      ui5BackgroundDesign = sap.m.BackgroundDesign.Solid;
    } else if (value === sap.firefly.UiBackgroundDesign.TRANSLUCENT) {
      ui5BackgroundDesign = sap.m.BackgroundDesign.Translucent;
    } else if (value === sap.firefly.UiBackgroundDesign.TRANSPARENT) {
      ui5BackgroundDesign = sap.m.BackgroundDesign.Transparent;
    }

    this.setProperty("backgroundDesign", ui5BackgroundDesign);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getBackgroundDesign = function () {
    return sap.firefly.DfUiContext.prototype.getBackgroundDesign.call(this);
  };

  sap.firefly.UxGeneric.prototype.isChecked = function () {
    return sap.firefly.DfUiContext.prototype.isChecked.call(this);
  };

  sap.firefly.UxGeneric.prototype.setChecked = function (value) {
    sap.firefly.DfUiContext.prototype.setChecked.call(this, value);
    this.setProperty("checked", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isSortable = function () {
    return sap.firefly.DfUiContext.prototype.isSortable.call(this);
  };

  sap.firefly.UxGeneric.prototype.setSortable = function (value) {
    sap.firefly.DfUiContext.prototype.setSortable.call(this, value);
    this.setProperty("sortable", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isSortable = function () {
    return sap.firefly.DfUiContext.prototype.isSortable.call(this);
  };

  sap.firefly.UxGeneric.prototype.setSortable = function (value) {
    sap.firefly.DfUiContext.prototype.setSortable.call(this, value);
    this.setProperty("sortable", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.setTarget = function (value) {
    sap.firefly.DfUiContext.prototype.setTarget.call(this, value);
    this.setProperty("target", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getTarget = function () {
    return sap.firefly.DfUiContext.prototype.getTarget.call(this);
  };

  sap.firefly.UxGeneric.prototype.getChartType = function () {
    return sap.firefly.DfUiContext.prototype.getChartType.call(this);
  };

  sap.firefly.UxGeneric.prototype.setChartType = function (value) {
    sap.firefly.DfUiContext.prototype.setChartType.call(this, value);
    this.setProperty("chartType", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.setDuration = function (value) {
    sap.firefly.DfUiContext.prototype.setDuration.call(this, value);
    this.setProperty("duration", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isShowValueHelp = function () {
    return sap.firefly.DfUiContext.prototype.isShowValueHelp.call(this);
  };

  sap.firefly.UxGeneric.prototype.setShowValueHelp = function (value) {
    sap.firefly.DfUiContext.prototype.setShowValueHelp.call(this, value);
    this.setProperty("showValueHelp", value);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getValueHelpIcon = function () {
    return sap.firefly.DfUiContext.prototype.getValueHelpIcon.call(this);
  };

  sap.firefly.UxGeneric.prototype.setValueHelpIcon = function (value) {
    sap.firefly.DfUiContext.prototype.setValueHelpIcon.call(this, value);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(value);
    this.setProperty("valueHelpIconSrc", iconUri);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getDuration = function () {
    return sap.firefly.DfUiContext.prototype.getDuration.call(this);
  };

  sap.firefly.UxGeneric.prototype.getLabelFor = function () {
    return sap.firefly.DfUiContext.prototype.getLabelFor.call(this);
  };

  sap.firefly.UxGeneric.prototype.setLabelFor = function (value) {
    sap.firefly.DfUiContext.prototype.setLabelFor.call(this, value);
    var nativeControl = null;

    if (value != null) {
      nativeControl = value.getNativeControl();
    }

    this.setProperty("labelFor", nativeControl);
    return this;
  };

  sap.firefly.UxGeneric.prototype.getName = function () {
    return sap.firefly.DfUiContext.prototype.getName.call(this);
  };

  sap.firefly.UxGeneric.prototype.setName = function (name) {
    sap.firefly.DfUiContext.prototype.setName.call(this, name); // add firefly name as attribute (data-ff-name) to the dom element
    // required for unique element selection (id cannot be used since it is generated randomly, name can be given by the user)

    if (this.getNativeControl() !== null && name && name.length > 0) {
      this.getNativeControl().data("ff-name", name, true);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.getTag = function () {
    return sap.firefly.DfUiContext.prototype.getTag.call(this);
  };

  sap.firefly.UxGeneric.prototype.setTag = function (tag) {
    sap.firefly.DfUiContext.prototype.setTag.call(this, tag);
    return this;
  };

  sap.firefly.UxGeneric.prototype.isDraggable = function () {
    return sap.firefly.DfUiContext.prototype.isDraggable.call(this);
  };

  sap.firefly.UxGeneric.prototype.setDraggable = function (draggable) {
    sap.firefly.DfUiContext.prototype.setDraggable.call(this, draggable);

    if (draggable) {
      this._addDraggable();
    } else {
      this._removeDraggable();
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.getDropInfo = function () {
    return sap.firefly.DfUiContext.prototype.getDropInfo.call(this);
  };

  sap.firefly.UxGeneric.prototype.setDropInfo = function (dropInfo) {
    sap.firefly.DfUiContext.prototype.setDropInfo.call(this, dropInfo);

    if (this.m_dropInfo) {
      if (!dropInfo) {
        this.getNativeControl().removeDragDropConfig(this.m_dropInfo);
        this.m_dropInfo = null;
      } else {
        this.m_dropInfo.setDropPosition(this._getUi5DropPosition());
        this.m_dropInfo.setDropEffect(this._getUi5DropEffect());
        this.m_dropInfo.setDropLayout(this._getUi5DropLayout());
        this.m_dropInfo.setTargetAggregation(this._getUi5DropTargetAggregation());
      }
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.getLayoutData = function () {
    return sap.firefly.DfUiContext.prototype.getLayoutData.call(this);
  };

  sap.firefly.UxGeneric.prototype.setLayoutData = function (layoutData) {
    sap.firefly.DfUiContext.prototype.setLayoutData.call(this, layoutData);
    var nativeLayoutData = null;

    if (layoutData) {
      nativeLayoutData = sap.firefly.ui.Ui5LayoutDataUtils.createNativeLayoutData(layoutData);
    }

    if (this.getNativeControl() && this.getNativeControl().setLayoutData) {
      this.getNativeControl().setLayoutData(nativeLayoutData);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.getCssClass = function () {
    return sap.firefly.DfUiContext.prototype.getCssClass.call(this);
  }; // ********************************************
  // *** Property helpers ***********************
  // ********************************************
  // ********************************************
  // ****************** Methods *****************
  // ********************************************


  sap.firefly.UxGeneric.prototype.focus = function () {
    sap.firefly.DfUiContext.prototype.focus.call(this); // UI5 takes some time to apply operations and in that time the focus won't work
    // setTimeout makes sure that the focus is set after operations.
    // e.g. setEnabled(true).focus() will not work without this.

    var myself = this;
    setTimeout(function () {
      var control = myself.getNativeControl();

      if (control && control.focus != null) {
        control.focus();
      }
    }, 0);
    return this;
  };

  sap.firefly.UxGeneric.prototype.addCssClass = function (cssClass) {
    sap.firefly.DfUiContext.prototype.addCssClass.call(this, cssClass);

    if (this.getNativeControl() !== null && this.getNativeControl().addStyleClass !== undefined && cssClass && cssClass.length > 0) {
      this.getNativeControl().addStyleClass(cssClass);
    }

    return this;
  };

  sap.firefly.UxGeneric.prototype.removeCssClass = function (cssClass) {
    sap.firefly.DfUiContext.prototype.removeCssClass.call(this, cssClass);

    if (this.getNativeControl() !== null && this.getNativeControl().removeStyleClass !== undefined && cssClass && cssClass.length > 0) {
      this.getNativeControl().removeStyleClass(cssClass);
    }

    return this;
  }; // ********************************************
  // *** Position, Size, Styling ****************
  // ********************************************


  sap.firefly.UxGeneric.prototype.setX = function (x) {
    sap.firefly.DfUiContext.prototype.setX.call(this, x);
    var xPosCss = this.calculatePosXCss();

    this._updateControlProperty(this.applyPosXCss, "setX", xPosCss, "x");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setY = function (y) {
    sap.firefly.DfUiContext.prototype.setY.call(this, y);
    var yPosCss = this.calculatePosYCss();

    this._updateControlProperty(this.applyPosYCss, "setY", yPosCss, "y");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setWidth = function (width) {
    sap.firefly.DfUiContext.prototype.setWidth.call(this, width);
    var widthCss = this.calculateWidthCss();

    this._updateControlProperty(this.applyWidthCss, "setWidth", widthCss, "width");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setHeight = function (height) {
    sap.firefly.DfUiContext.prototype.setHeight.call(this, height);
    var heightCss = this.calculateHeightCss();

    this._updateControlProperty(this.applyHeightCss, "setHeight", heightCss, "height");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setMinWidth = function (minWidth) {
    sap.firefly.DfUiContext.prototype.setMinWidth.call(this, minWidth);
    var minWidthCss = this.calculateMinWidthCss();

    this._updateControlProperty(this.applyMinWidthCss, "setMinWidth", minWidthCss, "minWidth");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setMaxWidth = function (maxWidth) {
    sap.firefly.DfUiContext.prototype.setMaxWidth.call(this, maxWidth);
    var maxWidthCss = this.calculateMaxWidthCss();

    this._updateControlProperty(this.applyMaxWidthCss, "setMaxWidth", maxWidthCss, "maxWidth");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setMinHeight = function (minHeight) {
    sap.firefly.DfUiContext.prototype.setMinHeight.call(this, minHeight);
    var minHeightCss = this.calculateMinHeightCss();

    this._updateControlProperty(this.applyMinHeightCss, "setMinHeight", minHeightCss, "minHeight");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setMaxHeight = function (maxHeight) {
    sap.firefly.DfUiContext.prototype.setMaxHeight.call(this, maxHeight);
    var maxHeightCss = this.calculateMaxHeightCss();

    this._updateControlProperty(this.applyMaxHeightCss, "setMaxHeight", maxHeightCss, "maxHeight");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setFlex = function (flex) {
    sap.firefly.DfUiContext.prototype.setFlex.call(this, flex);

    this._updateControlProperty(this.applyFlexCss, null, flex, "flex");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setAlignSelf = function (alignSelf) {
    sap.firefly.DfUiContext.prototype.setAlignSelf.call(this, alignSelf);

    var alignSelfCss = this._calculateAlignSelfCss();

    this._updateControlProperty(this.applyAlignSelfCss, null, alignSelfCss, "alignSelf");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setOrder = function (order) {
    sap.firefly.DfUiContext.prototype.setOrder.call(this, order);

    this._updateControlProperty(this.applyOrderCss, null, order, "order");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setPadding = function (padding) {
    sap.firefly.DfUiContext.prototype.setPadding.call(this, padding);
    var paddingCss = this.calculatePaddingCss();

    this._updateControlProperty(this.applyPaddingCss, "setPadding", paddingCss, "padding");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setMargin = function (margin) {
    sap.firefly.DfUiContext.prototype.setMargin.call(this, margin);
    var marginCss = this.calculateMarginCss();

    this._updateControlProperty(this.applyMarginCss, "setMargin", marginCss, "margin");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setCornerRadius = function (cornerRadius) {
    sap.firefly.DfUiContext.prototype.setCornerRadius.call(this, cornerRadius);

    var cornerRadiusCss = this._calculateCornerRadiusCss();

    this._updateControlProperty(this.applyCornerRadiusCss, null, cornerRadiusCss, "cornerRadius");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setColor = function (color) {
    sap.firefly.DfUiContext.prototype.setColor.call(this, color);

    var colorCss = this._calculateColorCss();

    this._updateControlProperty(this.applyColorCss, "setColor", colorCss, "color");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setBackgroundColor = function (color) {
    sap.firefly.DfUiContext.prototype.setBackgroundColor.call(this, color);

    var bgColor = this._calculateBackgroundColorCss();

    this._updateControlProperty(this.applyBackgroundColorCss, "setBackgroundColor", bgColor, "backgroundColor");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setBackgroundImageSrc = function (imageSrc) {
    sap.firefly.DfUiContext.prototype.setBackgroundImageSrc.call(this, imageSrc);

    this._updateControlProperty(this.applyBackgroundImageCss, "setBackgroundImgSrc", imageSrc, "backgroundImage");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setBorderStyle = function (borderStyle) {
    sap.firefly.DfUiContext.prototype.setBorderStyle.call(this, borderStyle);

    var borderStyleCss = this._calculateBorderStyleCss();

    this._updateControlProperty(this.applyBorderStyleCss, null, borderStyleCss, "borderStyle");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setBorderWidth = function (borderWidth) {
    sap.firefly.DfUiContext.prototype.setBorderWidth.call(this, borderWidth);

    var borderWidthCss = this._calculateBorderWidthCss();

    this._updateControlProperty(this.applyBorderWidthCss, null, borderWidthCss, "borderWidth");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setBorderColor = function (color) {
    sap.firefly.DfUiContext.prototype.setBorderColor.call(this, color);

    var borderColorCss = this._calculateBorderColorCss();

    this._updateControlProperty(this.applyBorderColorCss, null, borderColorCss, "borderColor");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setOpacity = function (opacity) {
    sap.firefly.DfUiContext.prototype.setOpacity.call(this, opacity);

    var opacityCss = this._calculateOpacityCss();

    this._updateControlProperty(this.applyOpacityCss, null, opacityCss, "opacity");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setRotation = function (rotation) {
    sap.firefly.DfUiContext.prototype.setRotation.call(this, rotation);

    var rotationCss = this._calculateRotationCss();

    this._updateControlProperty(this.applyRotationCss, null, rotationCss, "rotation");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setFontColor = function (fontColor) {
    sap.firefly.DfUiContext.prototype.setFontColor.call(this, fontColor);

    var fontColorCss = this._calculateFontColorCss();

    this._updateControlProperty(this.applyFontColorCss, "setColor", fontColorCss, "fontColor");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setFontSize = function (fontSize) {
    sap.firefly.DfUiContext.prototype.setFontSize.call(this, fontSize);

    var fontSizeCss = this._calculateFontSizeCss();

    this._updateControlProperty(this.applyFontSizeCss, "setSize", fontSizeCss, "fontSize");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.DfUiContext.prototype.setFontStyle.call(this, fontStyle);

    var fontStyleCss = this._calculateFontStyleCss();

    this._updateControlProperty(this.applyFontStyleCss, null, fontStyleCss, "fontStyle");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.DfUiContext.prototype.setFontWeight.call(this, fontWeight);

    var fontWeightCss = this._calculateFontWeightCss();

    this._updateControlProperty(this.applyFontWeightCss, null, fontWeightCss, "fontWeight");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setOverflow = function (overflow) {
    sap.firefly.DfUiContext.prototype.setOverflow.call(this, overflow);

    var overflowCss = this._calculateOverflowCss();

    this._updateControlProperty(this.applyOverflowCss, null, overflowCss, "overflow");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setTextDecoration = function (textDecoration) {
    sap.firefly.DfUiContext.prototype.setTextDecoration.call(this, textDecoration);

    var textDecorationCss = this._calculateTextDecorationCss();

    this._updateControlProperty(this.applyTextDecorationCss, null, textDecorationCss, "textDecoration");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setIconSize = function (iconSize) {
    sap.firefly.DfUiContext.prototype.setIconSize.call(this, iconSize);

    var iconSizeCss = this._calculateIconSizeCss();

    this._updateControlProperty(this.applyIconSizeCss, "setSize", iconSizeCss, "iconSize");

    return this;
  };

  sap.firefly.UxGeneric.prototype.setGap = function (gap) {
    sap.firefly.DfUiContext.prototype.setGap.call(this, gap);

    var gapCss = this._calculateGapCss();

    this._updateControlProperty(this.applyGapCss, "setGap", gapCss, "gap");

    return this;
  }; // ************************************************
  // *** css styling helpers ************************
  // ************************************************
  // helper


  sap.firefly.UxGeneric.prototype.getCssString = function (cssBasedObj) {
    var cssStr = null;

    if (cssBasedObj) {
      cssStr = cssBasedObj.getCssValue();
    }

    return cssStr;
  }; //width


  sap.firefly.UxGeneric.prototype.calculateWidthCss = function () {
    return this.getCssString(this.getWidth());
  };

  sap.firefly.UxGeneric.prototype.applyWidthCss = function (element, widthCss) {
    element.style.width = widthCss;
  }; //height


  sap.firefly.UxGeneric.prototype.calculateHeightCss = function () {
    return this.getCssString(this.getHeight());
  };

  sap.firefly.UxGeneric.prototype.applyHeightCss = function (element, heightCss) {
    element.style.height = heightCss;
  }; //min width


  sap.firefly.UxGeneric.prototype.calculateMinWidthCss = function () {
    return this.getCssString(this.getMinWidth());
  };

  sap.firefly.UxGeneric.prototype.applyMinWidthCss = function (element, minWidthCss) {
    element.style.minWidth = minWidthCss;
  }; //max width


  sap.firefly.UxGeneric.prototype.calculateMaxWidthCss = function () {
    return this.getCssString(this.getMaxWidth());
  };

  sap.firefly.UxGeneric.prototype.applyMaxWidthCss = function (element, maxWidthCss) {
    element.style.maxWidth = maxWidthCss;
  }; //min height


  sap.firefly.UxGeneric.prototype.calculateMinHeightCss = function () {
    return this.getCssString(this.getMinHeight());
  };

  sap.firefly.UxGeneric.prototype.applyMinHeightCss = function (element, minHeightCss) {
    element.style.minHeight = minHeightCss;
  }; //max height


  sap.firefly.UxGeneric.prototype.calculateMaxHeightCss = function () {
    return this.getCssString(this.getMaxHeight());
  };

  sap.firefly.UxGeneric.prototype.applyMaxHeightCss = function (element, maxHeightCss) {
    element.style.maxHeight = maxHeightCss;
  }; //pos x


  sap.firefly.UxGeneric.prototype.calculatePosXCss = function () {
    return this.getCssString(this.getX());
  };

  sap.firefly.UxGeneric.prototype.applyPosXCss = function (element, xPosCss) {
    element.style.left = xPosCss;
    element.style.position = "absolute";
  }; //pos y


  sap.firefly.UxGeneric.prototype.calculatePosYCss = function () {
    return this.getCssString(this.getY());
  };

  sap.firefly.UxGeneric.prototype.applyPosYCss = function (element, yPosCss) {
    element.style.top = yPosCss;
    element.style.position = "absolute";
  }; //padding


  sap.firefly.UxGeneric.prototype.calculatePaddingCss = function () {
    return this.getCssString(this.getPadding());
  };

  sap.firefly.UxGeneric.prototype.applyPaddingCss = function (element, paddingCss) {
    element.style.padding = paddingCss;
  }; //margin


  sap.firefly.UxGeneric.prototype.calculateMarginCss = function () {
    return this.getCssString(this.getMargin());
  };

  sap.firefly.UxGeneric.prototype.applyMarginCss = function (element, marginCss) {
    element.style.margin = marginCss;
  }; //border style


  sap.firefly.UxGeneric.prototype.applyBorderStyleCss = function (element, borderStyleCss) {
    element.style.borderStyle = borderStyleCss;
  }; //border width


  sap.firefly.UxGeneric.prototype.applyBorderWidthCss = function (element, borderWidthCss) {
    element.style.borderWidth = borderWidthCss;
  }; //border color


  sap.firefly.UxGeneric.prototype.applyBorderColorCss = function (element, borderColorCss) {
    element.style.borderColor = borderColorCss;
  }; //corner radius


  sap.firefly.UxGeneric.prototype.applyCornerRadiusCss = function (element, cornerRadiusCss) {
    element.style.borderRadius = cornerRadiusCss;
  }; //color


  sap.firefly.UxGeneric.prototype.applyColorCss = function (element, color) {
    element.style.backgroundColor = color;
  }; //background color


  sap.firefly.UxGeneric.prototype.applyBackgroundColorCss = function (element, bgColor) {
    element.style.backgroundColor = bgColor;
  }; // background image


  sap.firefly.UxGeneric.prototype.applyBackgroundImageCss = function (element, bgImageSrc) {
    element.style.backgroundImage = "url(" + bgImageSrc + ")";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundSize = "cover";
  }; // flex


  sap.firefly.UxGeneric.prototype.applyFlexCss = function (element, flexCss) {
    element.style.flex = flexCss;
  }; //align self


  sap.firefly.UxGeneric.prototype.applyAlignSelfCss = function (element, alignSelfCss) {
    element.style.alignSelf = alignSelfCss;
  }; //order


  sap.firefly.UxGeneric.prototype.applyOrderCss = function (element, orderCss) {
    element.style.order = orderCss;
  }; //opacity


  sap.firefly.UxGeneric.prototype.applyOpacityCss = function (element, opacityCss) {
    element.style.opacity = opacityCss;
  }; //rotation


  sap.firefly.UxGeneric.prototype.applyRotationCss = function (element, rotationCss) {
    element.style.transform = "rotate(" + rotationCss + "deg)";
  }; //font color


  sap.firefly.UxGeneric.prototype.applyFontColorCss = function (element, fontColorCss) {
    element.style.color = fontColorCss;
  }; //font size


  sap.firefly.UxGeneric.prototype.applyFontSizeCss = function (element, fontSizeCss) {
    element.style.fontSize = fontSizeCss;
  }; //font style


  sap.firefly.UxGeneric.prototype.applyFontStyleCss = function (element, fontStyleCss) {
    element.style.fontStyle = fontStyleCss;
  }; //font weight


  sap.firefly.UxGeneric.prototype.applyFontWeightCss = function (element, fontWeightCss) {
    element.style.fontWeight = fontWeightCss;
  }; //overflow


  sap.firefly.UxGeneric.prototype.applyOverflowCss = function (element, overflowCss) {
    element.style.overflow = overflowCss;
  }; //text decoration


  sap.firefly.UxGeneric.prototype.applyTextDecorationCss = function (element, textDecorationCss) {
    element.style.textDecoration = textDecorationCss;
  }; //icon size


  sap.firefly.UxGeneric.prototype.applyIconSizeCss = function (element, iconSizeCss) {
    element.style.fontSize = iconSizeCss;
  }; //gap


  sap.firefly.UxGeneric.prototype.applyGapCss = function (element, gapCss) {
    element.style.gap = gapCss;
  }; // *****************************************************
  // *** dom css/prop helpers ****************************
  // *****************************************************


  sap.firefly.UxGeneric.prototype.applyCss = function (name, value) {
    if (this.getNativeControl()) {
      var element = this.getNativeControl().getDomRef();

      if (element !== null) {
        element.style[name] = value;
      }
    }
  }; // ********************************************
  // *** internal css property calculation ******
  // ********************************************


  sap.firefly.UxGeneric.prototype._calculateBorderWidthCss = function () {
    return this.getCssString(this.getBorderWidth());
  };

  sap.firefly.UxGeneric.prototype._calculateBorderColorCss = function () {
    return this.getCssString(this.getBorderColor());
  };

  sap.firefly.UxGeneric.prototype._calculateBorderStyleCss = function () {
    return this.getCssString(this.getBorderStyle());
  };

  sap.firefly.UxGeneric.prototype._calculateCornerRadiusCss = function () {
    return this.getCssString(this.getCornerRadius());
  };

  sap.firefly.UxGeneric.prototype._calculateColorCss = function () {
    return this.getCssString(this.getColor());
  };

  sap.firefly.UxGeneric.prototype._calculateBackgroundColorCss = function () {
    return this.getCssString(this.getBackgroundColor());
  };

  sap.firefly.UxGeneric.prototype._calculateAlignSelfCss = function () {
    return this.getCssString(this.getAlignSelf());
  };

  sap.firefly.UxGeneric.prototype._calculateOpacityCss = function () {
    var opacityCss = this.getOpacity();
    return opacityCss;
  };

  sap.firefly.UxGeneric.prototype._calculateRotationCss = function () {
    var rotationCss = this.getRotation();
    return rotationCss;
  };

  sap.firefly.UxGeneric.prototype._calculateFontColorCss = function () {
    return this.getCssString(this.getFontColor());
  };

  sap.firefly.UxGeneric.prototype._calculateFontSizeCss = function () {
    return this.getCssString(this.getFontSize());
  };

  sap.firefly.UxGeneric.prototype._calculateFontStyleCss = function () {
    return this.getCssString(this.getFontStyle());
  };

  sap.firefly.UxGeneric.prototype._calculateFontWeightCss = function () {
    return this.getCssString(this.getFontWeight());
  };

  sap.firefly.UxGeneric.prototype._calculateOverflowCss = function () {
    return this.getCssString(this.getOverflow());
  };

  sap.firefly.UxGeneric.prototype._calculateTextDecorationCss = function () {
    return this.getCssString(this.getTextDecoration());
  };

  sap.firefly.UxGeneric.prototype._calculateIconSizeCss = function () {
    return this.getCssString(this.getIconSize());
  };

  sap.firefly.UxGeneric.prototype._calculateGapCss = function () {
    return this.getCssString(this.getGap());
  }; // *****************************************************
  // *** internal css/prop helpers ***********************
  // *****************************************************


  sap.firefly.UxGeneric.prototype._updateControlProperty = function (fn, ui5FnName, cssValue, propName) {
    // only continue if native control exists
    if (this.getNativeControl()) {
      if (ui5FnName && this.getNativeControl()[ui5FnName]) {
        // first check if a native control setter method has been specified and use that
        this.getNativeControl()[ui5FnName](cssValue);
        sap.firefly.ui.Log.logDebug("[PROP UI5 SET] " + this.getId() + " | prop: " + (propName || ui5FnName) + " val: " + cssValue, sap.firefly.ui.Log.Colors.GREEN);
      } else if (fn) {
        // else, if a css modification function specified, use that
        // if css value specified then add the prop update, else remove it
        if (cssValue != null) {
          // add the prop function and the value
          var oldValue = this.m_propertyFunctions[propName] ? this.m_propertyFunctions[propName].cssValue : undefined; // only continue if new css value is not the same as the old one

          if (oldValue != cssValue) {
            var newPropUpdateObj = {};
            newPropUpdateObj.propFn = fn;
            newPropUpdateObj.cssValue = cssValue;
            this.m_propertyFunctions[propName] = newPropUpdateObj;

            this._runPropFunction(fn, cssValue); // run the prop function once when setting the property


            sap.firefly.ui.Log.logDebug("[PROP CSS SET] " + this.getId() + " | prop: " + (propName || ui5FnName) + " val: " + cssValue, sap.firefly.ui.Log.Colors.GREEN);
          }
        } else {
          // delete the prop function, only if it exists
          if (this.m_propertyFunctions[propName]) {
            delete this.m_propertyFunctions[propName]; // manually rerender (invalidate) the ui5 control to retrigger an update

            this.rerenderNativeControl();
            sap.firefly.ui.Log.logDebug("[PROP CSS REMOVE] " + this.getId() + " | prop: " + (propName || ui5FnName), sap.firefly.ui.Log.Colors.ORANGE);
          }
        }
      }
    }
  };

  sap.firefly.UxGeneric.prototype._runPropFunction = function (fn, value) {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      if (fn) {
        var element = this.getNativeControl().getDomRef();
        fn.apply(this, [element, value]);
      }
    }
  }; // ********************************************
  // *** behaviour helpers **********************
  // ********************************************


  sap.firefly.UxGeneric.prototype.debounce = function (fn, time) {
    var timeout;
    var myself = this;

    var cancelDebounce = function cancelDebounce() {
      clearTimeout(timeout);
    };

    var debounceFunc = function debounceFunc(oEvent) {
      var eventCopy = jQuery.extend({}, oEvent); // copy the event since ui5 releases the event object after the event fired, and we calling this with a delay.

      var functionCall = function functionCall() {
        fn.apply(myself, [eventCopy]);
        eventCopy = null; // release the event copy
      };

      var timeToWait = time;

      if (timeToWait instanceof Function) {
        timeToWait = timeToWait(); // time can be a function so we dynamically can pass the time value
      }

      clearTimeout(timeout);
      timeout = setTimeout(functionCall, timeToWait);
    };

    debounceFunc.cancelDebounce = cancelDebounce;
    return debounceFunc;
  };

  sap.firefly.UxGeneric.prototype.throttle = function (fn, delay) {
    var timeoutHandler = null;
    return function () {
      if (timeoutHandler == null) {
        fn.apply(this);
        timeoutHandler = setTimeout(function () {
          clearInterval(timeoutHandler);
          timeoutHandler = null;
        }, delay);
      }
    };
  }; // ********************************************
  // *** drag and drop helpers ******************
  // ********************************************
  // file drop


  sap.firefly.UxGeneric.prototype._addFileDropHandling = function () {
    // ui5 handling for file drop
    var myself = this;
    var nativeControl = this.getNativeControl();

    if (nativeControl && nativeControl.getMetadata && nativeControl.getMetadata().dnd && nativeControl.addDragDropConfig) {
      nativeControl.getMetadata().dnd.droppable = true;
      nativeControl.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
        drop: function drop(oEvent) {
          oEvent.preventDefault();
          var oBrowserEvent = oEvent.getParameter("browserEvent");
          oBrowserEvent.stopPropagation();
          var files = oBrowserEvent.dataTransfer.files;

          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();

            reader.onload = function (event) {
              // onFileDrop event
              myself._fireOnFileDropEventIfPossible(file.name, file.type, event.target.result, file.size, file.lastModified);
            }; //console.log(file);
            //console.log(file.type);


            reader.readAsText(file);
          }
        },
        dragOver: function dragOver(oEvent) {
          // just prevent default and stop propagation
          oEvent.preventDefault();
          var oBrowserEvent = oEvent.getParameter("browserEvent");
          oBrowserEvent.stopPropagation();
        },
        dragEnter: function dragEnter(oEvent) {
          var oDragSession = oEvent.getParameter("dragSession");
          var oDraggedControl = oDragSession.getDragControl();

          if (oDraggedControl || oEvent.getParameters().browserEvent.dataTransfer.types.indexOf("sac-grid-drag-data") > -1) {
            oEvent.preventDefault();
            var oBrowserEvent = oEvent.getParameter("browserEvent");
            oBrowserEvent.stopPropagation();
          }
        }
      }));
    }
  };

  sap.firefly.UxGeneric.prototype._fireOnFileDropEventIfPossible = function (fileName, fileType, fileContent, fileSize, fileLastModified) {
    if (this.getListenerOnFileDrop() !== null) {
      var newParameters = sap.firefly.XProperties.create();
      newParameters.putString(sap.firefly.UiEventParams.PARAM_FILE_NAME, fileName);
      newParameters.putString(sap.firefly.UiEventParams.PARAM_FILE_TYPE, fileType);
      newParameters.putString(sap.firefly.UiEventParams.PARAM_FILE_CONTENT, fileContent);
      newParameters.putInteger(sap.firefly.UiEventParams.PARAM_FILE_SIZE, fileSize);
      newParameters.putInteger(sap.firefly.UiEventParams.PARAM_FILE_LAST_MODIFIED, fileLastModified);
      this.getListenerOnFileDrop().onFileDrop(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  }; // control drop


  sap.firefly.UxGeneric.prototype._addControlDropHandling = function () {
    // ui5 handling for control drop
    var myself = this;
    var nativeControl = this.getNativeControl();

    if (nativeControl && nativeControl.getMetadata && nativeControl.getMetadata().dnd && nativeControl.addDragDropConfig) {
      nativeControl.getMetadata().dnd.droppable = true;

      if (!this.m_dropInfo) {
        this.m_dropInfo = new sap.ui.core.dnd.DropInfo({
          dropPosition: this._getUi5DropPosition(),
          dropEffect: this._getUi5DropEffect(),
          dropLayout: this._getUi5DropLayout(),
          targetAggregation: this._getUi5DropTargetAggregation(),
          drop: function drop(oEvent) {
            //console.log("dropped");
            var nativeDraggedControl = oEvent.getParameters().draggedControl;
            var nativeDroppedControl = oEvent.getParameters().droppedControl;
            var relativeDropPositionStr = oEvent.getParameters().dropPosition; // at least dragged control needs to be there!

            if (nativeDraggedControl) {
              myself._fireOnDropEventIfPossible(nativeDraggedControl, nativeDroppedControl, relativeDropPositionStr, null);
            }
          },
          dragOver: function dragOver(oEvent) {//  console.log("dragOver");
          },
          dragEnter: function dragEnter(oEvent) {
            //    console.log("dragEnter");
            var oDragSession = oEvent.getParameter("dragSession");
            var oDraggedControl = oDragSession.getDragControl(); // if no drag control present then it is probably not a ui5 drag event (maybe file drag event or sactable)

            if (!oDraggedControl) {
              oEvent.preventDefault();
              return;
            } // check if the dragged control is allowed to be dropped


            if (!myself._isDropAllowedForUiElement(oDraggedControl)) {
              oEvent.preventDefault();
            }
          }
        });
        nativeControl.addDragDropConfig(this.m_dropInfo);
      }
    }
  };

  sap.firefly.UxGeneric.prototype._fireOnDropEventIfPossible = function (nativeDraggedControl, nativeDroppedControl, relativeDropPositionStr, params) {
    if (this.getListenerOnDrop() !== null) {
      var draggedControl = sap.firefly.UxGeneric.getUxControl(nativeDraggedControl);
      var droppedControl = sap.firefly.UxGeneric.getUxControl(nativeDroppedControl);
      var relativeDropPos = sap.firefly.UiRelativeDropPosition.lookup(relativeDropPositionStr);
      var newDropEvent = sap.firefly.UiDropEvent.create(this);
      newDropEvent.setDropData(draggedControl, droppedControl, relativeDropPos);
      this.getListenerOnDrop().onDrop(newDropEvent);
    }
  }; // drag helpers


  sap.firefly.UxGeneric.prototype._addDraggable = function () {
    // ui5 handling for setting a control draggable
    var myself = this;
    var nativeControl = this.getNativeControl();

    if (nativeControl && nativeControl.getMetadata && nativeControl.getMetadata().dnd && nativeControl.addDragDropConfig) {
      if (!nativeControl.getMetadata().dnd.draggable) {
        // some controls are "officially" not allowed to be draggable (example: custom controls), in that case let's force them!
        // it is questionable if we should force all controls to be draggable, as this affects also control which are used outside of firefly ui
        nativeControl.getMetadata().dnd.draggable = true;
      } // add only once


      if (!this.m_dragInfo) {
        this.m_dragInfo = new sap.ui.core.dnd.DragInfo({
          dragStart: function dragStart(oEvent) {
            //console.log("dragStart");
            myself._fireOnDragStartEventIfPossible();
          },
          dragEnd: function dragEnd(oEvent) {
            //console.log("dragEnd");
            myself._fireOnDragEndEventIfPossible();
          }
        });
        nativeControl.addDragDropConfig(this.m_dragInfo);
      }
    }
  };

  sap.firefly.UxGeneric.prototype._removeDraggable = function () {
    // ui5 handling for removing a control draggable
    var myself = this;
    var nativeControl = this.getNativeControl();

    if (nativeControl && nativeControl.getMetadata && nativeControl.getMetadata().dnd && nativeControl.removeAllDragDropConfig) {
      //we should remove the drag info to disable dragging
      if (this.m_dragInfo) {
        nativeControl.removeDragDropConfig(this.m_dragInfo);
        this.m_dragInfo = null;
      }
    }
  };

  sap.firefly.UxGeneric.prototype._fireOnDragStartEventIfPossible = function () {
    if (this.getListenerOnDragStart() !== null) {
      var newControlEvent = sap.firefly.UiControlEvent.create(this, null);
      this.getListenerOnDragStart().onDragStart(newControlEvent);
    }
  };

  sap.firefly.UxGeneric.prototype._fireOnDragEndEventIfPossible = function () {
    if (this.getListenerOnDragEnd() !== null) {
      var newControlEvent = sap.firefly.UiControlEvent.create(this, null);
      this.getListenerOnDragEnd().onDragEnd(newControlEvent);
    }
  }; // drop info helpers


  sap.firefly.UxGeneric.prototype._getUi5DropPosition = function () {
    var ffDropInfo = this.getDropInfo();
    var ui5DropPos = sap.ui.core.dnd.DropPosition.On;

    if (ffDropInfo) {
      var ffDropPos = ffDropInfo.getDropPosition();

      if (ffDropPos) {
        if (ffDropPos == sap.firefly.UiDropPosition.ON) {
          ui5DropPos = sap.ui.core.dnd.DropPosition.On;
        } else if (ffDropPos == sap.firefly.UiDropPosition.BETWEEN) {
          ui5DropPos = sap.ui.core.dnd.DropPosition.Between;
        } else if (ffDropPos == sap.firefly.UiDropPosition.ON_OR_BETWEEN) {
          ui5DropPos = sap.ui.core.dnd.DropPosition.OnOrBetween;
        }
      }
    }

    return ui5DropPos;
  };

  sap.firefly.UxGeneric.prototype._getUi5DropEffect = function () {
    var ffDropInfo = this.getDropInfo();
    var ui5DropEffect = sap.ui.core.dnd.DropEffect.Move;

    if (ffDropInfo) {
      var ffDropEffect = ffDropInfo.getDropEffect();

      if (ffDropEffect) {
        if (ffDropEffect == sap.firefly.UiDropEffect.COPY) {
          ui5DropEffect = sap.ui.core.dnd.DropEffect.Copy;
        } else if (ffDropEffect == sap.firefly.UiDropEffect.LINK) {
          ui5DropEffect = sap.ui.core.dnd.DropEffect.Link;
        } else if (ffDropEffect == sap.firefly.UiDropEffect.MOVE) {
          ui5DropEffect = sap.ui.core.dnd.DropEffect.Move;
        } else if (ffDropEffect == sap.firefly.UiDropEffect.NONE) {
          ui5DropEffect = sap.ui.core.dnd.DropEffect.None;
        }
      }
    }

    return ui5DropEffect;
  };

  sap.firefly.UxGeneric.prototype._getUi5DropLayout = function () {
    var ffDropInfo = this.getDropInfo();
    var ui5DropLayout = sap.ui.core.dnd.DropLayout.Default;

    if (ffDropInfo) {
      var ffDropLayout = ffDropInfo.getDropLayout();

      if (ffDropLayout) {
        if (ffDropLayout == sap.firefly.UiDropLayout.DEFAULT) {
          ui5DropLayout = sap.ui.core.dnd.DropLayout.Default;
        } else if (ffDropLayout == sap.firefly.UiDropLayout.HORIZONTAL) {
          ui5DropLayout = sap.ui.core.dnd.DropLayout.Horizontal;
        } else if (ffDropLayout == sap.firefly.UiDropLayout.VERTICAL) {
          ui5DropLayout = sap.ui.core.dnd.DropLayout.Vertical;
        }
      }
    }

    return ui5DropLayout;
  };

  sap.firefly.UxGeneric.prototype._getUi5DropTargetAggregation = function () {
    var ffDropInfo = this.getDropInfo();
    var ui5TargetAggregation = null;

    if (ffDropInfo) {
      var ffTargetAggregation = ffDropInfo.getTargetAggregation();

      if (ffTargetAggregation === sap.firefly.UiAggregation.ITEMS) {
        ui5TargetAggregation = "items";
      }
    }

    return ui5TargetAggregation;
  };

  sap.firefly.UxGeneric.prototype._isDropAllowedForUiElement = function (nativeDraggedControl) {
    var uiElement = sap.firefly.UxGeneric.getUxControl(nativeDraggedControl);
    var ffDropInfo = this.getDropInfo();

    if (ffDropInfo && uiElement) {
      var elementUiType = uiElement.getUiType();
      var elementTag = uiElement.getTag();
      var ffAllowedElementType = ffDropInfo.getAllowedElementType();
      var ffAllowedElementTag = ffDropInfo.getAllowedElementTag();

      if (!ffAllowedElementType) {// no allowed element type specified, allow all
      } else {
        if (elementUiType.isTypeOf(ffAllowedElementType)) {// is of type, allow type
        } else {
          return false; // is not of type, do not allow type
        }
      }

      if (!ffAllowedElementTag || ffAllowedElementTag.length === 0) {// no allowed element tag specified, allow all
      } else {
        if (ffAllowedElementTag === elementTag) {// tags are the same, allow element
        } else {
          return false; // tags do not match, do not allow element
        }
      }
    }

    return true; // no drop info specified, allow all
  };

  sap.firefly.UxListItemBase = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxListItemBase";
  };

  sap.firefly.UxListItemBase.prototype = new sap.firefly.UxGeneric(); //Base classes should have no newInstance method

  sap.firefly.UxListItemBase.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
  };

  sap.firefly.UxListItemBase.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxListItemBase.prototype._addEvents = function (nativeControl) {
    var myself = this; // onClick event

    nativeControl.onclick = function (oControlEvent) {
      if (myself.getListenerOnClick() !== null) {
        myself.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onDblClick event


    nativeControl.ondblclick = function (oControlEvent) {
      if (myself.getListenerOnDoubleClick() !== null) {
        myself.getListenerOnDoubleClick().onDoubleClick(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onPress event


    nativeControl.attachPress(function (oControlEvent) {
      //on press only works when list item type is not inactive
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    }); // onDetailPress event

    nativeControl.attachDetailPress(function (oControlEvent) {
      if (myself.getListenerOnDetailPress() !== null) {
        myself.getListenerOnDetailPress().onDetailPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxListItemBase.prototype.setEnabled = function (enabled) {
    sap.firefly.DfUiContext.prototype.setEnabled.call(this, enabled); // skip UxGeneric call since the property has a different name

    this.getNativeControl().setBlocked(!enabled);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.isEnabled = function () {
    return sap.firefly.UxGeneric.prototype.isEnabled.call(this);
  };

  sap.firefly.UxListItemBase.prototype.setSelected = function (selected) {
    sap.firefly.UxGeneric.prototype.setSelected.call(this, selected);
    this.getNativeControl().setSelected(selected);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.isSelected = function () {
    return this.getNativeControl().isSelected();
  };

  sap.firefly.UxListItemBase.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxListItemBase.prototype.setCounter = function (counter) {
    sap.firefly.UxGeneric.prototype.setCounter.call(this, counter);
    this.getNativeControl().setCounter(counter);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.getCounter = function () {
    return sap.firefly.UxGeneric.prototype.getCounter.call(this);
  };

  sap.firefly.UxListItemBase.prototype.setHighlight = function (messageType) {
    sap.firefly.UxGeneric.prototype.setHighlight.call(this, messageType);
    var msgType = sap.ui.core.MessageType.None;

    if (messageType == sap.firefly.UiMessageType.NONE) {
      msgType = sap.ui.core.MessageType.None;
    } else if (messageType == sap.firefly.UiMessageType.ERROR) {
      msgType = sap.ui.core.MessageType.Error;
    } else if (messageType == sap.firefly.UiMessageType.INFORMATION) {
      msgType = sap.ui.core.MessageType.Information;
    } else if (messageType == sap.firefly.UiMessageType.SUCCESS) {
      msgType = sap.ui.core.MessageType.Success;
    } else if (messageType == sap.firefly.UiMessageType.WARNING) {
      msgType = sap.ui.core.MessageType.Warning;
    }

    this.getNativeControl().setHighlight(msgType);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.getHighlight = function () {
    return sap.firefly.UxGeneric.prototype.getHighlight.call(this);
  };

  sap.firefly.UxListItemBase.prototype.setListItemType = function (listItemType) {
    sap.firefly.UxGeneric.prototype.setListItemType.call(this, listItemType);
    var nativeListType = sap.m.ListType.Inactive;

    if (listItemType == sap.firefly.UiListType.ACTIVE) {
      nativeListType = sap.m.ListType.Active;
    } else if (listItemType == sap.firefly.UiListType.DETAIL) {
      nativeListType = sap.m.ListType.Detail;
    } else if (listItemType == sap.firefly.UiListType.DETAIL_AND_ACTIVE) {
      nativeListType = sap.m.ListType.DetailAndActive;
    } else if (listItemType == sap.firefly.UiListType.INACTIVE) {
      nativeListType = sap.m.ListType.Inactive;
    } else if (listItemType == sap.firefly.UiListType.NAVIGATION) {
      nativeListType = sap.m.ListType.Navigation;
    }

    this.getNativeControl().setType(nativeListType);
    return this;
  };

  sap.firefly.UxListItemBase.prototype.getListItemType = function () {
    return sap.firefly.UxGeneric.prototype.getListItemType.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTreeItemBase = function () {
    sap.firefly.UxListItemBase.call(this);
    this._ff_c = "UxTreeItemBase";
  };

  sap.firefly.UxTreeItemBase.prototype = new sap.firefly.UxListItemBase(); //Base classes should have no newInstance method

  sap.firefly.UxTreeItemBase.prototype.initializeNative = function () {
    sap.firefly.UxListItemBase.prototype.initializeNative.call(this);
  };

  sap.firefly.UxTreeItemBase.prototype.releaseObject = function () {
    sap.firefly.UxListItemBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTreeItemBase.prototype.addItem = function (item) {
    sap.firefly.UxListItemBase.prototype.addItem.call(this, item);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTreeItemBase.prototype.insertItem = function (item, index) {
    sap.firefly.UxListItemBase.prototype.insertItem.call(this, item, index);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTreeItemBase.prototype.removeItem = function (item) {
    sap.firefly.UxListItemBase.prototype.removeItem.call(this, item);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTreeItemBase.prototype.clearItems = function () {
    sap.firefly.UxListItemBase.prototype.clearItems.call(this);
    this.createTreeModel();
    return this;
  }; // ======================================


  sap.firefly.UxTreeItemBase.prototype.setExpanded = function (expanded) {
    sap.firefly.UxListItemBase.prototype.setExpanded.call(this, expanded);

    if (expanded === true) {
      this.expandNativeItem(this);
    } else {
      this.collapseNativeItem(this);
    }

    return this;
  };

  sap.firefly.UxTreeItemBase.prototype.isExpanded = function () {
    if (this.getNativeControl()) {
      return this.getNativeControl().getExpanded();
    }

    return sap.firefly.UxListItemBase.prototype.isExpanded.call(this);
  };

  sap.firefly.UxTreeItemBase.prototype.setNode = function (node) {
    sap.firefly.UxListItemBase.prototype.setNode.call(this, node);

    if (this.getNativeControl()) {
      // this is a hack, and it does not work perfect
      // there is no way to do that in an offical way, this is the only way i currently found
      if (node) {
        this.getNativeControl().$().removeClass("sapMTreeItemBaseLeaf");
      } else {
        this.getNativeControl().$().addClass("sapMTreeItemBaseLeaf");
      }
    }

    return this;
  };

  sap.firefly.UxTreeItemBase.prototype.isNode = function () {
    if (this.getNativeControl()) {
      return !this.getNativeControl().isLeaf();
    }

    return sap.firefly.UxListItemBase.prototype.isNode.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTreeItemBase.prototype.createTreeModel = function () {
    if (this.getParent()) {
      this.getParent().createTreeModel();
    }
  };

  sap.firefly.UxTreeItemBase.prototype.expandNativeItem = function (item) {
    if (this.getParent()) {
      this.getParent().expandNativeItem(item);
    }
  };

  sap.firefly.UxTreeItemBase.prototype.collapseNativeItem = function (item) {
    if (this.getParent()) {
      this.getParent().collapseNativeItem(item);
    }
  };

  sap.firefly.UxTreeItemBase.prototype.rerenderNativeTreeItem = function () {
    if (this.getNativeControl()) {
      this.getNativeControl().destroy(); //this.setNativeControl(null);
    }

    this.initializeNative(); // i need to do this to make sure that newly created items have the same data
    // those controls are constantly re-rendered!

    this.setEnabled(this.isEnabled());
    this.setHighlight(this.getHighlight());
    this.setSelected(this.isSelected());
    this.setVisible(this.isVisible());
    this.setBusy(this.isBusy());
    this.setListItemType(this.getListItemType());
    this.setCounter(this.getCounter());
    this.registerOnContextMenu(this.getListenerOnContextMenu());
  };

  sap.firefly.UxTreeItemBase.prototype.itemExpanded = function () {
    if (this.getListenerOnExpand() !== null) {
      var uiEventItem = sap.firefly.UiItemEvent.createItem(this, null, null);
      this.getListenerOnExpand().onExpand(uiEventItem);
    }
  };

  sap.firefly.UxTreeItemBase.prototype.itemCollapsed = function () {
    if (this.getListenerOnCollapse() !== null) {
      var uiEventItem = sap.firefly.UiItemEvent.createItem(this, null, null);
      this.getListenerOnCollapse().onCollapse(uiEventItem);
    }
  };

  sap.firefly.UxComboBoxBase = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxComboBoxBase";
  };

  sap.firefly.UxComboBoxBase.prototype = new sap.firefly.UxGeneric(); //Base classes should have no newInstance method

  sap.firefly.UxComboBoxBase.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
  };

  sap.firefly.UxComboBoxBase.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxComboBoxBase.prototype.registerOnSelectionChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnSelectionChange.call(this, listener);
    this.getNativeControl().detachSelectionChange(this.handleSelectionChange, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachSelectionChange(this.handleSelectionChange, this);
    }

    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.registerOnEnter = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnEnter.call(this, listener);
    var myself = this;
    this.getNativeControl().addEventDelegate({
      onsapenter: this.handleOnEnter.bind(this)
    });
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.registerOnEditingBegin = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnEditingBegin.call(this, listener);
    var myself = this;
    this.getNativeControl().addEventDelegate({
      onfocusin: this.handleOnEditingBegin.bind(this)
    });
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.registerOnEditingEnd = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnEditingEnd.call(this, listener);
    var myself = this;
    this.getNativeControl().addEventDelegate({
      onsapfocusleave: this.handleOnEditingEnd.bind(this)
    });
    return this;
  }; // ======================================


  sap.firefly.UxComboBoxBase.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxComboBoxBase.prototype.open = function () {
    sap.firefly.UxGeneric.prototype.open.call(this);
    this.getNativeControl().open();
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.isOpen = function () {
    return this.getNativeControl().isOpen();
  }; // ======================================


  sap.firefly.UxComboBoxBase.prototype.setValue = function (text) {
    sap.firefly.DfUiContext.prototype.setValue.call(this, text); // skip superclass implementation

    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.getValue = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxComboBoxBase.prototype.setPlaceholder = function (placeholder) {
    sap.firefly.UxGeneric.prototype.setPlaceholder.call(this, placeholder);
    this.getNativeControl().setPlaceholder(placeholder);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.getPlaceholder = function () {
    return this.getNativeControl().getPlaceholder();
  };

  sap.firefly.UxComboBoxBase.prototype.setRequired = function (required) {
    sap.firefly.UxGeneric.prototype.setRequired.call(this, required);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.isRequired = function () {
    return sap.firefly.UxGeneric.prototype.isRequired.call(this);
  };

  sap.firefly.UxComboBoxBase.prototype.setValueState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setValueState.call(this, valueState);
    var newValueState = sap.ui.core.ValueState.None;

    if (valueState === sap.firefly.UiValueState.NONE) {
      newValueState = sap.ui.core.ValueState.None;
    } else if (valueState === sap.firefly.UiValueState.ERROR) {
      newValueState = sap.ui.core.ValueState.Error;
    } else if (valueState === sap.firefly.UiValueState.INFORMATION) {
      newValueState = sap.ui.core.ValueState.Information;
    } else if (valueState === sap.firefly.UiValueState.SUCCESS) {
      newValueState = sap.ui.core.ValueState.Success;
    } else if (valueState === sap.firefly.UiValueState.WARNING) {
      newValueState = sap.ui.core.ValueState.Warning;
    }

    this.getNativeControl().setValueState(newValueState);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.getValueState = function () {
    return sap.firefly.UxGeneric.prototype.getValueState.call(this);
  };

  sap.firefly.UxComboBoxBase.prototype.setValueStateText = function (valueStateText) {
    sap.firefly.UxGeneric.prototype.setValueStateText.call(this, valueStateText);
    this.getNativeControl().setValueStateText(valueStateText);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.getValueStateText = function () {
    return this.getNativeControl().getValueStateText();
  };

  sap.firefly.UxComboBoxBase.prototype.setShowSecondaryValues = function (showSecondaryValues) {
    sap.firefly.UxGeneric.prototype.setShowSecondaryValues.call(this, showSecondaryValues);
    this.getNativeControl().setShowSecondaryValues(showSecondaryValues);
    return this;
  };

  sap.firefly.UxComboBoxBase.prototype.isShowSecondaryValues = function () {
    return this.getNativeControl().getShowSecondaryValues();
  }; // Overrides
  // ======================================


  sap.firefly.UxComboBoxBase.prototype.setHeight = function (height) {
    // remove height from the object
    // don't change the Combobox height on JavaScript, it should only be done on iOS
    sap.firefly.UxGeneric.prototype.setHeight.call(this, null);
    return this;
  }; // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxComboBoxBase.prototype.handleSelectionChange = function (oEvent) {// needs to be implemented by subclasses
  };

  sap.firefly.UxComboBoxBase.prototype.handleOnEnter = function (oEvent) {
    if (this.getListenerOnEnter() !== null) {
      this.getListenerOnEnter().onEnter(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxComboBoxBase.prototype.handleOnEditingBegin = function (oEvent) {
    if (this.getListenerOnEditingBegin() !== null) {
      this.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxComboBoxBase.prototype.handleOnEditingEnd = function (oEvent) {
    if (this.getListenerOnEditingEnd() !== null) {
      this.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxTileBase = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTileBase";
  };

  sap.firefly.UxTileBase.prototype = new sap.firefly.UxGeneric(); //Base classes should have no newInstance method

  sap.firefly.UxTileBase.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
  };

  sap.firefly.UxTileBase.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================
  //TODO: currently only button and this class use this (and subclass), see UxButton class


  sap.firefly.UxTileBase.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().detachPress(this.handlePress, this);

    if (listener) {
      this.getNativeControl().attachPress(this.handlePress, this);
    }

    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxListBase = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxListBase";
  };

  sap.firefly.UxListBase.prototype = new sap.firefly.UxGeneric(); //Base classes should have no newInstance method

  sap.firefly.UxListBase.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
  };

  sap.firefly.UxListBase.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxListBase.prototype.registerOnSelect = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnSelect.call(this, listener);
    this.getNativeControl().detachSelectionChange(this.handleSelect, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachSelectionChange(this.handleSelect, this);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.registerOnSelectionChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnSelectionChange.call(this, listener);
    this.getNativeControl().detachSelectionChange(this.handleSelectionChange, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachSelectionChange(this.handleSelectionChange, this);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.registerOnDelete = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnDelete.call(this, listener);
    this.getNativeControl().detachDelete(this.handleDelete, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachDelete(this.handleDelete, this);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.registerOnScrollLoad = function (listener) {
    sap.firefly.UxListBase.prototype.registerOnScrollLoad.call(this, listener);
    this.getNativeControl().addDelegate({
      onAfterRendering: this.handleScrollLoad.bind(this)
    });
    return this;
  }; // ======================================


  sap.firefly.UxListBase.prototype.scrollToIndex = function (index) {
    sap.firefly.UxGeneric.prototype.scrollToIndex.call(this, index);
    this.getNativeControl().scrollToIndex(index);
    return this;
  }; // ======================================


  sap.firefly.UxListBase.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxListBase.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxListBase.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxListBase.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxListBase.prototype.getSelectedItem = function () {
    var selectedItem = this.getNativeControl().getSelectedItem();

    if (selectedItem != null) {
      return sap.firefly.UxGeneric.getUxControl(selectedItem);
    }

    return null;
  };

  sap.firefly.UxListBase.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeItemToSelect = item.getNativeControl();

      if (nativeItemToSelect) {
        this.getNativeControl().setSelectedItem(nativeItemToSelect, true);
      }
    } else {
      this.clearSelectedItems();
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.getSelectedItems = function () {
    var oList = sap.firefly.XList.create();
    var aSelectedItems = this.getNativeControl().getSelectedItems();

    for (var i = 0; i < aSelectedItems.length; i++) {
      var ffControl = sap.firefly.UxGeneric.getUxControl(aSelectedItems[i]);
      oList.add(ffControl);
    }

    return oList;
  };

  sap.firefly.UxListBase.prototype.setSelectedItems = function (items) {
    sap.firefly.UxGeneric.prototype.setSelectedItems.call(this, items);
    this.getNativeControl().removeSelections();

    if (items !== null) {
      var size = items.size();

      for (var i = 0; i < size; i++) {
        this.getNativeControl().setSelectedItem(items.get(i).getNativeControl(), true);
      }
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.addSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.addSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().setSelectedItem(item.getNativeControl(), true);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().setSelectedItem(item.getNativeControl(), false);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.clearSelectedItems = function () {
    sap.firefly.UxGeneric.prototype.clearSelectedItems.call(this);
    this.getNativeControl().removeSelections();
    return this;
  }; // ======================================


  sap.firefly.UxListBase.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
    ;
  };

  sap.firefly.UxListBase.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      var nativeHeaderControl = header.getNativeControl();
      this.getNativeControl().destroyHeaderToolbar(); // remove the old header toolbar

      var tmpToolbar = new sap.m.Toolbar(this.getId() + "_headerToolbar");
      tmpToolbar.addContent(nativeHeaderControl);
      this.getNativeControl().setHeaderToolbar(tmpToolbar);
    }

    return this;
  };

  sap.firefly.UxListBase.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().destroyHeaderToolbar();
    return this;
  }; // ======================================


  sap.firefly.UxListBase.prototype.setSelectionMode = function (selectionMode) {
    sap.firefly.UxGeneric.prototype.setSelectionMode.call(this, selectionMode);
    this.getNativeControl().setMode(sap.firefly.ui.Ui5ConstantUtils.parseSelectionMode(selectionMode));
    return this;
  };

  sap.firefly.UxListBase.prototype.getSelectionMode = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionMode.call(this);
  };

  sap.firefly.UxListBase.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxListBase.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxListBase.prototype.setNoDataText = function (noDataText) {
    sap.firefly.UxGeneric.prototype.setNoDataText.call(this, noDataText);
    this.getNativeControl().setNoDataText(noDataText);
    return this;
  };

  sap.firefly.UxListBase.prototype.getNoDataText = function () {
    return sap.firefly.UxGeneric.prototype.getNoDataText.call(this);
  };

  sap.firefly.UxListBase.prototype.setOverflow = function (overflow) {
    sap.firefly.UxGeneric.prototype.setOverflow.call(this, overflow);
    return this;
  };

  sap.firefly.UxListBase.prototype.getOverflow = function () {
    return sap.firefly.UxGeneric.prototype.getOverflow.call(this);
  };

  sap.firefly.UxListBase.prototype.setShowNoData = function (showNoData) {
    sap.firefly.UxGeneric.prototype.setShowNoData.call(this, showNoData);
    this.getNativeControl().setShowNoData(showNoData);
    return this;
  };

  sap.firefly.UxListBase.prototype.isShowNoData = function () {
    return this.getNativeControl().getShowNoData();
  };

  sap.firefly.UxListBase.prototype.setListSeparators = function (listSeparators) {
    sap.firefly.UxGeneric.prototype.setListSeparators.call(this, listSeparators);
    this.getNativeControl().setShowSeparators(sap.firefly.ui.Ui5ConstantUtils.parseListSeparators(listSeparators));
    return this;
  };

  sap.firefly.UxListBase.prototype.getListSeparators = function () {
    return sap.firefly.UxGeneric.prototype.getListSeparators.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxListBase.prototype.handleSelect = function (oControlEvent) {
    var isSelect = oControlEvent.getParameters().selected;

    if (isSelect === true) {
      if (this.getListenerOnSelect() !== null) {
        var listItem = oControlEvent.getParameters().listItem;
        var selectedItem = sap.firefly.UxGeneric.getUxControl(listItem);
        var theEvent = sap.firefly.UiSelectionEvent.createSingleSelection(this, null, selectedItem);
        this.getListenerOnSelect().onSelect(theEvent);
      }
    }
  };

  sap.firefly.UxListBase.prototype.handleSelectionChange = function (oControlEvent) {
    if (this.getListenerOnSelectionChange() !== null) {
      var isSelect = oControlEvent.getParameters().selected;
      var isSelectAll = oControlEvent.getParameters().selectAll && isSelect;
      var isDeselectAll = isSelectAll === false && oControlEvent.getParameters().listItems.length > 1; // deselctAll is when listItems length is graeter then 1
      // prepare the properties

      var newParameters = sap.firefly.XProperties.create();
      newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT, isSelect);
      newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT_ALL, isSelectAll);
      newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_DESELECT_ALL, isDeselectAll);
      this.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(this, newParameters));
    }
  };

  sap.firefly.UxListBase.prototype.handleDelete = function (oControlEvent) {
    if (this.getListenerOnDelete() !== null) {
      var nativeItem = oControlEvent.getParameters().listItem;
      var deletedItem = sap.firefly.UxGeneric.getUxControl(nativeItem);
      this.getListenerOnDelete().onDelete(sap.firefly.UiItemEvent.createItem(this, null, deletedItem));
    }
  };

  sap.firefly.UxListBase.prototype.handleScrollLoad = function (oControlEvent) {
    var scroller = sap.m.getScrollDelegate(this.getNativeControl());

    if (scroller) {
      scroller.setGrowingList(this.throttle(function () {
        if (this.getListenerOnScrollLoad() !== null) {
          this.getListenerOnScrollLoad().onScrollLoad(sap.firefly.UiControlEvent.create(this));
        }
      }, 1000), sap.m.ListGrowingDirection.Downwards);
    }
  };

  sap.firefly.UxDateTimeField = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxDateTimeField";
  };

  sap.firefly.UxDateTimeField.prototype = new sap.firefly.UxGeneric(); //Base classes should have no newInstance method

  sap.firefly.UxDateTimeField.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
  };

  sap.firefly.UxDateTimeField.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxDateTimeField.prototype.registerOnChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnChange.call(this, listener);
    this.getNativeControl().detachChange(this.handleChange, this);

    if (listener) {
      this.getNativeControl().attachChange(this.handleChange, this);
    }

    return this;
  };

  sap.firefly.UxDateTimeField.prototype.registerOnLiveChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnLiveChange.call(this, listener);

    if (this.getNativeControl().attachLiveChange) {
      // since ui5 version 1.104
      this.getNativeControl().detachLiveChange(this.handleLiveChange, this);

      if (listener) {
        this.getNativeControl().attachLiveChange(this.handleLiveChange, this);
      }
    }

    return this;
  }; // ======================================


  sap.firefly.UxDateTimeField.prototype.setValue = function (value) {
    sap.firefly.DfUiContext.prototype.setValue.call(this, value); // skip superclass implementation

    this.getNativeControl().setValue(value);
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.getValue = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxDateTimeField.prototype.setValueFormat = function (valueFormat) {
    sap.firefly.UxGeneric.prototype.setValueFormat.call(this, valueFormat);
    this.getNativeControl().setValueFormat(valueFormat);
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.getValueFormat = function () {
    return sap.firefly.UxGeneric.prototype.getValueFormat.call(this);
  };

  sap.firefly.UxDateTimeField.prototype.setDisplayFormat = function (displayFormat) {
    sap.firefly.UxGeneric.prototype.setDisplayFormat.call(this, displayFormat);
    this.getNativeControl().setDisplayFormat(displayFormat);
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.getDisplayFormat = function () {
    return sap.firefly.UxGeneric.prototype.getDisplayFormat.call(this);
  };

  sap.firefly.UxDateTimeField.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxDateTimeField.prototype.setValueState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setValueState.call(this, valueState);
    this.getNativeControl().setValueState(sap.firefly.ui.Ui5ConstantUtils.parseValueState(valueState));
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.getValueState = function () {
    return sap.firefly.UxGeneric.prototype.getValueState.call(this);
  };

  sap.firefly.UxDateTimeField.prototype.setValueStateText = function (valueStateText) {
    sap.firefly.UxGeneric.prototype.setValueStateText.call(this, valueStateText);
    this.getNativeControl().setValueStateText(valueStateText);
    return this;
  };

  sap.firefly.UxDateTimeField.prototype.getValueStateText = function () {
    return this.getNativeControl().getValueStateText();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxDateTimeField.prototype.handleChange = function (oControlEvent) {
    if (this.getListenerOnChange() !== null) {
      var newValue = oControlEvent.getParameters().value;
      var isValid = oControlEvent.getParameters().valid;
      var newParameters = sap.firefly.XProperties.create();
      newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
      newParameters.putBoolean(sap.firefly.UiEventParams.PARAM_VALID, isValid);
      this.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  };

  sap.firefly.UxDateTimeField.prototype.handleLiveChange = function (oControlEvent) {
    if (this.getListenerOnLiveChange() !== null) {
      var newValue = oControlEvent.getParameters().value;
      var previousValue = oControlEvent.getParameters().previousValue;
      var newParameters = sap.firefly.XProperties.create();
      newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
      newParameters.putString(sap.firefly.UiEventParams.PARAM_PREVIOUS_VALUE, previousValue);
      this.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  };

  sap.firefly.UxCard = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxCard";
  };

  sap.firefly.UxCard.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxCard.prototype.newInstance = function () {
    var object = new sap.firefly.UxCard();
    object.setup();
    return object;
  };

  sap.firefly.UxCard.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.integration");
    var myself = this;
    var nativeControl = new sap.ui.integration.widgets.Card(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCard.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCard.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxCard.prototype.setModelJson = function (modelJson) {
    sap.firefly.UxGeneric.prototype.setModelJson.call(this, modelJson);
    var nativeModel = jsonModel.convertToNative();
    this.getNativeControl().setManifest(nativeModel);
    return this;
  };

  sap.firefly.UxCard.prototype.getModelJson = function () {
    return sap.firefly.UxGeneric.prototype.getModelJson.call(this);
  };

  sap.firefly.UxCard.prototype.setDataManifest = function (dataManifest) {
    sap.firefly.UxGeneric.prototype.setDataManifest.call(this, dataManifest);
    return this;
  };

  sap.firefly.UxCard.prototype.getDataManifest = function () {
    return sap.firefly.UxGeneric.prototype.getDataManifest.call(this);
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxButton = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxButton";
  };

  sap.firefly.UxButton.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxButton();
    object.setup();
    return object;
  };

  sap.firefly.UxButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Button(this.getId());
    nativeControl.addStyleClass("ff-button");
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxButton.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================
  //TODO: for testing use the new way of handle events


  sap.firefly.UxButton.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().detachPress(this.handlePress, this);

    if (listener) {
      this.getNativeControl().attachPress(this.handlePress, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxButton.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxButton.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxButton.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxButton.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxButton.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxButton.prototype.setActiveIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setActiveIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxButton.prototype.getActiveIcon = function () {
    return sap.firefly.UxGeneric.prototype.getActiveIcon.call(this);
  };

  sap.firefly.UxButton.prototype.setButtonType = function (value) {
    sap.firefly.UxGeneric.prototype.setButtonType.call(this, value);

    if (value === sap.firefly.UiButtonType.DEFAULT) {
      this.getNativeControl().setType(sap.m.ButtonType.Default);
    } else if (value === sap.firefly.UiButtonType.PRIMARY) {
      this.getNativeControl().setType(sap.m.ButtonType.Emphasized);
    } else if (value === sap.firefly.UiButtonType.ACCEPT) {
      this.getNativeControl().setType(sap.m.ButtonType.Accept);
    } else if (value === sap.firefly.UiButtonType.TRANSPARENT) {
      this.getNativeControl().setType(sap.m.ButtonType.Transparent);
    } else if (value === sap.firefly.UiButtonType.DESTRUCTIVE) {
      this.getNativeControl().setType(sap.m.ButtonType.Reject);
    } else if (value === sap.firefly.UiButtonType.ATTENTION) {
      this.getNativeControl().setType(sap.m.ButtonType.Attention);
    } else if (value === sap.firefly.UiButtonType.GHOST) {
      this.getNativeControl().setType(sap.m.ButtonType.Ghost);
    } else if (value === sap.firefly.UiButtonType.CRITICAL) {
      this.getNativeControl().setType(sap.m.ButtonType.Critical);
    } else if (value === sap.firefly.UiButtonType.NEGATIVE) {
      this.getNativeControl().setType(sap.m.ButtonType.Negative);
    } else if (value === sap.firefly.UiButtonType.NEUTRAL) {
      this.getNativeControl().setType(sap.m.ButtonType.Neutral);
    } else if (value === sap.firefly.UiButtonType.SUCCESS) {
      this.getNativeControl().setType(sap.m.ButtonType.Success);
    }

    return this;
  };

  sap.firefly.UxButton.prototype.getButtonType = function () {
    return sap.firefly.UxGeneric.prototype.getButtonType.call(this);
  };

  sap.firefly.UxButton.prototype.setBadgeNumber = function (badgeNumber) {
    sap.firefly.UxGeneric.prototype.setBadgeNumber.call(this, badgeNumber);

    this._createBadgeCustomDataIfNeeded();

    this.getNativeControl().getBadgeCustomData().setValue(badgeNumber);
    return this;
  };

  sap.firefly.UxButton.prototype.getBadgeNumber = function () {
    return sap.firefly.UxGeneric.prototype.getBadgeNumber.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxButton.prototype.applyHeightCss = function (element, heightCss) {
    element.style.height = heightCss; // adjust icon and text to be in the center vertically

    $(element).find(".sapMBtnInner").css("height", "100%");
    $(element).find(".sapMBtnInner").css("display", "flex");
    $(element).find(".sapMBtnInner").css("justify-content", "center");
    $(element).find(".sapMBtnInner").css("align-items", "center");
  };

  sap.firefly.UxButton.prototype.applyBackgroundColorCss = function (element, bgColor) {
    $(element).find(".sapMBtnInner").css("background-color", bgColor);
  }; // Helpers
  // ======================================


  sap.firefly.UxButton.prototype._createBadgeCustomDataIfNeeded = function () {
    var badgeCustomData = this.getNativeControl().getBadgeCustomData();

    if (!badgeCustomData) {
      this.getNativeControl().addCustomData(new sap.m.BadgeCustomData());
    }
  };

  sap.firefly.UxToggleButton = function () {
    sap.firefly.UxButton.call(this);
    this._ff_c = "UxToggleButton";
  };

  sap.firefly.UxToggleButton.prototype = new sap.firefly.UxButton();

  sap.firefly.UxToggleButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxToggleButton();
    object.setup();
    return object;
  };

  sap.firefly.UxToggleButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); //call UxGeneric directly, we want to skip the UxButton initialize method call here since we create a different control

    var myself = this;
    var nativeControl = new sap.m.ToggleButton(this.getId()); // add unique style class to distinguish the toggle button from a normal button

    nativeControl.addStyleClass("ff-toggle-button");
    this.setNativeControl(nativeControl);
  }; // ======================================


  sap.firefly.UxToggleButton.prototype.setPressed = function (pressed) {
    sap.firefly.UxButton.prototype.setPressed.call(this, pressed);
    this.getNativeControl().setPressed(pressed);
    return this;
  };

  sap.firefly.UxToggleButton.prototype.isPressed = function () {
    return this.getNativeControl().getPressed();
  }; // ToggleButton inherits from Button and it has the same base properties and events


  sap.firefly.UxMenuButton = function () {
    sap.firefly.UxButton.call(this);
    this._ff_c = "UxMenuButton";
  };

  sap.firefly.UxMenuButton.prototype = new sap.firefly.UxButton();

  sap.firefly.UxMenuButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxMenuButton();
    object.setup();
    return object;
  };

  sap.firefly.UxMenuButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); //call UxGeneric directly, we want to skip the UxButton initialize method call here since we create a different control

    var myself = this;
    var nativeControl = new sap.m.MenuButton(this.getId());
    nativeControl.addStyleClass("ff-menu-button");
    this.setNativeControl(nativeControl);
  }; // ======================================
  //TODO: for testing use the new way of handle events
  // overwrite onPress since menu button has different event name


  sap.firefly.UxMenuButton.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().detachDefaultAction(this.handlePress, this);

    if (listener) {
      this.getNativeControl().attachDefaultAction(this.handlePress, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxMenuButton.prototype.setMenuButtonMode = function (menuButtonMode) {
    sap.firefly.UxGeneric.prototype.setMenuButtonMode.call(this, menuButtonMode); //call UxGeneric directly

    var nativeMenuButtonMode = sap.m.MenuButtonMode.Regular;

    if (menuButtonMode === sap.firefly.UiMenuButtonMode.REGULAR) {
      nativeMenuButtonMode = sap.m.MenuButtonMode.Regular;
    } else if (menuButtonMode === sap.firefly.UiMenuButtonMode.SPLIT) {
      nativeMenuButtonMode = sap.m.MenuButtonMode.Split;
    }

    this.getNativeControl().setButtonMode(nativeMenuButtonMode);
    return this;
  };

  sap.firefly.UxMenuButton.prototype.getMenuButtonMode = function () {
    return sap.firefly.UxGeneric.prototype.getMenuButtonMode.call(this); //call UxGeneric directly
  };

  sap.firefly.UxMenuButton.prototype.setMenu = function (menu) {
    sap.firefly.UxGeneric.prototype.setMenu.call(this, menu); //call UxGeneric directly

    var nativeMenu = menu ? menu.getNativeControl() : null;
    this.getNativeControl().setMenu(nativeMenu);
    return this;
  };

  sap.firefly.UxMenuButton.prototype.getMenu = function () {
    return sap.firefly.UxGeneric.prototype.getMenu.call(this); //call UxGeneric directly
  };

  sap.firefly.UxMenuButton.prototype.setUseDefaultActionOnly = function (useDefaultActionOnly) {
    sap.firefly.UxGeneric.prototype.setUseDefaultActionOnly.call(this, useDefaultActionOnly); //call UxGeneric directly

    this.getNativeControl().setUseDefaultActionOnly(useDefaultActionOnly);
    return this;
  };

  sap.firefly.UxMenuButton.prototype.isUseDefaultActionOnly = function () {
    return sap.firefly.UxGeneric.prototype.isUseDefaultActionOnly.call(this); //call UxGeneric directly
  }; // UxMenuButton inherits from Button and it has the same base properties and events


  sap.firefly.UxOverflowButton = function () {
    sap.firefly.UxButton.call(this);
    this._ff_c = "UxOverflowButton";
  };

  sap.firefly.UxOverflowButton.prototype = new sap.firefly.UxButton();

  sap.firefly.UxOverflowButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxOverflowButton();
    object.setup();
    return object;
  };

  sap.firefly.UxOverflowButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); //call UxGeneric directly, we want to skip the UxButton initialize method call here since we create a different control

    var myself = this;
    var nativeControl = new sap.m.OverflowToolbarButton(this.getId());
    nativeControl.addStyleClass("ff-overflow-button");
    this.setNativeControl(nativeControl);
  }; // ======================================
  // OverflowButton inherits from Button and it has the same base properties and events


  sap.firefly.UxOverflowToggleButton = function () {
    sap.firefly.UxToggleButton.call(this);
    this._ff_c = "UxOverflowToggleButton";
  };

  sap.firefly.UxOverflowToggleButton.prototype = new sap.firefly.UxToggleButton();

  sap.firefly.UxOverflowToggleButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxOverflowToggleButton();
    object.setup();
    return object;
  };

  sap.firefly.UxOverflowToggleButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); //call UxGeneric directly, we want to skip the UxToggleButton initialize method call here since we create a different control

    var myself = this;
    var nativeControl = new sap.m.OverflowToolbarToggleButton(this.getId());
    nativeControl.addStyleClass("ff-overflow-toggle-button");
    this.setNativeControl(nativeControl);
  }; // ======================================
  // OverflowToggleButton inherits from ToggleButton and it has the same base properties and events


  sap.firefly.UxImage = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxImage";
  };

  sap.firefly.UxImage.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxImage.prototype.newInstance = function () {
    var object = new sap.firefly.UxImage();
    object.setup();
    return object;
  };

  sap.firefly.UxImage.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Image(this.getId());
    nativeControl.setDensityAware(false);
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxImage.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxImage.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().detachPress(this.handlePress, this);

    if (listener) {
      this.getNativeControl().attachPress(this.handlePress, this);
    }

    return this;
  };

  sap.firefly.UxImage.prototype.registerOnLoadFinished = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnLoadFinished.call(this, listener);
    this.getNativeControl().detachLoad(this.handleLoadFinished, this);

    if (listener) {
      this.getNativeControl().attachLoad(this.handleLoadFinished, this);
    }

    return this;
  };

  sap.firefly.UxImage.prototype.registerOnError = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnError.call(this, listener);
    this.getNativeControl().detachError(this.handleError, this);

    if (listener) {
      this.getNativeControl().attachError(this.handleError, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxImage.prototype.setSrc = function (src) {
    sap.firefly.UxGeneric.prototype.setSrc.call(this, src);

    if (src === null || src.length <= 0) {
      this.getNativeControl().setSrc(null);
    } else {
      this.getNativeControl().setSrc(src);
    }

    return this;
  };

  sap.firefly.UxImage.prototype.getSrc = function () {
    return sap.firefly.UxGeneric.prototype.getSrc.call(this);
  };

  sap.firefly.UxImage.prototype.setRotation = function (rotation) {
    sap.firefly.UxGeneric.prototype.setRotation.call(this, rotation); //not supported by the ui5 control?

    return this;
  };

  sap.firefly.UxImage.prototype.getRotation = function () {
    return sap.firefly.UxGeneric.prototype.getRotation.call(this);
  };

  sap.firefly.UxImage.prototype.setLazyLoading = function (value) {
    sap.firefly.UxGeneric.prototype.setLazyLoading.call(this, value);
    this.getNativeControl().setLazyLoading(value);
    return this;
  };

  sap.firefly.UxImage.prototype.isLazyLoadis = function () {
    return sap.firefly.UxGeneric.prototype.isLazyLoadis.call(this);
  };

  sap.firefly.UxImage.prototype.setBackgroundSize = function (value) {
    sap.firefly.UxGeneric.prototype.setBackgroundSize.call(this, value);
    this.getNativeControl().setBackgroundSize(value);
    return this;
  };

  sap.firefly.UxImage.prototype.getBackgroundSize = function () {
    return sap.firefly.UxGeneric.prototype.getBackgroundSize.call(this);
  };

  sap.firefly.UxImage.prototype.setBackgroundPosition = function (value) {
    sap.firefly.UxGeneric.prototype.setBackgroundPosition.call(this, value);
    this.getNativeControl().setBackgroundPosition(value);
    return this;
  };

  sap.firefly.UxImage.prototype.getBackgroundPosition = function () {
    return sap.firefly.UxGeneric.prototype.getBackgroundPosition.call(this);
  };

  sap.firefly.UxImage.prototype.setImageMode = function (value) {
    sap.firefly.UxGeneric.prototype.setImageMode.call(this, value);
    this.getNativeControl().setMode(sap.firefly.ui.Ui5ConstantUtils.parseImageMode(value));
    return this;
  };

  sap.firefly.UxImage.prototype.getImageMode = function () {
    return sap.firefly.UxGeneric.prototype.getImageMode.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxImage.prototype.handleLoadFinished = function (oEvent, parameters) {
    if (this.getListenerOnLoadFinished() !== null) {
      this.getListenerOnLoadFinished().onLoadFinished(sap.firefly.UiControlEvent.create(this, null));
    }
  };

  sap.firefly.UxImage.prototype.handleError = function (oEvent, parameters) {
    if (this.getListenerOnError() !== null) {
      //    var newParameters = sap.firefly.XProperties.create();
      //  newParameters.putString(sap.firefly.UiEventParams.PARAM_MSG, msg);
      this.getListenerOnError().onError(sap.firefly.UiControlEvent.create(this, null));
    }
  };

  sap.firefly.UxIcon = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxIcon";
    this.m_isEndIcon = false;
  };

  sap.firefly.UxIcon.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxIcon.prototype.newInstance = function () {
    var object = new sap.firefly.UxIcon();
    object.setup();
    return object;
  };

  sap.firefly.UxIcon.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.ui.core.Icon(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxIcon.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxIcon.prototype._addEvents = function (nativeControl) {
    var myself = this; //onPress event

    nativeControl.attachPress(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null && myself.isEnabled() === true) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxIcon.prototype.setTooltip = function (tooltip) {
    sap.firefly.UxGeneric.prototype.setTooltip.call(this, tooltip); // when someone sets a tooltip then disable automatic tooltip
    // that way when a tooltip is not set then the automatic will be used
    // this is only required for the UxIcon control

    this.getNativeControl().setUseIconTooltip(false);
    return this;
  };

  sap.firefly.UxIcon.prototype.setColor = function (color) {
    sap.firefly.UxGeneric.prototype.setColor.call(this, color);
    return this;
  };

  sap.firefly.UxIcon.prototype.getColor = function () {
    return sap.firefly.UxGeneric.prototype.getColor.call(this);
  };

  sap.firefly.UxIcon.prototype.setIconSize = function (iconSize) {
    sap.firefly.UxGeneric.prototype.setIconSize.call(this, iconSize);
    return this;
  };

  sap.firefly.UxIcon.prototype.getIconSize = function () {
    return sap.firefly.UxGeneric.prototype.getIconSize.call(this);
  };

  sap.firefly.UxIcon.prototype.setHeight = function (height) {
    sap.firefly.UxGeneric.prototype.setHeight.call(this, height); // use the height as the icon size to simplify the api

    var heightCss = this.calculateHeightCss();

    if (heightCss !== null) {
      this.getNativeControl().setSize(heightCss);
    }

    return this;
  };

  sap.firefly.UxIcon.prototype.setEnabled = function (enabled) {
    sap.firefly.DfUiContext.prototype.setEnabled.call(this, enabled); // must skip UxGeneric superclass class since the property does not exist on the icon control
    // trigger a manual rerender (invalidate) to update styling

    this.rerenderNativeControl(); // additional end icon styling

    this._applyIconStyles();

    return this;
  };

  sap.firefly.UxIcon.prototype.isEnabled = function () {
    return sap.firefly.DfUiContext.prototype.isEnabled.call(this); // must skip UxGeneric superclass class since the property does not exist on the icon control
  }; // Overrides
  // ======================================


  sap.firefly.UxIcon.prototype.setIcon = function (icon) {
    sap.firefly.DfUiContext.prototype.setIcon.call(this, icon);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(icon);
    this.getNativeControl().setSrc(iconUri); //different prop name

    return this;
  }; // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxIcon.prototype.applyCustomCssStyling = function (element) {
    if (this.isEnabled() === true) {
      element.style.cursor = null;
    } else {
      element.style.cursor = "default";
    }
  };

  sap.firefly.UxIcon.prototype.applyCustomAttributes = function (element) {
    if (this.isEnabled() === true) {
      $(element).attr("tabIndex", 0);
      element.style.outline = null;
    } else {
      $(element).attr("tabIndex", -1); // prevent disabled icon to be focused, tab tabIndex="-1" makes an element non focusable

      element.style.outline = "none";
    }
  }; // Helpers
  // ======================================
  // called by the endIcons aggregation owner (currently only input) to add special endicon styling


  sap.firefly.UxIcon.prototype.setIsEndIcon = function (endIcon) {
    this.m_isEndIcon = endIcon;

    this._applyIconStyles();
  };

  sap.firefly.UxIcon.prototype.isEndIcon = function () {
    return this.m_isEndIcon;
  };

  sap.firefly.UxIcon.prototype._applyIconStyles = function () {
    if (this.isEnabled() === true && this.isEndIcon() === true || this.isEnabled() === false && this.isEndIcon() === false) {
      this.getNativeControl().setHoverBackgroundColor(null);
      this.getNativeControl().setActiveColor(null);
    } else {
      this.getNativeControl().setHoverBackgroundColor("transparent");
      this.getNativeControl().setActiveColor("#666666");
    }
  };

  sap.firefly.UxAvatar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxAvatar";
  };

  sap.firefly.UxAvatar.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxAvatar.prototype.newInstance = function () {
    var object = new sap.firefly.UxAvatar();
    object.setup();
    return object;
  };

  sap.firefly.UxAvatar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Avatar(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxAvatar.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxAvatar.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().detachPress(this.handlePress, this);

    if (listener) {
      this.getNativeControl().attachPress(this.handlePress, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxAvatar.prototype.setSrc = function (src) {
    sap.firefly.UxGeneric.prototype.setSrc.call(this, src);

    if (src === null || src.length <= 0) {
      this.getNativeControl().setSrc(null);
    } else {
      this.getNativeControl().setSrc(src);
    }

    return this;
  };

  sap.firefly.UxAvatar.prototype.getSrc = function () {
    return sap.firefly.UxGeneric.prototype.getSrc.call(this);
  };

  sap.firefly.UxAvatar.prototype.setInitials = function (initials) {
    sap.firefly.UxGeneric.prototype.setInitials.call(this, initials);
    this.getNativeControl().setInitials(initials);
    return this;
  };

  sap.firefly.UxAvatar.prototype.getInitials = function () {
    return sap.firefly.UxGeneric.prototype.getInitials.call(this);
  };

  sap.firefly.UxAvatar.prototype.setAvatarSize = function (avatarSize) {
    sap.firefly.UxGeneric.prototype.setAvatarSize.call(this, avatarSize);
    this.getNativeControl().setDisplaySize(sap.firefly.ui.Ui5ConstantUtils.parseAvatarSize(avatarSize));
    return this;
  };

  sap.firefly.UxAvatar.prototype.getAvatarSize = function () {
    return sap.firefly.UxGeneric.prototype.getAvatarSize.call(this);
  };

  sap.firefly.UxAvatar.prototype.setAvatarShape = function (avatarShape) {
    sap.firefly.UxGeneric.prototype.setAvatarShape.call(this, avatarShape);
    this.getNativeControl().setDisplayShape(sap.firefly.ui.Ui5ConstantUtils.parseAvatarShape(avatarShape));
    return this;
  };

  sap.firefly.UxAvatar.prototype.getAvatarShape = function () {
    return sap.firefly.UxGeneric.prototype.getAvatarShape.call(this);
  };

  sap.firefly.UxAvatar.prototype.setAvatarColor = function (avatarColor) {
    sap.firefly.UxGeneric.prototype.setAvatarColor.call(this, avatarColor);
    this.getNativeControl().setBackgroundColor(sap.firefly.ui.Ui5ConstantUtils.parseAvatarColor(avatarColor));
    return this;
  };

  sap.firefly.UxAvatar.prototype.getAvatarColor = function () {
    return sap.firefly.UxGeneric.prototype.getAvatarColor.call(this);
  }; // Overrides
  // ======================================


  sap.firefly.UxAvatar.prototype.setIcon = function (icon) {
    sap.firefly.DfUiContext.prototype.setIcon.call(this, icon);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(icon);
    this.getNativeControl().setSrc(iconUri); //different prop name

    return this;
  }; // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxText = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxText";
  };

  sap.firefly.UxText.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxText.prototype.newInstance = function () {
    var object = new sap.firefly.UxText();
    object.setup();
    return object;
  };

  sap.firefly.UxText.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.TextArea(this.getId());
    nativeControl.setEditable(false);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxText.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxText.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxText.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation

    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxText.prototype.getText = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxText.prototype.setEnabled = function (enabled) {
    sap.firefly.DfUiContext.prototype.setEnabled.call(this, enabled); // skip superclass implementation

    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxText.prototype.isEnabled = function () {
    return this.getNativeControl().getEditable();
  };

  sap.firefly.UxText.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxText.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxText.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxText.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxText.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.UxGeneric.prototype.setFontWeight.call(this, fontWeight);
    return this;
  };

  sap.firefly.UxText.prototype.getFontWeight = function () {
    return sap.firefly.UxGeneric.prototype.getFontWeight.call(this);
  };

  sap.firefly.UxText.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxText.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxText.prototype.applyBackgroundColorCss = function (element, bgColor) {
    $(element).find(".sapMInputBaseInner").css("background-color", bgColor);
  }; // special font color handling


  sap.firefly.UxText.prototype.applyFontColorCss = function (element, fontColorCss) {
    $(element).find("textarea").css("color", fontColorCss);
  }; // special font size handling


  sap.firefly.UxText.prototype.applyFontSizeCss = function (element, fontSizeCss) {
    $(element).find("textarea").css("font-size", fontSizeCss);
  }; // special font style handling


  sap.firefly.UxText.prototype.applyFontStyleCss = function (element, fontStyleCss) {
    $(element).find("textarea").css("font-style", fontStyleCss);
  }; // special font weight handling


  sap.firefly.UxText.prototype.applyFontWeightCss = function (element, fontWeightCss) {
    $(element).find("textarea").css("font-weight", fontWeightCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxTextArea = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTextArea";
  };

  sap.firefly.UxTextArea.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTextArea.prototype.newInstance = function () {
    var object = new sap.firefly.UxTextArea();
    object.setup();
    return object;
  };

  sap.firefly.UxTextArea.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.TextArea(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTextArea.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTextArea.prototype._addEvents = function (nativeControl) {
    var myself = this; // onLiveChange event

    nativeControl.attachLiveChange(this.debounce(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        var newValue = oEvent.getParameters().newValue;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }, function () {
      // debounce time is a function, so dynamic time can be passed
      return myself.getDebounceTime();
    })); //onPaste event

    nativeControl.onpaste = function (event) {
      if (myself.getListenerOnPaste() !== null) {
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("text/plain"); // i need to make a timeout so that firs the data is pasted and it could be replaced afterwards

        setTimeout(function () {
          var newParameters = sap.firefly.XProperties.create();
          newParameters.putString(sap.firefly.UiEventParams.PARAM_PASTED_DATA, pastedData);
          myself.getListenerOnPaste().onPaste(sap.firefly.UiControlEvent.create(myself, newParameters));
        }, 0);
      }
    }; // onEnter, onFocusIn, onFocusOut events


    nativeControl.addEventDelegate({
      onsapenter: function onsapenter() {
        if (myself.getListenerOnEnter() !== null) {
          myself.getListenerOnEnter().onEnter(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onfocusin: function onfocusin() {
        if (myself.getListenerOnEditingBegin() !== null) {
          myself.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onsapfocusleave: function onsapfocusleave() {
        if (myself.getListenerOnEditingEnd() !== null) {
          myself.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(myself));
        }
      }
    });
  }; // ======================================


  sap.firefly.UxTextArea.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxTextArea.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation

    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getText = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxTextArea.prototype.setPlaceholder = function (placeholder) {
    sap.firefly.UxGeneric.prototype.setPlaceholder.call(this, placeholder);
    this.getNativeControl().setPlaceholder(placeholder);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getPlaceholder = function () {
    return this.getNativeControl().getPlaceholder();
  };

  sap.firefly.UxTextArea.prototype.setMaxLength = function (maxLength) {
    sap.firefly.UxGeneric.prototype.setMaxLength.call(this, maxLength);
    this.getNativeControl().setMaxLength(maxLength);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getMaxLength = function () {
    return sap.firefly.UxGeneric.prototype.getMaxLength.call(this);
  };

  sap.firefly.UxTextArea.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxTextArea.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxTextArea.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxTextArea.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxTextArea.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.UxGeneric.prototype.setFontWeight.call(this, fontWeight);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getFontWeight = function () {
    return sap.firefly.UxGeneric.prototype.getFontWeight.call(this);
  };

  sap.firefly.UxTextArea.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  };

  sap.firefly.UxTextArea.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTextArea.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxTextArea.prototype.setDebounceTime = function (debounceTime) {
    sap.firefly.UxGeneric.prototype.setDebounceTime.call(this, debounceTime);
    return this;
  };

  sap.firefly.UxTextArea.prototype.getDebounceTime = function () {
    return sap.firefly.UxGeneric.prototype.getDebounceTime.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxTextArea.prototype.applyBackgroundColorCss = function (element, bgColor) {
    $(element).find(".sapMInputBaseInner").css("background-color", bgColor);
  }; // special font color handling


  sap.firefly.UxTextArea.prototype.applyFontColorCss = function (element, fontColorCss) {
    $(element).find("textarea").css("color", fontColorCss);
  }; // special font size handling


  sap.firefly.UxTextArea.prototype.applyFontSizeCss = function (element, fontSizeCss) {
    $(element).find("textarea").css("font-size", fontSizeCss);
  }; // special font style handling


  sap.firefly.UxTextArea.prototype.applyFontStyleCss = function (element, fontStyleCss) {
    $(element).find("textarea").css("font-style", fontStyleCss);
  }; // special font weight handling


  sap.firefly.UxTextArea.prototype.applyFontWeightCss = function (element, fontWeightCss) {
    $(element).find("textarea").css("font-weight", fontWeightCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxCodeEditor = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxCodeEditor";
  };

  sap.firefly.UxCodeEditor.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxCodeEditor.prototype.newInstance = function () {
    var object = new sap.firefly.UxCodeEditor();
    object.setup();
    return object;
  };

  sap.firefly.UxCodeEditor.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.codeeditor");
    var myself = this;
    var nativeControl = new sap.ui.codeeditor.CodeEditor(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCodeEditor.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCodeEditor.prototype._addEvents = function (nativeControl) {
    var myself = this; // onLiveChange event

    nativeControl.attachLiveChange(this.debounce(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        var newValue = oEvent.getParameters().value;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }, function () {
      // debounce time is a function, so dynamic time can be passed
      return myself.getDebounceTime();
    })); //onPaste event

    nativeControl.onpaste = function (event) {
      if (myself.getListenerOnPaste() !== null) {
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("text/plain"); // i need to make a timeout so that first the data is pasted and it could be replaced afterwards

        setTimeout(function () {
          var newParameters = sap.firefly.XProperties.create();
          newParameters.putString(sap.firefly.UiEventParams.PARAM_PASTED_DATA, pastedData);
          myself.getListenerOnPaste().onPaste(sap.firefly.UiControlEvent.create(myself, newParameters));
        }, 0);
      }
    }; // onEnter, onFocusIn, onFocusOut events


    nativeControl.addEventDelegate({
      onsapenter: function onsapenter() {
        if (myself.getListenerOnEnter() !== null) {
          myself.getListenerOnEnter().onEnter(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onfocusin: function onfocusin() {
        if (myself.getListenerOnEditingBegin() !== null) {
          myself.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onsapfocusleave: function onsapfocusleave() {
        if (myself.getListenerOnEditingEnd() !== null) {
          myself.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(myself));
        }
      }
    });
  }; // ======================================


  sap.firefly.UxCodeEditor.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.prettyPrint = function () {
    sap.firefly.UxGeneric.prototype.prettyPrint.call(this);
    this.getNativeControl().prettyPrint();
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.insertText = function (text) {
    sap.firefly.UxGeneric.prototype.insertText.call(text); //use of private api!

    if (this.getNativeControl()._oEditor && this.getNativeControl()._oEditor.insert) {
      this.getNativeControl()._oEditor.insert(text);
    } else {
      //fallback, append at the end
      this.getNativeControl().setValue(this.getNativeControl().getValue() + text);
    }

    return this;
  }; // ======================================


  sap.firefly.UxCodeEditor.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation

    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.getText = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxCodeEditor.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxCodeEditor.prototype.setEnabled = function (enabled) {
    // there is no enabbled property on the code editor so i just forward this to the editable property
    this.setEditable(enabled);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.isEnabled = function () {
    return this.isEditable();
  };

  sap.firefly.UxCodeEditor.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxCodeEditor.prototype.setDebounceTime = function (debounceTime) {
    sap.firefly.UxGeneric.prototype.setDebounceTime.call(this, debounceTime);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.getDebounceTime = function () {
    return sap.firefly.UxGeneric.prototype.getDebounceTime.call(this);
  };

  sap.firefly.UxCodeEditor.prototype.setCodeType = function (codeType) {
    sap.firefly.UxGeneric.prototype.setCodeType.call(this, codeType);
    this.getNativeControl().setType(codeType);
    return this;
  };

  sap.firefly.UxCodeEditor.prototype.getCodeType = function () {
    return this.getNativeControl().getType();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRichTextEditor = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxRichTextEditor";
  };

  sap.firefly.UxRichTextEditor.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxRichTextEditor.prototype.newInstance = function () {
    var object = new sap.firefly.UxRichTextEditor();
    object.setup();
    return object;
  };

  sap.firefly.UxRichTextEditor.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.richtexteditor");
    var myself = this;
    var nativeControl = new sap.ui.richtexteditor.RichTextEditor(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxRichTextEditor.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxRichTextEditor.prototype._addEvents = function (nativeControl) {
    var myself = this; // onChange event

    nativeControl.attachChange(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    }); // onEnter, onFocusIn, onFocusOut events

    nativeControl.addEventDelegate({
      onfocusin: function onfocusin() {
        if (myself.getListenerOnEditingBegin() !== null) {
          myself.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onsapfocusleave: function onsapfocusleave() {
        if (myself.getListenerOnEditingEnd() !== null) {
          myself.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(myself));
        }
      }
    });
  }; // ======================================


  sap.firefly.UxRichTextEditor.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxRichTextEditor.prototype.setValue = function (value) {
    sap.firefly.UxGeneric.prototype.setValue.call(this, value);
    return this;
  };

  sap.firefly.UxRichTextEditor.prototype.getValue = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxRichTextEditor.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxRichTextEditor.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxRichTextEditor.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxRichTextEditor.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxInput = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxInput";
    this.m_liveChangeDebounce = null;
  };

  sap.firefly.UxInput.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxInput.prototype.newInstance = function () {
    var object = new sap.firefly.UxInput();
    object.setup();
    return object;
  };

  sap.firefly.UxInput.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Input(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxInput.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxInput.prototype._addEvents = function (nativeControl) {
    var myself = this; // onLiveChange event
    // prepare the debounce function

    this.m_liveChangeDebounce = this.debounce(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        var newValue = oEvent.getParameters().newValue;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }, function () {
      // debounce time is a function, so dynamic time can be passed
      return myself.getDebounceTime();
    }); // attach the live change event

    nativeControl.attachLiveChange(this.m_liveChangeDebounce); // onSuggestionItemSelect event

    nativeControl.attachSuggestionItemSelected(function (oEvent) {
      if (myself.getListenerOnSuggestionSelect() !== null) {
        var selectedNativeItem = oEvent.getParameters().selectedItem;
        var selectedItem = sap.firefly.UxGeneric.getUxControl(selectedNativeItem);
        var theEvent = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedItem);
        myself.getListenerOnSuggestionSelect().onSuggestionSelect(theEvent);
      }
    }); //onPaste event

    nativeControl.onpaste = function (event) {
      if (myself.getListenerOnPaste() !== null) {
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("text/plain"); // i need to make a timeout so that first the data is pasted and it could be replaced afterwards

        setTimeout(function () {
          var newParameters = sap.firefly.XProperties.create();
          newParameters.putString(sap.firefly.UiEventParams.PARAM_PASTED_DATA, pastedData);
          myself.getListenerOnPaste().onPaste(sap.firefly.UiControlEvent.create(myself, newParameters));
        }, 0);
      }
    }; // onEnter, onFocusIn, onFocusOut events


    nativeControl.addEventDelegate({
      onsapenter: function onsapenter(oEvent) {
        if (myself.getListenerOnEnter() !== null) {
          var isIcon = $(oEvent.target).hasClass("sapUiIcon"); // do not fire onEnter event when enter on an EndIcon is pressed

          if (isIcon == false) {
            myself.m_liveChangeDebounce.cancelDebounce(); // cancel the debounce if it was fired (prevent debounce fire after enter was pressed)

            myself.getListenerOnEnter().onEnter(sap.firefly.UiControlEvent.create(myself));
          }
        }
      },
      onfocusin: function onfocusin() {
        if (myself.getListenerOnEditingBegin() !== null) {
          myself.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onsapfocusleave: function onsapfocusleave() {
        if (myself.getListenerOnEditingEnd() !== null) {
          myself.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(myself));
        }
      }
    });
  }; //TODO: for testing use the new way of handle events


  sap.firefly.UxInput.prototype.registerOnValueHelpRequest = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnValueHelpRequest.call(this, listener);
    this.getNativeControl().detachValueHelpRequest(this.handleValueHelpRequest, this);

    if (listener) {
      this.getNativeControl().attachValueHelpRequest(this.handleValueHelpRequest, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxInput.prototype.addSuggestion = function (suggestionItem) {
    sap.firefly.UxGeneric.prototype.addSuggestion.call(this, suggestionItem);
    this.getNativeControl().setShowSuggestion(true);
    var nativeChild = suggestionItem.getNativeControl();
    this.getNativeControl().addSuggestionItem(nativeChild);
    return this;
  };

  sap.firefly.UxInput.prototype.insertSuggestion = function (suggestionItem, index) {
    sap.firefly.UxGeneric.prototype.insertSuggestion.call(this, suggestionItem, index);
    this.getNativeControl().setShowSuggestion(true);
    var nativeChild = suggestionItem.getNativeControl(); //this.getNativeControl().insertSuggestionItem(nativeChild, index); // Ui5 bug? they swap index and object so this does not work i need to swap them like below

    this.getNativeControl().insertSuggestionItem(index, nativeChild);
    return this;
  };

  sap.firefly.UxInput.prototype.removeSuggestion = function (suggestionItem) {
    var nativeChild = suggestionItem.getNativeControl();
    this.getNativeControl().removeSuggestionItem(nativeChild);
    sap.firefly.UxGeneric.prototype.removeSuggestion.call(this, suggestionItem);
    return this;
  };

  sap.firefly.UxInput.prototype.clearSuggestions = function () {
    sap.firefly.UxGeneric.prototype.clearSuggestions.call(this);
    this.getNativeControl().removeAllSuggestionItems();
    return this;
  }; // ======================================


  sap.firefly.UxInput.prototype.addEndIcon = function (endIcon) {
    sap.firefly.UxGeneric.prototype.addEndIcon.call(this, endIcon);
    endIcon.setIsEndIcon(true); // helper method from UxIcon

    var nativeChild = endIcon.getNativeControl();

    this._prepareEndIcons();

    if (nativeChild) {
      nativeChild.addStyleClass(sap.m.InputBase.ICON_CSS_CLASS);
      this.getNativeControl().addAggregation("_endIcon", nativeChild);
    }

    return this;
  };

  sap.firefly.UxInput.prototype.insertEndIcon = function (endIcon, index) {
    sap.firefly.UxGeneric.prototype.insertEndIcon.call(this, endIcon, index);
    endIcon.setIsEndIcon(true); // helper method from UxIcon

    var nativeChild = endIcon.getNativeControl();

    this._prepareEndIcons();

    if (nativeChild) {
      nativeChild.addStyleClass(sap.m.InputBase.ICON_CSS_CLASS);
      this.getNativeControl().insertAggregation("_endIcon", nativeChild, index);
    }

    return this;
  };

  sap.firefly.UxInput.prototype.removeEndIcon = function (endIcon) {
    endIcon.setIsEndIcon(false); // helper method from UxIcon

    var nativeChild = endIcon.getNativeControl();

    if (nativeChild) {
      this.getNativeControl().removeAggregation("_endIcon", nativeChild);
    }

    sap.firefly.UxGeneric.prototype.removeEndIcon.call(this, endIcon);
    return this;
  };

  sap.firefly.UxInput.prototype.clearEndIcons = function () {
    for (var i = index + 1; i < this.getEndIcons().size(); i++) {
      var tmpEndIcon = this.getEndIcons().get(i);
      tmpEndIcon.setIsEndIcon(false); // helper method from UxIcon
    }

    sap.firefly.UxGeneric.prototype.clearEndIcons.call(this);
    this.getNativeControl().removeAllAggregation("_endIcon");
    return this;
  }; // ======================================


  sap.firefly.UxInput.prototype.showSuggestions = function () {
    sap.firefly.UxGeneric.prototype.showSuggestions.call(this);
    this.getNativeControl().showItems();
    return this;
  };

  sap.firefly.UxInput.prototype.closeSuggestions = function () {
    sap.firefly.UxGeneric.prototype.closeSuggestions.call(this);
    this.getNativeControl().closeSuggestions();
    return this;
  };

  sap.firefly.UxInput.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  };

  sap.firefly.UxInput.prototype.selectText = function (startIndex, endIndex) {
    sap.firefly.UxGeneric.prototype.selectText.call(this, startIndex, endIndex);
    this.getNativeControl().selectText(startIndex, endIndex);
    return this;
  }; // ======================================


  sap.firefly.UxInput.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxInput.prototype.getText = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxInput.prototype.setPlaceholder = function (placeholder) {
    sap.firefly.UxGeneric.prototype.setPlaceholder.call(this, placeholder);
    this.getNativeControl().setPlaceholder(placeholder);
    return this;
  };

  sap.firefly.UxInput.prototype.getPlaceholder = function () {
    return this.getNativeControl().getPlaceholder();
  };

  sap.firefly.UxInput.prototype.setMaxLength = function (maxLength) {
    sap.firefly.UxGeneric.prototype.setMaxLength.call(this, maxLength);
    this.getNativeControl().setMaxLength(maxLength);
    return this;
  };

  sap.firefly.UxInput.prototype.getMaxLength = function () {
    return sap.firefly.UxGeneric.prototype.getMaxLength.call(this);
  };

  sap.firefly.UxInput.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxInput.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxInput.prototype.setInputType = function (inputType) {
    sap.firefly.UxGeneric.prototype.setInputType.call(this, inputType);
    var newInputTypeValue = sap.m.InputType.Text;

    if (inputType === sap.firefly.UiInputType.TEXT) {
      newInputTypeValue = sap.m.InputType.Text;
    } else if (inputType === sap.firefly.UiInputType.NUMBER) {
      newInputTypeValue = sap.m.InputType.Number;
    } else if (inputType === sap.firefly.UiInputType.TIME) {
      newInputTypeValue = sap.m.InputType.Time;
    } else if (inputType === sap.firefly.UiInputType.DATE) {
      newInputTypeValue = sap.m.InputType.Date;
    } else if (inputType === sap.firefly.UiInputType.PASSWORD) {
      newInputTypeValue = sap.m.InputType.Password;
    } else if (inputType === sap.firefly.UiInputType.EMAIL) {
      newInputTypeValue = sap.m.InputType.Email;
    } else if (inputType === sap.firefly.UiInputType.URL) {
      newInputTypeValue = sap.m.InputType.Url;
    }

    this.getNativeControl().setType(newInputTypeValue);
    return this;
  };

  sap.firefly.UxInput.prototype.getInputType = function () {
    return sap.firefly.UxGeneric.prototype.getInputType.call(this);
  };

  sap.firefly.UxInput.prototype.setRequired = function (required) {
    sap.firefly.UxGeneric.prototype.setRequired.call(this, required);
    return this;
  };

  sap.firefly.UxInput.prototype.isRequired = function () {
    return sap.firefly.UxGeneric.prototype.isRequired.call(this);
  };

  sap.firefly.UxInput.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxInput.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxInput.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxInput.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxInput.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.UxGeneric.prototype.setFontWeight.call(this, fontWeight);
    return this;
  };

  sap.firefly.UxInput.prototype.getFontWeight = function () {
    return sap.firefly.UxGeneric.prototype.getFontWeight.call(this);
  };

  sap.firefly.UxInput.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxInput.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  };

  sap.firefly.UxInput.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxInput.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxInput.prototype.setDebounceTime = function (debounceTime) {
    sap.firefly.UxGeneric.prototype.setDebounceTime.call(this, debounceTime);
    return this;
  };

  sap.firefly.UxInput.prototype.getDebounceTime = function () {
    return sap.firefly.UxGeneric.prototype.getDebounceTime.call(this);
  };

  sap.firefly.UxInput.prototype.setValueState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setValueState.call(this, valueState);
    var newValueState = sap.ui.core.ValueState.None;

    if (valueState === sap.firefly.UiValueState.NONE) {
      newValueState = sap.ui.core.ValueState.None;
    } else if (valueState === sap.firefly.UiValueState.ERROR) {
      newValueState = sap.ui.core.ValueState.Error;
    } else if (valueState === sap.firefly.UiValueState.INFORMATION) {
      newValueState = sap.ui.core.ValueState.Information;
    } else if (valueState === sap.firefly.UiValueState.SUCCESS) {
      newValueState = sap.ui.core.ValueState.Success;
    } else if (valueState === sap.firefly.UiValueState.WARNING) {
      newValueState = sap.ui.core.ValueState.Warning;
    }

    this.getNativeControl().setValueState(newValueState);
    return this;
  };

  sap.firefly.UxInput.prototype.getValueState = function () {
    return sap.firefly.UxGeneric.prototype.getValueState.call(this);
  };

  sap.firefly.UxInput.prototype.setValueStateText = function (valueStateText) {
    sap.firefly.UxGeneric.prototype.setValueStateText.call(this, valueStateText);
    this.getNativeControl().setValueStateText(valueStateText);
    return this;
  };

  sap.firefly.UxInput.prototype.getValueStateText = function () {
    return this.getNativeControl().getValueStateText();
  };

  sap.firefly.UxInput.prototype.isShowValueHelp = function () {
    return sap.firefly.UxGeneric.prototype.isShowValueHelp.call(this);
  };

  sap.firefly.UxInput.prototype.setShowValueHelp = function (value) {
    sap.firefly.UxGeneric.prototype.setShowValueHelp.call(this, value);
    return this;
  };

  sap.firefly.UxInput.prototype.getValueHelpIcon = function () {
    return sap.firefly.UxGeneric.prototype.getValueHelpIcon.call(this);
  };

  sap.firefly.UxInput.prototype.setValueHelpIcon = function (value) {
    sap.firefly.UxGeneric.prototype.setValueHelpIcon.call(this, value);
    return this;
  };

  sap.firefly.UxInput.prototype.setAutocomplete = function (autocomplete) {
    sap.firefly.DfUiContext.prototype.setAutocomplete.call(this, autocomplete); // skip superclass implementation, different properies

    this.getNativeControl().invalidate(); // trigger rendering

    return this;
  };

  sap.firefly.UxInput.prototype.isAutocomplete = function () {
    return sap.firefly.UxGeneric.prototype.isAutocomplete.call(this);
  };

  sap.firefly.UxInput.prototype.setValueHelpOnly = function (valueHelpOnly) {
    sap.firefly.UxGeneric.prototype.setValueHelpOnly.call(this, valueHelpOnly);
    this.getNativeControl().setValueHelpOnly(valueHelpOnly);
    return this;
  };

  sap.firefly.UxInput.prototype.isValueHelpOnly = function () {
    return sap.firefly.UxGeneric.prototype.isValueHelpOnly.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxInput.prototype.applyCustomCssStyling = function (element) {
    // input has some weird issue in desktop mode, it is not positioned in the midlle so i do it manually
    if (this.getUiStyleClass() === sap.firefly.UiStyleClass.DESKTOP) {
      element.style.display = "flex";
      element.style.alignItems = "center";
    } // endicons styling adjustments


    if (this.getEndIconCount() > 0) {
      // set the icon container height to always be 100%
      // for some reason when the input field is read only they set the height of the end icon to 0 which breaks the end icons when editable is false
      $(element).find(".sapMInputBaseIconContainer").css("height", "100%"); // also we need to extend the size for the icons, each icon has a size of 32px, only if there are more then 1 icon

      if (this.getEndIconCount() > 1) {
        // make sure the private method _calculateIconsSpace is available, if yes, then use it to get the space, else caluclate the sapce manually
        var iconSpaceFromUi5 = this.getNativeControl()._calculateIconsSpace ? this.getNativeControl()._calculateIconsSpace() : 0;

        if (iconSpaceFromUi5 === 0) {
          iconSpaceFromUi5 = 32 * this.getEndIconCount();
        }

        var iconSpace = iconSpaceFromUi5 + "px";
        $(element).find(".sapMInputBaseInner").css("width", "calc(100% - " + iconSpace + ")");
      }
    }
  };

  sap.firefly.UxInput.prototype.applyCustomAttributes = function (element) {
    //add the autocomplete="new-password" attribute to the input to disable browser autocompletition if the property is set to false
    if (!this.isAutocomplete()) {
      $(element).find("input").attr("autocomplete", "new-password");
    }
  }; // special background color styling handling


  sap.firefly.UxInput.prototype.applyBackgroundColorCss = function (element, bgColor) {
    $(element).find(".sapMInputBaseContentWrapper").css("background-color", bgColor);
  }; //special border style handling


  sap.firefly.UxInput.prototype.applyBorderStyleCss = function (element, borderStyleCss) {
    $(element).find(".sapMInputBaseContentWrapper").css("border-style", borderStyleCss);
  }; //special border width handling


  sap.firefly.UxInput.prototype.applyBorderWidthCss = function (element, borderWidthCss) {
    $(element).find(".sapMInputBaseContentWrapper").css("border-width", borderWidthCss);
  }; //special border color handling


  sap.firefly.UxInput.prototype.applyBorderColorCss = function (element, borderColorCss) {
    $(element).find(".sapMInputBaseContentWrapper").css("border-color", borderColorCss);
  }; // special font color handling


  sap.firefly.UxInput.prototype.applyFontColorCss = function (element, fontColorCss) {
    $(element).find("input").css("color", fontColorCss);
  }; // special font size handling


  sap.firefly.UxInput.prototype.applyFontSizeCss = function (element, fontSizeCss) {
    $(element).find("input").css("font-size", fontSizeCss);
  }; // special font style handling


  sap.firefly.UxInput.prototype.applyFontStyleCss = function (element, fontStyleCss) {
    $(element).find("input").css("font-style", fontStyleCss);
  }; // special font weight handling


  sap.firefly.UxInput.prototype.applyFontWeightCss = function (element, fontWeightCss) {
    $(element).find("input").css("font-weight", fontWeightCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxInput.prototype._prepareEndIcons = function () {
    //  if this is the first end icon which we are adding then do this as required step, without this the end icon does not appear
    // https://github.com/SAP/openui5/blob/367acb922f9ae2707cda0e88afffd1fc028e8928/src/sap.m/src/sap/m/DatePicker.js#L398-L402
    if (this.getEndIconCount() === 1) {
      var oValueHelpIcon = this.getNativeControl()._getValueHelpIcon();

      if (oValueHelpIcon) {
        oValueHelpIcon.setProperty("visible", this.getNativeControl().getEditable(), true);
      } // manually trigger a rerender for the css styling to apply


      this.rerenderNativeControl();
    }
  };

  sap.firefly.UxSuggestionItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSuggestionItem";
  };

  sap.firefly.UxSuggestionItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSuggestionItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxSuggestionItem();
    object.setup();
    return object;
  };

  sap.firefly.UxSuggestionItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this; // Extends: sap.ui.core.Item, needs to be sap.m.SuggestionItem in order to be used in input and searchfield

    var nativeControl = new sap.m.SuggestionItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSuggestionItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSuggestionItem.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxSuggestionItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxSuggestionItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSearchField = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSearchField";
    this.m_liveChangeDebounce = null;
  };

  sap.firefly.UxSearchField.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSearchField.prototype.newInstance = function () {
    var object = new sap.firefly.UxSearchField();
    object.setup();
    return object;
  };

  sap.firefly.UxSearchField.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.SearchField(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSearchField.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSearchField.prototype._addEvents = function (nativeControl) {
    var myself = this; // required for the suggestion popup to open

    nativeControl.attachSuggest(function (oEvent) {
      var searchValue = oEvent.getParameter("suggestValue"); // i need to do my own suggestion filter to update the suggestion list only with the items that fit the search Value
      // this is a different behaviour to sap.m.Input where this filtering is happening automatically

      myself._filterSuggestions(searchValue);

      nativeControl.suggest();
    }); // onLiveChange event
    // prepare the debounce function

    this.m_liveChangeDebounce = this.debounce(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        var newValue = oEvent.getParameters().newValue;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, newValue);
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }, function () {
      // debounce time is a function, so dynamic time can be passed
      return myself.getDebounceTime();
    }); // attach the live change event

    nativeControl.attachLiveChange(this.m_liveChangeDebounce); //onSearch and onSuggestionItemSelect events

    nativeControl.attachSearch(function (oEvent) {
      var selectedSuggestionItem = oEvent.getParameters().suggestionItem;
      var clearButtonPressed = oEvent.getParameters().clearButtonPressed;
      var searchText = oEvent.getParameters().query || "";

      if (clearButtonPressed) {
        // if clear button pressed then i need to remove the suggestion filter
        myself._filterSuggestions("");

        nativeControl.suggest();
      } // onSearch event


      if (myself.getListenerOnSearch() !== null) {
        myself.m_liveChangeDebounce.cancelDebounce(); // cancel the debounce if it was fired (prevent debounce fire after enter was pressed)

        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SEARCH_TEXT, searchText);
        newParameters.putBoolean(sap.firefly.UiEventParams.PARAM_CLEAR_BUTTON_PRESSED, clearButtonPressed);
        myself.getListenerOnSearch().onSearch(sap.firefly.UiControlEvent.create(myself, newParameters));
      } // onSuggestionItemSelect event


      if (selectedSuggestionItem != null) {
        if (myself.getListenerOnSuggestionSelect() !== null) {
          var selectedSuggestionItem = sap.firefly.UxGeneric.getUxControl(selectedSuggestionItem);
          var theEvent = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedSuggestionItem);
          myself.getListenerOnSuggestionSelect().onSuggestionSelect(theEvent);
        }
      }
    }); //onPaste event

    nativeControl.onpaste = function (event) {
      if (myself.getListenerOnPaste() !== null) {
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("text/plain"); // i need to make a timeout so that firs the data is pasted and it could be replaced afterwards

        setTimeout(function () {
          var newParameters = sap.firefly.XProperties.create();
          newParameters.putString(sap.firefly.UiEventParams.PARAM_PASTED_DATA, pastedData);
          myself.getListenerOnPaste().onPaste(sap.firefly.UiControlEvent.create(myself, newParameters));
        }, 0);
      }
    }; // onFocusIn, onFocusOut events


    nativeControl.addEventDelegate({
      onfocusin: function onfocusin() {
        if (myself.getListenerOnEditingBegin() !== null) {
          myself.getListenerOnEditingBegin().onEditingBegin(sap.firefly.UiControlEvent.create(myself));
        }
      },
      onsapfocusleave: function onsapfocusleave() {
        if (myself.getListenerOnEditingEnd() !== null) {
          myself.getListenerOnEditingEnd().onEditingEnd(sap.firefly.UiControlEvent.create(myself));
        }
      }
    });
  }; // ======================================


  sap.firefly.UxSearchField.prototype.addSuggestion = function (suggestionItem) {
    sap.firefly.UxGeneric.prototype.addSuggestion.call(this, suggestionItem);
    this.getNativeControl().setEnableSuggestions(true);
    var nativeChild = suggestionItem.getNativeControl();
    this.getNativeControl().addSuggestionItem(nativeChild);
    return this;
  };

  sap.firefly.UxSearchField.prototype.insertSuggestion = function (suggestionItem, index) {
    sap.firefly.UxGeneric.prototype.insertSuggestion.call(this, suggestionItem, index);
    this.getNativeControl().setEnableSuggestions(true);
    var nativeChild = suggestionItem.getNativeControl(); //this.getNativeControl().insertSuggestionItem(nativeChild, index); // Ui5 bug? they swap index and object so this does not work i need to swap them like below

    this.getNativeControl().insertSuggestionItem(index, nativeChild);
    return this;
  };

  sap.firefly.UxSearchField.prototype.removeSuggestion = function (suggestionItem) {
    var nativeChild = suggestionItem.getNativeControl();
    this.getNativeControl().removeSuggestionItem(nativeChild);
    sap.firefly.UxGeneric.prototype.removeSuggestion.call(this, suggestionItem);
    return this;
  };

  sap.firefly.UxSearchField.prototype.clearSuggestions = function () {
    sap.firefly.UxGeneric.prototype.clearSuggestions.call(this);
    this.getNativeControl().removeAllSuggestionItems();
    return this;
  }; // ======================================


  sap.firefly.UxSearchField.prototype.showSuggestions = function () {
    sap.firefly.UxGeneric.prototype.showSuggestions.call(this);
    this.getNativeControl().suggest();
    return this;
  };

  sap.firefly.UxSearchField.prototype.closeSuggestions = function () {
    sap.firefly.UxGeneric.prototype.closeSuggestions.call(this);
    this.getNativeControl().exit();
    return this;
  };

  sap.firefly.UxSearchField.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxSearchField.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    this.getNativeControl().setValue(text);
    return this;
  };

  sap.firefly.UxSearchField.prototype.getText = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxSearchField.prototype.setPlaceholder = function (placeholder) {
    sap.firefly.UxGeneric.prototype.setPlaceholder.call(this, placeholder);
    this.getNativeControl().setPlaceholder(placeholder);
    return this;
  };

  sap.firefly.UxSearchField.prototype.getPlaceholder = function () {
    return this.getNativeControl().getPlaceholder();
  };

  sap.firefly.UxSearchField.prototype.setMaxLength = function (maxLength) {
    sap.firefly.UxGeneric.prototype.setMaxLength.call(this, maxLength);
    this.getNativeControl().setMaxLength(maxLength);
    return this;
  };

  sap.firefly.UxSearchField.prototype.getMaxLength = function () {
    return sap.firefly.UxGeneric.prototype.getMaxLength.call(this);
  };

  sap.firefly.UxSearchField.prototype.setRequired = function (required) {
    sap.firefly.UxGeneric.prototype.setRequired.call(this, required);
    return this;
  };

  sap.firefly.UxSearchField.prototype.isRequired = function () {
    return sap.firefly.UxGeneric.prototype.isRequired.call(this);
  };

  sap.firefly.UxSearchField.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxSearchField.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxSearchField.prototype.setDebounceTime = function (debounceTime) {
    sap.firefly.UxGeneric.prototype.setDebounceTime.call(this, debounceTime);
    return this;
  };

  sap.firefly.UxSearchField.prototype.getDebounceTime = function () {
    return sap.firefly.UxGeneric.prototype.getDebounceTime.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSearchField.prototype._filterSuggestions = function (searchValue) {
    if (this.hasSuggestions()) {
      var origNativeSuggestions = [];

      for (var i = 0; i < this.getSuggestions().size(); i++) {
        origNativeSuggestions.push(this.getSuggestion(i).getNativeControl());
      }

      var filterdNativeSuggestions = origNativeSuggestions.filter(function (suggestionItem) {
        return suggestionItem.getText().indexOf(searchValue) !== -1;
      });
      this.getNativeControl().removeAllSuggestionItems();

      for (var i = 0; i < filterdNativeSuggestions.length; i++) {
        this.getNativeControl().addSuggestionItem(filterdNativeSuggestions[i]);
      }
    }
  };

  sap.firefly.UxCheckbox = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxCheckbox";
  };

  sap.firefly.UxCheckbox.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxCheckbox.prototype.newInstance = function () {
    var object = new sap.firefly.UxCheckbox();
    object.setup();
    return object;
  };

  sap.firefly.UxCheckbox.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.CheckBox(this.getId());
    nativeControl.setUseEntireWidth(true); // apply width to the whole control, not just label

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCheckbox.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCheckbox.prototype._addEvents = function (nativeControl) {
    var myself = this; // onChange event

    nativeControl.attachSelect(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxCheckbox.prototype.setChecked = function (checked) {
    sap.firefly.UxGeneric.prototype.setChecked.call(this, checked);
    this.getNativeControl().setSelected(checked);
    return this;
  };

  sap.firefly.UxCheckbox.prototype.isChecked = function () {
    return this.getNativeControl().getSelected();
  };

  sap.firefly.UxCheckbox.prototype.setPartiallyChecked = function (partiallyChecked) {
    sap.firefly.UxGeneric.prototype.setPartiallyChecked.call(this, partiallyChecked);
    this.getNativeControl().setPartiallySelected(partiallyChecked);
    return this;
  };

  sap.firefly.UxCheckbox.prototype.isPartiallyChecked = function () {
    return this.getNativeControl().getPartiallySelected();
  };

  sap.firefly.UxCheckbox.prototype.setWrapping = function (wrapping) {
    sap.firefly.UxGeneric.prototype.setWrapping.call(this, wrapping);
    this.getNativeControl().setWrapping(wrapping);
    return this;
  };

  sap.firefly.UxCheckbox.prototype.isWrapping = function () {
    return sap.firefly.UxGeneric.prototype.isWrapping.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSwitch = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSwitch";
  };

  sap.firefly.UxSwitch.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSwitch.prototype.newInstance = function () {
    var object = new sap.firefly.UxSwitch();
    object.setup();
    return object;
  };

  sap.firefly.UxSwitch.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Switch(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSwitch.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSwitch.prototype._addEvents = function (nativeControl) {
    var myself = this; // onChange event

    nativeControl.attachChange(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxSwitch.prototype.setOn = function (isOn) {
    sap.firefly.UxGeneric.prototype.setOn.call(this, isOn);
    this.getNativeControl().setState(isOn);
    return this;
  };

  sap.firefly.UxSwitch.prototype.isOn = function () {
    return this.getNativeControl().getState();
  };

  sap.firefly.UxSwitch.prototype.setOnText = function (onText) {
    sap.firefly.UxGeneric.prototype.setOnText.call(this, onText);
    this.getNativeControl().setCustomTextOn(onText);
    return this;
  };

  sap.firefly.UxSwitch.prototype.getOnText = function () {
    return sap.firefly.UxGeneric.prototype.getOnText.call(this);
  };

  sap.firefly.UxSwitch.prototype.setOffText = function (offText) {
    sap.firefly.UxGeneric.prototype.setOffText.call(this, offText);
    this.getNativeControl().setCustomTextOff(offText);
    return this;
  };

  sap.firefly.UxSwitch.prototype.getOffText = function () {
    return sap.firefly.UxGeneric.prototype.getOffText.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxLabel = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxLabel";
  };

  sap.firefly.UxLabel.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxLabel.prototype.newInstance = function () {
    var object = new sap.firefly.UxLabel();
    object.setup();
    return object;
  };

  sap.firefly.UxLabel.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Label(this.getId());
    nativeControl.addStyleClass("ff-label");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxLabel.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxLabel.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxLabel.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxLabel.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxLabel.prototype.setRequired = function (required) {
    sap.firefly.UxGeneric.prototype.setRequired.call(this, required);
    return this;
  };

  sap.firefly.UxLabel.prototype.isRequired = function () {
    return sap.firefly.UxGeneric.prototype.isRequired.call(this);
  };

  sap.firefly.UxLabel.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxLabel.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxLabel.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxLabel.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxLabel.prototype.setTextAlign = function (textAlign) {
    sap.firefly.UxGeneric.prototype.setTextAlign.call(this, textAlign);
    this.getNativeControl().setTextAlign(sap.firefly.ui.Ui5ConstantUtils.parseTextAlign(textAlign));
    return this;
  };

  sap.firefly.UxLabel.prototype.getTextAlign = function () {
    return sap.firefly.UxGeneric.prototype.getTextAlign.call(this);
  };

  sap.firefly.UxLabel.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxLabel.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  };

  sap.firefly.UxLabel.prototype.setWrapping = function (wrapping) {
    sap.firefly.UxGeneric.prototype.setWrapping.call(this, wrapping);
    this.getNativeControl().setWrapping(wrapping);
    return this;
  };

  sap.firefly.UxLabel.prototype.isWrapping = function () {
    return sap.firefly.UxGeneric.prototype.isWrapping.call(this);
  };

  sap.firefly.UxLabel.prototype.getLabelFor = function () {
    return sap.firefly.UxGeneric.prototype.getLabelFor.call(this);
  };

  sap.firefly.UxLabel.prototype.setLabelFor = function (value) {
    sap.firefly.UxGeneric.prototype.setLabelFor.call(this, value);
    return this;
  };

  sap.firefly.UxLabel.prototype.isShowColon = function () {
    if (this.getNativeControl().getShowColon) {
      return this.getNativeControl().getShowColon();
    }

    return sap.firefly.UxGeneric.prototype.isShowColon.call(this);
  };

  sap.firefly.UxLabel.prototype.setShowColon = function (showColon) {
    sap.firefly.UxGeneric.prototype.setShowColon.call(this, showColon);

    if (this.getNativeControl().setShowColon) {
      this.getNativeControl().setShowColon(showColon);
    }

    return this;
  }; // Overrides
  // ======================================


  sap.firefly.UxLabel.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.DfUiContext.prototype.setFontWeight.call(this, fontWeight); // no need for css

    var newDesign = sap.m.LabelDesign.Standard;

    if (fontWeight === sap.firefly.UiFontWeight.NORMAL) {
      newDesign = sap.m.LabelDesign.Standard;
    } else if (fontWeight === sap.firefly.UiFontWeight.BOLD) {
      newDesign = sap.m.LabelDesign.Bold;
    }

    this.getNativeControl().setDesign(newDesign);
    return this;
  }; // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxLabel.prototype.applyTextDecorationCss = function (element, textDecorationCss) {
    $(element).find(".sapMLabelTextWrapper").css("text-decoration", textDecorationCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxTitle = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTitle";
  };

  sap.firefly.UxTitle.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTitle.prototype.newInstance = function () {
    var object = new sap.firefly.UxTitle();
    object.setup();
    return object;
  };

  sap.firefly.UxTitle.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Title(this.getId());
    nativeControl.addStyleClass("ff-title");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTitle.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTitle.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTitle.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxTitle.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxTitle.prototype.setTextAlign = function (textAlign) {
    sap.firefly.UxGeneric.prototype.setTextAlign.call(this, textAlign);
    this.getNativeControl().setTextAlign(sap.firefly.ui.Ui5ConstantUtils.parseTextAlign(textAlign));
    return this;
  };

  sap.firefly.UxTitle.prototype.getTextAlign = function () {
    return sap.firefly.UxGeneric.prototype.getTextAlign.call(this);
  };

  sap.firefly.UxTitle.prototype.setWrapping = function (wrapping) {
    sap.firefly.UxGeneric.prototype.setWrapping.call(this, wrapping);
    this.getNativeControl().setWrapping(wrapping);
    return this;
  };

  sap.firefly.UxTitle.prototype.isWrapping = function () {
    return sap.firefly.UxGeneric.prototype.isWrapping.call(this);
  };

  sap.firefly.UxTitle.prototype.getLabelFor = function () {
    return sap.firefly.UxGeneric.prototype.getLabelFor.call(this);
  };

  sap.firefly.UxTitle.prototype.setTitleStyle = function (style) {
    sap.firefly.UxGeneric.prototype.setTitleStyle.call(this, style);
    this.getNativeControl().setTitleStyle(sap.firefly.ui.Ui5ConstantUtils.parseTitleLevel(style));
    return this;
  };

  sap.firefly.UxTitle.prototype.getTitleStyle = function () {
    return sap.firefly.UxGeneric.prototype.getTitleStyle.call(this);
  };

  sap.firefly.UxTitle.prototype.setTitleLevel = function (level) {
    sap.firefly.UxGeneric.prototype.setTitleLevel.call(this, level);
    this.getNativeControl().setLevel(sap.firefly.ui.Ui5ConstantUtils.parseTitleLevel(level));
    return this;
  };

  sap.firefly.UxTitle.prototype.getTitleLevel = function () {
    return sap.firefly.UxGeneric.prototype.getTitleLevel.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRadioButton = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxRadioButton";
  };

  sap.firefly.UxRadioButton.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxRadioButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxRadioButton();
    object.setup();
    return object;
  };

  sap.firefly.UxRadioButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.RadioButton(this.getId());
    nativeControl.setGroupName("ffGlobalRadioButtonGroup");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxRadioButton.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxRadioButton.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelect event

    nativeControl.attachSelect(function (oControlEvent) {
      if (myself.getListenerOnChange() !== null) {
        // timeout is needed to fix an call order issue (possible sapui5 bug), first wait that the correct values are set and then sent out the event.
        setTimeout(function () {
          myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
        }, 1);
      }
    });
  }; // ======================================


  sap.firefly.UxRadioButton.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxRadioButton.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxRadioButton.prototype.setSelected = function (selected) {
    sap.firefly.UxGeneric.prototype.setSelected.call(this, selected);
    this.getNativeControl().setSelected(selected);
    return this;
  };

  sap.firefly.UxRadioButton.prototype.isSelected = function () {
    return this.getNativeControl().getSelected();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRadioButtonGroup = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxRadioButtonGroup";
  };

  sap.firefly.UxRadioButtonGroup.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxRadioButtonGroup.prototype.newInstance = function () {
    var object = new sap.firefly.UxRadioButtonGroup();
    object.setup();
    return object;
  };

  sap.firefly.UxRadioButtonGroup.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.RadioButtonGroup(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxRadioButtonGroup.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxRadioButtonGroup.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelect event

    nativeControl.attachSelect(function (oControlEvent) {
      // onSelect event
      if (myself.getListenerOnSelect() !== null) {
        var selectedItemIndex = oControlEvent.getParameters().selectedIndex;
        var selectedItem = myself.getRadioButton(selectedItemIndex);
        var theEvent = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedItem);
        myself.getListenerOnSelect().onSelect(theEvent);
      }
    });
  }; // ======================================


  sap.firefly.UxRadioButtonGroup.prototype.addRadioButton = function (radioButton) {
    sap.firefly.UxGeneric.prototype.addRadioButton.call(this, radioButton);
    var nativeChild = radioButton.getNativeControl();
    this.getNativeControl().addButton(nativeChild);
    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.insertRadioButton = function (radioButton, index) {
    sap.firefly.UxGeneric.prototype.insertRadioButton.call(this, radioButton, index);
    var nativeChild = radioButton.getNativeControl();
    this.getNativeControl().insertButton(nativeChild, index);
    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.removeRadioButton = function (radioButton) {
    var nativeChild = radioButton.getNativeControl();
    this.getNativeControl().removeButton(nativeChild);
    sap.firefly.UxGeneric.prototype.removeRadioButton.call(this, radioButton);
    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.clearRadioButtons = function () {
    sap.firefly.UxGeneric.prototype.clearRadioButtons.call(this);
    this.getNativeControl().removeAllButtons();
    return this;
  }; // ======================================


  sap.firefly.UxRadioButtonGroup.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item == null) {
      this.getNativeControl().setSelectedButton(null);
    } else {
      this.getNativeControl().setSelectedButton(item.getNativeControl());
    }

    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.getSelectedItem = function () {
    var selectedItem = this.getNativeControl().getSelectedButton();

    if (selectedItem != null) {
      return sap.firefly.UxGeneric.getUxControl(selectedItem);
    }

    return null;
  }; // ======================================


  sap.firefly.UxRadioButtonGroup.prototype.setColumnCount = function (columnCount) {
    sap.firefly.UxGeneric.prototype.setColumnCount.call(this, columnCount);

    if (columnCount > 0) {
      this.getNativeControl().setColumns(columnCount);
    }

    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.getColumnCount = function () {
    if (this.getNativeControl() != null) {
      return this.getNativeControl().getColumns();
    }

    return sap.firefly.UxGeneric.prototype.getColumnCount.call(this);
  };

  sap.firefly.UxRadioButtonGroup.prototype.setValueState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setValueState.call(this, valueState);
    var newValueState = sap.ui.core.ValueState.None;

    if (valueState === sap.firefly.UiValueState.NONE) {
      newValueState = sap.ui.core.ValueState.None;
    } else if (valueState === sap.firefly.UiValueState.ERROR) {
      newValueState = sap.ui.core.ValueState.Error;
    } else if (valueState === sap.firefly.UiValueState.INFORMATION) {
      newValueState = sap.ui.core.ValueState.Information;
    } else if (valueState === sap.firefly.UiValueState.SUCCESS) {
      newValueState = sap.ui.core.ValueState.Success;
    } else if (valueState === sap.firefly.UiValueState.WARNING) {
      newValueState = sap.ui.core.ValueState.Warning;
    }

    this.getNativeControl().setValueState(newValueState);
    return this;
  };

  sap.firefly.UxRadioButtonGroup.prototype.getValueState = function () {
    return sap.firefly.UxGeneric.prototype.getValueState.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxLink = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxLink";
  };

  sap.firefly.UxLink.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxLink.prototype.newInstance = function () {
    var object = new sap.firefly.UxLink();
    object.setup();
    return object;
  };

  sap.firefly.UxLink.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Link(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxLink.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxLink.prototype._addEvents = function (nativeControl) {
    var myself = this; // onPress event

    nativeControl.attachPress(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxLink.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxLink.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxLink.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxLink.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxLink.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxLink.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxLink.prototype.setTextAlign = function (textAlign) {
    sap.firefly.UxGeneric.prototype.setTextAlign.call(this, textAlign);
    this.getNativeControl().setTextAlign(sap.firefly.ui.Ui5ConstantUtils.parseTextAlign(textAlign));
    return this;
  };

  sap.firefly.UxLink.prototype.getTextAlign = function () {
    return sap.firefly.UxGeneric.prototype.getTextAlign.call(this);
  };

  sap.firefly.UxLink.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.UxGeneric.prototype.setFontWeight.call(this, fontWeight);
    return this;
  };

  sap.firefly.UxLink.prototype.getFontWeight = function () {
    return sap.firefly.UxGeneric.prototype.getFontWeight.call(this);
  };

  sap.firefly.UxLink.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxLink.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  };

  sap.firefly.UxLink.prototype.setWrapping = function (wrapping) {
    sap.firefly.UxGeneric.prototype.setWrapping.call(this, wrapping);
    this.getNativeControl().setWrapping(wrapping);
    return this;
  };

  sap.firefly.UxLink.prototype.isWrapping = function () {
    return sap.firefly.UxGeneric.prototype.isWrapping.call(this);
  };

  sap.firefly.UxLink.prototype.setSrc = function (src) {
    sap.firefly.UxGeneric.prototype.setSrc.call(this, src);
    this.getNativeControl().setHref(src);
    return this;
  };

  sap.firefly.UxLink.prototype.getSrc = function () {
    return sap.firefly.UxGeneric.prototype.getSrc.call(this);
  };

  sap.firefly.UxLink.prototype.setTarget = function (target) {
    sap.firefly.UxGeneric.prototype.setTarget.call(this, target);
    return this;
  };

  sap.firefly.UxLink.prototype.getTarget = function () {
    return sap.firefly.UxGeneric.prototype.getTarget.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxDatePicker = function () {
    sap.firefly.UxDateTimeField.call(this);
    this._ff_c = "UxDatePicker";
  };

  sap.firefly.UxDatePicker.prototype = new sap.firefly.UxDateTimeField();

  sap.firefly.UxDatePicker.prototype.newInstance = function () {
    var object = new sap.firefly.UxDatePicker();
    object.setup();
    return object;
  };

  sap.firefly.UxDatePicker.prototype.initializeNative = function () {
    sap.firefly.UxDateTimeField.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.DatePicker(this.getId());
    nativeControl.addStyleClass("ff-date-picker");
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxDatePicker.prototype.releaseObject = function () {
    sap.firefly.UxDateTimeField.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================


  sap.firefly.UxDatePicker.prototype.setMinDate = function (minDate) {
    sap.firefly.UxDateTimeField.prototype.setMinDate.call(this, minDate);
    var dateObject = new Date(minDate);
    this.getNativeControl().setMinDate(dateObject);
    return this;
  };

  sap.firefly.UxDatePicker.prototype.getMinDate = function () {
    return sap.firefly.UxDateTimeField.prototype.getMinDate.call(this);
  };

  sap.firefly.UxDatePicker.prototype.setMaxDate = function (maxDate) {
    sap.firefly.UxDateTimeField.prototype.setMaxDate.call(this, maxDate);
    var dateObject = new Date(maxDate);
    this.getNativeControl().setMaxDate(dateObject);
    return this;
  };

  sap.firefly.UxDatePicker.prototype.getMaxDate = function () {
    return sap.firefly.UxDateTimeField.prototype.getMaxDate.call(this);
  };

  sap.firefly.UxDatePicker.prototype.setShowCurrentDateButton = function (showCurrentDateButton) {
    sap.firefly.UxDateTimeField.prototype.setShowCurrentDateButton.call(this, showCurrentDateButton);

    if (this.getNativeControl().setShowCurrentDateButton) {
      // since ui5 version 1.95, remove when sac updated to ui5 1.102
      this.getNativeControl().setShowCurrentDateButton(showCurrentDateButton);
    }

    return this;
  };

  sap.firefly.UxDatePicker.prototype.isShowCurrentDateButton = function () {
    if (this.getNativeControl().getShowCurrentDateButton) {
      // since ui5 version 1.95, remove when sac updated to ui5 1.102
      return this.getNativeControl().getShowCurrentDateButton();
    } else {
      return sap.firefly.UxDateTimeField.prototype.isShowCurrentDateButton.call(this);
    }
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxTimePicker = function () {
    sap.firefly.UxDateTimeField.call(this);
    this._ff_c = "UxTimePicker";
  };

  sap.firefly.UxTimePicker.prototype = new sap.firefly.UxDateTimeField();

  sap.firefly.UxTimePicker.prototype.newInstance = function () {
    var object = new sap.firefly.UxTimePicker();
    object.setup();
    return object;
  };

  sap.firefly.UxTimePicker.prototype.initializeNative = function () {
    sap.firefly.UxDateTimeField.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.TimePicker(this.getId());
    nativeControl.addStyleClass("ff-time-picker");
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTimePicker.prototype.releaseObject = function () {
    sap.firefly.UxDateTimeField.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================


  sap.firefly.UxTimePicker.prototype.setMinutesInterval = function (minInterval) {
    sap.firefly.UxDateTimeField.prototype.setMinutesInterval.call(this, minInterval);
    this.getNativeControl().setMinutesStep(minInterval);
    return this;
  };

  sap.firefly.UxTimePicker.prototype.getMinutesInterval = function () {
    return sap.firefly.UxDateTimeField.prototype.getMinutesInterval.call(this);
  };

  sap.firefly.UxTimePicker.prototype.setSecondsInterval = function (secInterval) {
    sap.firefly.UxDateTimeField.prototype.setSecondsInterval.call(this, secInterval);
    this.getNativeControl().setSecondsStep(secInterval);
    return this;
  };

  sap.firefly.UxTimePicker.prototype.getSecondsInterval = function () {
    return sap.firefly.UxDateTimeField.prototype.getSecondsInterval.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxDateTimePicker = function () {
    sap.firefly.UxDatePicker.call(this);
    this._ff_c = "UxDateTimePicker";
  };

  sap.firefly.UxDateTimePicker.prototype = new sap.firefly.UxDatePicker();

  sap.firefly.UxDateTimePicker.prototype.newInstance = function () {
    var object = new sap.firefly.UxDateTimePicker();
    object.setup();
    return object;
  };

  sap.firefly.UxDateTimePicker.prototype.initializeNative = function () {
    sap.firefly.UxDateTimeField.prototype.initializeNative.call(this); // skip superclass as we do not want the init native from date picker to run

    var myself = this;
    var nativeControl = new sap.m.DateTimePicker(this.getId());
    nativeControl.addStyleClass("ff-date-time-picker");
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxDateTimePicker.prototype.releaseObject = function () {
    sap.firefly.UxDatePicker.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================


  sap.firefly.UxDateTimePicker.prototype.setMinutesInterval = function (minInterval) {
    sap.firefly.UxDateTimeField.prototype.setMinutesInterval.call(this, minInterval);
    this.getNativeControl().setMinutesStep(minInterval);
    return this;
  };

  sap.firefly.UxDateTimePicker.prototype.getMinutesInterval = function () {
    return sap.firefly.UxDateTimeField.prototype.getMinutesInterval.call(this);
  };

  sap.firefly.UxDateTimePicker.prototype.setSecondsInterval = function (secInterval) {
    sap.firefly.UxDateTimeField.prototype.setSecondsInterval.call(this, secInterval);
    this.getNativeControl().setSecondsStep(secInterval);
    return this;
  };

  sap.firefly.UxDateTimePicker.prototype.getSecondsInterval = function () {
    return sap.firefly.UxDateTimeField.prototype.getSecondsInterval.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxCalendar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxCalendar";
  };

  sap.firefly.UxCalendar.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxCalendar.prototype.newInstance = function () {
    var object = new sap.firefly.UxCalendar();
    object.setup();
    return object;
  };

  sap.firefly.UxCalendar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.ui.unified.Calendar(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCalendar.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCalendar.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelect event

    nativeControl.attachSelect(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxCalendar.prototype.setStartDate = function (startDate) {
    sap.firefly.UxGeneric.prototype.setStartDate.call(this, startDate);
    this.getNativeControl().removeAllSelectedDates();

    var dateRangeObj = this._generateCurrentDateRangeObject();

    if (dateRangeObj && dateRangeObj.getStartDate()) {
      this.getNativeControl().addSelectedDate(dateRangeObj);
      this.getNativeControl().focusDate(dateRangeObj.getStartDate());
    }

    return this;
  };

  sap.firefly.UxCalendar.prototype.getStartDate = function () {
    var selectedDates = this.getNativeControl().getSelectedDates();

    if (selectedDates.length > 0) {
      var selectedDate = selectedDates[0];
      var startDate = selectedDate.getStartDate();
      var valFormat = this.getValueFormat() || "yyyy-MM-dd";
      var dateFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: valFormat
      });
      var formattedString = dateFormatter.format(startDate);
      return formattedString;
    }

    return sap.firefly.UxGeneric.prototype.getStartDate.call(this);
  };

  sap.firefly.UxCalendar.prototype.setEndDate = function (endDate) {
    sap.firefly.UxGeneric.prototype.setEndDate.call(this, endDate);
    this.getNativeControl().removeAllSelectedDates();

    var dateRangeObj = this._generateCurrentDateRangeObject();

    if (dateRangeObj && dateRangeObj.getEndDate()) {
      this.getNativeControl().addSelectedDate(dateRangeObj);
      this.getNativeControl().focusDate(dateRangeObj.getEndDate());
    }

    return this;
  };

  sap.firefly.UxCalendar.prototype.getEndDate = function () {
    var selectedDates = this.getNativeControl().getSelectedDates();

    if (selectedDates.length > 0) {
      var selectedDate = selectedDates[0];
      var endDate = selectedDate.getEndDate();

      if (endDate) {
        var valFormat = this.getValueFormat() || "yyyy-MM-dd";
        var dateFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: valFormat
        });
        var formattedString = dateFormatter.format(endDate);
        return formattedString;
      } else {
        return null; // if no end date present then return null
      }
    }

    return sap.firefly.UxGeneric.prototype.getEndDate.call(this);
  };

  sap.firefly.UxCalendar.prototype.setValueFormat = function (valueFormat) {
    sap.firefly.UxGeneric.prototype.setValueFormat.call(this, valueFormat); // the ui5 control does not support valueformat so i need to do it manually in the setValue and getValue functions

    return this;
  };

  sap.firefly.UxCalendar.prototype.getValueFormat = function () {
    return sap.firefly.UxGeneric.prototype.getValueFormat.call(this);
  };

  sap.firefly.UxCalendar.prototype.setMinDate = function (minDate) {
    sap.firefly.UxGeneric.prototype.setMinDate.call(this, minDate);
    var dateObject = new Date(minDate);
    this.getNativeControl().setMinDate(dateObject);
    return this;
  };

  sap.firefly.UxCalendar.prototype.getMinDate = function () {
    return sap.firefly.UxGeneric.prototype.getMinDate.call(this);
  };

  sap.firefly.UxCalendar.prototype.setMaxDate = function (maxDate) {
    sap.firefly.UxGeneric.prototype.setMaxDate.call(this, maxDate);
    var dateObject = new Date(maxDate);
    this.getNativeControl().setMaxDate(dateObject);
    return this;
  };

  sap.firefly.UxCalendar.prototype.getMaxDate = function () {
    return sap.firefly.UxGeneric.prototype.getMaxDate.call(this);
  };

  sap.firefly.UxCalendar.prototype.setIntervalSelection = function (value) {
    sap.firefly.UxGeneric.prototype.setIntervalSelection.call(this, value);
    this.getNativeControl().setIntervalSelection(value);
    return this;
  };

  sap.firefly.UxCalendar.prototype.isIntervalSelection = function () {
    return this.getNativeControl().getIntervalSelection();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxCalendar.prototype._generateCurrentDateRangeObject = function () {
    var startDate = sap.firefly.UxGeneric.prototype.getStartDate.call(this);
    ;
    var endDate = sap.firefly.UxGeneric.prototype.getEndDate.call(this);
    var dateRange = new sap.ui.unified.DateRange();
    var valFormat = this.getValueFormat() || "yyyy-MM-dd";
    var dateFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
      pattern: valFormat
    });
    var startDateObject = dateFormatter.parse(startDate);
    var endDateObject = dateFormatter.parse(endDate);
    dateRange.setStartDate(startDateObject);
    dateRange.setEndDate(endDateObject);
    return dateRange;
  };

  sap.firefly.UxClock = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxClock";
    this.m_updateTimeTimeout = null;
  };

  sap.firefly.UxClock.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxClock.prototype.newInstance = function () {
    var object = new sap.firefly.UxClock();
    object.setup();
    return object;
  };

  sap.firefly.UxClock.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Label(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);

    this._updateTime();
  };

  sap.firefly.UxClock.prototype.releaseObject = function () {
    if (this.m_updateTimeTimeout) {
      clearTimeout(this.m_updateTimeTimeout);
    }

    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxClock.prototype._addEvents = function (nativeControl) {
    var myself = this; //onClick event

    nativeControl.onclick = function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onHover, onHoverEnd


    nativeControl.addEventDelegate({
      onmouseover: function onmouseover() {
        if (myself.getListenerOnPress() !== null) {
          // on hover if listener on press exists change the cursor to pointer for click ui
          myself.applyCss("cursor", "pointer");
        }
      },
      onmouseout: function onmouseout() {
        // after leaving hover change the cursor back to the default one
        myself.applyCss("cursor", "default");
      }
    });
  }; // ======================================


  sap.firefly.UxClock.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor);
    return this;
  };

  sap.firefly.UxClock.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxClock.prototype.setFontSize = function (fontSize) {
    sap.firefly.UxGeneric.prototype.setFontSize.call(this, fontSize);
    return this;
  };

  sap.firefly.UxClock.prototype.getFontSize = function () {
    return sap.firefly.UxGeneric.prototype.getFontSize.call(this);
  };

  sap.firefly.UxClock.prototype.setFontWeight = function (fontWeight) {
    sap.firefly.UxGeneric.prototype.setFontWeight.call(this, fontWeight);

    if (fontWeight === sap.firefly.UiFontWeight.NORMAL) {
      this.getNativeControl().setDesign(sap.m.LabelDesign.Standard);
    } else if (fontWeight === sap.firefly.UiFontWeight.BOLD) {
      this.getNativeControl().setDesign(sap.m.LabelDesign.Bold);
    }

    return this;
  };

  sap.firefly.UxClock.prototype.getFontWeight = function () {
    return sap.firefly.UxGeneric.prototype.getFontWeight.call(this);
  };

  sap.firefly.UxClock.prototype.setFontStyle = function (fontStyle) {
    sap.firefly.UxGeneric.prototype.setFontStyle.call(this, fontStyle);
    return this;
  };

  sap.firefly.UxClock.prototype.getFontStyle = function () {
    return sap.firefly.UxGeneric.prototype.getFontStyle.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxClock.prototype.applyCustomCssStyling = function (element) {
    element.style.userSelect = "none";
    element.style.cursor = "default";
  }; // Helpers
  // ======================================


  sap.firefly.UxClock.prototype._updateTime = function () {
    if (this.getNativeControl()) {
      var date = new Date();
      var h = date.getHours(); // 0 - 23

      var m = date.getMinutes(); // 0 - 59

      var s = date.getSeconds(); // 0 - 59

      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s; //var time = h + ":" + m + ":" + s; // with seconds

      var time = h + ":" + m; // only minutes

      this.getNativeControl().setText(time);
    }

    this.m_updateTimeTimeout = setTimeout(this._updateTime.bind(this), 1000);
  };

  sap.firefly.UxPanel = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxPanel";
  };

  sap.firefly.UxPanel.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxPanel.prototype.newInstance = function () {
    var object = new sap.firefly.UxPanel();
    object.setup();
    return object;
  };

  sap.firefly.UxPanel.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Panel(this.getId());
    nativeControl.setHeaderText("Panel");
    nativeControl.addStyleClass("ff-panel"); //nativeControl.setExpandable(false); //default value is false

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxPanel.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxPanel.prototype._addEvents = function (nativeControl) {
    var myself = this;
    nativeControl.attachExpand(function (oControlEvent) {
      var isExpand = oControlEvent.getParameters().expand;
      var isTriggeredByInteraction = oControlEvent.getParameters().triggeredByInteraction;

      if (isExpand === true) {
        if (myself.getListenerOnExpand() !== null) {
          var newExpandParameters = sap.firefly.XProperties.create();
          newExpandParameters.putBoolean(sap.firefly.UiEventParams.PARAM_TRIGGERED_BY_INTERACTION, isTriggeredByInteraction);
          myself.getListenerOnExpand().onExpand(sap.firefly.UiItemEvent.createItem(myself, newExpandParameters, null));
        }
      } else {
        if (myself.getListenerOnCollapse() !== null) {
          var newCollapseParameters = sap.firefly.XProperties.create();
          newCollapseParameters.putBoolean(sap.firefly.UiEventParams.PARAM_TRIGGERED_BY_INTERACTION, isTriggeredByInteraction);
          myself.getListenerOnCollapse().onCollapse(sap.firefly.UiItemEvent.createItem(myself, newCollapseParameters, null));
        }
      }
    });
  }; // ======================================


  sap.firefly.UxPanel.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl);
    }

    return this;
  };

  sap.firefly.UxPanel.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxPanel.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxPanel.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      var nativeHeaderControl = header.getNativeControl();
      this.getNativeControl().destroyHeaderToolbar(); // remove the old header toolbar

      var tmpToolbar = new sap.m.Toolbar(this.getId() + "_headerToolbar");
      tmpToolbar.addContent(nativeHeaderControl);
      this.getNativeControl().setHeaderToolbar(tmpToolbar);
    }

    return this;
  };

  sap.firefly.UxPanel.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
  };

  sap.firefly.UxPanel.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().destroyHeaderToolbar();
    return this;
  }; // ======================================


  sap.firefly.UxPanel.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation since the property name is different

    this.getNativeControl().setHeaderText(text);
    return this;
  };

  sap.firefly.UxPanel.prototype.getText = function () {
    return this.getNativeControl().getHeaderText();
  };

  sap.firefly.UxPanel.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);
    this.getNativeControl().setExpanded(expanded);
    return this;
  };

  sap.firefly.UxPanel.prototype.isExpanded = function () {
    return this.getNativeControl().getExpanded();
  };

  sap.firefly.UxPanel.prototype.setExpandable = function (expandable) {
    sap.firefly.UxGeneric.prototype.setExpandable.call(this, expandable);
    this.getNativeControl().setExpandable(expandable);
    return this;
  };

  sap.firefly.UxPanel.prototype.isExpandable = function () {
    return this.getNativeControl().getExpandable();
  };

  sap.firefly.UxPanel.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxPanel.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxPanel.prototype.setBackgroundDesign = function (value) {
    sap.firefly.UxGeneric.prototype.setBackgroundDesign.call(this, value);
    return this;
  };

  sap.firefly.UxPanel.prototype.getBackgroundDesign = function () {
    return sap.firefly.UxGeneric.prototype.getBackgroundDesign.call(this);
  };

  sap.firefly.UxPanel.prototype.setAnimated = function (animated) {
    sap.firefly.UxGeneric.prototype.setAnimated.call(this, animated);
    this.getNativeControl().setExpandAnimation(animated);
    return this;
  };

  sap.firefly.UxPanel.prototype.isAnimated = function () {
    return this.getNativeControl().getExpandAnimation();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxMenu = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxMenu";
  };

  sap.firefly.UxMenu.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxMenu.prototype.newInstance = function () {
    var object = new sap.firefly.UxMenu();
    object.setup();
    return object;
  };

  sap.firefly.UxMenu.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Menu(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxMenu.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxMenu.prototype._addEvents = function (nativeControl) {
    var myself = this; // close event

    nativeControl.attachClosed(function (oEvent) {
      if (myself.getListenerOnClose() !== null) {
        myself.getListenerOnClose().onClose(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxMenu.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxMenu.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxMenu.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxMenu.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxMenu.prototype.openAt = function (control) {
    sap.firefly.UxGeneric.prototype.openAt.call(this, control);

    if (control != null) {
      var nativeLocationControl = control.getNativeControl();
      this.getNativeControl().openBy(nativeLocationControl);
    }

    return this;
  };

  sap.firefly.UxMenu.prototype.openAtPosition = function (posX, posY) {
    sap.firefly.UxGeneric.prototype.openAtPosition.call(this, posX, posY);
    var position = {};
    position.offsetX = posX;
    position.offsetY = posY; //  position.left = 150;
    //  position.top = 150;

    var isRTL = sap.ui.getCore().getConfiguration().getRTL();

    if (isRTL) {
      // RTL requires the reference element to be set and also left and top in the postion object for some reason, hence the special handling
      position.left = posX;
      position.top = posY;
      this.getNativeControl().openAsContextMenu(position, $("html"));
    } else {
      this.getNativeControl().openAsContextMenu(position);
    }

    return this;
  };

  sap.firefly.UxMenu.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxMenu.prototype.isOpen = function () {
    return sap.firefly.UxGeneric.prototype.isOpen.call(this);
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxMenuItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxMenuItem";
  };

  sap.firefly.UxMenuItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxMenuItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxMenuItem();
    object.setup();
    return object;
  };

  sap.firefly.UxMenuItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.MenuItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxMenuItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxMenuItem.prototype._addEvents = function (nativeControl) {
    var myself = this; // onClick event

    nativeControl.onclick = function (oControlEvent) {
      if (myself.getListenerOnClick() !== null) {
        myself.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onPress event


    nativeControl.attachPress(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxMenuItem.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxMenuItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxMenuItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxMenuItem.prototype.setSectionStart = function (sectionStart) {
    sap.firefly.UxGeneric.prototype.setSectionStart.call(this, sectionStart);
    this.getNativeControl().setStartsSection(sectionStart);
    return this;
  };

  sap.firefly.UxMenuItem.prototype.isSectionStart = function () {
    return this.getNativeControl().getStartsSection();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxToolbar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxToolbar";
  };

  sap.firefly.UxToolbar.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxToolbar.prototype.newInstance = function () {
    var object = new sap.firefly.UxToolbar();
    object.setup();
    return object;
  };

  sap.firefly.UxToolbar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Toolbar(this.getId());
    nativeControl.addStyleClass("ff-toolbar");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxToolbar.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxToolbar.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxToolbar.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addContent(nativeItem);
    return this;
  };

  sap.firefly.UxToolbar.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertContent(nativeItem, index);
    return this;
  };

  sap.firefly.UxToolbar.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeContent(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxToolbar.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxToolbar.prototype.setToolbarDesign = function (toolbarDesign) {
    sap.firefly.UxGeneric.prototype.setToolbarDesign.call(this, toolbarDesign);
    this.getNativeControl().setDesign(sap.firefly.ui.Ui5ConstantUtils.parseToolbarDesign(toolbarDesign));
    return this;
  };

  sap.firefly.UxToolbar.prototype.getToolbarDesign = function () {
    return sap.firefly.UxGeneric.prototype.getToolbarDesign.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxOverflowToolbar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxOverflowToolbar";
  };

  sap.firefly.UxOverflowToolbar.prototype = new sap.firefly.UxToolbar();

  sap.firefly.UxOverflowToolbar.prototype.newInstance = function () {
    var object = new sap.firefly.UxOverflowToolbar();
    object.setup();
    return object;
  };

  sap.firefly.UxOverflowToolbar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); //call UxGeneric directly, we want to skip the UxButton initialize method call here since we create a different control

    var myself = this;
    var nativeControl = new sap.m.OverflowToolbar(this.getId());
    nativeControl.addStyleClass("ff-overflow-toolbar");
    this.setNativeControl(nativeControl);
  }; // ======================================
  // UxOverflowToolbar inherits from Toolbar and it has the same base properties and events


  sap.firefly.UxSegmentedButton = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSegmentedButton";
  };

  sap.firefly.UxSegmentedButton.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSegmentedButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxSegmentedButton();
    object.setup();
    return object;
  };

  sap.firefly.UxSegmentedButton.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.SegmentedButton(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSegmentedButton.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSegmentedButton.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelectionChange event

    nativeControl.attachSelectionChange(function (oControlEvent) {
      var nativeItem = oControlEvent.getParameters().item;
      var selectedItem = null;

      if (nativeItem !== null) {
        var selectedItem = sap.firefly.UxGeneric.getUxControl(nativeItem);
      }

      if (myself.getListenerOnSelectionChange() !== null) {
        myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedItem));
      }
    });
  }; // ======================================


  sap.firefly.UxSegmentedButton.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxSegmentedButton.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxSegmentedButton.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxSegmentedButton.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxSegmentedButton.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item !== null && item !== undefined) {
      var nativeItem = item.getNativeControl();
      this.getNativeControl().setSelectedItem(nativeItem);
    } else {
      this.getNativeControl().setSelectedItem(null); // remove selected item
    }

    return this;
  };

  sap.firefly.UxSegmentedButton.prototype.getSelectedItem = function () {
    var selectedItemId = this.getNativeControl().getSelectedItem();
    var selectedItem = this.getItemById(selectedItemId);

    if (selectedItem != null) {
      return selectedItem;
    }

    return null;
  }; // ======================================


  sap.firefly.UxSegmentedButton.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSegmentedButtonItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSegmentedButtonItem";
  };

  sap.firefly.UxSegmentedButtonItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSegmentedButtonItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxSegmentedButtonItem();
    object.setup();
    return object;
  };

  sap.firefly.UxSegmentedButtonItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.SegmentedButtonItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSegmentedButtonItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSegmentedButtonItem.prototype._addEvents = function (nativeControl) {
    var myself = this; // onPress event

    nativeControl.attachPress(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxSegmentedButtonItem.prototype.focus = function () {
    sap.firefly.UxGeneric.prototype.focus.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxSegmentedButtonItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxSegmentedButtonItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxSegmentedButtonItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxSegmentedButtonItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxSegmentedButtonItem.prototype.setSelected = function (selected) {
    sap.firefly.UxGeneric.prototype.setSelected.call(this, selected);
    var parent = this.getParent();

    if (parent !== null && parent !== undefined) {
      var parentNative = parent.getNativeControl();
      parentNative.setSelectedItem(this.getNativeControl());
    }

    return this;
  };

  sap.firefly.UxSegmentedButtonItem.prototype.isSelected = function () {
    var parent = this.getParent();

    if (parent !== null && parent !== undefined) {
      var parentNative = parent.getNativeControl();
      var selectedItemId = parentNative.getSelectedItem();
      return selectedItemId == this.getId();
    }

    return sap.firefly.UxGeneric.prototype.isSelected.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxPage = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxPage";
  };

  sap.firefly.UxPage.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxPage.prototype.newInstance = function () {
    var object = new sap.firefly.UxPage();
    object.setup();
    return object;
  };

  sap.firefly.UxPage.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Page(this.getId());
    nativeControl.addStyleClass("ff-page");
    nativeControl.setTitle("Page");
    nativeControl.setShowNavButton(true); // always show nav button, but not on inital page

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxPage.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxPage.prototype._addEvents = function (nativeControl) {
    var myself = this; //onBack event

    nativeControl.attachNavButtonPress(function (oEvent) {
      if (myself.getParent() != null && myself.getParent().getUiType() === sap.firefly.UiType.NAVIGATION_CONTAINER) {
        myself.getParent().backNavBtnPressed();
      }
    });
  }; // ======================================


  sap.firefly.UxPage.prototype.addPageButton = function (pageButton) {
    sap.firefly.UxGeneric.prototype.addPageButton.call(this, pageButton);
    var nativePageButton = pageButton.getNativeControl();
    this.getNativeControl().addHeaderContent(nativePageButton);
    return this;
  };

  sap.firefly.UxPage.prototype.insertPageButton = function (pageButton, index) {
    sap.firefly.UxGeneric.prototype.insertPageButton.call(this, pageButton, index);
    var nativePageButton = pageButton.getNativeControl();
    this.getNativeControl().insertHeaderContent(nativePageButton, index);
    return this;
  };

  sap.firefly.UxPage.prototype.removePageButton = function (pageButton) {
    var nativePageButton = pageButton.getNativeControl();
    this.getNativeControl().removeHeaderContent(nativePageButton);
    sap.firefly.UxGeneric.prototype.removePageButton.call(this, pageButton);
    return this;
  };

  sap.firefly.UxPage.prototype.clearPageButtons = function () {
    sap.firefly.UxGeneric.prototype.clearPageButtons.call(this);
    this.getNativeControl().removeAllHeaderContent();
    return this;
  }; // ======================================


  sap.firefly.UxPage.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();
    var nativeContentControl = content.getNativeControl();
    this.getNativeControl().addContent(nativeContentControl);
    return this;
  };

  sap.firefly.UxPage.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxPage.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxPage.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      var nativeHeaderControl = this._wrapInToolbarIfNecessary(header, "Header");

      this.getNativeControl().setCustomHeader(nativeHeaderControl);
    } else {
      this.getNativeControl().setCustomHeader(null);
    }

    return this;
  };

  sap.firefly.UxPage.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
  };

  sap.firefly.UxPage.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().setCustomHeader(null);
    return this;
  }; // ======================================


  sap.firefly.UxPage.prototype.setSubHeader = function (subHeader) {
    sap.firefly.UxGeneric.prototype.setSubHeader.call(this, subHeader);

    if (subHeader != null) {
      var nativeSubHeader = this._wrapInToolbarIfNecessary(subHeader, "SubHeader");

      this.getNativeControl().setSubHeader(nativeSubHeader);
    } else {
      this.getNativeControl().setSubHeader(null);
    }

    return this;
  };

  sap.firefly.UxPage.prototype.getSubHeader = function () {
    return sap.firefly.UxGeneric.prototype.getSubHeader.call(this);
  };

  sap.firefly.UxPage.prototype.clearSubHeader = function () {
    sap.firefly.UxGeneric.prototype.clearSubHeader.call(this);
    this.getNativeControl().setSubHeader(null);
    return this;
  }; // ======================================


  sap.firefly.UxPage.prototype.setFooter = function (footer) {
    sap.firefly.UxGeneric.prototype.setFooter.call(this, footer);

    if (footer != null) {
      var nativeFooter = this._wrapInToolbarIfNecessary(footer, "Footer");

      this.getNativeControl().setFooter(nativeFooter);
    } else {
      this.getNativeControl().setFooter(null);
    }

    return this;
  };

  sap.firefly.UxPage.prototype.getFooter = function () {
    return sap.firefly.UxGeneric.prototype.getFooter.call(this);
  };

  sap.firefly.UxPage.prototype.clearFooter = function () {
    sap.firefly.UxGeneric.prototype.clearFooter.call(this);
    this.getNativeControl().setFooter(null);
    return this;
  }; // ======================================


  sap.firefly.UxPage.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    this.getNativeControl().setTitle(title);
    return this;
  };

  sap.firefly.UxPage.prototype.getTitle = function () {
    return this.getNativeControl().getTitle();
  };

  sap.firefly.UxPage.prototype.setShowNavButton = function (showNavButton) {
    sap.firefly.UxGeneric.prototype.setShowNavButton.call(this, showNavButton);
    this.getNativeControl().setShowNavButton(showNavButton);
    return this;
  };

  sap.firefly.UxPage.prototype.isShowNavButton = function () {
    return this.getNativeControl().getShowNavButton();
  };

  sap.firefly.UxPage.prototype.setShowHeader = function (showHeader) {
    sap.firefly.UxGeneric.prototype.setShowHeader.call(this, showHeader);
    this.getNativeControl().setShowHeader(showHeader);
    return this;
  };

  sap.firefly.UxPage.prototype.isShowHeader = function () {
    return this.getNativeControl().getShowHeader();
  };

  sap.firefly.UxPage.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxPage.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxPage.prototype.setFloatingFooter = function (floatingFooter) {
    sap.firefly.UxGeneric.prototype.setFloatingFooter.call(this, floatingFooter);
    this.getNativeControl().setFloatingFooter(floatingFooter);
    return this;
  };

  sap.firefly.UxPage.prototype.isFloatingFooter = function () {
    return this.getNativeControl().getFloatingFooter();
  };

  sap.firefly.UxPage.prototype.setContentOnlyBusy = function (contentOnlyBusy) {
    sap.firefly.UxGeneric.prototype.setContentOnlyBusy.call(this, contentOnlyBusy);
    this.getNativeControl().setContentOnlyBusy(contentOnlyBusy);
    return this;
  };

  sap.firefly.UxPage.prototype.isContentOnlyBusy = function () {
    return this.getNativeControl().getContentOnlyBusy();
  };

  sap.firefly.UxPage.prototype.setShowSubHeader = function (showSubHeader) {
    sap.firefly.UxGeneric.prototype.setShowSubHeader.call(this, showSubHeader);
    this.getNativeControl().setShowSubHeader(showSubHeader);
    return this;
  };

  sap.firefly.UxPage.prototype.isShowSubHeader = function () {
    return this.getNativeControl().getShowSubHeader();
  };

  sap.firefly.UxPage.prototype.setEnableScrolling = function (enabledScrolling) {
    sap.firefly.UxGeneric.prototype.setEnableScrolling.call(this, enabledScrolling);
    this.getNativeControl().setEnableScrolling(enabledScrolling);
    return this;
  };

  sap.firefly.UxPage.prototype.isEnableScrolling = function () {
    return this.getNativeControl().getEnableScrolling();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxPage.prototype.hideNavigationButton = function () {
    if (this.getNativeControl()) {
      this.getNativeControl().setShowNavButton(false);
    }
  };

  sap.firefly.UxPage.prototype._wrapInToolbarIfNecessary = function (control) {
    // header, footer or subheader require a control of the sapui5 IBar interface
    // currently we do not have any check for that in the ui so we do that check here and wrap the control if it is not a toolbar
    if (control != null) {
      var nativeControl = control.getNativeControl();

      if (control.getUiType() === sap.firefly.UiType.TOOLBAR) {
        return nativeControl;
      }

      var tmpToolbar = new sap.m.Toolbar(this.getId() + "_Toolbar");
      tmpToolbar.addContent(nativeControl);
      return tmpToolbar;
    }
  };

  sap.firefly.UxPageButton = function () {
    sap.firefly.UxButton.call(this);
    this._ff_c = "UxPageButton";
  };

  sap.firefly.UxPageButton.prototype = new sap.firefly.UxButton();

  sap.firefly.UxPageButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxPageButton();
    object.setup();
    return object;
  }; // PageButton inherits from Button and it has the same properties


  sap.firefly.UxNavigationContainer = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxNavigationContainer";
  };

  sap.firefly.UxNavigationContainer.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxNavigationContainer.prototype.newInstance = function () {
    var object = new sap.firefly.UxNavigationContainer();
    object.setup();
    return object;
  };

  sap.firefly.UxNavigationContainer.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.NavContainer(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxNavigationContainer.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxNavigationContainer.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxNavigationContainer.prototype.pushPage = function (page) {
    sap.firefly.UxGeneric.prototype.pushPage.call(this, page);
    var nativePage = page.getNativeControl();
    this.getNativeControl().addPage(nativePage); // set the initial page

    if (this.getNativeControl().getInitialPage() == null) {
      this.getNativeControl().setInitialPage(nativePage);
      page.hideNavigationButton(); // initial page should never have a back button
    }

    this.getNativeControl().to(nativePage);
    return this;
  };

  sap.firefly.UxNavigationContainer.prototype.popPage = function () {
    var removedPage = sap.firefly.UxGeneric.prototype.popPage.call(this);
    this.getNativeControl().back();
    /*
    // note (mp): this is probably not needed as removePage is a protected method and causes a popover to lose focus
    if (removedPage) {
      var nativeChild = removedPage.getNativeControl();
      this.getNativeControl().removePage(nativeChild);
    }
    */
    // set the nitial page to null when poping last page

    if (this.getNativeControl().getPages().length <= 0) {
      this.getNativeControl().setInitialPage(null);
    } // send on back event


    if (this.getListenerOnBack() !== null) {
      this.getListenerOnBack().onBack(sap.firefly.UiControlEvent.create(this));
    }

    return removedPage;
  };

  sap.firefly.UxNavigationContainer.prototype.clearPages = function () {
    sap.firefly.UxGeneric.prototype.clearPages.call(this);
    this.getNativeControl().setInitialPage(null);
    this.getNativeControl().removeAllPages();
    return this;
  }; // ======================================


  sap.firefly.UxNavigationContainer.prototype.popToPage = function (page) {
    sap.firefly.UxGeneric.prototype.popToPage.call(this, page);

    if (page) {
      var nativePage = page.getNativeControl(); // pop only if the desired page is not the current page, and when the desired page is on the stack

      if (nativePage != this.getNativeControl().getCurrentPage() && this.getNativeControl().indexOfPage(nativePage) != -1) {
        this.getNativeControl().backToPage(nativePage.getId()); // remove all the pages from the native page storage which are not on the stack anymore

        this._removeAllPagesTillNativePage(nativePage); // send on back event


        if (this.getListenerOnBack() !== null) {
          this.getListenerOnBack().onBack(sap.firefly.UiControlEvent.create(this));
        }
      }
    }

    return this;
  }; // ======================================


  sap.firefly.UxNavigationContainer.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxNavigationContainer.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxNavigationContainer.prototype.applyCustomCssStyling = function (element) {
    // the control needs to have a min height or it will not be visible in dialogs
    element.style.minHeight = "200px";
  }; // Helpers
  // ======================================


  sap.firefly.UxNavigationContainer.prototype.backNavBtnPressed = function () {
    this.popPage();
  };

  sap.firefly.UxNavigationContainer.prototype._removeAllPagesTillNativePage = function (nativePage) {
    if (nativePage) {
      var pageIndex = this.getNativeControl().getPages().indexOf(nativePage);

      if (pageIndex != -1) {
        var pagesToRemove = this.getNativeControl().getPages().slice(pageIndex + 1, this.getNativeControl().getPages().length);

        if (pagesToRemove != null) {
          for (var a = 0; a < pagesToRemove.length; a++) {
            var tmpPage = pagesToRemove[a];
            this.getNativeControl().removePage(tmpPage);
          }
        }
      }
    }
  };

  sap.firefly.UxTree = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTree";
  };

  sap.firefly.UxTree.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTree.prototype.newInstance = function () {
    var object = new sap.firefly.UxTree();
    object.setup();
    return object;
  };

  sap.firefly.UxTree.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Tree(this.getId());
    nativeControl.setIncludeItemInSelection(true);
    nativeControl.setSticky([sap.m.Sticky.HeaderToolbar]);
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setSizeLimit(1100); // Default is 100 for a UI5 model.

    nativeControl.setModel(oModel);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTree.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTree.prototype._addEvents = function (nativeControl) {
    var myself = this; // onToggleOpen state

    nativeControl.attachToggleOpenState(function (oControlEvent) {
      var isExpanded = oControlEvent.getParameters().expanded;
      var nativeItemIndex = oControlEvent.getParameters().itemIndex;
      var nativeItem = myself.getNativeControl().getItems()[nativeItemIndex];

      if (nativeItem == null) {
        sap.firefly.ui.Log.logError("Something went wrong - could not find native item");
        return;
      }

      var mobileTreeItem = sap.firefly.UxGeneric.getUxControl(nativeItem);

      if (mobileTreeItem == null) {
        sap.firefly.ui.Log.logError("Something went wrong - could not find mobile tree item");
        return;
      }

      if (isExpanded) {
        // item event
        mobileTreeItem.itemExpanded(); // tree control event

        if (myself.getListenerOnExpand() !== null) {
          var uiEventItem = sap.firefly.UiItemEvent.createItem(myself, null, mobileTreeItem);
          myself.getListenerOnExpand().onExpand(uiEventItem);
        }
      } else {
        // items event
        mobileTreeItem.itemCollapsed(); // tree control event

        if (myself.getListenerOnCollapse() !== null) {
          var uiEventItem = sap.firefly.UiItemEvent.createItem(myself, null, mobileTreeItem);
          myself.getListenerOnCollapse().onCollapse(uiEventItem);
        }
      }
    }); // onSelectionChange event

    nativeControl.attachSelectionChange(function (oControlEvent) {
      var isSelect = oControlEvent.getParameters().selected;

      if (isSelect === true) {
        if (myself.getListenerOnSelect() !== null) {
          var listItem = oControlEvent.getParameters().listItem;
          var selectedItem = sap.firefly.UxGeneric.getUxControl(listItem);
          myself.getListenerOnSelect().onSelect(sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedItem));
        }
      }

      if (myself.getListenerOnSelectionChange() !== null) {
        var isSelect = oControlEvent.getParameters().selected;
        var isSelectAll = oControlEvent.getParameters().selectAll && isSelect;
        var isDeselectAll = isSelectAll === false && oControlEvent.getParameters().listItems.length > 1; // deselctAll is when listItems length is graeter then 1
        // prepare the properties

        var newParameters = sap.firefly.XProperties.create();
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT, isSelect);
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT_ALL, isSelectAll);
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_DESELECT_ALL, isDeselectAll);
        myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(myself, newParameters));
      }
    }); // onDelete event

    nativeControl.attachDelete(function (oControlEvent) {
      if (myself.getListenerOnDelete() !== null) {
        var nativeTreeItem = oControlEvent.getParameters().listItem;
        var deletedItem = sap.firefly.UxGeneric.getUxControl(nativeTreeItem);
        myself.getListenerOnDelete().onDelete(sap.firefly.UiItemEvent.createItem(myself, null, deletedItem));
      }
    });
  }; // ======================================


  sap.firefly.UxTree.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTree.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTree.prototype.removeItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    this.createTreeModel();
    return this;
  };

  sap.firefly.UxTree.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.createTreeModel();
    return this;
  }; // ======================================


  sap.firefly.UxTree.prototype.getSelectedItem = function () {
    var nativeSelectedItem = this.getNativeControl().getSelectedItem();

    if (nativeSelectedItem) {
      return sap.firefly.UxGeneric.getUxControl(nativeSelectedItem);
    }

    return null;
  };

  sap.firefly.UxTree.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeItemToSelect = item.getNativeControl();

      if (nativeItemToSelect) {
        this.getNativeControl().removeSelections();
        this.getNativeControl().setSelectedItem(nativeItemToSelect, true);
      }
    } else {
      this.getNativeControl().removeSelections();
    }
  };

  sap.firefly.UxTree.prototype.getSelectedItems = function () {
    var selectedItems = sap.firefly.XList.create();
    var nativeSelectedItems = this.getNativeControl().getSelectedItems();

    for (var i = 0; i < nativeSelectedItems.length; i++) {
      var tmpNativeTreeItem = nativeSelectedItems[i];
      var ffControl = sap.firefly.UxGeneric.getUxControl(tmpNativeTreeItem);
      selectedItems.add(ffControl);
    }

    return selectedItems;
  };

  sap.firefly.UxTree.prototype.setSelectedItems = function (items) {
    sap.firefly.UxGeneric.prototype.setSelectedItems.call(this, items);

    if (items !== null) {
      this.getNativeControl().removeSelections();
      var size = items.size();

      for (var i = 0; i < size; i++) {
        this.getNativeControl().setSelectedItem(items.get(i).getNativeControl(), true);
      }
    }

    return this;
  };

  sap.firefly.UxTree.prototype.addSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.addSelectedItem.call(this, item);
    var nativeItemToSelect = item.getNativeControl();

    if (nativeItemToSelect) {
      this.getNativeControl().setSelectedItem(nativeItemToSelect, true);
    }

    return this;
  };

  sap.firefly.UxTree.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeSelectedItem.call(this, item);
    var nativeItemToDeselect = item.getNativeControl();

    if (nativeItemToDeselect) {
      this.getNativeControl().setSelectedItem(nativeItemToDeselect, false);
    }

    return this;
  };

  sap.firefly.UxTree.prototype.clearSelectedItems = function () {
    sap.firefly.UxGeneric.prototype.clearSelectedItems.call(this);
    this.getNativeControl().removeSelections();
    return this;
  }; // ======================================


  sap.firefly.UxTree.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
    ;
  };

  sap.firefly.UxTree.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      var nativeHeaderControl = header.getNativeControl();
      this.getNativeControl().destroyHeaderToolbar(); // remove the old header toolbar

      var tmpToolbar = new sap.m.Toolbar(this.getId() + "_headerToolbar");
      tmpToolbar.addContent(nativeHeaderControl);
      this.getNativeControl().setHeaderToolbar(tmpToolbar);
    }

    return this;
  };

  sap.firefly.UxTree.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().destroyHeaderToolbar();
    return this;
  }; // ======================================


  sap.firefly.UxTree.prototype.expandToLevel = function (level) {
    sap.firefly.UxGeneric.prototype.expandToLevel.call(this, level);

    if (this.hasItems()) {
      this.getNativeControl().expandToLevel(level);
    }

    return this;
  };

  sap.firefly.UxTree.prototype.collapseAll = function () {
    sap.firefly.UxGeneric.prototype.collapseAll.call(this);

    if (this.hasItems()) {
      this.getNativeControl().collapseAll();
    }

    return this;
  }; // ======================================


  sap.firefly.UxTree.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    this.getNativeControl().setHeaderText(title);
    return this;
  };

  sap.firefly.UxTree.prototype.getTitle = function () {
    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxTree.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTree.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxTree.prototype.setSelectionMode = function (selectionMode) {
    sap.firefly.UxGeneric.prototype.setSelectionMode.call(this, selectionMode);
    var mode = sap.m.ListMode.SingleSelectMaster;

    if (selectionMode == sap.firefly.UiSelectionMode.NONE) {
      mode = sap.m.ListMode.None;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT) {
      mode = sap.m.ListMode.SingleSelect;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT_LEFT) {
      mode = sap.m.ListMode.SingleSelectLeft;
    } else if (selectionMode == sap.firefly.UiSelectionMode.MULTI_SELECT) {
      mode = sap.m.ListMode.MultiSelect;
    } else if (selectionMode == sap.firefly.UiSelectionMode.DELETE) {
      mode = sap.m.ListMode.Delete;
    }

    this.getNativeControl().setMode(mode);
    return this;
  };

  sap.firefly.UxTree.prototype.getSelectionMode = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionMode.call(this);
  };

  sap.firefly.UxTree.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);

    if (this.hasItems()) {
      if (expanded === true) {
        this.getNativeControl().expandToLevel(999);
      } else {
        this.getNativeControl().collapseAll();
      }
    }

    return this;
  };

  sap.firefly.UxTree.prototype.isExpanded = function () {
    return sap.firefly.UxGeneric.prototype.isExpanded.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxTree.prototype.applyCustomCssStyling = function (element) {
    // content needs to have overflow auto or tree items will break out of bounds if the tree items size is bigger then the control
    element.style.overflow = "auto";
  }; // Helpers
  // ======================================


  sap.firefly.UxTree.prototype.createTreeModel = function () {
    var myself = this;
    var children = this.getItems();
    var modelData = [];

    if (children && children.size() > 0) {
      modelData = this._generateTreeModelRecursive(children);
    }

    if (this.getNativeControl().getModel().getJSON() == null || this.getNativeControl().getModel().getJSON().length <= 2) {
      this.getNativeControl().getModel().setData(modelData);
      this.getNativeControl().bindItems("/", function (sId, oContext) {
        var itemId = oContext.getProperty("ffTreeItemId");

        var mobileTreeItem = myself._getMobileTreeItemById(itemId);

        if (mobileTreeItem) {
          mobileTreeItem.rerenderNativeTreeItem();
          return mobileTreeItem.getNativeControl();
        }

        return null;
      });
    } else {
      this.getNativeControl().getModel().setData(modelData);
      this.getNativeControl().updateItems();
    } // ------------ EXPANDED WHOLE TREE
    // if exapnded property on tree control is set then expand the whole tree


    if (this.isExpanded()) {
      this.expand();
    } // ------------

  };

  sap.firefly.UxTree.prototype._generateTreeModelRecursive = function (children) {
    var tmpModel = [];

    if (children && children.size() > 0) {
      for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        var newModelItem = new Object();
        newModelItem.ffTreeItemId = child.getId();

        if (child.getItemCount() > 0) {
          var tmpNodes = this._generateTreeModelRecursive(child.getItems());

          newModelItem.nodes = tmpNodes;
        }

        tmpModel.push(newModelItem);
      }

      return tmpModel;
    }

    return [];
  };

  sap.firefly.UxTree.prototype._getMobileTreeItemById = function (itemId) {
    var children = this._getAllMobileTreeItems();

    for (var i = 0; i < children.length; i++) {
      var tmpChild = children[i];

      if (tmpChild.getId() == itemId) {
        return tmpChild;
      }
    }

    return null;
  };

  sap.firefly.UxTree.prototype._getAllMobileTreeItems = function () {
    var firstLevelChildren = this.getItems();

    var allMobileTreeListItems = this._getMobileTreeItemsRecursive(firstLevelChildren);

    if (allMobileTreeListItems && allMobileTreeListItems.length > 0) {
      return allMobileTreeListItems;
    }

    return [];
  };

  sap.firefly.UxTree.prototype._getMobileTreeItemsRecursive = function (children) {
    var tmpTreeItemsArray = [];

    if (children && children.size() > 0) {
      for (var i = 0; i < children.size(); i++) {
        var tmpChild = children.get(i);
        tmpTreeItemsArray.push(tmpChild);

        var tmpLowerChildArray = this._getMobileTreeItemsRecursive(tmpChild.getItems());

        if (tmpLowerChildArray && tmpLowerChildArray.length > 0) {
          tmpTreeItemsArray = tmpTreeItemsArray.concat(tmpLowerChildArray);
        }
      }

      return tmpTreeItemsArray;
    }

    return [];
  };

  sap.firefly.UxTree.prototype.expandNativeItem = function (treeItem) {
    var nativeItem = treeItem.getNativeControl();
    var indexOfNativeItem = this.getNativeControl().indexOfItem(nativeItem);

    if (indexOfNativeItem != -1) {
      this.getNativeControl().expand(indexOfNativeItem);
    } else {
      this._tryToExpandPath(treeItem);
    }
  };

  sap.firefly.UxTree.prototype.collapseNativeItem = function (treeItem) {
    var nativeItem = treeItem.getNativeControl();
    var indexOfNativeItem = this.getNativeControl().indexOfItem(nativeItem);

    if (indexOfNativeItem != -1 && nativeItem.isLeaf() == false) {
      this.getNativeControl().collapse(indexOfNativeItem);
    }
  };

  sap.firefly.UxTree.prototype._tryToExpandPath = function (treeItem) {
    if (treeItem) {
      var tmpItemParent = treeItem.getParent();
      var itemsArray = [treeItem];

      while (tmpItemParent && tmpItemParent.isExpanded() === false && tmpItemParent != this) {
        itemsArray = [tmpItemParent].concat(itemsArray);
        tmpItemParent = tmpItemParent.getParent();
      }

      if (itemsArray) {
        for (var a = 0; a < itemsArray.length; a++) {
          var tmpItem = itemsArray[a];

          if (tmpItem) {
            var nativeItem = tmpItem.getNativeControl();
            var indexOfNativeItem = this.getNativeControl().indexOfItem(nativeItem);

            if (indexOfNativeItem != -1) {
              this.getNativeControl().expand(indexOfNativeItem);
            }
          }
        }
      }
    }
  };

  sap.firefly.UxTreeItem = function () {
    sap.firefly.UxTreeItemBase.call(this);
    this._ff_c = "UxTreeItem";
  };

  sap.firefly.UxTreeItem.prototype = new sap.firefly.UxTreeItemBase();

  sap.firefly.UxTreeItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxTreeItem();
    object.setup();
    return object;
  };

  sap.firefly.UxTreeItem.prototype.initializeNative = function () {
    sap.firefly.UxTreeItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.StandardTreeItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTreeItem.prototype.releaseObject = function () {
    sap.firefly.UxTreeItemBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTreeItem.prototype.setText = function (text) {
    sap.firefly.UxTreeItemBase.prototype.setText.call(this, text);

    if (this.getNativeControl()) {
      this.getNativeControl().setTitle(text);
    }

    return this;
  };

  sap.firefly.UxTreeItem.prototype.getText = function () {
    return sap.firefly.UxTreeItemBase.prototype.getText.call(this);
  };

  sap.firefly.UxTreeItem.prototype.setIcon = function (icon) {
    sap.firefly.UxTreeItemBase.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxTreeItem.prototype.getIcon = function () {
    return sap.firefly.UxTreeItemBase.prototype.getIcon.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTreeItem.prototype.rerenderNativeTreeItem = function () {
    sap.firefly.UxTreeItemBase.prototype.rerenderNativeTreeItem.call(this);
    this.setText(this.getText());
    this.setIcon(this.getIcon());
  };

  sap.firefly.UxCustomTreeItem = function () {
    sap.firefly.UxTreeItemBase.call(this);
    this._ff_c = "UxCustomTreeItem";
  };

  sap.firefly.UxCustomTreeItem.prototype = new sap.firefly.UxTreeItemBase();

  sap.firefly.UxCustomTreeItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxCustomTreeItem();
    object.setup();
    return object;
  };

  sap.firefly.UxCustomTreeItem.prototype.initializeNative = function () {
    sap.firefly.UxTreeItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.CustomTreeItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCustomTreeItem.prototype.releaseObject = function () {
    sap.firefly.UxTreeItemBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCustomTreeItem.prototype.setContent = function (content) {
    sap.firefly.UxTreeItemBase.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl); //cloning makes it work but then actual ff control references the original control
      // so that the clone does not react to property changes or events which makes it not good...
      //this.getNativeControl().addContent(childControl.clone());
    }

    return this;
  };

  sap.firefly.UxCustomTreeItem.prototype.getContent = function () {
    return sap.firefly.UxTreeItemBase.prototype.getContent.call(this);
  };

  sap.firefly.UxCustomTreeItem.prototype.clearContent = function () {
    sap.firefly.UxTreeItemBase.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxCustomTreeItem.prototype.rerenderNativeTreeItem = function () {
    if (this.getNativeControl()) {
      this.getNativeControl().removeAllContent(); // remove the content reference before destroying so that we do not destroy the contenet yet since we still need it
    }

    sap.firefly.UxTreeItemBase.prototype.rerenderNativeTreeItem.call(this);
    this.setContent(this.getContent());
  }; // Event handlers
  // ======================================


  sap.firefly.UxTable = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTable";
    this.m_rowModel = {};
  };

  sap.firefly.UxTable.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTable.prototype.newInstance = function () {
    var object = new sap.firefly.UxTable();
    object.setup();
    return object;
  };

  sap.firefly.UxTable.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.table");
    var myself = this;
    var nativeControl = new sap.ui.table.Table(this.getId());
    var oModel = new sap.ui.model.json.JSONModel();
    nativeControl.setModel(oModel);
    nativeControl.setVisibleRowCount(10); // 10 is default, when visible row count mode is set to auto then this property has no effect

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTable.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTable.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelectionChange event

    nativeControl.attachRowSelectionChange(function (oControlEvent) {
      // only fire the event if happen with user interaction, e.g. user selects something, do not fire when selectIndex method is called
      var userInteraction = oControlEvent.getParameters().userInteraction;
      var isSelectAll = oControlEvent.getParameters().selectAll;

      if (userInteraction) {
        if (isSelectAll === false || isSelectAll === undefined) {
          if (myself.getListenerOnSelect() !== null) {
            var rowIndex = oControlEvent.getParameters().rowIndex;

            if (myself.getNativeControl().isIndexSelected(rowIndex)) {
              var tableRow = myself.getRow(rowIndex);
              myself.getListenerOnSelect().onSelect(sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, tableRow));
            }
          }
        }

        if (myself.getListenerOnSelectionChange() !== null) {
          var isSelectAll = oControlEvent.getParameters().selectAll || false;
          var isDeselectAll = isSelectAll === false && oControlEvent.getParameters().rowIndex === -1; // deselctAll is when rowIndex is -1

          var isSelect = isSelectAll;

          if (isSelectAll === false && isDeselectAll === false) {
            // if not select all and not deselct all then check if the specified rowIndex is selected
            isSelect = myself.getNativeControl().isIndexSelected(rowIndex);
          } // prepare the properties


          var newParameters = sap.firefly.XProperties.create();
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT_ALL, isSelectAll);
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_DESELECT_ALL, isDeselectAll);
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT, isSelect);
          myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(myself, newParameters));
        }
      }
    }); // onClick event

    nativeControl.attachCellClick(function (oControlEvent) {
      var rowIndex = oControlEvent.getParameters().rowIndex;
      var columnIndex = oControlEvent.getParameters().columnIndex; // row clicked

      var tableRow = myself.getRow(rowIndex);

      if (tableRow) {
        tableRow.rowClicked(); // cell clicked

        var tableRowCell = tableRow.getCell(columnIndex);

        if (tableRowCell) {
          tableRowCell.cellClicked();
        }
      }
    }); // onScroll event

    nativeControl.attachFirstVisibleRowChanged(function (oControlEvent) {
      if (myself.getListenerOnScroll() !== null) {
        var firstVisibleRowIndex = oControlEvent.getParameters().firstVisibleRow;
        var firstVisibleTableRow = myself.getRow(firstVisibleRowIndex); // prepare the properties

        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_FIRST_VISIBLE_ROW_NAME, firstVisibleTableRow.getName());
        myself.getListenerOnScroll().onScroll(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
  }; // ======================================


  sap.firefly.UxTable.prototype.addColumn = function (column) {
    sap.firefly.UxGeneric.prototype.addColumn.call(this, column);
    var columnIndex = this.numberOfColumns() - 1;
    column.setColumnIndex(columnIndex);
    var nativeColumn = column.getNativeControl();
    this.getNativeControl().addColumn(nativeColumn);
    return this;
  };

  sap.firefly.UxTable.prototype.insertColumn = function (column, index) {
    sap.firefly.UxGeneric.prototype.insertColumn.call(this, column, index);
    var columnIndex = index;
    column.setColumnIndex(columnIndex); // adjust the indices of other columns

    for (var i = index + 1; i < this.getColumns().size(); i++) {
      var tmpTableColumn = this.getColumns().get(i);
      tmpTableColumn.setColumnIndex(i);
    }

    var nativeColumn = column.getNativeControl();
    this.getNativeControl().insertColumn(nativeColumn, index);
    return this;
  };

  sap.firefly.UxTable.prototype.removeColumn = function (column) {
    var nativeColumn = column.getNativeControl();
    this.getNativeControl().removeColumn(nativeColumn);
    sap.firefly.UxGeneric.prototype.removeColumn.call(this, column);
    return this;
  };

  sap.firefly.UxTable.prototype.clearColumns = function () {
    sap.firefly.UxGeneric.prototype.clearColumns.call(this);
    this.getNativeControl().removeAllColumns();
    return this;
  }; // ======================================


  sap.firefly.UxTable.prototype.addRow = function (row) {
    sap.firefly.UxGeneric.prototype.addRow.call(this, row);
    var data = row.getData();
    this.m_rowModel[row.getId()] = data;
    this.refreshData();
    return this;
  };

  sap.firefly.UxTable.prototype.insertRow = function (row, index) {
    sap.firefly.UxGeneric.prototype.insertRow.call(this, row, index); //at insert i need to regenerate the row model

    this.m_rowModel = {};

    for (var i = 0; i < this.getRows().size(); i++) {
      var tmpTableRow = this.getRows().get(i);
      var tmpData = tmpTableRow.getData();
      this.m_rowModel[tmpTableRow.getId()] = tmpData;
    }

    this.refreshData();
    return this;
  };

  sap.firefly.UxTable.prototype.removeRow = function (row) {
    if (row != null) {
      delete this.m_rowModel[row.getId()];
      this.refreshData();
    }

    sap.firefly.UxGeneric.prototype.removeRow.call(this, row);
    return this;
  };

  sap.firefly.UxTable.prototype.clearRows = function () {
    sap.firefly.UxGeneric.prototype.clearRows.call(this);
    this.m_rowModel = {};
    this.refreshData();
    return this;
  }; // ======================================


  sap.firefly.UxTable.prototype.getFooter = function () {
    return sap.firefly.UxGeneric.prototype.getFooter.call(this);
  };

  sap.firefly.UxTable.prototype.setFooter = function (footer) {
    sap.firefly.UxGeneric.prototype.setFooter.call(this, footer);
    var nativeFooterControl = footer.getNativeControl();
    this.getNativeControl().setFooter(nativeFooterControl);
    return this;
  };

  sap.firefly.UxTable.prototype.clearFooter = function () {
    sap.firefly.UxGeneric.prototype.clearFooter.call(this);
    this.getNativeControl().destroyFooter();
    return this;
  }; // ======================================


  sap.firefly.UxTable.prototype.getSelectedItem = function () {
    var nativeSelectedIndices = this.getNativeControl().getSelectedIndices();

    if (nativeSelectedIndices && nativeSelectedIndices.length > 0) {
      return this.getRow(nativeSelectedIndices[0]);
    }

    return null;
  };

  sap.firefly.UxTable.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeRowIndexToSelect = this.getIndexOfRow(item);

      if (nativeRowIndexToSelect != -1) {
        this.getNativeControl().setSelectedIndex(nativeRowIndexToSelect);
      }
    } else {
      this.getNativeControl().clearSelection();
    }

    return this;
  };

  sap.firefly.UxTable.prototype.getSelectedItems = function () {
    var selectedItems = sap.firefly.XList.create();
    var nativeSelectedRowIndices = this.getNativeControl().getSelectedIndices();

    for (var i = 0; i < nativeSelectedRowIndices.length; i++) {
      var tmpTableTreeItem = this.getRow(nativeSelectedRowIndices[i]);
      selectedItems.add(tmpTableTreeItem);
    }

    return selectedItems;
  };

  sap.firefly.UxTable.prototype.setSelectedItems = function (items) {
    sap.firefly.UxGeneric.prototype.setSelectedItems.call(this, items);

    if (items !== null) {
      this.getNativeControl().clearSelection();
      var size = items.size();

      for (var i = 0; i < size; i++) {
        var rowIndexToSelect = this.getIndexOfRow(items.get(i));

        if (rowIndexToSelect != -1) {
          this.getNativeControl().addSelectionInterval(rowIndexToSelect, rowIndexToSelect);
        }
      }
    }

    return this;
  };

  sap.firefly.UxTable.prototype.addSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.addSelectedItem.call(this, item);

    if (item != null) {
      var rowIndexToSelect = this.getIndexOfRow(item);

      if (rowIndexToSelect != -1) {
        this.getNativeControl().addSelectionInterval(rowIndexToSelect, rowIndexToSelect);
      }
    }

    return this;
  };

  sap.firefly.UxTable.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeSelectedItem.call(this, item);

    if (item != null) {
      var rowIndexToDeselect = this.getIndexOfRow(item);

      if (rowIndexToDeselect != -1) {
        this.getNativeControl().removeSelectionInterval(rowIndexToDeselect, rowIndexToDeselect);
      }
    }

    return this;
  };

  sap.firefly.UxTable.prototype.clearSelectedItems = function () {
    sap.firefly.UxGeneric.prototype.clearSelectedItems.call(this);
    this.getNativeControl().clearSelection();
    return this;
  }; // ======================================


  sap.firefly.UxTable.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    return this;
  };

  sap.firefly.UxTable.prototype.getTitle = function () {
    if (this.getNativeControl() && this.getNativeControl().getTitle()) {
      return this.getNativeControl().getTitle().getText();
    }

    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxTable.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTable.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxTable.prototype.setSelectionMode = function (selectionMode) {
    sap.firefly.UxGeneric.prototype.setSelectionMode.call(this, selectionMode);
    var mode = sap.ui.table.SelectionMode.Single;

    if (selectionMode == sap.firefly.UiSelectionMode.NONE) {
      mode = sap.ui.table.SelectionMode.None;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT) {
      mode = sap.ui.table.SelectionMode.Single;
    } else if (selectionMode == sap.firefly.UiSelectionMode.MULTI_SELECT) {
      mode = sap.ui.table.SelectionMode.MultiToggle;
    }

    this.getNativeControl().setSelectionMode(mode);
    return this;
  };

  sap.firefly.UxTable.prototype.getSelectionMode = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionMode.call(this);
  };

  sap.firefly.UxTable.prototype.setSelectionBehavior = function (selectionBehavior) {
    sap.firefly.UxGeneric.prototype.setSelectionBehavior.call(this, selectionBehavior);
    var behavior = sap.ui.table.SelectionBehavior.RowSelector;

    if (selectionBehavior == sap.firefly.UiSelectionBehavior.ROW) {
      behavior = sap.ui.table.SelectionBehavior.Row;
    } else if (selectionBehavior == sap.firefly.UiSelectionBehavior.ROW_ONLY) {
      behavior = sap.ui.table.SelectionBehavior.RowOnly;
    } else if (selectionBehavior == sap.firefly.UiSelectionBehavior.ROW_SELECTOR) {
      behavior = sap.ui.table.SelectionBehavior.RowSelector;
    }

    this.getNativeControl().setSelectionBehavior(behavior);
    return this;
  };

  sap.firefly.UxTable.prototype.getSelectionBehavior = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionBehavior.call(this);
  };

  sap.firefly.UxTable.prototype.setVisibleRowCount = function (visibleRowCount) {
    sap.firefly.UxGeneric.prototype.setVisibleRowCount.call(this, visibleRowCount);
    this.getNativeControl().setVisibleRowCount(visibleRowCount);
    return this;
  };

  sap.firefly.UxTable.prototype.getVisibleRowCount = function () {
    return this.getNativeControl().getVisibleRowCount();
  };

  sap.firefly.UxTable.prototype.setVisibleRowCountMode = function (visibleRowCountMode) {
    sap.firefly.UxGeneric.prototype.setVisibleRowCountMode.call(this, visibleRowCountMode);
    var mode = sap.ui.table.VisibleRowCountMode.Fixed;

    if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.AUTO) {
      mode = sap.ui.table.VisibleRowCountMode.Auto;
    } else if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.FIXED) {
      mode = sap.ui.table.VisibleRowCountMode.Fixed;
    } else if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.INTERACTIVE) {
      mode = sap.ui.table.VisibleRowCountMode.Interactive;
    }

    this.getNativeControl().setVisibleRowCountMode(mode);
    return this;
  };

  sap.firefly.UxTable.prototype.getVisibleRowCountMode = function () {
    return sap.firefly.UxGeneric.prototype.getVisibleRowCountMode.call(this);
  };

  sap.firefly.UxTable.prototype.setMinRowCount = function (minRowCount) {
    sap.firefly.UxGeneric.prototype.setMinRowCount.call(this, minRowCount);
    this.getNativeControl().setMinAutoRowCount(minRowCount);
    return this;
  };

  sap.firefly.UxTable.prototype.getMinRowCount = function () {
    return this.getNativeControl().getMinAutoRowCount();
  };

  sap.firefly.UxTable.prototype.setShowSelectAll = function (showSelectAll) {
    sap.firefly.DfUiContext.prototype.setShowSelectAll.call(this, showSelectAll); // skip superclass implementation, different prop name

    this.getNativeControl().setEnableSelectAll(showSelectAll);
    return this;
  };

  sap.firefly.UxTable.prototype.isShowSelectAll = function () {
    return this.getNativeControl().getEnableSelectAll();
  };

  sap.firefly.UxTable.prototype.setFirstVisibleRow = function (firstVisibleRow) {
    sap.firefly.UxGeneric.prototype.setFirstVisibleRow.call(this, firstVisibleRow);

    if (firstVisibleRow) {
      var rowIndex = this.getIndexOfRow(firstVisibleRow);
      this.getNativeControl().setFirstVisibleRow(rowIndex);
    }

    return this;
  };

  sap.firefly.UxTable.prototype.getFirstVisibleRow = function () {
    var firstVisibleRowIndex = this.getNativeControl().getFirstVisibleRow();
    var firstVisibleTableRow = this.getRow(firstVisibleRowIndex);
    return firstVisibleTableRow;
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxTable.prototype.applyHeightCss = function (element, heightCss) {
    sap.firefly.UxGeneric.prototype.applyHeightCss.call(this, element, heightCss); // special css needed when setting a height in pixel on the table

    if (heightCss && heightCss.includes("px")) {
      // have to differentiate between when title is set and not since ths size changes then (48px more with title)
      $(element).find(".sapUiTableCnt").css("overflow-y", "auto");

      if (this.getTitle() != null && this.getTitle().length > 0) {
        $(element).find(".sapUiTableCnt").css("height", "calc(100% - 48px)");
      } else {
        $(element).find(".sapUiTableCnt").css("height", "100%");
      }
    }
  }; // Helpers
  // ======================================


  sap.firefly.UxTable.prototype.getTable = function () {
    return this;
  };

  sap.firefly.UxTable.prototype.getTableCellById = function (itemId) {
    // method not used currently
    var rows = this.getRows();

    for (var i = 0; i < rows.size(); i++) {
      var tmpRow = rows.get(i);
      var tmpCells = tmpRow.getCells();

      for (var a = 0; a < tmpCells.size(); a++) {
        var tmpCell = tmpCells.get(a);

        if (tmpCell.getId() == itemId) {
          return tmpCell;
        }
      }
    }

    return null;
  };

  sap.firefly.UxTable.prototype.refreshData = function () {
    //this.getNativeControl().bindRows("/modelData");
    if (this.getNativeControl().getModel().getJSON() == null || this.getNativeControl().getModel().getJSON().length <= 2) {
      this.getNativeControl().getModel().setData({
        modelData: this.m_rowModel
      });
      this.getNativeControl().bindRows("/modelData");
    } else {
      this.getNativeControl().getModel().setData({
        modelData: this.m_rowModel
      });
      this.getNativeControl().updateRows(sap.ui.model.ChangeReason.Refresh, ""); // second param can be empty? At least cannot be null! No public API for that!
    }
  };

  sap.firefly.UxTableColumn = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTableColumn";
    this.m_columnIndex = -1;
  };

  sap.firefly.UxTableColumn.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTableColumn.prototype.newInstance = function () {
    var object = new sap.firefly.UxTableColumn();
    object.setup();
    return object;
  };

  sap.firefly.UxTableColumn.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.table");
    var myself = this;
    var nativeControl = new sap.ui.table.Column(this.getId());
    var template = new sap.m.Label();
    nativeControl.setTemplate(template);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTableColumn.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTableColumn.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTableColumn.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    var label = new sap.m.Label({
      text: title
    });
    this.getNativeControl().setLabel(label);
    return this;
  };

  sap.firefly.UxTableColumn.prototype.getTitle = function () {
    if (this.getNativeControl() && this.getNativeControl().getLabel()) {
      return this.getNativeControl().getLabel().getText();
    }

    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxTableColumn.prototype.setShowSorting = function (showSorting) {
    sap.firefly.UxGeneric.prototype.setShowSorting.call(this, showSorting);
    var nativeControl = this.getNativeControl();

    if (nativeControl) {
      if (showSorting) {
        nativeControl.setSortProperty("column" + this.m_columnIndex + "_text");
      } else {
        nativeControl.setSortProperty("");
      }
    }
  };

  sap.firefly.UxTableColumn.prototype.isShowSorting = function () {
    return sap.firefly.UxGeneric.prototype.isShowSorting.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTableColumn.prototype.setColumnIndex = function (columnIndex) {
    this.m_columnIndex = columnIndex;
    this.getNativeControl().getTemplate().bindProperty("text", "column" + columnIndex + "_text");
    this.getNativeControl().getTemplate().bindProperty("tooltip", "column" + columnIndex + "_tooltip");
    return this;
  };

  sap.firefly.UxTableColumn.prototype.getColumnIndex = function () {
    return this.m_columnIndex;
  };

  sap.firefly.UxTableRow = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTableRow";
    this.m_rowData = {};
  };

  sap.firefly.UxTableRow.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTableRow.prototype.newInstance = function () {
    var object = new sap.firefly.UxTableRow();
    object.setup();
    return object;
  };

  sap.firefly.UxTableRow.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = null;

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTableRow.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTableRow.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTableRow.prototype.addCell = function (cell) {
    sap.firefly.UxGeneric.prototype.addCell.call(this, cell);
    var cellIndex = this.numberOfCells() - 1;
    cell.setCellIndex(cellIndex); // initially prepare the cell, add the text, tooltip etc after adding the cell

    var data = this.getData();

    this._prepareCell(data, cellIndex, cell); // update the table


    this.refreshData();
    return this;
  };

  sap.firefly.UxTableRow.prototype.insertCell = function (cell, index) {
    sap.firefly.UxGeneric.prototype.insertCell.call(this, cell, index);
    var cellIndex = index;
    cell.setCellIndex(cellIndex); // initially prepare the cell, add the text, tooltip etc after adding the cell

    var data = this.getData();

    this._prepareCell(data, cellIndex, cell); // change the other cells indices since everything moved 1 up


    for (var i = index + 1; i < this.getCells().size(); i++) {
      var tmpTableCell = this.getCells().get(i);
      tmpTableCell.setCellIndex(i); // update cell properties after changing the cell index

      this._prepareCell(data, i, tmpTableCell);
    } // update the table


    this.refreshData();
    return this;
  };

  sap.firefly.UxTableRow.prototype.removeCell = function (cell) {
    if (cell) {
      var cellIndex = cell.getCellIndex();

      if (cellIndex != -1) {
        var data = this.getData();

        this._deleteCell(data, cellIndex);

        cell.setCellIndex(-1);
        this.refreshData();
      }
    }

    sap.firefly.UxGeneric.prototype.removeCell.call(this, cell);
    return this;
  };

  sap.firefly.UxTableRow.prototype.clearCells = function () {
    var data = this.getData();

    for (var a = 0; a < this.getCells().size(); a++) {
      this._deleteCell(data, a);

      this.getCells().get(a).setCellIndex(-1);
      this.refreshData();
    }

    sap.firefly.UxGeneric.prototype.clearCells.call(this);
    return this;
  }; // ======================================


  sap.firefly.UxTableRow.prototype.setSelected = function (selected) {
    sap.firefly.UxGeneric.prototype.setSelected.call(this, selected);
    var table = this.getTable();

    if (table) {
      var rowIndexToSelect = this.getRowIndex();

      if (rowIndexToSelect != -1) {
        if (selected === true) {
          table.getNativeControl().addSelectionInterval(rowIndexToSelect, rowIndexToSelect);
        } else {
          table.getNativeControl().removeSelectionInterval(rowIndexToSelect, rowIndexToSelect);
        }
      }
    }

    return this;
  };

  sap.firefly.UxTableRow.prototype.isSelected = function () {
    var table = this.getTable();

    if (table) {
      var rowIndexToCheck = this.getRowIndex();

      if (rowIndexToCheck != -1) {
        return table.getNativeControl().isIndexSelected(rowIndexToCheck);
      }
    }

    return sap.firefly.UxGeneric.prototype.isSelected.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTableRow.prototype.getData = function () {
    return this.m_rowData;
  };

  sap.firefly.UxTableRow.prototype.getRowIndex = function () {
    var table = this.getTable();

    if (table) {
      return table.getIndexOfRow(this);
    }

    return -1;
  };

  sap.firefly.UxTableRow.prototype.rowClicked = function () {
    if (this.getListenerOnClick() !== null) {
      this.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxTableRow.prototype.getTable = function () {
    if (this.getParent()) {
      return this.getParent().getTable();
    }

    return null;
  };

  sap.firefly.UxTableRow.prototype.refreshData = function () {
    if (this.getParent()) {
      this.getParent().refreshData();
    }
  };

  sap.firefly.UxTableRow.prototype._prepareCell = function (rowData, cellIndex, cell) {
    if (cell.getText() != null) {
      rowData["column" + cellIndex + "_text"] = cell.getText();
    }

    if (cell.getTooltip() != null) {
      rowData["column" + cellIndex + "_tooltip"] = cell.getTooltip();
    }
  };

  sap.firefly.UxTableRow.prototype._deleteCell = function (rowData, cellIndex) {
    delete rowData["column" + cellIndex + "_text"];
    delete rowData["column" + cellIndex + "_tooltip"];
  };

  sap.firefly.UxTableCell = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTableCell";
    this.m_cellIndex = -1;
  };

  sap.firefly.UxTableCell.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTableCell.prototype.newInstance = function () {
    var object = new sap.firefly.UxTableCell();
    object.setup();
    return object;
  };

  sap.firefly.UxTableCell.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = null;

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTableCell.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTableCell.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTableCell.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);

    if (this.getParent() != null) {
      var data = this.getParent().getData();
      data["column" + this.m_cellIndex + "_text"] = text;

      this._refreshData();
    }

    return this;
  };

  sap.firefly.UxTableCell.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxTableCell.prototype.setTooltip = function (tooltip) {
    sap.firefly.UxGeneric.prototype.setTooltip.call(this, tooltip);

    if (this.getParent() != null) {
      var data = this.getParent().getData();
      data["column" + this.m_cellIndex + "_tooltip"] = tooltip;

      this._refreshData();
    }

    return this;
  };

  sap.firefly.UxTableCell.prototype.getTooltip = function () {
    return sap.firefly.UxGeneric.prototype.getTooltip.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTableCell.prototype.setCellIndex = function (columnIndex) {
    this.m_cellIndex = columnIndex;
    return this;
  };

  sap.firefly.UxTableCell.prototype.getCellIndex = function () {
    return this.m_cellIndex;
  };

  sap.firefly.UxTableCell.prototype.cellClicked = function () {
    if (this.getListenerOnClick() !== null) {
      this.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxTableCell.prototype.getTable = function () {
    if (this.getParent()) {
      return this.getParent().getTable();
    }

    return null;
  };

  sap.firefly.UxTableCell.prototype._refreshData = function () {
    if (this.getParent()) {
      this.getParent().refreshData();
    }
  };

  sap.firefly.UxResponsiveTable = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxResponsiveTable";
  };

  sap.firefly.UxResponsiveTable.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxResponsiveTable.prototype.newInstance = function () {
    var object = new sap.firefly.UxResponsiveTable();
    object.setup();
    return object;
  };

  sap.firefly.UxResponsiveTable.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Table(this.getId()); //nativeControl.setFixedLayout(false); // automatically adjust column width to fit text

    nativeControl.setSticky([sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar, sap.m.Sticky.InfoToolbar]);
    nativeControl.setContextualWidth("Auto");
    nativeControl.setPopinLayout(sap.m.PopinLayout.GridSmall);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxResponsiveTable.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelectionChange event

    nativeControl.attachSelectionChange(function (oControlEvent) {
      var isSelect = oControlEvent.getParameters().selected;

      if (isSelect === true) {
        if (myself.getListenerOnSelect() !== null) {
          var row = oControlEvent.getParameters().listItem;
          var selectedRow = sap.firefly.UxGeneric.getUxControl(row);
          var theEvent = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, selectedRow);
          myself.getListenerOnSelect().onSelect(theEvent);
        }
      }

      if (myself.getListenerOnSelectionChange() !== null) {
        var isSelect = oControlEvent.getParameters().selected;
        var isSelectAll = oControlEvent.getParameters().selectAll && isSelect;
        var isDeselectAll = isSelectAll === false && oControlEvent.getParameters().listItems.length > 1; // deselctAll is when listItems length is graeter then 1
        // prepare the properties

        var newParameters = sap.firefly.XProperties.create();
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT, isSelect);
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT_ALL, isSelectAll);
        newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_DESELECT_ALL, isDeselectAll);
        myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(myself, newParameters));
      }
    }); //onDelete event

    nativeControl.attachDelete(function (oControlEvent) {
      if (myself.getListenerOnDelete() !== null) {
        var nativeItem = oControlEvent.getParameters().listItem;
        var deletedItem = sap.firefly.UxGeneric.getUxControl(nativeItem);
        myself.getListenerOnDelete().onDelete(sap.firefly.UiItemEvent.createItem(myself, null, deletedItem));
      }
    }); // onScrollLoad event -- using onAfterRender event for that, this is a private method so it might break in the future
    //only work when is inside a scrollable scroll container (e.g sap.m.Page).

    nativeControl.addDelegate({
      onAfterRendering: $.proxy(function () {
        var scroller = sap.m.getScrollDelegate(nativeControl);

        if (scroller) {
          scroller.setGrowingList(myself.throttle(function () {
            if (myself.getListenerOnScrollLoad() !== null) {
              myself.getListenerOnScrollLoad().onScrollLoad(sap.firefly.UiControlEvent.create(myself));
            }
          }, 1000), sap.m.ListGrowingDirection.Downwards);
        }
      }, this.getNativeControl())
    });
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.scrollToIndex = function (index) {
    sap.firefly.UxGeneric.prototype.scrollToIndex.call(this, index);
    this.getNativeControl().scrollToIndex(index);
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.addResponsiveTableColumn = function (column) {
    sap.firefly.UxGeneric.prototype.addResponsiveTableColumn.call(this, column);
    var nativeColumn = column.getNativeControl();

    if (nativeColumn) {
      this._calculateColumResponsiveness();

      this.getNativeControl().addColumn(nativeColumn);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.insertResponsiveTableColumn = function (column, index) {
    sap.firefly.UxGeneric.prototype.insertResponsiveTableColumn.call(this, column, index);
    var nativeColumn = column.getNativeControl();

    if (nativeColumn) {
      this._calculateColumResponsiveness();

      this.getNativeControl().insertColumn(nativeColumn, index);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.removeResponsiveTableColumn = function (column) {
    var nativeColumn = column.getNativeControl();

    if (nativeColumn) {
      this.getNativeControl().removeColumn(nativeColumn);
    }

    sap.firefly.UxGeneric.prototype.removeResponsiveTableColumn.call(this, column);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.clearResponsiveTableColumns = function () {
    sap.firefly.UxGeneric.prototype.clearResponsiveTableColumns.call(this);
    this.getNativeControl().removeAllColumns();
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.addResponsiveTableRow = function (row) {
    sap.firefly.UxGeneric.prototype.addResponsiveTableRow.call(this, row);
    var nativeColumnListItem = row.getNativeControl();

    if (nativeColumnListItem) {
      this.getNativeControl().addItem(nativeColumnListItem);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.insertResponsiveTableRow = function (row, index) {
    sap.firefly.UxGeneric.prototype.insertResponsiveTableRow.call(this, row, index);
    var nativeColumnListItem = row.getNativeControl();

    if (nativeColumnListItem) {
      this.getNativeControl().insertItem(nativeColumnListItem, index);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.removeResponsiveTableRow = function (row) {
    var nativeColumnListItem = row.getNativeControl();

    if (nativeColumnListItem) {
      this.getNativeControl().removeItem(nativeColumnListItem);
    }

    sap.firefly.UxGeneric.prototype.removeResponsiveTableRow.call(this, row);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.clearResponsiveTableRows = function () {
    sap.firefly.UxGeneric.prototype.clearResponsiveTableRows.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.getSelectedItem = function () {
    var selectedItem = this.getNativeControl().getSelectedItem();

    if (selectedItem != null) {
      return sap.firefly.UxGeneric.getUxControl(selectedItem);
    }

    return null;
  };

  sap.firefly.UxResponsiveTable.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeItemToSelect = item.getNativeControl();

      if (nativeItemToSelect) {
        this.getNativeControl().setSelectedItem(nativeItemToSelect, true);
      }
    } else {
      this.clearSelectedItems();
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.getSelectedItems = function () {
    var oList = sap.firefly.XList.create();
    var aSelectedItems = this.getNativeControl().getSelectedItems();

    for (var i = 0; i < aSelectedItems.length; i++) {
      var ffControl = sap.firefly.UxGeneric.getUxControl(aSelectedItems[i]);
      oList.add(ffControl);
    }

    return oList;
  };

  sap.firefly.UxResponsiveTable.prototype.setSelectedItems = function (items) {
    sap.firefly.UxGeneric.prototype.setSelectedItems.call(this, items);
    this.getNativeControl().removeSelections();

    if (items !== null) {
      var size = items.size();

      for (var i = 0; i < size; i++) {
        this.getNativeControl().setSelectedItem(items.get(i).getNativeControl(), true);
      }
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.addSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.addSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().setSelectedItem(item.getNativeControl(), true);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().setSelectedItem(item.getNativeControl(), false);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.clearSelectedItems = function () {
    sap.firefly.UxGeneric.prototype.clearSelectedItems.call(this);
    this.getNativeControl().removeSelections();
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
    ;
  };

  sap.firefly.UxResponsiveTable.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      var nativeHeaderControl = header.getNativeControl();
      this.getNativeControl().destroyHeaderToolbar(); // remove the old header toolbar

      var tmpToolbar = new sap.m.Toolbar(this.getId() + "_headerToolbar");
      tmpToolbar.addContent(nativeHeaderControl);
      this.getNativeControl().setHeaderToolbar(tmpToolbar);
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().destroyHeaderToolbar();
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTable.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxResponsiveTable.prototype.setSelectionMode = function (selectionMode) {
    sap.firefly.UxGeneric.prototype.setSelectionMode.call(this, selectionMode);
    var mode = sap.m.ListMode.SingleSelectMaster;

    if (selectionMode == sap.firefly.UiSelectionMode.NONE) {
      mode = sap.m.ListMode.None;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT) {
      mode = sap.m.ListMode.SingleSelect;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT_LEFT) {
      mode = sap.m.ListMode.SingleSelectLeft;
    } else if (selectionMode == sap.firefly.UiSelectionMode.MULTI_SELECT) {
      mode = sap.m.ListMode.MultiSelect;
    } else if (selectionMode == sap.firefly.UiSelectionMode.DELETE) {
      mode = sap.m.ListMode.Delete;
    }

    this.getNativeControl().setMode(mode);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.getSelectionMode = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionMode.call(this);
  };

  sap.firefly.UxResponsiveTable.prototype.setNoDataText = function (noDataText) {
    sap.firefly.UxGeneric.prototype.setNoDataText.call(this, noDataText);
    this.getNativeControl().setNoDataText(noDataText);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.getNoDataText = function () {
    return sap.firefly.UxGeneric.prototype.getNoDataText.call(this);
  };

  sap.firefly.UxResponsiveTable.prototype.setOverflow = function (overflow) {
    sap.firefly.UxGeneric.prototype.setOverflow.call(this, overflow);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.getOverflow = function () {
    return sap.firefly.UxGeneric.prototype.getOverflow.call(this);
  };

  sap.firefly.UxResponsiveTable.prototype.setAlternateRowColors = function (alternateRowColors) {
    sap.firefly.UxGeneric.prototype.setAlternateRowColors.call(this, alternateRowColors);
    this.getNativeControl().setAlternateRowColors(alternateRowColors);
    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.isAlternateRowColors = function () {
    return sap.firefly.UxGeneric.prototype.isAlternateRowColors.call(this);
  };

  sap.firefly.UxResponsiveTable.prototype.setColumnResize = function (columnResize) {
    sap.firefly.UxGeneric.prototype.setColumnResize.call(this, columnResize); // available since ui5 version 1.91

    if (sap.m.plugins.ColumnResizer) {
      var currentResizer = this.getNativeControl().getDependents().length > 0 ? this.getNativeControl().getDependents()[0] : null;

      if (columnResize && !currentResizer) {
        this.getNativeControl().addDependent(new sap.m.plugins.ColumnResizer());
      } else if (!columnResize && currentResizer) {
        this.getNativeControl().removeDependent(currentResizer);
      }
    } else {
      sap.firefly.ui.Log.logWarning("The currently used sapui5 version does not support sap.m.Table column resize!");
    }

    return this;
  };

  sap.firefly.UxResponsiveTable.prototype.isColumnResize = function () {
    return sap.firefly.UxGeneric.prototype.isColumnResize.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxResponsiveTable.prototype._calculateColumResponsiveness = function () {
    var columnCount = this.numberOfResponsiveTableColumns();

    for (var a = 0; a < columnCount; a++) {
      var tmpColumn = this.getResponsiveTableColumn(a);
      tmpColumn.determineResponsiveness(a);
    }
  };

  sap.firefly.UxResponsiveTableColumn = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxResponsiveTableColumn";
  };

  sap.firefly.UxResponsiveTableColumn.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxResponsiveTableColumn.prototype.newInstance = function () {
    var object = new sap.firefly.UxResponsiveTableColumn();
    object.setup();
    return object;
  };

  sap.firefly.UxResponsiveTableColumn.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Column(this.getId()); //  nativeControl.setMinScreenWidth(sap.m.ScreenSize.Phone);
    //  nativeControl.setDemandPopin(true);

    var header = new sap.m.Label();
    header.setText(this.getId());
    nativeControl.setHeader(header);
    nativeControl.setStyleClass("ff-responsive-table-column"); // be careful!!! different name for the style class method

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxResponsiveTableColumn.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================
  //TODO: for testing use the new way of handle events


  sap.firefly.UxResponsiveTableColumn.prototype.registerOnPress = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnPress.call(this, listener);
    this.getNativeControl().onclick = null;

    if (listener) {
      this.getNativeControl().onclick = this.handlePress.bind(this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTableColumn.prototype.addCssClass = function (cssClass) {
    sap.firefly.DfUiContext.prototype.addCssClass.call(this, cssClass); // skip generic implementation

    var curNativeCssClass = this.getNativeControl().getStyleClass();

    if (!curNativeCssClass.includes(cssClass)) {
      curNativeCssClass = curNativeCssClass + " " + cssClass;
      curNativeCssClass = curNativeCssClass.trim();
      this.getNativeControl().setStyleClass(curNativeCssClass);
    }

    return this;
  };

  sap.firefly.UxResponsiveTableColumn.prototype.removeCssClass = function (cssClass) {
    sap.firefly.DfUiContext.prototype.removeCssClass.call(this, cssClass); // skip generic implementation

    var curNativeCssClass = this.getNativeControl().getStyleClass();

    if (curNativeCssClass.includes(cssClass)) {
      curNativeCssClass = curNativeCssClass.replace(cssClass, "");
      curNativeCssClass = curNativeCssClass.replace("  ", " "); //make sure we have no double or triple spaces

      curNativeCssClass = curNativeCssClass.replace("   ", " ");
      curNativeCssClass = curNativeCssClass.trim();
      this.getNativeControl().setStyleClass(curNativeCssClass);
    }

    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTableColumn.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    var label = this.getNativeControl().getHeader();

    if (label) {
      label.setText(title);
    }

    return this;
  };

  sap.firefly.UxResponsiveTableColumn.prototype.getTitle = function () {
    var label = this.getNativeControl().getHeader();

    if (label) {
      return label.getText();
    }

    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxResponsiveTableColumn.prototype.setSortIndicator = function (sortOrder) {
    sap.firefly.UxGeneric.prototype.setSortIndicator.call(this, sortOrder);
    var nativeSortOrder = sap.ui.core.SortOrder.None;

    if (sortOrder === sap.firefly.UiSortOrder.ASCENDING) {
      nativeSortOrder = sap.ui.core.SortOrder.Ascending;
    } else if (sortOrder === sap.firefly.UiSortOrder.DESCENDING) {
      nativeSortOrder = sap.ui.core.SortOrder.Descending;
    } else if (sortOrder === sap.firefly.UiSortOrder.NONE) {
      nativeSortOrder = sap.ui.core.SortOrder.None;
    }

    this.getNativeControl().setSortIndicator(nativeSortOrder);
    return this;
  };

  sap.firefly.UxResponsiveTableColumn.prototype.getSortIndicator = function () {
    return sap.firefly.UxGeneric.prototype.getSortIndicator.call(this);
  }; // Overrides
  // ======================================
  //different name for the style class method


  sap.firefly.UxResponsiveTableColumn.prototype.setCssClass = function (cssClass) {
    var oldStyleClass = this.getCssClass();
    var curNativeCssClass = this.getNativeControl().getStyleClass();
    sap.firefly.DfUiContext.prototype.setCssClass.call(this, cssClass); // skip generic implementation

    var newNativeCssClassToSet = this.determineNewCssClass(curNativeCssClass, oldStyleClass, cssClass);
    this.getNativeControl().setStyleClass(newNativeCssClassToSet);
    return this;
  }; // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxResponsiveTableColumn.prototype.determineResponsiveness = function (colIndex) {
    // show 1 column on smartphone
    if (colIndex >= 1 && colIndex < 5) {
      this.getNativeControl().setMinScreenWidth(sap.m.ScreenSize.Tablet);
      this.getNativeControl().setDemandPopin(true);
    } // show 5 columns on a tablet


    if (colIndex >= 5) {
      this.getNativeControl().setMinScreenWidth(sap.m.ScreenSize.Desktop);
      this.getNativeControl().setDemandPopin(true);
    }
  }; // Event handlers
  // ======================================


  sap.firefly.UxResponsiveTableColumn.prototype.handlePress = function (oEvent) {
    if (this.getListenerOnPress() !== null) {
      this.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxResponsiveTableRow = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxResponsiveTableRow";
  };

  sap.firefly.UxResponsiveTableRow.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxResponsiveTableRow.prototype.newInstance = function () {
    var object = new sap.firefly.UxResponsiveTableRow();
    object.setup();
    return object;
  };

  sap.firefly.UxResponsiveTableRow.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ColumnListItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxResponsiveTableRow.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxResponsiveTableRow.prototype._addEvents = function (nativeControl) {
    var myself = this; // onClick event

    nativeControl.onclick = function (oControlEvent) {
      if (myself.getListenerOnClick() !== null) {
        myself.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onDblClick event


    nativeControl.ondblclick = function (oControlEvent) {
      if (myself.getListenerOnDoubleClick() !== null) {
        myself.getListenerOnDoubleClick().onDoubleClick(sap.firefly.UiControlEvent.create(myself));
      }
    }; // onPress event


    nativeControl.attachPress(function (oControlEvent) {
      //on press only works when list item type is not inactive
      if (myself.getListenerOnPress() !== null) {
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself));
      }
    }); // onDetailPress event

    nativeControl.attachDetailPress(function (oControlEvent) {
      if (myself.getListenerOnDetailPress() !== null) {
        myself.getListenerOnDetailPress().onDetailPress(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxResponsiveTableRow.prototype.addResponsiveTableCell = function (cell) {
    sap.firefly.UxGeneric.prototype.addResponsiveTableCell.call(this, cell);
    var nativeCell = cell.getNativeControl();

    if (nativeCell) {
      this.getNativeControl().addCell(nativeCell);
    }

    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.insertResponsiveTableCell = function (cell, index) {
    sap.firefly.UxGeneric.prototype.insertResponsiveTableCell.call(this, cell, index);
    var nativeCell = cell.getNativeControl();

    if (nativeCell) {
      this.getNativeControl().insertCell(nativeCell, index);
    }

    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.removeResponsiveTableCell = function (cell) {
    var nativeCell = cell.getNativeControl();

    if (nativeCell) {
      this.getNativeControl().removeCell(nativeCell);
    }

    sap.firefly.UxGeneric.prototype.removeResponsiveTableCell.call(this, cell);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.clearResponsiveTableCells = function () {
    sap.firefly.UxGeneric.prototype.clearResponsiveTableCells.call(this);
    this.getNativeControl().removeAllCells();
    return this;
  }; // ======================================


  sap.firefly.UxResponsiveTableRow.prototype.setEnabled = function (enabled) {
    sap.firefly.DfUiContext.prototype.setEnabled.call(this, enabled); // skip UxGeneric call since the property has a different name

    this.getNativeControl().setBlocked(!enabled);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.isEnabled = function () {
    return !this.getNativeControl().getBlocked();
  };

  sap.firefly.UxResponsiveTableRow.prototype.setSelected = function (selected) {
    sap.firefly.UxGeneric.prototype.setSelected.call(this, selected);
    this.getNativeControl().setSelected(selected);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.isSelected = function () {
    return this.getNativeControl().isSelected();
  };

  sap.firefly.UxResponsiveTableRow.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxResponsiveTableRow.prototype.setHighlight = function (messageType) {
    sap.firefly.UxGeneric.prototype.setHighlight.call(this, messageType);
    var msgType = sap.ui.core.MessageType.None;

    if (messageType == sap.firefly.UiMessageType.NONE) {
      msgType = sap.ui.core.MessageType.None;
    } else if (messageType == sap.firefly.UiMessageType.ERROR) {
      msgType = sap.ui.core.MessageType.Error;
    } else if (messageType == sap.firefly.UiMessageType.INFORMATION) {
      msgType = sap.ui.core.MessageType.Information;
    } else if (messageType == sap.firefly.UiMessageType.SUCCESS) {
      msgType = sap.ui.core.MessageType.Success;
    } else if (messageType == sap.firefly.UiMessageType.WARNING) {
      msgType = sap.ui.core.MessageType.Warning;
    }

    this.getNativeControl().setHighlight(msgType);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.getHighlight = function () {
    return sap.firefly.UxGeneric.prototype.getHighlight.call(this);
  };

  sap.firefly.UxResponsiveTableRow.prototype.setListItemType = function (listItemType) {
    sap.firefly.UxGeneric.prototype.setListItemType.call(this, listItemType);
    var nativeListType = sap.m.ListType.Inactive;

    if (listItemType == sap.firefly.UiListType.ACTIVE) {
      nativeListType = sap.m.ListType.Active;
    } else if (listItemType == sap.firefly.UiListType.DETAIL) {
      nativeListType = sap.m.ListType.Detail;
    } else if (listItemType == sap.firefly.UiListType.DETAIL_AND_ACTIVE) {
      nativeListType = sap.m.ListType.DetailAndActive;
    } else if (listItemType == sap.firefly.UiListType.INACTIVE) {
      nativeListType = sap.m.ListType.Inactive;
    } else if (listItemType == sap.firefly.UiListType.NAVIGATION) {
      nativeListType = sap.m.ListType.Navigation;
    }

    this.getNativeControl().setType(nativeListType);
    return this;
  };

  sap.firefly.UxResponsiveTableRow.prototype.getListItemType = function () {
    return sap.firefly.UxGeneric.prototype.getListItemType.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTreeTable = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTreeTable";
    this.m_rowModel = {};
  };

  sap.firefly.UxTreeTable.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTreeTable.prototype.newInstance = function () {
    var object = new sap.firefly.UxTreeTable();
    object.setup();
    return object;
  };

  sap.firefly.UxTreeTable.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.ui.table");
    var myself = this;
    var nativeControl = new sap.ui.table.TreeTable(this.getId());
    nativeControl.setCollapseRecursive(false); // this is required to presist the selection when collapsing and expanding a node, setting this to true will cause the selection to get lost (true is default value)

    var oModel = new sap.ui.model.json.JSONModel();
    nativeControl.setModel(oModel);
    nativeControl.setVisibleRowCount(10); // 10 is default, when visible row count mode is set to auto then this property has no effect

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTreeTable.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTreeTable.prototype._addEvents = function (nativeControl) {
    var myself = this; // onToggleOpen event

    nativeControl.attachToggleOpenState(function (oControlEvent) {
      var isExpanded = oControlEvent.getParameters().expanded;
      var rowIndex = oControlEvent.getParameters().rowIndex;

      var treeTableRow = myself._getTreeTableRowByRowIndex(rowIndex);

      if (treeTableRow == null) {
        sap.firefly.ui.Log.logError("Something went wrong - could not find table tree item");
        return;
      }

      if (isExpanded) {
        // item event
        treeTableRow.rowExpanded(); // tree control event

        if (myself.getListenerOnExpand() !== null) {
          var uiEventItem = sap.firefly.UiItemEvent.createItem(myself, null, treeTableRow);
          myself.getListenerOnExpand().onExpand(uiEventItem);
        }
      } else {
        // items event
        treeTableRow.rowCollapsed(); // tree control event

        if (myself.getListenerOnCollapse() !== null) {
          var uiEventItem = sap.firefly.UiItemEvent.createItem(myself, null, treeTableRow);
          myself.getListenerOnCollapse().onCollapse(uiEventItem);
        }
      }
    }); // onSelectionChange event

    nativeControl.attachRowSelectionChange(function (oControlEvent) {
      // only fire the event if happen with user interaction, e.g. user selects something, do not fire when selectIndex method is called
      var userInteraction = oControlEvent.getParameters().userInteraction;
      var isSelectAll = oControlEvent.getParameters().selectAll;

      if (userInteraction) {
        if (isSelectAll === false || isSelectAll === undefined) {
          if (myself.getListenerOnSelect() !== null) {
            var rowIndex = oControlEvent.getParameters().rowIndex;

            if (myself.getNativeControl().isIndexSelected(rowIndex)) {
              var treeTableRow = myself._getTreeTableRowByRowIndex(rowIndex);

              myself.getListenerOnSelect().onSelect(sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, treeTableRow));
            }
          }
        }

        if (myself.getListenerOnSelectionChange() !== null) {
          var isSelectAll = oControlEvent.getParameters().selectAll || false;
          var isDeselectAll = isSelectAll === false && oControlEvent.getParameters().rowIndex === -1; // deselctAll is when rowIndex is -1

          var isSelect = isSelectAll;

          if (isSelectAll === false && isDeselectAll === false) {
            // if not select all and not deselct all then check if the specified rowIndex is selected
            isSelect = myself.getNativeControl().isIndexSelected(rowIndex);
          } // prepare the properties


          var newParameters = sap.firefly.XProperties.create();
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT_ALL, isSelectAll);
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_DESELECT_ALL, isDeselectAll);
          newParameters.putBoolean(sap.firefly.UiSelectionEvent.PARAM_SELECT, isSelect);
          myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(myself, newParameters));
        }
      }
    }); // onClick event

    nativeControl.attachCellClick(function (oControlEvent) {
      var rowIndex = oControlEvent.getParameters().rowIndex;
      var columnIndex = oControlEvent.getParameters().columnIndex; // row clicked

      var treeTableRow = myself._getTreeTableRowByRowIndex(rowIndex);

      if (treeTableRow) {
        treeTableRow.rowClicked(); // cell clicked

        var tableRowCell = treeTableRow.getCell(columnIndex);

        if (tableRowCell) {
          tableRowCell.cellClicked();
        }
      }
    }); // onScroll event

    nativeControl.attachFirstVisibleRowChanged(function (oControlEvent) {
      if (myself.getListenerOnScroll() !== null) {
        var firstVisibleRowIndex = oControlEvent.getParameters().firstVisibleRow;

        var firstVisbibleTreeTableRow = myself._getTreeTableRowByRowIndex(firstVisibleRowIndex); // prepare the properties


        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_FIRST_VISIBLE_ROW_NAME, firstVisbibleTreeTableRow.getName());
        myself.getListenerOnScroll().onScroll(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.addColumn = function (column) {
    sap.firefly.UxGeneric.prototype.addColumn.call(this, column);
    var columnIndex = this.numberOfColumns() - 1;
    column.setColumnIndex(columnIndex);
    var nativeColumn = column.getNativeControl();
    this.getNativeControl().addColumn(nativeColumn);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.insertColumn = function (column, index) {
    sap.firefly.UxGeneric.prototype.insertColumn.call(this, column, index);
    var columnIndex = index;
    column.setColumnIndex(columnIndex); // adjust the indices of other columns

    for (var i = index + 1; i < this.getColumns().size(); i++) {
      var tmpTableColumn = this.getColumns().get(i);
      tmpTableColumn.setColumnIndex(i);
    }

    var nativeColumn = column.getNativeControl();
    this.getNativeControl().insertColumn(nativeColumn, index);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.removeColumn = function (column) {
    var nativeColumn = column.getNativeControl();
    this.getNativeControl().removeColumn(nativeColumn);
    sap.firefly.UxGeneric.prototype.removeColumn.call(this, column);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.clearColumns = function () {
    sap.firefly.UxGeneric.prototype.clearColumns.call(this);
    this.getNativeControl().removeAllColumns();
    return this;
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.addTreeTableRow = function (treeTableRow) {
    sap.firefly.UxGeneric.prototype.addTreeTableRow.call(this, treeTableRow);
    var rowIndex = this.numberOfTreeTableRows() - 1;
    treeTableRow.setRowIndex(rowIndex);
    var data = treeTableRow.getData();
    this.m_rowModel[treeTableRow.getId()] = data;
    this.refreshData();
    return this;
  };

  sap.firefly.UxTreeTable.prototype.insertTreeTableRow = function (treeTableRow, index) {
    sap.firefly.UxGeneric.prototype.insertTreeTableRow.call(this, treeTableRow, index); //at insert i need to regenerate the row model

    this.m_rowModel = {};

    for (var i = 0; i < this.getTreeTableRows().size(); i++) {
      var tmpTableRow = this.getTreeTableRows().get(i);
      tmpTableRow.setRowIndex(i);
      var tmpData = tmpTableRow.getData();
      this.m_rowModel[tmpTableRow.getId()] = tmpData;
    }

    this.refreshData();
    return this;
  };

  sap.firefly.UxTreeTable.prototype.removeTreeTableRow = function (treeTableRow) {
    if (treeTableRow != null) {
      delete this.m_rowModel[treeTableRow.getId()];
      treeTableRow.setRowIndex(-1);
      this.refreshData();
    }

    sap.firefly.UxGeneric.prototype.removeTreeTableRow.call(this, treeTableRow);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.clearTreeTableRows = function () {
    sap.firefly.UxGeneric.prototype.clearTreeTableRows.call(this);
    this.m_rowModel = {};
    this.refreshData();
    return this;
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.getFooter = function () {
    return sap.firefly.UxGeneric.prototype.getFooter.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setFooter = function (footer) {
    sap.firefly.UxGeneric.prototype.setFooter.call(this, footer);
    var nativeFooterControl = footer.getNativeControl();
    this.getNativeControl().setFooter(nativeFooterControl);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.clearFooter = function () {
    sap.firefly.UxGeneric.prototype.clearFooter.call(this);
    this.getNativeControl().destroyFooter();
    return this;
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.getSelectedItem = function () {
    var nativeSelectedIndices = this.getNativeControl().getSelectedIndices();

    if (nativeSelectedIndices && nativeSelectedIndices.length > 0) {
      return this._getTreeTableRowByRowIndex(nativeSelectedIndices[0]);
    }

    return null;
  };

  sap.firefly.UxTreeTable.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeRowIndexToSelect = this.getRowIndexByTreeTableRow(item);

      if (nativeRowIndexToSelect != -1) {
        this.getNativeControl().setSelectedIndex(nativeRowIndexToSelect);
      }
    } else {
      this.getNativeControl().clearSelection();
    }
  };

  sap.firefly.UxTreeTable.prototype.getSelectedItems = function () {
    var selectedItems = sap.firefly.XList.create();
    var nativeSelectedRowIndices = this.getNativeControl().getSelectedIndices();

    for (var i = 0; i < nativeSelectedRowIndices.length; i++) {
      var tmpTableTreeItem = this._getTreeTableRowByRowIndex(nativeSelectedRowIndices[i]);

      selectedItems.add(tmpTableTreeItem);
    }

    return selectedItems;
  };

  sap.firefly.UxTreeTable.prototype.setSelectedItems = function (items) {
    sap.firefly.UxGeneric.prototype.setSelectedItems.call(this, items);

    if (items !== null) {
      this.getNativeControl().clearSelection();
      var size = items.size();

      for (var i = 0; i < size; i++) {
        var rowIndexToSelect = this.getRowIndexByTreeTableRow(items.get(i));

        if (rowIndexToSelect != -1) {
          this.getNativeControl().addSelectionInterval(rowIndexToSelect, rowIndexToSelect);
        }
      }
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.addSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.addSelectedItem.call(this, item);

    if (item != null) {
      var rowIndexToSelect = this.getRowIndexByTreeTableRow(item);

      if (rowIndexToSelect != -1) {
        this.getNativeControl().addSelectionInterval(rowIndexToSelect, rowIndexToSelect);
      }
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.removeSelectedItem.call(this, item);

    if (item != null) {
      var rowIndexToDeselect = this.getRowIndexByTreeTableRow(item);

      if (rowIndexToDeselect != -1) {
        this.getNativeControl().removeSelectionInterval(rowIndexToDeselect, rowIndexToDeselect);
      }
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.clearSelectedItems = function () {
    sap.firefly.UxGeneric.prototype.clearSelectedItems.call(this);
    this.getNativeControl().clearSelection();
    return this;
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.expandToLevel = function (level) {
    sap.firefly.UxGeneric.prototype.expandToLevel.call(this, level);

    if (this.hasTreeTableRows()) {
      this.getNativeControl().expandToLevel(level);
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.collapseAll = function () {
    sap.firefly.UxGeneric.prototype.collapseAll.call(this);

    if (this.hasTreeTableRows()) {
      this.getNativeControl().collapseAll();
    }

    return this;
  }; // ======================================


  sap.firefly.UxTreeTable.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getTitle = function () {
    if (this.getNativeControl() && this.getNativeControl().getTitle()) {
      return this.getNativeControl().getTitle().getText();
    }

    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setSelectionMode = function (selectionMode) {
    sap.firefly.UxGeneric.prototype.setSelectionMode.call(this, selectionMode);
    var mode = sap.ui.table.SelectionMode.Single;

    if (selectionMode == sap.firefly.UiSelectionMode.NONE) {
      mode = sap.ui.table.SelectionMode.None;
    } else if (selectionMode == sap.firefly.UiSelectionMode.SINGLE_SELECT) {
      mode = sap.ui.table.SelectionMode.Single;
    } else if (selectionMode == sap.firefly.UiSelectionMode.MULTI_SELECT) {
      mode = sap.ui.table.SelectionMode.MultiToggle;
    }

    this.getNativeControl().setSelectionMode(mode);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getSelectionMode = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionMode.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setSelectionBehavior = function (selectionBehaviour) {
    sap.firefly.UxGeneric.prototype.setSelectionBehavior.call(this, selectionBehaviour);
    var behavior = sap.ui.table.SelectionBehavior.RowSelector;

    if (selectionBehaviour == sap.firefly.UiSelectionBehavior.ROW) {
      behavior = sap.ui.table.SelectionBehavior.Row;
    } else if (selectionBehaviour == sap.firefly.UiSelectionBehavior.ROW_ONLY) {
      behavior = sap.ui.table.SelectionBehavior.RowOnly;
    } else if (selectionBehaviour == sap.firefly.UiSelectionBehavior.ROW_SELECTOR) {
      behavior = sap.ui.table.SelectionBehavior.RowSelector;
    }

    this.getNativeControl().setSelectionBehavior(behavior);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getSelectionBehavior = function () {
    return sap.firefly.UxGeneric.prototype.getSelectionBehavior.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);

    if (this.hasTreeTableRows()) {
      if (expanded === true) {
        this.getNativeControl().expandToLevel(999);
      } else {
        this.getNativeControl().collapseAll();
      }
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.isExpanded = function () {
    return sap.firefly.UxGeneric.prototype.isExpanded.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setVisibleRowCount = function (visibleRowCount) {
    sap.firefly.UxGeneric.prototype.setVisibleRowCount.call(this, visibleRowCount);
    this.getNativeControl().setVisibleRowCount(visibleRowCount);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getVisibleRowCount = function () {
    return this.getNativeControl().getVisibleRowCount();
  };

  sap.firefly.UxTreeTable.prototype.setVisibleRowCountMode = function (visibleRowCountMode) {
    sap.firefly.UxGeneric.prototype.setVisibleRowCountMode.call(this, visibleRowCountMode);
    var mode = sap.ui.table.VisibleRowCountMode.Fixed;

    if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.AUTO) {
      mode = sap.ui.table.VisibleRowCountMode.Auto;
    } else if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.FIXED) {
      mode = sap.ui.table.VisibleRowCountMode.Fixed;
    } else if (visibleRowCountMode == sap.firefly.UiVisibleRowCountMode.INTERACTIVE) {
      mode = sap.ui.table.VisibleRowCountMode.Interactive;
    }

    this.getNativeControl().setVisibleRowCountMode(mode);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getVisibleRowCountMode = function () {
    return sap.firefly.UxGeneric.prototype.getVisibleRowCountMode.call(this);
  };

  sap.firefly.UxTreeTable.prototype.setMinRowCount = function (minRowCount) {
    sap.firefly.UxGeneric.prototype.setMinRowCount.call(this, minRowCount);
    this.getNativeControl().setMinAutoRowCount(minRowCount);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.getMinRowCount = function () {
    return this.getNativeControl().getMinAutoRowCount();
  };

  sap.firefly.UxTreeTable.prototype.setShowSelectAll = function (showSelectAll) {
    sap.firefly.DfUiContext.prototype.setShowSelectAll.call(this, showSelectAll); // skip superclass implementation, different prop name

    this.getNativeControl().setEnableSelectAll(showSelectAll);
    return this;
  };

  sap.firefly.UxTreeTable.prototype.isShowSelectAll = function () {
    return this.getNativeControl().getEnableSelectAll();
  };

  sap.firefly.UxTreeTable.prototype.setFirstVisibleRow = function (firstVisibleRow) {
    sap.firefly.UxGeneric.prototype.setFirstVisibleRow.call(this, firstVisibleRow);

    if (firstVisibleRow) {
      var rowIndex = this.getRowIndexByTreeTableRow(firstVisibleRow);
      this.getNativeControl().setFirstVisibleRow(rowIndex);
    }

    return this;
  };

  sap.firefly.UxTreeTable.prototype.getFirstVisibleRow = function () {
    var firstVisibleRowIndex = this.getNativeControl().getFirstVisibleRow();

    var firstVisibleTreeTableRow = this._getTreeTableRowByRowIndex(firstVisibleRowIndex);

    return firstVisibleTreeTableRow;
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxTreeTable.prototype.applyHeightCss = function (element, heightCss) {
    sap.firefly.UxGeneric.prototype.applyHeightCss.call(this, element, heightCss); // special css needed when setting a height in pixel on the tree table

    if (heightCss && heightCss.includes("px")) {
      // have to differentiate between when title is set and not since ths size changes then (48px more with title)
      $(element).find(".sapUiTableCnt").css("overflow-y", "auto");

      if (this.getTitle() != null && this.getTitle().length > 0) {
        $(element).find(".sapUiTableCnt").css("height", "calc(100% - 48px)");
      } else {
        $(element).find(".sapUiTableCnt").css("height", "100%");
      }
    }
  }; // Helpers
  // ======================================


  sap.firefly.UxTreeTable.prototype.getTable = function () {
    return this;
  };

  sap.firefly.UxTreeTable.prototype._getTreeTableRowById = function (itemId) {
    var children = this.getTreeTableRows();

    if (children != null) {
      for (var i = 0; i < children.size(); i++) {
        var tmpChild = children.get(i);

        if (tmpChild.getId() == itemId) {
          return tmpChild;
        }
      }
    }

    return null;
  };

  sap.firefly.UxTreeTable.prototype._getTreeTableRowByRowIndex = function (rowIndex) {
    var rowContext = this.getNativeControl().getContextByIndex(rowIndex);

    if (rowContext) {
      var bindingPath = rowContext.getPath();
      var itemId = bindingPath.substring(bindingPath.lastIndexOf("/") + 1);

      var treeTableRow = this._getTreeTableRowById(itemId);

      return treeTableRow;
    }

    return null;
  };

  sap.firefly.UxTreeTable.prototype.getRowIndexByTreeTableRow = function (treeTableRow) {
    var index = 0;
    var rowContext = null;

    do {
      rowContext = this.getNativeControl().getContextByIndex(index);

      if (rowContext) {
        var bindingPath = rowContext.getPath();
        var itemId = bindingPath.substring(bindingPath.lastIndexOf("/") + 1);

        if (itemId === treeTableRow.getId()) {
          return index;
        }
      }

      index++;
    } while (rowContext != null);

    return -1;
  };

  sap.firefly.UxTreeTable.prototype.expandNativeRow = function (treeTableRow) {
    var rowIndexToExpand = this.getRowIndexByTreeTableRow(treeTableRow);

    if (rowIndexToExpand != -1) {
      this.getNativeControl().expand(rowIndexToExpand);
    } else {
      this._tryToExpandPath(treeTableRow);
    }
  };

  sap.firefly.UxTreeTable.prototype.collapseNativeRow = function (treeTableRow) {
    var rowIndexToCollapse = this.getRowIndexByTreeTableRow(treeTableRow);

    if (rowIndexToCollapse != -1) {
      this.getNativeControl().collapse(rowIndexToCollapse);
    }
  };

  sap.firefly.UxTreeTable.prototype._tryToExpandPath = function (treeTableRow) {
    if (treeTableRow) {
      var tmpRowParent = treeTableRow.getParent();
      var rowsArray = [treeTableRow];

      while (tmpRowParent && tmpRowParent.isExpanded() === false && tmpRowParent != this) {
        rowsArray = tmpRowParent.concat(rowsArray);
        tmpRowParent = tmpRowParent.getParent();
      }

      if (rowsArray) {
        for (var a = 0; a < rowsArray.length; a++) {
          var tmpItem = rowsArray[a];

          if (tmpItem) {
            var rowIndexToExpand = this.getRowIndexByTreeTableRow(tmpItem);

            if (rowIndexToExpand != -1) {
              this.getNativeControl().expand(rowIndexToExpand);
            }
          }
        }
      }
    }
  };

  sap.firefly.UxTreeTable.prototype.refreshData = function () {
    if (this.getNativeControl().getModel().getJSON() == null || this.getNativeControl().getModel().getJSON().length <= 2) {
      this.getNativeControl().getModel().setData({
        modelData: this.m_rowModel
      });
      this.getNativeControl().bindRows("/modelData");
    } else {
      this.getNativeControl().getModel().setData({
        modelData: this.m_rowModel
      });
      this.getNativeControl().updateRows(sap.ui.model.ChangeReason.Refresh, ""); // second param can be empty? At least cannot be null! No public API for that!
    }
  };

  sap.firefly.UxTreeTableRow = function () {
    sap.firefly.UxTableRow.call(this);
    this._ff_c = "UxTreeTableRow";
  };

  sap.firefly.UxTreeTableRow.prototype = new sap.firefly.UxTableRow();

  sap.firefly.UxTreeTableRow.prototype.newInstance = function () {
    var object = new sap.firefly.UxTreeTableRow();
    object.setup();
    return object;
  };

  sap.firefly.UxTreeTableRow.prototype.initializeNative = function () {
    sap.firefly.UxTableRow.prototype.initializeNative.call(this); // use TableRow
  };

  sap.firefly.UxTreeTableRow.prototype.releaseObject = function () {
    sap.firefly.UxTableRow.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTreeTableRow.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTreeTableRow.prototype.addTreeTableRow = function (treeTableRow) {
    sap.firefly.UxTableRow.prototype.addTreeTableRow.call(this, treeTableRow);
    var rowIndex = this.numberOfTreeTableRows() - 1;
    treeTableRow.setRowIndex(rowIndex);
    var data = treeTableRow.getData();
    var mydData = this.getData();
    mydData[treeTableRow.getId()] = data;
    this.refreshData();
    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.insertTreeTableRow = function (treeTableRow, index) {
    sap.firefly.UxTableRow.prototype.insertTreeTableRow.call(this, treeTableRow, index);

    this._clearTreeTableData();

    var mydData = this.getData();

    for (var i = 0; i < this.getTreeTableRows().size(); i++) {
      var tmpTableRow = this.getTreeTableRows().get(i);
      tmpTableRow.setRowIndex(i);
      var tmpData = tmpTableRow.getData();
      mydData[tmpTableRow.getId()] = tmpData;
    }

    this.refreshData();
    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.removeTreeTableRow = function (treeTableRow) {
    if (treeTableRow != null) {
      var mydData = this.getData();
      delete mydData[treeTableRow.getId()];
      treeTableRow.setRowIndex(-1);
      this.refreshData();
    }

    sap.firefly.UxTableRow.prototype.removeTreeTableRow.call(this, treeTableRow);
    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.clearTreeTableRows = function () {
    sap.firefly.UxTableRow.prototype.clearTreeTableRows.call(this);

    this._clearTreeTableData();

    this.refreshData();
    return this;
  }; // ======================================


  sap.firefly.UxTreeTableRow.prototype.addCell = function (cell) {
    sap.firefly.UxTableRow.prototype.addCell.call(this, cell); // use TableRow

    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.insertCell = function (cell, index) {
    sap.firefly.UxTableRow.prototype.insertCell.call(this, cell, index); // use TableRow

    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.removeCell = function (cell) {
    sap.firefly.UxTableRow.prototype.removeCell.call(this, cell); // use TableRow

    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.clearCells = function () {
    sap.firefly.UxTableRow.prototype.clearCells.call(this); // use TableRow

    return this;
  }; // ====================================


  sap.firefly.UxTreeTableRow.prototype.setExpanded = function (expanded) {
    sap.firefly.UxTableRow.prototype.setExpanded.call(this, expanded);

    if (expanded === true) {
      this.expandNativeRow(this);
    } else {
      this.collapseNativeRow(this);
    }

    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.isExpanded = function () {
    var treeTable = this.getTable();

    if (treeTable && treeTable.getNativeControl()) {
      var rowIndexToCheck = treeTable.getRowIndexByTreeTableRow(this);

      if (rowIndexToCheck != -1) {
        return treeTable.getNativeControl().isExpanded(rowIndexToCheck);
      } else {
        return false;
      }
    }

    return sap.firefly.UxTableRow.prototype.isExpanded.call(this);
  };

  sap.firefly.UxTreeTableRow.prototype.setSelected = function (selected) {
    sap.firefly.UxTableRow.prototype.setSelected.call(this, selected); // use TableRow

    return this;
  };

  sap.firefly.UxTreeTableRow.prototype.isSelected = function () {
    return sap.firefly.UxTableRow.prototype.isSelected.call(this); // use TableRow
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTreeTableRow.prototype.getRowIndex = function () {
    var treeTable = this.getTable();

    if (treeTable && treeTable.getNativeControl()) {
      var index = 0;
      var rowContext = null;

      do {
        rowContext = treeTable.getNativeControl().getContextByIndex(index);

        if (rowContext) {
          var bindingPath = rowContext.getPath();
          var itemId = bindingPath.substring(bindingPath.lastIndexOf("/") + 1);

          if (itemId === this.getId()) {
            return index;
          }
        }

        index++;
      } while (rowContext != null);
    }

    return -1;
  };

  sap.firefly.UxTreeTableRow.prototype._clearTreeTableData = function () {
    for (var propKey in this.getData()) {
      // column properties are cells so do not delete them, we only want to remove the children (tree table rows)
      //the string column is defined in the TableCell class
      if (this.getData().hasOwnProperty(propKey) && propKey.indexOf("column") === -1) {
        delete this.getData()[propKey];
      }
    }
  };

  sap.firefly.UxTreeTableRow.prototype.expandNativeRow = function (treeTableRow) {
    if (this.getParent()) {
      this.getParent().expandNativeRow(treeTableRow);
    }
  };

  sap.firefly.UxTreeTableRow.prototype.collapseNativeRow = function (treeTableRow) {
    if (this.getParent()) {
      this.getParent().collapseNativeRow(treeTableRow);
    }
  };

  sap.firefly.UxTreeTableRow.prototype.rowClicked = function () {
    if (this.getListenerOnClick() !== null) {
      this.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxTreeTableRow.prototype.rowExpanded = function () {
    if (this.getListenerOnExpand() !== null) {
      var newEvent = sap.firefly.UiItemEvent.createItem(this, null, this);
      this.getListenerOnExpand().onExpand(newEvent);
    }
  };

  sap.firefly.UxTreeTableRow.prototype.rowCollapsed = function () {
    if (this.getListenerOnCollapse() !== null) {
      var newEvent = sap.firefly.UiItemEvent.createItem(this, null, this);
      this.getListenerOnCollapse().onCollapse(newEvent);
    }
  };

  sap.firefly.UxDropDown = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxDropDown";
  };

  sap.firefly.UxDropDown.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxDropDown.prototype.newInstance = function () {
    var object = new sap.firefly.UxDropDown();
    object.setup();
    return object;
  };

  sap.firefly.UxDropDown.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ActionSelect(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxDropDown.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxDropDown.prototype.registerOnSelect = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnSelect.call(this, listener);
    this.getNativeControl().detachChange(this.handleSelect, this);

    if (listener) {
      this.getNativeControl().attachChange(this.handleSelect, this);
    }

    return this;
  };

  sap.firefly.UxDropDown.prototype.registerOnLiveChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnLiveChange.call(this, listener);

    if (this.getNativeControl().attachLiveChange) {
      // since ui5 version 1.100
      this.getNativeControl().detachLiveChange(this.handleLiveChange, this);

      if (listener) {
        this.getNativeControl().attachLiveChange(this.handleLiveChange, this);
      }
    }

    return this;
  }; // ======================================


  sap.firefly.UxDropDown.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxDropDown.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxDropDown.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxDropDown.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ActionSelect specific
  // ======================================


  sap.firefly.UxDropDown.prototype.addButton = function (button) {
    sap.firefly.UxGeneric.prototype.addButton.call(this, button);
    var nativeButton = button.getNativeControl();
    this.getNativeControl().addButton(nativeButton);
    return this;
  };

  sap.firefly.UxDropDown.prototype.insertButton = function (button, index) {
    sap.firefly.UxGeneric.prototype.insertButton.call(this, button, index);
    var nativeButton = button.getNativeControl(); // No insertButton method available on native control so just use addButton instead

    this.getNativeControl().addButton(button);
    return this;
  };

  sap.firefly.UxDropDown.prototype.removeButton = function (button) {
    var nativeButton = button.getNativeControl();
    this.getNativeControl().removeButton(nativeButton);
    sap.firefly.UxGeneric.prototype.removeButton.call(this, button);
    return this;
  };

  sap.firefly.UxDropDown.prototype.clearButtons = function () {
    sap.firefly.UxGeneric.prototype.clearButtons.call(this);
    this.getNativeControl().removeAllButtons();
    return this;
  }; // ======================================


  sap.firefly.UxDropDown.prototype.setSelectedItem = function (selectedItem) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, selectedItem);

    if (selectedItem !== null && selectedItem !== undefined) {
      var value = selectedItem.getId();
      this.getNativeControl().setSelectedItemId(value);
    } else {
      this.getNativeControl().setSelectedItem(null); // remove selection from dropdown
    }

    return this;
  };

  sap.firefly.UxDropDown.prototype.getSelectedItem = function () {
    var selectedItemId = this.getNativeControl().getSelectedItemId();
    var selectedItem = this.getItemById(selectedItemId);

    if (selectedItem != null) {
      return selectedItem;
    }

    return null;
  }; // ======================================


  sap.firefly.UxDropDown.prototype.open = function () {
    sap.firefly.UxGeneric.prototype.open.call(this);
    this.getNativeControl().open();
    return this;
  };

  sap.firefly.UxDropDown.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxDropDown.prototype.isOpen = function () {
    return this.getNativeControl().isOpen();
  }; // ======================================


  sap.firefly.UxDropDown.prototype.setRequired = function (required) {
    sap.firefly.UxGeneric.prototype.setRequired.call(this, required);
    return this;
  };

  sap.firefly.UxDropDown.prototype.isRequired = function () {
    return sap.firefly.UxGeneric.prototype.isRequired.call(this);
  };

  sap.firefly.UxDropDown.prototype.setValueState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setValueState.call(this, valueState);
    var newValueState = sap.ui.core.ValueState.None;

    if (valueState === sap.firefly.UiValueState.NONE) {
      newValueState = sap.ui.core.ValueState.None;
    } else if (valueState === sap.firefly.UiValueState.ERROR) {
      newValueState = sap.ui.core.ValueState.Error;
    } else if (valueState === sap.firefly.UiValueState.INFORMATION) {
      newValueState = sap.ui.core.ValueState.Information;
    } else if (valueState === sap.firefly.UiValueState.SUCCESS) {
      newValueState = sap.ui.core.ValueState.Success;
    } else if (valueState === sap.firefly.UiValueState.WARNING) {
      newValueState = sap.ui.core.ValueState.Warning;
    }

    this.getNativeControl().setValueState(newValueState);
    return this;
  };

  sap.firefly.UxDropDown.prototype.getValueState = function () {
    return sap.firefly.UxGeneric.prototype.getValueState.call(this);
  };

  sap.firefly.UxDropDown.prototype.setValueStateText = function (valueStateText) {
    sap.firefly.UxGeneric.prototype.setValueStateText.call(this, valueStateText);
    this.getNativeControl().setValueStateText(valueStateText);
    return this;
  };

  sap.firefly.UxDropDown.prototype.getValueStateText = function () {
    return this.getNativeControl().getValueStateText();
  };

  sap.firefly.UxDropDown.prototype.setEditable = function (editable) {
    sap.firefly.UxGeneric.prototype.setEditable.call(this, editable);
    this.getNativeControl().setEditable(editable);
    return this;
  };

  sap.firefly.UxDropDown.prototype.isEditable = function () {
    return sap.firefly.UxGeneric.prototype.isEditable.call(this);
  };

  sap.firefly.UxDropDown.prototype.setShowSecondaryValues = function (showSecondaryValues) {
    sap.firefly.UxGeneric.prototype.setShowSecondaryValues.call(this, showSecondaryValues);
    this.getNativeControl().setShowSecondaryValues(showSecondaryValues);
    return this;
  };

  sap.firefly.UxDropDown.prototype.isShowSecondaryValues = function () {
    return this.getNativeControl().getShowSecondaryValues();
  }; // Overrides
  // ======================================


  sap.firefly.UxDropDown.prototype.setHeight = function (height) {
    // remove height from the object
    // don't change the Dropdown height on JavaScript, it should only be done on iOS
    sap.firefly.UxGeneric.prototype.setHeight.call(this, null);
    return this;
  }; // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxDropDown.prototype.handleSelect = function (oControlEvent) {
    if (this.getListenerOnSelect() !== null) {
      var nativeSelectedItem = oControlEvent.getParameters().selectedItem;
      var ffSelectedItem = sap.firefly.UxGeneric.getUxControl(nativeSelectedItem);
      var ffEvent = sap.firefly.UiSelectionEvent.createSingleSelection(this, null, ffSelectedItem);
      this.getListenerOnSelect().onSelect(ffEvent);
    }
  };

  sap.firefly.UxDropDown.prototype.handleLiveChange = function (oControlEvent) {
    if (this.getListenerOnLiveChange() !== null) {
      this.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(this, null));
    }
  };

  sap.firefly.UxDropDownItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxDropDownItem";
  };

  sap.firefly.UxDropDownItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxDropDownItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxDropDownItem();
    object.setup();
    return object;
  };

  sap.firefly.UxDropDownItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.ui.core.ListItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxDropDownItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxDropDownItem.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxDropDownItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxDropDownItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxDropDownItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxDropDownItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxDropDownItem.prototype.setAdditionalText = function (additionalText) {
    sap.firefly.UxGeneric.prototype.setAdditionalText.call(this, additionalText);
    this.getNativeControl().setAdditionalText(additionalText);
    return this;
  };

  sap.firefly.UxDropDownItem.prototype.getAdditionalText = function () {
    return sap.firefly.UxGeneric.prototype.getAdditionalText.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxComboBox = function () {
    sap.firefly.UxComboBoxBase.call(this);
    this._ff_c = "UxComboBox";
  };

  sap.firefly.UxComboBox.prototype = new sap.firefly.UxComboBoxBase();

  sap.firefly.UxComboBox.prototype.newInstance = function () {
    var object = new sap.firefly.UxComboBox();
    object.setup();
    return object;
  };

  sap.firefly.UxComboBox.prototype.initializeNative = function () {
    sap.firefly.UxComboBoxBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ComboBox(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxComboBox.prototype.releaseObject = function () {
    sap.firefly.UxComboBoxBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxComboBox.prototype.registerOnChange = function (listener) {
    sap.firefly.UxComboBoxBase.prototype.registerOnChange.call(this, listener);
    this.getNativeControl().detachChange(this.handleChange, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachChange(this.handleChange, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxComboBox.prototype.setSelectedItem = function (selectedItem) {
    sap.firefly.UxComboBoxBase.prototype.setSelectedItem.call(this, selectedItem);

    if (selectedItem !== null && selectedItem !== undefined) {
      var value = selectedItem.getId();
      this.getNativeControl().setSelectedItemId(value);
    }

    return this;
  };

  sap.firefly.UxComboBox.prototype.getSelectedItem = function () {
    var selectedItemId = this.getNativeControl().getSelectedItemId();
    var selectedItem = this.getItemById(selectedItemId);

    if (selectedItem != null) {
      return selectedItem;
    }

    return null;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxComboBox.prototype.handleSelectionChange = function (oEvent) {
    if (this.getListenerOnSelectionChange() !== null) {
      var nativeNode = oEvent.getParameters().selectedItem;
      var selectedItem = sap.firefly.UxGeneric.getUxControl(nativeNode);
      this.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createSingleSelection(this, null, selectedItem));
    }
  };

  sap.firefly.UxComboBox.prototype.handleChange = function (oEvent) {
    if (this.getListenerOnChange() !== null) {
      var parameters = oEvent.getParameters();
      var newParameters = sap.firefly.XProperties.create();

      if (!!parameters) {
        newParameters.putString(sap.firefly.UiEventParams.PARAM_VALUE, parameters.value);
        newParameters.putBoolean(sap.firefly.UiEventParams.PARAM_ITEM_PRESSED, parameters.itemPressed);
      }

      this.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  };

  sap.firefly.UxMultiComboBox = function () {
    sap.firefly.UxComboBoxBase.call(this);
    this._ff_c = "UxMultiComboBox";
  };

  sap.firefly.UxMultiComboBox.prototype = new sap.firefly.UxComboBoxBase();

  sap.firefly.UxMultiComboBox.prototype.newInstance = function () {
    var object = new sap.firefly.UxMultiComboBox();
    object.setup();
    return object;
  };

  sap.firefly.UxMultiComboBox.prototype.initializeNative = function () {
    sap.firefly.UxComboBoxBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.MultiComboBox(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxMultiComboBox.prototype.releaseObject = function () {
    sap.firefly.UxComboBoxBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxMultiComboBox.prototype.registerOnSelectionFinish = function (listener) {
    sap.firefly.UxComboBoxBase.prototype.registerOnSelectionFinish.call(this, listener);
    this.getNativeControl().detachSelectionFinish(this.handleSelectionFinish, this); // first deregister any previous listeners

    if (listener) {
      this.getNativeControl().attachSelectionFinish(this.handleSelectionFinish, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxMultiComboBox.prototype.setSelectedItem = function (item) {
    sap.firefly.UxComboBoxBase.prototype.setSelectedItem.call(this, item);

    if (item !== null && item !== undefined) {
      this.getNativeControl().setSelectedItems([item.getNativeControl()]);
    }

    return this;
  };

  sap.firefly.UxMultiComboBox.prototype.getSelectedItem = function () {
    var aSelectedItems = this.getNativeControl().getSelectedItems();

    if (aSelectedItems != null && aSelectedItems.length > 0) {
      return aSelectedItems[0];
    }

    return null;
  };

  sap.firefly.UxMultiComboBox.prototype.setSelectedItems = function (items) {
    sap.firefly.UxComboBoxBase.prototype.setSelectedItems.call(this, items);
    this.getNativeControl().clearSelection();

    if (items !== null) {
      var size = items.size();
      var itemList = [];

      for (var i = 0; i < size; i++) {
        itemList.push(items.get(i).getNativeControl());
      }

      this.getNativeControl().setSelectedItems(itemList);
    } else {
      this.getNativeControl().setSelectedItems(null);
    }

    return this;
  };

  sap.firefly.UxMultiComboBox.prototype.getSelectedItems = function () {
    var oList = sap.firefly.XList.create();
    var aSelectedItems = this.getNativeControl().getSelectedItems();

    for (var i = 0; i < aSelectedItems.length; i++) {
      var ffControl = sap.firefly.UxGeneric.getUxControl(aSelectedItems[i]);
      oList.add(ffControl);
    }

    return oList;
  };

  sap.firefly.UxMultiComboBox.prototype.addSelectedItem = function (item) {
    sap.firefly.UxComboBoxBase.prototype.addSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().addSelectedItem(item.getNativeControl());
    }

    return this;
  };

  sap.firefly.UxMultiComboBox.prototype.removeSelectedItem = function (item) {
    sap.firefly.UxComboBoxBase.prototype.removeSelectedItem.call(this, item);

    if (item != null) {
      this.getNativeControl().removeSelectedItem(item.getNativeControl());
    }

    return this;
  };

  sap.firefly.UxMultiComboBox.prototype.clearSelectedItems = function () {
    sap.firefly.UxComboBoxBase.prototype.clearSelectedItems.call(this);
    this.getNativeControl().clearSelection();
    return this;
  }; // ======================================


  sap.firefly.UxMultiComboBox.prototype.setShowSelectAll = function (showSelectAll) {
    sap.firefly.UxComboBoxBase.prototype.setShowSelectAll.call(this, showSelectAll);

    if (this.getNativeControl().setShowSelectAll) {
      // available since ui5 version 1.96
      this.getNativeControl().setShowSelectAll(showSelectAll);
    }

    return this;
  };

  sap.firefly.UxMultiComboBox.prototype.isShowSelectAll = function () {
    if (this.getNativeControl().getShowSelectAll) {
      // available since ui5 version 1.96
      return this.getNativeControl().getShowSelectAll();
    }

    return sap.firefly.UxComboBoxBase.prototype.isShowSelectAll.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxMultiComboBox.prototype.handleSelectionChange = function (oEvent) {
    if (this.getListenerOnSelectionChange() !== null) {
      var nativeNode = oEvent.getParameters().changedItem;
      var selectedItem = sap.firefly.UxGeneric.getUxControl(nativeNode);
      this.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createSingleSelection(this, null, selectedItem));
    }
  };

  sap.firefly.UxMultiComboBox.prototype.handleSelectionFinish = function (oEvent) {
    if (this.getListenerOnSelectionFinish() !== null) {
      // get the selected items
      var nativeSelectedItems = oEvent.getParameters().selectedItems || []; // create new firefly list

      var oSelectedItemsList = sap.firefly.XList.create();

      for (var i = 0; i < nativeSelectedItems.length; i++) {
        var ffControl = sap.firefly.UxGeneric.getUxControl(nativeSelectedItems[i]);
        oSelectedItemsList.add(ffControl);
      }

      this.getListenerOnSelectionFinish().onSelectionFinish(sap.firefly.UiSelectionEvent.createMultiSelection(this, null, oSelectedItemsList));
    }
  };

  sap.firefly.UxList = function () {
    sap.firefly.UxListBase.call(this);
    this._ff_c = "UxList";
  };

  sap.firefly.UxList.prototype = new sap.firefly.UxListBase();

  sap.firefly.UxList.prototype.newInstance = function () {
    var object = new sap.firefly.UxList();
    object.setup();
    return object;
  };

  sap.firefly.UxList.prototype.initializeNative = function () {
    sap.firefly.UxListBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.List(this.getId());
    nativeControl.addStyleClass("ff-list");
    nativeControl.setIncludeItemInSelection(true);
    nativeControl.setSticky([sap.m.Sticky.HeaderToolbar]); // list type is not yet implemented, but is it really necessary?

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxList.prototype.releaseObject = function () {
    sap.firefly.UxListBase.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================
  // ======================================
  // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxListItem = function () {
    sap.firefly.UxListItemBase.call(this);
    this._ff_c = "UxListItem";
  };

  sap.firefly.UxListItem.prototype = new sap.firefly.UxListItemBase();

  sap.firefly.UxListItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxListItem();
    object.setup();
    return object;
  };

  sap.firefly.UxListItem.prototype.initializeNative = function () {
    sap.firefly.UxListItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.StandardListItem(this.getId());
    nativeControl.setIconDensityAware(false); // do not try to fetch @2 icons

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxListItem.prototype.releaseObject = function () {
    sap.firefly.UxListItemBase.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================


  sap.firefly.UxListItem.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip UxGeneric call since the property has a different name

    this.getNativeControl().setTitle(text);
    return this;
  };

  sap.firefly.UxListItem.prototype.getText = function () {
    return this.getNativeControl().getTitle();
  };

  sap.firefly.UxListItem.prototype.setDescription = function (description) {
    sap.firefly.UxListItemBase.prototype.setDescription.call(this, description);
    return this;
  };

  sap.firefly.UxListItem.prototype.getDescription = function () {
    return this.getNativeControl().getDescription();
  };

  sap.firefly.UxListItem.prototype.setIcon = function (icon) {
    sap.firefly.UxListItemBase.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxListItem.prototype.getIcon = function () {
    return sap.firefly.UxListItemBase.prototype.getIcon.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxCustomListItem = function () {
    sap.firefly.UxListItemBase.call(this);
    this._ff_c = "UxCustomListItem";
  };

  sap.firefly.UxCustomListItem.prototype = new sap.firefly.UxListItemBase();

  sap.firefly.UxCustomListItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxCustomListItem();
    object.setup();
    return object;
  };

  sap.firefly.UxCustomListItem.prototype.initializeNative = function () {
    sap.firefly.UxListItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.CustomListItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCustomListItem.prototype.releaseObject = function () {
    sap.firefly.UxListItemBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCustomListItem.prototype.setContent = function (content) {
    sap.firefly.UxListItemBase.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl);
    }

    return this;
  };

  sap.firefly.UxCustomListItem.prototype.getContent = function () {
    return sap.firefly.UxListItemBase.prototype.getContent.call(this);
  };

  sap.firefly.UxCustomListItem.prototype.clearContent = function () {
    sap.firefly.UxListItemBase.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxGroupHeaderListItem = function () {
    sap.firefly.UxListItemBase.call(this);
    this._ff_c = "UxGroupHeaderListItem";
  };

  sap.firefly.UxGroupHeaderListItem.prototype = new sap.firefly.UxListItemBase();

  sap.firefly.UxGroupHeaderListItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxGroupHeaderListItem();
    object.setup();
    return object;
  };

  sap.firefly.UxGroupHeaderListItem.prototype.initializeNative = function () {
    sap.firefly.UxListItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.GroupHeaderListItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxGroupHeaderListItem.prototype.releaseObject = function () {
    sap.firefly.UxListItemBase.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================


  sap.firefly.UxGroupHeaderListItem.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip UxGeneric call since the property has a different name

    this.getNativeControl().setTitle(text);
    return this;
  };

  sap.firefly.UxGroupHeaderListItem.prototype.getText = function () {
    return sap.firefly.UxListItemBase.prototype.getText.call(this);
  };

  sap.firefly.UxGroupHeaderListItem.prototype.setCount = function (count) {
    sap.firefly.UxListItemBase.prototype.setCount.call(this, count);
    this.getNativeControl().setCount(count);
    return this;
  };

  sap.firefly.UxGroupHeaderListItem.prototype.getCount = function () {
    return sap.firefly.UxListItemBase.prototype.getCount.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxGridList = function () {
    sap.firefly.UxListBase.call(this);
    this._ff_c = "UxGridList";
  };

  sap.firefly.UxGridList.prototype = new sap.firefly.UxListBase();

  sap.firefly.UxGridList.prototype.newInstance = function () {
    var object = new sap.firefly.UxGridList();
    object.setup();
    return object;
  };

  sap.firefly.UxGridList.prototype.initializeNative = function () {
    sap.firefly.UxListBase.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.f");
    sap.firefly.loadUi5LibIfNeeded("sap.ui.layout");
    sap.firefly.loadGridLayoutsIfNeeded(); // make sure the layouts are loaded, somehow they do not load automatically

    var myself = this;
    var nativeControl = new sap.f.GridList(this.getId());
    nativeControl.addStyleClass("ff-grid-list");
    nativeControl.setIncludeItemInSelection(true);
    nativeControl.setSticky([sap.m.Sticky.HeaderToolbar]);
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxGridList.prototype.releaseObject = function () {
    sap.firefly.UxListBase.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================
  // ======================================


  sap.firefly.UxGridList.prototype.getGridLayout = function () {
    return sap.firefly.UxGeneric.prototype.getGridLayout.call(this);
  };

  sap.firefly.UxGridList.prototype.setGridLayout = function (gridLayout) {
    sap.firefly.UxGeneric.prototype.setGridLayout.call(this, gridLayout);
    var nativeGridLayout = null;

    if (gridLayout) {
      nativeGridLayout = sap.firefly.ui.Ui5LayoutDataUtils.createNativeGridLayout(gridLayout);
    }

    if (this.getNativeControl() && this.getNativeControl().setCustomLayout) {
      this.getNativeControl().setCustomLayout(nativeGridLayout);
    }

    return this;
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxGridListItem = function () {
    sap.firefly.UxListItemBase.call(this);
    this._ff_c = "UxGridListItem";
  };

  sap.firefly.UxGridListItem.prototype = new sap.firefly.UxListItemBase();

  sap.firefly.UxGridListItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxGridListItem();
    object.setup();
    return object;
  };

  sap.firefly.UxGridListItem.prototype.initializeNative = function () {
    sap.firefly.UxListItemBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.f.GridListItem(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxGridListItem.prototype.releaseObject = function () {
    sap.firefly.UxListItemBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxGridListItem.prototype.setContent = function (content) {
    sap.firefly.UxListItemBase.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl);
    }

    return this;
  };

  sap.firefly.UxGridListItem.prototype.getContent = function () {
    return sap.firefly.UxListItemBase.prototype.getContent.call(this);
  };

  sap.firefly.UxGridListItem.prototype.clearContent = function () {
    sap.firefly.UxListItemBase.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxNavigationList = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxNavigationList";
  };

  sap.firefly.UxNavigationList.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxNavigationList.prototype.newInstance = function () {
    var object = new sap.firefly.UxNavigationList();
    object.setup();
    return object;
  };

  sap.firefly.UxNavigationList.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.tnt");
    var myself = this;
    var nativeControl = new sap.tnt.NavigationList(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxNavigationList.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxNavigationList.prototype._addEvents = function (nativeControl) {
    var myself = this; // onItemSelect event

    nativeControl.attachItemSelect(function (oControlEvent) {
      if (myself.getListenerOnItemSelect() !== null) {
        var nativeSelectedItem = oControlEvent.getParameters().item;

        if (nativeSelectedItem) {
          var ffSelectedItem = sap.firefly.UxGeneric.getUxControl(nativeSelectedItem);
          var uiItemEvent = sap.firefly.UiItemEvent.createItem(myself, null, ffSelectedItem);
          myself.getListenerOnItemSelect().onItemSelect(uiItemEvent);
        }
      }
    });
  }; // ======================================


  sap.firefly.UxNavigationList.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxNavigationList.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxNavigationList.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxNavigationList.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxNavigationList.prototype.getSelectedItem = function () {
    var selectedItem = this.getNativeControl().getSelectedItem();

    if (selectedItem != null) {
      return sap.firefly.UxGeneric.getUxControl(selectedItem);
    }

    return null;
  };

  sap.firefly.UxNavigationList.prototype.setSelectedItem = function (item) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, item);

    if (item != null) {
      var nativeItemToSelect = item.getNativeControl();

      if (nativeItemToSelect) {
        this.getNativeControl().setSelectedItem(nativeItemToSelect);
      }
    } else {
      this.getNativeControl().setSelectedItem(null);
    }

    return this;
  }; // ======================================


  sap.firefly.UxNavigationList.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);
    this.getNativeControl().setExpanded(expanded);
    return this;
  };

  sap.firefly.UxNavigationList.prototype.isExpanded = function () {
    return sap.firefly.UxGeneric.prototype.isExpanded.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxNavigationListItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxNavigationListItem";
  };

  sap.firefly.UxNavigationListItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxNavigationListItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxNavigationListItem();
    object.setup();
    return object;
  };

  sap.firefly.UxNavigationListItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.tnt");
    var myself = this;
    var nativeControl = new sap.tnt.NavigationListItem(this.getId());
    nativeControl.setTarget("_blank");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxNavigationListItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxNavigationListItem.prototype._addEvents = function (nativeControl) {
    var myself = this; // onSelect event

    nativeControl.attachSelect(function (oEvent) {
      if (myself.getListenerOnSelect() !== null) {
        var nativeItem = oEvent.getParameters().item; // the item here should be actaully myself so no need for a single selection event!
        //TODO: onSelect should mean when this item gets selected!

        var ffItem = sap.firefly.UxGeneric.getUxControl(nativeItem);
        var ffEvent = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, ffItem);
        myself.getListenerOnSelect().onSelect(ffEvent);
      }
    });
  }; // ======================================


  sap.firefly.UxNavigationListItem.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxNavigationListItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxNavigationListItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxNavigationListItem.prototype.isExpanded = function () {
    return sap.firefly.UxGeneric.prototype.isExpanded.call(this);
  };

  sap.firefly.UxNavigationListItem.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.setSrc = function (src) {
    sap.firefly.UxGeneric.prototype.setSrc.call(this, src);
    this.getNativeControl().setHref(src);
    return this;
  };

  sap.firefly.UxNavigationListItem.prototype.getSrc = function () {
    return sap.firefly.UxGeneric.prototype.getSrc.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSideNavigation = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSideNavigation";
  };

  sap.firefly.UxSideNavigation.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSideNavigation.prototype.newInstance = function () {
    var object = new sap.firefly.UxSideNavigation();
    object.setup();
    return object;
  };

  sap.firefly.UxSideNavigation.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.tnt");
    var myself = this;
    var nativeControl = new sap.tnt.SideNavigation(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSideNavigation.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSideNavigation.prototype._addEvents = function (nativeControl) {
    var myself = this; // onItemSelect event

    nativeControl.attachItemSelect(function (oControlEvent) {
      if (myself.getListenerOnItemSelect() !== null) {
        var nativeSelectedItem = oControlEvent.getParameters().item;

        if (nativeSelectedItem) {
          var ffSelectedItem = sap.firefly.UxGeneric.getUxControl(nativeSelectedItem);
          var uiItemEvent = sap.firefly.UiItemEvent.createItem(myself, null, ffSelectedItem);
          myself.getListenerOnItemSelect().onItemSelect(uiItemEvent);
        }
      }
    });
  }; // ======================================


  sap.firefly.UxSideNavigation.prototype.setNavList = function (navList) {
    sap.firefly.UxGeneric.prototype.setNavList.call(this, navList);
    var nativeNavList = navList.getNativeControl();
    this.getNativeControl().setItem(nativeNavList);
    return this;
  };

  sap.firefly.UxSideNavigation.prototype.getNavList = function () {
    return sap.firefly.UxGeneric.prototype.getNavList.call(this);
  };

  sap.firefly.UxSideNavigation.prototype.clearNavList = function () {
    sap.firefly.UxGeneric.prototype.clearNavList.call(this);
    this.getNativeControl().destroyItem();
    return this;
  }; // ======================================


  sap.firefly.UxSideNavigation.prototype.setFixedNavList = function (navList) {
    sap.firefly.UxGeneric.prototype.setFixedNavList.call(this, navList);
    var nativeNavList = navList.getNativeControl();
    this.getNativeControl().setFixedItem(nativeNavList);
    return this;
  };

  sap.firefly.UxSideNavigation.prototype.getFixedNavList = function () {
    return sap.firefly.UxGeneric.prototype.getFixedNavList.call(this);
  };

  sap.firefly.UxSideNavigation.prototype.clearFixedNavList = function () {
    sap.firefly.UxGeneric.prototype.clearFixedNavList.call(this);
    this.getNativeControl().destroyFixedItem();
    return this;
  }; // ======================================


  sap.firefly.UxSideNavigation.prototype.setFooter = function (footer) {
    sap.firefly.UxGeneric.prototype.setFooter.call(this, footer);
    var nativeFooterControl = footer.getNativeControl();
    this.getNativeControl().setFooter(nativeFooterControl);
    return this;
  };

  sap.firefly.UxSideNavigation.prototype.getFooter = function () {
    return sap.firefly.UxGeneric.prototype.getFooter.call(this);
  };

  sap.firefly.UxSideNavigation.prototype.clearFooter = function () {
    sap.firefly.UxGeneric.prototype.clearFooter.call(this);
    this.getNativeControl().destroyFooter();
    return this;
  }; // ======================================


  sap.firefly.UxSideNavigation.prototype.setExpanded = function (expanded) {
    sap.firefly.UxGeneric.prototype.setExpanded.call(this, expanded);
    this.getNativeControl().setExpanded(expanded);
    return this;
  };

  sap.firefly.UxSideNavigation.prototype.isExpanded = function () {
    return sap.firefly.UxGeneric.prototype.isExpanded.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSlider = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSlider";
  };

  sap.firefly.UxSlider.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSlider.prototype.newInstance = function () {
    var object = new sap.firefly.UxSlider();
    object.setup();
    return object;
  };

  sap.firefly.UxSlider.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Slider(this.getId());
    nativeControl.setValue(0);
    nativeControl.setMin(0);
    nativeControl.setMax(100);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSlider.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSlider.prototype._addEvents = function (nativeControl) {
    var myself = this; // onLiveChange event

    nativeControl.attachLiveChange(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself));
      }
    }); // onChange event

    nativeControl.attachChange(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxSlider.prototype.setSliderMinimum = function (min) {
    sap.firefly.UxGeneric.prototype.setSliderMinimum.call(this, min);
    this.getNativeControl().setMin(min);
    return this;
  };

  sap.firefly.UxSlider.prototype.getSliderMinimum = function () {
    return sap.firefly.UxGeneric.prototype.getSliderMinimum.call(this);
  };

  sap.firefly.UxSlider.prototype.setSliderMaximum = function (max) {
    sap.firefly.UxGeneric.prototype.setSliderMaximum.call(this, max);
    this.getNativeControl().setMax(max);
    return this;
  };

  sap.firefly.UxSlider.prototype.getSliderMaximum = function () {
    return sap.firefly.UxGeneric.prototype.getSliderMaximum.call(this);
  };

  sap.firefly.UxSlider.prototype.setSliderStep = function (step) {
    sap.firefly.UxGeneric.prototype.setSliderStep.call(this, step);
    this.getNativeControl().setStep(step);
    return this;
  };

  sap.firefly.UxSlider.prototype.getSliderStep = function () {
    return sap.firefly.UxGeneric.prototype.getSliderStep.call(this);
  };

  sap.firefly.UxSlider.prototype.setSliderValue = function (value) {
    sap.firefly.UxGeneric.prototype.setSliderValue.call(this, value);
    this.getNativeControl().setValue(value);
    return this;
  };

  sap.firefly.UxSlider.prototype.getSliderValue = function () {
    return this.getNativeControl().getValue();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRangeSlider = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxRangeSlider";
  };

  sap.firefly.UxRangeSlider.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxRangeSlider.prototype.newInstance = function () {
    var object = new sap.firefly.UxRangeSlider();
    object.setup();
    return object;
  };

  sap.firefly.UxRangeSlider.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.RangeSlider(this.getId());
    nativeControl.setMin(0);
    nativeControl.setMax(100);
    nativeControl.setValue(0);
    nativeControl.setValue2(100);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxRangeSlider.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxRangeSlider.prototype._addEvents = function (nativeControl) {
    var myself = this; // onLiveChange event

    nativeControl.attachLiveChange(function (oEvent) {
      if (myself.getListenerOnLiveChange() !== null) {
        myself.getListenerOnLiveChange().onLiveChange(sap.firefly.UiControlEvent.create(myself));
      }
    }); // onChange event

    nativeControl.attachChange(function (oEvent) {
      if (myself.getListenerOnChange() !== null) {
        myself.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxRangeSlider.prototype.setSliderMinimum = function (min) {
    sap.firefly.UxGeneric.prototype.setSliderMinimum.call(this, min);
    this.getNativeControl().setMin(min);
    return this;
  };

  sap.firefly.UxRangeSlider.prototype.getSliderMinimum = function () {
    return sap.firefly.UxGeneric.prototype.getSliderMinimum.call(this);
  };

  sap.firefly.UxRangeSlider.prototype.setSliderMaximum = function (max) {
    sap.firefly.UxGeneric.prototype.setSliderMaximum.call(this, max);
    this.getNativeControl().setMax(max);
    return this;
  };

  sap.firefly.UxRangeSlider.prototype.getSliderMaximum = function () {
    return sap.firefly.UxGeneric.prototype.getSliderMaximum.call(this);
  };

  sap.firefly.UxRangeSlider.prototype.setSliderStep = function (step) {
    sap.firefly.UxGeneric.prototype.setSliderStep.call(this, step);
    this.getNativeControl().setStep(step);
    return this;
  };

  sap.firefly.UxRangeSlider.prototype.getSliderStep = function () {
    return sap.firefly.UxGeneric.prototype.getSliderStep.call(this);
  };

  sap.firefly.UxRangeSlider.prototype.setSliderValue = function (value) {
    sap.firefly.UxGeneric.prototype.setSliderValue.call(this, value);
    this.getNativeControl().setValue(value);
    return this;
  };

  sap.firefly.UxRangeSlider.prototype.getSliderValue = function () {
    return this.getNativeControl().getValue();
  };

  sap.firefly.UxRangeSlider.prototype.setSliderUpperValue = function (value) {
    sap.firefly.UxGeneric.prototype.setSliderUpperValue.call(this, value);
    this.getNativeControl().setValue2(value);
    return this;
  };

  sap.firefly.UxRangeSlider.prototype.getSliderUpperValue = function () {
    return this.getNativeControl().getValue2();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxActivityIndicator = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxActivityIndicator";
  };

  sap.firefly.UxActivityIndicator.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxActivityIndicator.prototype.newInstance = function () {
    var object = new sap.firefly.UxActivityIndicator();
    object.setup();
    return object;
  };

  sap.firefly.UxActivityIndicator.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.BusyIndicator(this.getId());
    nativeControl.setCustomIconDensityAware(false); // do not try to fetch @2 icons

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxActivityIndicator.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxActivityIndicator.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxActivityIndicator.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    this.getNativeControl().setText(text);
    this.getNativeControl().invalidate(); // requires for text update on a existing activity indicator!

    return this;
  };

  sap.firefly.UxActivityIndicator.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxActivityIndicator.prototype.setSrc = function (src) {
    sap.firefly.UxGeneric.prototype.setSrc.call(this, src);
    this.getNativeControl().setCustomIcon(src);
    return this;
  };

  sap.firefly.UxActivityIndicator.prototype.getSrc = function () {
    return sap.firefly.UxGeneric.prototype.getSrc.call(this);
  };

  sap.firefly.UxActivityIndicator.prototype.setAnimationDuration = function (animationDuration) {
    sap.firefly.UxGeneric.prototype.setAnimationDuration.call(this, animationDuration);
    this.getNativeControl().setCustomIconRotationSpeed(animationDuration);
    return this;
  };

  sap.firefly.UxActivityIndicator.prototype.getAnimationDuration = function () {
    return sap.firefly.UxGeneric.prototype.getAnimationDuration.call(this);
  }; // Overrides
  // ======================================


  sap.firefly.UxActivityIndicator.prototype.setIconSize = function (iconSize) {
    sap.firefly.DfUiContext.prototype.setIconSize.call(this, iconSize); // skip generic implementation

    var iconSizeCss = this._calculateIconSizeCss();

    this.getNativeControl().setSize(iconSizeCss);
    this.getNativeControl().setCustomIconWidth(iconSizeCss); // additionally set values for custom icon

    this.getNativeControl().setCustomIconHeight(iconSizeCss); // additionally set values for custom icon

    return this;
  }; // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxActivityIndicator.prototype.applyCustomCssStyling = function (element) {
    // center the activity indicator and the text horizontally and vertically
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.justifyContent = "center";
    element.style.alignItems = "center";
  }; // Helpers
  // ======================================


  sap.firefly.UxProgressIndicator = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxProgressIndicator";
  };

  sap.firefly.UxProgressIndicator.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxProgressIndicator.prototype.newInstance = function () {
    var object = new sap.firefly.UxProgressIndicator();
    object.setup();
    return object;
  };

  sap.firefly.UxProgressIndicator.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ProgressIndicator(this.getId());
    nativeControl.addStyleClass("ff-progress-indicator");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxActivityIndicator.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxProgressIndicator.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxProgressIndicator.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    this.getNativeControl().setDisplayValue(text);
    return this;
  };

  sap.firefly.UxProgressIndicator.prototype.getText = function () {
    return this.getNativeControl().getDisplayValue();
  };

  sap.firefly.UxProgressIndicator.prototype.setAnimated = function (animated) {
    sap.firefly.UxGeneric.prototype.setAnimated.call(this, animated);
    this.getNativeControl().setDisplayAnimation(animated);
    return this;
  };

  sap.firefly.UxProgressIndicator.prototype.isAnimated = function () {
    return this.getNativeControl().getDisplayAnimation();
  };

  sap.firefly.UxProgressIndicator.prototype.setPercentValue = function (value) {
    sap.firefly.UxGeneric.prototype.setPercentValue.call(this, value);
    this.getNativeControl().setPercentValue(value);
    return this;
  };

  sap.firefly.UxProgressIndicator.prototype.getPercentValue = function () {
    return this.getNativeControl().getPercentValue();
  };

  sap.firefly.UxProgressIndicator.prototype.setShowValue = function (showValue) {
    sap.firefly.UxGeneric.prototype.setShowValue.call(this, showValue);
    this.getNativeControl().setShowValue(showValue);
    return this;
  };

  sap.firefly.UxProgressIndicator.prototype.isShowValue = function () {
    return this.getNativeControl().getShowValue();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxProgressIndicator.prototype.applyColorCss = function (element, color) {
    $(element).find(".sapMPIBar").css("background-color", color);
  };

  sap.firefly.UxProgressIndicator.prototype.applyBackgrounColorCss = function (element, bgColor) {
    $(element).find(".sapMPIBarRemaining").css("background-color", bgColor);
  };

  sap.firefly.UxProgressIndicator.prototype.applyFontColorCss = function (element, fontColorCss) {
    $(element).find(".sapMPIText").css("color", fontColorCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxHtml = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxHtml";
  };

  sap.firefly.UxHtml.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxHtml.prototype.newInstance = function () {
    var object = new sap.firefly.UxHtml();
    object.setup();
    return object;
  };

  sap.firefly.UxHtml.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.ui.core.HTML(this.getId());
    nativeControl.setPreferDOM(false); // prevent moving the content to sap-ui-preserve when not needed

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxHtml.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxHtml.prototype._addEvents = function (nativeControl) {
    var myself = this; // onAfterRender event

    nativeControl.attachAfterRendering(function (oControlEvent) {
      if (myself.getListenerOnLoadFinished() !== null) {
        myself.getListenerOnLoadFinished().onLoadFinished(sap.firefly.UiControlEvent.create(myself, null));
      }
    });
  }; // ======================================


  sap.firefly.UxHtml.prototype.setValue = function (value) {
    sap.firefly.UxGeneric.prototype.setValue.call(this, value);

    if (value && value.length > 0) {
      if (this._isURL(value)) {
        this.getNativeControl().setContent("<div><iframe class ='ff-html-iframe' src='" + value + "'></iframe></div>");
      } else {
        this.getNativeControl().setContent("<div>" + value + "</div>");
      }
    } else {
      this.getNativeControl().setContent(null);
    }

    return this;
  };

  sap.firefly.UxHtml.prototype.getValue = function () {
    return sap.firefly.UxGeneric.prototype.getValue.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxHtml.prototype._isURL = function (str) {
    var pattern = new RegExp("^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    // and extension
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?" + // port
    "(\\/[-a-z\\d%@_.~+&:]*)*" + // path
    "(\\?[;&a-z\\d%@_.,~+&:=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$", "i"); // fragment locator

    return pattern.test(str);
  };

  sap.firefly.UxFormattedText = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxFormattedText";
  };

  sap.firefly.UxFormattedText.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxFormattedText.prototype.newInstance = function () {
    var object = new sap.firefly.UxFormattedText();
    object.setup();
    return object;
  };

  sap.firefly.UxFormattedText.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.FormattedText(this.getId());
    nativeControl.addStyleClass("ff-formatted-text");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxFormattedText.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxFormattedText.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxFormattedText.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip generic implementation, different prop name

    this.getNativeControl().setHtmlText(text);
    return this;
  };

  sap.firefly.UxFormattedText.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxFormattedText.prototype.setTextAlign = function (textAlign) {
    sap.firefly.UxGeneric.prototype.setTextAlign.call(this, textAlign);
    this.getNativeControl().setTextAlign(sap.firefly.ui.Ui5ConstantUtils.parseTextAlign(textAlign));
    return this;
  };

  sap.firefly.UxFormattedText.prototype.getTextAlign = function () {
    return sap.firefly.UxGeneric.prototype.getTextAlign.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxCanvasLayout = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxCanvasLayout";
  };

  sap.firefly.UxCanvasLayout.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxCanvasLayout.prototype.newInstance = function () {
    var object = new sap.firefly.UxCanvasLayout();
    object.setup();
    return object;
  };

  sap.firefly.UxCanvasLayout.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ScrollContainer(this.getId());
    nativeControl.setHorizontal(true); // enable horizontal scrolling

    nativeControl.setVertical(true); // enable vertical scrolling

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxCanvasLayout.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxCanvasLayout.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxCanvasLayout.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addContent(nativeItem);
    return this;
  };

  sap.firefly.UxCanvasLayout.prototype.insertItem = function (item) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertContent(nativeItem, index);
    return this;
  };

  sap.firefly.UxCanvasLayout.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeContent(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this);
    return this;
  };

  sap.firefly.UxCanvasLayout.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call();
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSplitter = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSplitter";
  };

  sap.firefly.UxSplitter.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSplitter.prototype.newInstance = function () {
    var object = new sap.firefly.UxSplitter();
    object.setup();
    return object;
  };

  sap.firefly.UxSplitter.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.ui.layout.Splitter(this.getId());
    nativeControl.setOrientation(sap.ui.core.Orientation.Vertical);
    nativeControl.addStyleClass("ff-splitter");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSplitter.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSplitter.prototype._addEvents = function (nativeControl) {
    var myself = this; //onResize event

    nativeControl.attachResize(function (event) {
      if (myself.getListenerOnResize() !== null) {
        var newResizeEvent = sap.firefly.UiResizeEvent.create(myself);
        newResizeEvent.setResizeData(event.newWidth, event.newHeight);
        myself.getListenerOnResize().onResize(newResizeEvent);
      }
    });
  }; // ======================================


  sap.firefly.UxSplitter.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addContentArea(nativeItem);
    return this;
  };

  sap.firefly.UxSplitter.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertContentArea(nativeItem, index);
    return this;
  };

  sap.firefly.UxSplitter.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeContentArea(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxSplitter.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllContentAreas();
    return this;
  }; // ======================================


  sap.firefly.UxSplitter.prototype.setOrientation = function (orientation) {
    sap.firefly.UxGeneric.prototype.setOrientation.call(this, orientation);
    var nativeOrientation = null;

    if (orientation === sap.firefly.UiOrientation.HORIZONTAL) {
      nativeOrientation = sap.ui.core.Orientation.Horizontal;
    } else if (orientation === sap.firefly.UiOrientation.VERTICAL) {
      nativeOrientation = sap.ui.core.Orientation.Vertical;
    }

    this.getNativeControl().setOrientation(nativeOrientation);
    return this;
  };

  sap.firefly.UxSplitter.prototype.getOrientation = function () {
    return sap.firefly.UxGeneric.prototype.getOrientation.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxInteractiveSplitter = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxInteractiveSplitter";
  };

  sap.firefly.UxInteractiveSplitter.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxInteractiveSplitter.prototype.newInstance = function () {
    var object = new sap.firefly.UxInteractiveSplitter();
    object.setup();
    return object;
  };

  sap.firefly.UxInteractiveSplitter.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var nativeControl = new sap.firefly.XtUi5InteractiveSplitter(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxInteractiveSplitter.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.registerOnChange = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnChange.call(this, listener);
    this.getNativeControl().detachStateChange(this.handleChange, this); // first unregister any previous listeners

    if (listener) {
      this.getNativeControl().attachStateChange(this.handleChange, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().clearItems();
    return this;
  }; // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.setOrientation = function (orientation) {
    sap.firefly.UxGeneric.prototype.setOrientation.call(this, orientation);
    var nativeOrientation = null;

    if (orientation === sap.firefly.UiOrientation.HORIZONTAL) {
      nativeOrientation = sap.ui.core.Orientation.Horizontal;
    } else if (orientation === sap.firefly.UiOrientation.VERTICAL) {
      nativeOrientation = sap.ui.core.Orientation.Vertical;
    }

    this.getNativeControl().setOrientation(nativeOrientation);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.getOrientation = function () {
    return sap.firefly.UxGeneric.prototype.getOrientation.call(this);
  }; // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.setEnableReordering = function (enableReordering) {
    sap.firefly.UxGeneric.prototype.setEnableReordering.call(this, enableReordering);
    this.getNativeControl().setEnableTabReordering(enableReordering);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.isEnableReordering = function () {
    return sap.firefly.UxGeneric.prototype.isEnableReordering().call(this);
  }; // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.setStateJson = function (stateJson) {
    sap.firefly.UxGeneric.prototype.setStateJson.call(this, stateJson);
    var nativeModel = stateJson.convertToNative();
    this.getNativeControl().setContentState(nativeModel);
    return this;
  };

  sap.firefly.UxInteractiveSplitter.prototype.getStateJson = function () {
    return sap.firefly.UxGeneric.prototype.getStateJson.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxInteractiveSplitter.prototype.handleChange = function (oEvent) {
    if (this.getListenerOnChange() !== null) {
      var newParameters = sap.firefly.XProperties.create();
      newParameters.put(sap.firefly.UiEventParams.PARAM_NEW_CONTENT_STATE, JSON.stringify(oEvent.getParameter("newContentState")));
      this.getListenerOnChange().onChange(sap.firefly.UiControlEvent.create(this, newParameters));
    }
  };

  sap.firefly.UxInteractiveSplitterItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxInteractiveSplitterItem";
  };

  sap.firefly.UxInteractiveSplitterItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxInteractiveSplitterItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxInteractiveSplitterItem();
    object.setup();
    return object;
  };

  sap.firefly.UxInteractiveSplitterItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var nativeControl = new sap.firefly.XtUi5InteractiveSplitterItem(this.getId());
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxInteractiveSplitterItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxInteractiveSplitterItem.prototype.registerOnResize = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnResize.call(this, listener);
    this.getNativeControl().detachResize(this.handleResize, this); // first unregister any previous listeners

    if (listener) {
      this.getNativeControl().attachResize(this.handleResize, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxInteractiveSplitterItem.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl);
    }

    return this;
  };

  sap.firefly.UxInteractiveSplitterItem.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxInteractiveSplitterItem.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeContent();
    return this;
  }; // ======================================


  sap.firefly.UxInteractiveSplitterItem.prototype.setStateName = function (stateName) {
    sap.firefly.UxGeneric.prototype.setStateName.call(this, stateName);
    this.getNativeControl().setStateName(stateName);
    return this;
  };

  sap.firefly.UxInteractiveSplitterItem.prototype.getStateName = function () {
    return sap.firefly.UxGeneric.prototype.getStateName.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxInteractiveSplitterItem.prototype.handleResize = function (oEvent) {
    if (this.getListenerOnResize() != null) {
      var oSize = oEvent.getParameter("size");

      if (oSize) {
        var newWidth = oSize.width;
        var newHeight = oSize.height;
        var newResizeEvent = sap.firefly.UiResizeEvent.create(this);
        newResizeEvent.setResizeData(newWidth, newHeight);
        this.getListenerOnResize().onResize(newResizeEvent);
      } else {
        console.error("sap.firefly.UxInteractiveSplitterItem - Resize event triggered without 'size' argument!");
      }
    }
  };

  sap.firefly.UxHorizontalLayout = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxHorizontalLayout";
  };

  sap.firefly.UxHorizontalLayout.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxHorizontalLayout.prototype.newInstance = function () {
    var object = new sap.firefly.UxHorizontalLayout();
    object.setup();
    return object;
  };

  sap.firefly.UxHorizontalLayout.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.HBox(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxHorizontalLayout.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxHorizontalLayout.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxHorizontalLayout.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxHorizontalLayout.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxHorizontalLayout.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxHorizontalLayout.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxHorizontalLayout.prototype.applyCustomCssStyling = function (element) {
    // content needs to have overflow auto or content will break out of bounds if the content is bigger then the layout
    element.style.overflowX = "auto";
  }; // Helpers
  // ======================================


  sap.firefly.UxVerticalLayout = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxVerticalLayout";
  };

  sap.firefly.UxVerticalLayout.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxVerticalLayout.prototype.newInstance = function () {
    var object = new sap.firefly.UxVerticalLayout();
    object.setup();
    return object;
  };

  sap.firefly.UxVerticalLayout.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.VBox(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxVerticalLayout.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxVerticalLayout.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxVerticalLayout.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxVerticalLayout.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxVerticalLayout.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxVerticalLayout.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxVerticalLayout.prototype.applyCustomCssStyling = function (element) {
    // content needs to have overflow auto or content will break out of bounds if the content is bigger then the layout
    element.style.overflowY = "auto";
  }; // Helpers
  // ======================================


  sap.firefly.UxFlexLayout = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxFlexLayout";
  };

  sap.firefly.UxFlexLayout.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxFlexLayout.prototype.newInstance = function () {
    var object = new sap.firefly.UxFlexLayout();
    object.setup();
    return object;
  };

  sap.firefly.UxFlexLayout.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.FlexBox(this.getId());
    nativeControl.setRenderType(sap.m.FlexRendertype.Bare); // remove the divs which wrap the items

    nativeControl.setFitContainer(true);
    nativeControl.addStyleClass("ff-flex-layout");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxFlexLayout.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxFlexLayout.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxFlexLayout.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxFlexLayout.prototype.setDirection = function (direction) {
    sap.firefly.UxGeneric.prototype.setDirection.call(this, direction);

    if (direction === sap.firefly.UiFlexDirection.ROW) {
      this.getNativeControl().setDirection(sap.m.FlexDirection.Row);
    } else if (direction === sap.firefly.UiFlexDirection.ROW_REVERSE) {
      this.getNativeControl().setDirection(sap.m.FlexDirection.RowReverse);
    } else if (direction === sap.firefly.UiFlexDirection.COLUMN) {
      this.getNativeControl().setDirection(sap.m.FlexDirection.Column);
    } else if (direction === sap.firefly.UiFlexDirection.COLUMN_REVERSE) {
      this.getNativeControl().setDirection(sap.m.FlexDirection.ColumnReverse);
    } else if (direction === sap.firefly.UiFlexDirection.INHERIT) {
      this.getNativeControl().setDirection(sap.m.FlexDirection.Inherit);
    }

    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getDirection = function () {
    return sap.firefly.UxGeneric.prototype.getDirection.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setAlignItems = function (alignItems) {
    sap.firefly.UxGeneric.prototype.setAlignItems.call(this, alignItems);

    if (alignItems === sap.firefly.UiFlexAlignItems.BASELINE) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.Baseline);
    } else if (alignItems === sap.firefly.UiFlexAlignItems.CENTER) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.Center);
    } else if (alignItems === sap.firefly.UiFlexAlignItems.END) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.End);
    } else if (alignItems === sap.firefly.UiFlexAlignItems.START) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.Start);
    } else if (alignItems === sap.firefly.UiFlexAlignItems.STRETCH) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.Stretch);
    } else if (alignItems === sap.firefly.UiFlexAlignItems.INHERIT) {
      this.getNativeControl().setAlignItems(sap.m.FlexAlignItems.Inherit);
    }

    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getAlignItems = function () {
    return sap.firefly.UxGeneric.prototype.getAlignItems.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setAlignContent = function (alignContent) {
    sap.firefly.UxGeneric.prototype.setAlignContent.call(this, alignContent);

    if (alignContent === sap.firefly.UiFlexAlignContent.CENTER) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.Center);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.END) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.End);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.SPACE_AROUND) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.SpaceAround);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.SPACE_BETWEEN) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.SpaceBetween);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.START) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.Start);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.STRETCH) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.Stretch);
    } else if (alignContent === sap.firefly.UiFlexAlignContent.INHERIT) {
      this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.Inherit);
    }

    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getAlignContent = function () {
    return sap.firefly.UxGeneric.prototype.getAlignContent.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setJustifyContent = function (justifyContent) {
    sap.firefly.UxGeneric.prototype.setJustifyContent.call(this, justifyContent);

    if (justifyContent === sap.firefly.UiFlexJustifyContent.CENTER) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.Center);
    } else if (justifyContent === sap.firefly.UiFlexJustifyContent.END) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.End);
    } else if (justifyContent === sap.firefly.UiFlexJustifyContent.SPACE_AROUND) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.SpaceAround);
    } else if (justifyContent === sap.firefly.UiFlexJustifyContent.SPACE_BETWEEN) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.SpaceBetween);
    } else if (justifyContent === sap.firefly.UiFlexJustifyContent.START) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.Start);
    } else if (justifyContent === sap.firefly.UiFlexJustifyContent.INHERIT) {
      this.getNativeControl().setJustifyContent(sap.m.FlexJustifyContent.Inherit);
    }

    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getJustifyContent = function () {
    return sap.firefly.UxGeneric.prototype.getJustifyContent.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setWrap = function (wrap) {
    sap.firefly.UxGeneric.prototype.setWrap.call(this, wrap);

    if (wrap === sap.firefly.UiFlexWrap.NO_WRAP) {
      this.getNativeControl().setWrap(sap.m.FlexWrap.NoWrap);
    } else if (wrap === sap.firefly.UiFlexWrap.WRAP) {
      this.getNativeControl().setWrap(sap.m.FlexWrap.Wrap);
    } else if (wrap === sap.firefly.UiFlexWrap.WRAP_REVERSE) {
      this.getNativeControl().setWrap(sap.m.FlexWrap.WrapReverse);
    }

    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getWrap = function () {
    return sap.firefly.UxGeneric.prototype.getWrap.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setOverflow = function (overflow) {
    sap.firefly.UxGeneric.prototype.setOverflow.call(this, overflow);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getOverflow = function () {
    return sap.firefly.UxGeneric.prototype.getOverflow.call(this);
  };

  sap.firefly.UxFlexLayout.prototype.setBackgroundDesign = function (value) {
    sap.firefly.UxGeneric.prototype.setBackgroundDesign.call(this, value);
    return this;
  };

  sap.firefly.UxFlexLayout.prototype.getBackgroundDesign = function () {
    return sap.firefly.UxGeneric.prototype.getBackgroundDesign.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxFlowLayout = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxFlowLayout";
  };

  sap.firefly.UxFlowLayout.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxFlowLayout.prototype.newInstance = function () {
    var object = new sap.firefly.UxFlowLayout();
    object.setup();
    return object;
  };

  sap.firefly.UxFlowLayout.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.FlexBox(this.getId());
    nativeControl.setRenderType(sap.m.FlexRendertype.Bare); // remove the divs which wrap the items

    nativeControl.setWrap(sap.m.FlexWrap.Wrap);
    nativeControl.setJustifyContent(sap.m.FlexJustifyContent.SpaceAround);
    nativeControl.setFitContainer(true);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxFlowLayout.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxFlowLayout.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxFlowLayout.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxFlowLayout.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxFlowLayout.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxFlowLayout.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxFlowLayout.prototype.setOverflow = function (overflow) {
    sap.firefly.UxGeneric.prototype.setOverflow.call(this, overflow);
    return this;
  };

  sap.firefly.UxFlowLayout.prototype.getOverflow = function () {
    return sap.firefly.UxGeneric.prototype.getOverflow.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTabBar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTabBar";
  };

  sap.firefly.UxTabBar.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTabBar.prototype.newInstance = function () {
    var object = new sap.firefly.UxTabBar();
    object.setup();
    return object;
  };

  sap.firefly.UxTabBar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.TabContainer(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTabBar.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTabBar.prototype._addEvents = function (nativeControl) {
    var myself = this;
    nativeControl.attachItemSelect(function (oEvent) {
      if (myself.getListenerOnItemSelect() !== null) {
        var nativeItem = oEvent.getParameters().item;

        if (nativeItem) {
          var key = nativeItem.getKey();
          var theItem = myself.getItemById(key); // i write the id of the tabstrip item as key

          var uiItemEvent = sap.firefly.UiItemEvent.createItem(myself, null, theItem);
          myself.getListenerOnItemSelect().onItemSelect(uiItemEvent);
        }
      }
    });
    nativeControl.attachItemClose(function (oEvent) {
      oEvent.preventDefault(); // do not automatically close the tab!

      if (myself.getListenerOnItemClose() !== null) {
        var nativeItem = oEvent.getParameters().item;

        if (nativeItem) {
          var key = nativeItem.getKey();
          var theItem = myself.getItemById(key); // i write the id of the tabstrip item as key

          var uiItemEvent = sap.firefly.UiItemEvent.createItem(myself, null, theItem);
          myself.getListenerOnItemClose().onItemClose(uiItemEvent);
        }
      }
    });
    nativeControl.attachAddNewButtonPress(function (oEvent) {
      if (myself.getListenerOnButtonPress() !== null) {
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_PRESSED_BUTTON_TYPE, sap.firefly.UiPressedButtonType.ADD.getName());
        myself.getListenerOnButtonPress().onButtonPress(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
  }; // ======================================


  sap.firefly.UxTabBar.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxTabBar.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxTabBar.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxTabBar.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxTabBar.prototype.setSelectedItem = function (selectedItem) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, selectedItem);

    if (selectedItem !== null) {
      var nativeItem = selectedItem.getNativeControl(); // can be the id or the item itself

      this.getNativeControl().setSelectedItem(nativeItem);
    }

    return this;
  };

  sap.firefly.UxTabBar.prototype.getSelectedItem = function () {
    var selectedKey = this.getNativeControl().getSelectedItem(); // this method runs the id as string!!!

    var selectedItem = this.getItemById(selectedKey); // i write the id of the tabstrip item as key

    return selectedItem;
  }; // ======================================


  sap.firefly.UxTabBar.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTabBar.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxTabBar.prototype.setShowAddNewButton = function (showAddNewButton) {
    sap.firefly.UxGeneric.prototype.setShowAddNewButton.call(this, showAddNewButton);
    this.getNativeControl().setShowAddNewButton(showAddNewButton);
    return this;
  };

  sap.firefly.UxTabBar.prototype.isShowAddNewButton = function () {
    return sap.firefly.UxGeneric.prototype.isShowAddNewButton.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTabBarItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxTabBarItem";
  };

  sap.firefly.UxTabBarItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxTabBarItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxTabBarItem();
    object.setup();
    return object;
  };

  sap.firefly.UxTabBarItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.TabContainerItem(this.getId());
    nativeControl.setKey(this.getId()); // used for selection

    nativeControl.setName("Tab");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTabBarItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTabBarItem.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxTabBarItem.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var nativeContent = content.getNativeControl();
      this.getNativeControl().addContent(nativeContent);
    }

    return this;
  };

  sap.firefly.UxTabBarItem.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxTabBarItem.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxTabBarItem.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text);
    this.getNativeControl().setName(text);
    return this;
  };

  sap.firefly.UxTabBarItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxTabBarItem.prototype.setDescription = function (description) {
    sap.firefly.DfUiContext.prototype.setDescription.call(this, description);
    this.getNativeControl().setAdditionalText(description);
    return this;
  };

  sap.firefly.UxTabBarItem.prototype.getDescription = function () {
    return sap.firefly.UxGeneric.prototype.getDescription.call(this);
  };

  sap.firefly.UxTabBarItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxTabBarItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxTabBarItem.prototype.setModified = function (modified) {
    sap.firefly.UxGeneric.prototype.setModified.call(this, modified); // set only if a different value was passed, somehow when passing the same value (true) then the marking next to the text toggles on/off!

    if (this.getNativeControl().getModified() !== modified) {
      this.getNativeControl().setModified(modified);
    }

    return this;
  };

  sap.firefly.UxTabBarItem.prototype.isModified = function () {
    return sap.firefly.UxGeneric.prototype.isModified.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxIconTabBar = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxIconTabBar";
  };

  sap.firefly.UxIconTabBar.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxIconTabBar.prototype.newInstance = function () {
    var object = new sap.firefly.UxIconTabBar();
    object.setup();
    return object;
  };

  sap.firefly.UxIconTabBar.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.IconTabBar(this.getId());
    nativeControl.setStretchContentHeight(true);
    nativeControl.setExpandable(false);
    nativeControl.setTabDensityMode(sap.m.IconTabDensityMode.Inherit);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxIconTabBar.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxIconTabBar.prototype._addEvents = function (nativeControl) {
    var myself = this;
    nativeControl.attachSelect(function (oEvent) {
      if (myself.getListenerOnSelect() !== null) {
        var key = oEvent.getParameters().selectedItem.getKey();
        var theItem = myself.getItemById(key); // i write the id of the tabstrip item as key

        var uiEventSelection = sap.firefly.UiSelectionEvent.createSingleSelection(myself, null, theItem);
        myself.getListenerOnSelect().onSelect(uiEventSelection);
      }
    });
  }; // ======================================


  sap.firefly.UxIconTabBar.prototype.addItem = function (item) {
    sap.firefly.UxGeneric.prototype.addItem.call(this, item);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().addItem(nativeItem);
    return this;
  };

  sap.firefly.UxIconTabBar.prototype.insertItem = function (item, index) {
    sap.firefly.UxGeneric.prototype.insertItem.call(this, item, index);
    var nativeItem = item.getNativeControl();
    this.getNativeControl().insertItem(nativeItem, index);
    return this;
  };

  sap.firefly.UxIconTabBar.prototype.removeItem = function (item) {
    var nativeItem = item.getNativeControl();
    this.getNativeControl().removeItem(nativeItem);
    sap.firefly.UxGeneric.prototype.removeItem.call(this, item);
    return this;
  };

  sap.firefly.UxIconTabBar.prototype.clearItems = function () {
    sap.firefly.UxGeneric.prototype.clearItems.call(this);
    this.getNativeControl().removeAllItems();
    return this;
  }; // ======================================


  sap.firefly.UxIconTabBar.prototype.setSelectedItem = function (selectedItem) {
    sap.firefly.UxGeneric.prototype.setSelectedItem.call(this, selectedItem);

    if (selectedItem !== null) {
      var key = selectedItem.getId(); // i write the id of the tabstrip item as key

      this.getNativeControl().setSelectedKey(key);
    }

    return this;
  };

  sap.firefly.UxIconTabBar.prototype.getSelectedItem = function () {
    var selectedKey = this.getNativeControl().getSelectedKey();
    var selectedItem = this.getItemById(selectedKey); // i write the id of the tabstrip item as key

    return selectedItem;
  }; // ======================================


  sap.firefly.UxIconTabBar.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxIconTabBar.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  };

  sap.firefly.UxIconTabBar.prototype.setApplyContentPadding = function (applyContentPadding) {
    sap.firefly.UxGeneric.prototype.setApplyContentPadding.call(this, applyContentPadding);

    if (this.getNativeControl()) {
      this.getNativeControl().setApplyContentPadding(applyContentPadding);
    }

    return this;
  };

  sap.firefly.UxIconTabBar.prototype.isApplyContentPadding = function () {
    return sap.firefly.UxGeneric.prototype.isApplyContentPadding.call(this);
  };

  sap.firefly.UxIconTabBar.prototype.setEnableReordering = function (enableReordering) {
    sap.firefly.UxGeneric.prototype.setEnableReordering.call(this, enableReordering);

    if (this.getNativeControl()) {
      this.getNativeControl().setEnableTabReordering(enableReordering);
    }

    return this;
  };

  sap.firefly.UxIconTabBar.prototype.isEnableReordering = function () {
    return sap.firefly.UxGeneric.prototype.isEnableReordering.call(this);
  };

  sap.firefly.UxIconTabBar.prototype.setHeaderMode = function (headerMode) {
    sap.firefly.UxGeneric.prototype.setHeaderMode.call(this, headerMode);
    var nativeMode = sap.m.IconTabHeaderMode.Standard;

    if (headerMode == sap.firefly.UiIconTabBarHeaderMode.STANDARD) {
      nativeMode = sap.m.IconTabHeaderMode.Standard;
    } else if (headerMode == sap.firefly.UiIconTabBarHeaderMode.INLINE) {
      nativeMode = sap.m.IconTabHeaderMode.Inline;
    }

    if (this.getNativeControl()) {
      this.getNativeControl().setHeaderMode(nativeMode);
    }

    return this;
  };

  sap.firefly.UxIconTabBar.prototype.getHeaderMode = function () {
    return sap.firefly.UxGeneric.prototype.getHeaderMode.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxIconTabBar.prototype.applyCustomCssStyling = function (element) {
    // content needs to have overflow auto or content will break out of bounds
    $(element).find(".sapMITBContent").css("overflow", "auto"); // position: relative, with and height are required for coreect setStretchContentHeight property

    element.style.position = "relative";
    element.style.width = "100%";
    element.style.height = "100%";
  }; // Helpers
  // ======================================


  sap.firefly.UxIconTabBarItem = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxIconTabBarItem";
  };

  sap.firefly.UxIconTabBarItem.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxIconTabBarItem.prototype.newInstance = function () {
    var object = new sap.firefly.UxIconTabBarItem();
    object.setup();
    return object;
  };

  sap.firefly.UxIconTabBarItem.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.IconTabFilter(this.getId());
    nativeControl.setKey(this.getId()); // used for selection

    nativeControl.setText("Tab");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxIconTabBarItem.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxIconTabBarItem.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxIconTabBarItem.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var nativeContent = content.getNativeControl();
      this.getNativeControl().addContent(nativeContent);
    }

    return this;
  };

  sap.firefly.UxIconTabBarItem.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxIconTabBarItem.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxIconTabBarItem.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxIconTabBarItem.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxIconTabBarItem.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxIconTabBarItem.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxIconTabBarItem.prototype.setCount = function (count) {
    sap.firefly.UxGeneric.prototype.setCount.call(this, count);
    this.getNativeControl().setCount(count);
    return this;
  };

  sap.firefly.UxIconTabBarItem.prototype.getCount = function () {
    return sap.firefly.UxGeneric.prototype.getCount.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxDialog = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxDialog";
    this.m_resizeEventId = null;
  };

  sap.firefly.UxDialog.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxDialog.prototype.newInstance = function () {
    var object = new sap.firefly.UxDialog();
    object.setup();
    return object;
  };

  sap.firefly.UxDialog.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Dialog(this.getId());
    nativeControl.setDraggable(true); // default is false, we want to have it default true

    nativeControl.addStyleClass("ff-dialog");
    nativeControl.addStyleClass("sapUiNoContentPadding"); // older version of ui5 have content padding enabled per default, this should make sure we never have content padding in our dialogs
    // use setStretch on a mobile device (tablet and phone) to make sure that the dialog is full screen

    if (this.getUiManager().getDeviceInfo().isMobile() == true || sap.ui.Device.system.phone == true) {
      nativeControl.setStretch(true);
    }

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxDialog.prototype.releaseObject = function () {
    this._cleanUpResizeHandler();

    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxDialog.prototype._addEvents = function (nativeControl) {
    var myself = this; // beforeOpen event

    nativeControl.attachBeforeOpen(function (oEvent) {
      if (myself.getListenerOnBeforeOpen() !== null) {
        myself.getListenerOnBeforeOpen().onBeforeOpen(sap.firefly.UiControlEvent.create(myself));
      }
    }); // beforeClose event

    nativeControl.attachBeforeClose(function (oEvent) {
      if (myself.getListenerOnBeforeClose() !== null) {
        myself.getListenerOnBeforeClose().onBeforeClose(sap.firefly.UiControlEvent.create(myself));
      }
    }); // afterOpen event

    nativeControl.attachAfterOpen(function (oEvent) {
      if (myself.getListenerOnAfterOpen() !== null) {
        myself.getListenerOnAfterOpen().onAfterOpen(sap.firefly.UiControlEvent.create(myself));
      }
    }); // afterClose event

    nativeControl.attachAfterClose(function (oEvent) {
      if (myself.getListenerOnAfterClose() !== null) {
        myself.getListenerOnAfterClose().onAfterClose(sap.firefly.UiControlEvent.create(myself));
      }
    });
  };

  sap.firefly.UxDialog.prototype.registerOnResize = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnResize.call(this, listener);

    this._cleanUpResizeHandler();

    if (listener) {
      this.m_resizeEventId = sap.ui.core.ResizeHandler.register(this.getNativeControl(), this.handleResize.bind(this));
    }

    return this;
  };

  sap.firefly.UxDialog.prototype.registerOnEscape = function (listener) {
    var _this7 = this;

    sap.firefly.UxGeneric.prototype.registerOnEscape.call(this, listener);

    if (listener) {
      this.getNativeControl().setEscapeHandler(function (escapePromise) {
        escapePromise.reject();

        _this7.handleEscape();
      });
    } else {
      this.getNativeControl().setEscapeHandler(null);
    }

    return this;
  }; // ======================================


  sap.firefly.UxDialog.prototype.addDialogButton = function (dialogButton) {
    sap.firefly.UxGeneric.prototype.addDialogButton.call(this, dialogButton);
    var nativeDialogButton = dialogButton.getNativeControl();
    this.getNativeControl().addButton(nativeDialogButton);

    if (this.getDialogButtonCount() == 1) {
      this.getNativeControl().setInitialFocus(nativeDialogButton);
      nativeDialogButton.focus();
    }

    return this;
  };

  sap.firefly.UxDialog.prototype.insertDialogButton = function (dialogButton, index) {
    sap.firefly.UxGeneric.prototype.insertDialogButton.call(this, dialogButton, index);
    var nativeDialogButton = dialogButton.getNativeControl();
    this.getNativeControl().insertButton(nativeDialogButton, index);
    return this;
  };

  sap.firefly.UxDialog.prototype.removeDialogButton = function (dialogButton) {
    var nativeDialogButton = dialogButton.getNativeControl();
    this.getNativeControl().removeButton(nativeDialogButton);
    sap.firefly.UxGeneric.prototype.removeDialogButton.call(this, dialogButton);
    return this;
  };

  sap.firefly.UxDialog.prototype.clearDialogButtons = function () {
    sap.firefly.UxGeneric.prototype.clearDialogButtons.call(this);
    this.getNativeControl().removeAllButtons();
    return this;
  }; // ======================================


  sap.firefly.UxDialog.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var childNativeControl = content.getNativeControl();
      this.getNativeControl().addContent(childNativeControl);
    }

    return this;
  };

  sap.firefly.UxDialog.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxDialog.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
  }; // ======================================


  sap.firefly.UxDialog.prototype.open = function () {
    sap.firefly.UxGeneric.prototype.open.call(this);
    this.getNativeControl().open();
    return this;
  };

  sap.firefly.UxDialog.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxDialog.prototype.isOpen = function () {
    return this.getNativeControl().isOpen();
  };

  sap.firefly.UxDialog.prototype.shake = function () {
    sap.firefly.UxGeneric.prototype.shake.call(this);

    this._shakeDialog();

    return this;
  }; // ======================================


  sap.firefly.UxDialog.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    this.getNativeControl().setTitle(title);
    return this;
  };

  sap.firefly.UxDialog.prototype.getTitle = function () {
    return this.getNativeControl().getTitle();
  };

  sap.firefly.UxDialog.prototype.setResizable = function (resizable) {
    sap.firefly.UxGeneric.prototype.setResizable.call(this, resizable);
    this.getNativeControl().setResizable(resizable);
    return this;
  };

  sap.firefly.UxDialog.prototype.isResizable = function () {
    return sap.firefly.UxGeneric.prototype.isResizable.call(this);
  };

  sap.firefly.UxDialog.prototype.setIcon = function (icon) {
    sap.firefly.UxGeneric.prototype.setIcon.call(this, icon);
    return this;
  };

  sap.firefly.UxDialog.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxDialog.prototype.setState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setState.call(this, valueState);
    this.getNativeControl().setState(sap.firefly.ui.Ui5ConstantUtils.parseValueState(valueState));
    return this;
  };

  sap.firefly.UxDialog.prototype.getState = function () {
    return sap.firefly.UxGeneric.prototype.getState.call(this);
  };

  sap.firefly.UxDialog.prototype.setShowHeader = function (showHeader) {
    sap.firefly.UxGeneric.prototype.setShowHeader.call(this, showHeader);
    this.getNativeControl().setShowHeader(showHeader);
    return this;
  };

  sap.firefly.UxDialog.prototype.isShowHeader = function () {
    return this.getNativeControl().getShowHeader();
  }; // Overrides
  // ======================================


  sap.firefly.UxDialog.prototype.setWidth = function (width) {
    sap.firefly.DfUiContext.prototype.setWidth.call(this, width); // skip generic implementation

    var widthCss = this.calculateWidthCss();
    this.getNativeControl().setContentWidth(widthCss);
    return this;
  };

  sap.firefly.UxDialog.prototype.setHeight = function (height) {
    sap.firefly.DfUiContext.prototype.setHeight.call(this, height); // skip generic implementation

    var heightCss = this.calculateHeightCss();
    this.getNativeControl().setContentHeight(heightCss);
    return this;
  };

  sap.firefly.UxDialog.prototype.setDraggable = function (draggable) {
    sap.firefly.DfUiContext.prototype.setDraggable.call(this, draggable); // skip generic implementation

    this.getNativeControl().setDraggable(draggable);
    return this;
  }; // read only!


  sap.firefly.UxDialog.prototype.getOffsetHeight = function () {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return this.getNativeControl().getDomRef().offsetHeight;
    }

    return 0;
  };

  sap.firefly.UxDialog.prototype.getOffsetWidth = function () {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return this.getNativeControl().getDomRef().offsetWidth;
    }

    return 0;
  }; // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxDialog.prototype.applyCustomCssStyling = function (element) {
    // scroll content should always have 100% (default is auto), this makes dynamic layouting better
    $(element).find(".sapMDialogScroll").css("height", "100%");
  };

  sap.firefly.UxDialog.prototype.applyPaddingCss = function (element, paddingCss) {
    $(element).find(".sapMDialogScrollCont").css("padding", paddingCss);

    if (paddingCss != null) {
      // when setting padding then i need to substract twice the padding from the height so that the content perfectly fits into the window
      var dialogScrollContent = $(element).find(".sapMDialogScrollCont").first(); // only do that when the sapMDialogStretchContent exists on the element since this class sets height to 100%

      if (dialogScrollContent.hasClass("sapMDialogStretchContent")) {
        $(element).find(".sapMDialogScrollCont").css("height", "calc(100% - 2 * " + paddingCss + ")");
      }
    }
  };

  sap.firefly.UxDialog.prototype.applyMinWidthCss = function (element, minWidthCss) {
    $(element).find(".sapMDialogScroll").css("min-width", minWidthCss);
  };

  sap.firefly.UxDialog.prototype.applyMaxWidthCss = function (element, maxWidthCss) {
    $(element).find(".sapMDialogScroll").css("max-width", maxWidthCss);
  };

  sap.firefly.UxDialog.prototype.applyMinHeightCss = function (element, minHeightCss) {
    $(element).find(".sapMDialogScroll").css("min-height", minHeightCss);
  };

  sap.firefly.UxDialog.prototype.applyMaxHeightCss = function (element, maxHeightCss) {
    $(element).find(".sapMDialogScroll").css("max-height", maxHeightCss);
  }; // Helpers
  // ======================================


  sap.firefly.UxDialog.prototype._shakeDialog = function () {
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      var domElement = this.getNativeControl().getDomRef();
      var distance = 6;
      var duration = 80;
      var index = 0;
      $(domElement).css("transition", "none");
      var shakeInterval = setInterval(function () {
        index++;
        $(domElement).finish().animate({
          left: ["+=" + distance, "swing"]
        }, duration, function () {
          $(domElement).animate({
            left: ["-=" + distance, "swing"]
          }, duration, function () {
            if (index > 2) {
              clearInterval(shakeInterval);
              $(domElement).css("transition", "");
            }
          });
        });
      }, 40 + duration * 2);
    }
  };

  sap.firefly.UxDialog.prototype._cleanUpResizeHandler = function () {
    if (this.m_resizeEventId) {
      sap.ui.core.ResizeHandler.deregister(this.m_resizeEventId);
      this.m_resizeEventId = null;
    }
  }; // Event handlers
  // ======================================


  sap.firefly.UxDialog.prototype.handleResize = function (oEvent) {
    if (this.getListenerOnResize() !== null && oEvent.oldSize.width !== 0 && oEvent.oldSize.height !== 0) {
      var newWidth = oEvent.size.width;
      var newHeight = oEvent.size.height;
      var newResizeEvent = sap.firefly.UiResizeEvent.create(this);
      newResizeEvent.setResizeData(newWidth, newHeight);
      this.getListenerOnResize().onResize(newResizeEvent);
    }
  };

  sap.firefly.UxDialog.prototype.handleEscape = function () {
    if (this.getListenerOnEscape() !== null) {
      this.getListenerOnEscape().onEscape(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxDialogButton = function () {
    sap.firefly.UxButton.call(this);
    this._ff_c = "UxDialogButton";
  };

  sap.firefly.UxDialogButton.prototype = new sap.firefly.UxButton();

  sap.firefly.UxDialogButton.prototype.newInstance = function () {
    var object = new sap.firefly.UxDialogButton();
    object.setup();
    return object;
  }; // DialogButton inherits from Button and it has the same properties


  sap.firefly.UxAlert = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxAlert";
    this.m_labelView = null;
  };

  sap.firefly.UxAlert.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxAlert.prototype.newInstance = function () {
    var object = new sap.firefly.UxAlert();
    object.setup();
    return object;
  };

  sap.firefly.UxAlert.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Dialog(this.getId(), {
      title: "",
      type: "Message",
      resizable: false,
      draggable: false,
      endButton: new sap.m.Button(this.getId() + "_closeBtn", {
        text: "Ok",
        press: function press() {
          nativeControl.close(); // dialog.destroy();
        }
      })
    }); // add the lavel view to the alert

    this.m_labelView = new sap.m.Label(this.getId() + "_label", {
      text: "",
      textAlign: sap.ui.core.TextAlign.Center,
      wrapping: true,
      width: "100%"
    });
    nativeControl.addContent(this.m_labelView);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxAlert.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxAlert.prototype._addEvents = function (nativeControl) {
    var myself = this; // close event

    nativeControl.attachAfterClose(function (oEvent) {
      if (myself.getListenerOnClose() !== null) {
        myself.getListenerOnClose().onClose(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxAlert.prototype.open = function () {
    sap.firefly.UxGeneric.prototype.open.call(this);
    this.getNativeControl().open();
    return this;
  };

  sap.firefly.UxAlert.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxAlert.prototype.isOpen = function () {
    return this.getNativeControl().isOpen();
  }; // ======================================


  sap.firefly.UxAlert.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);
    this.getNativeControl().setTitle(title);
    return this;
  };

  sap.firefly.UxAlert.prototype.getTitle = function () {
    return this.getNativeControl().getTitle();
  };

  sap.firefly.UxAlert.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation

    this.m_labelView.setText(text);
    return this;
  };

  sap.firefly.UxAlert.prototype.getText = function () {
    return this.m_labelView.getText();
  };

  sap.firefly.UxAlert.prototype.setState = function (valueState) {
    sap.firefly.UxGeneric.prototype.setState.call(this, valueState);
    this.getNativeControl().setState(sap.firefly.ui.Ui5ConstantUtils.parseValueState(valueState));
    return this;
  };

  sap.firefly.UxAlert.prototype.getState = function () {
    return sap.firefly.UxGeneric.prototype.getState.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxToast = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxToast";
    this.m_isOpen = false;
  };

  sap.firefly.UxToast.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxToast.prototype.newInstance = function () {
    var object = new sap.firefly.UxToast();
    object.setup();
    return object;
  };

  sap.firefly.UxToast.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = null;

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxToast.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxToast.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxToast.prototype.open = function () {
    sap.firefly.UxGeneric.prototype.open.call(this);

    this._openToastInternal(null);

    return this;
  };

  sap.firefly.UxToast.prototype.openAt = function (control) {
    sap.firefly.UxGeneric.prototype.openAt.call(this, control);
    var nativeUi5Control = null;

    if (control != null) {
      nativeUi5Control = control.getNativeControl();
    }

    this._openToastInternal(nativeUi5Control);

    return this;
  };

  sap.firefly.UxToast.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this); // currently not possible to close a sap.m.MessageToast manually

    return this;
  };

  sap.firefly.UxToast.prototype.isOpen = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    return this.m_isOpen;
  }; // ======================================


  sap.firefly.UxToast.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxToast.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxToast.prototype.setFontColor = function (fontColor) {
    sap.firefly.UxGeneric.prototype.setFontColor.call(this, fontColor); // toast has no native control so superclass method can be called here

    return this;
  };

  sap.firefly.UxToast.prototype.getFontColor = function () {
    return sap.firefly.UxGeneric.prototype.getFontColor.call(this);
  };

  sap.firefly.UxToast.prototype.setMessageType = function (messageType) {
    sap.firefly.UxGeneric.prototype.setMessageType.call(this, messageType);
    return this;
  };

  sap.firefly.UxToast.prototype.getMessageType = function () {
    return sap.firefly.UxGeneric.prototype.getMessageType.call(this);
  };

  sap.firefly.UxToast.prototype.setDuration = function (duration) {
    sap.firefly.UxGeneric.prototype.setDuration.call(this, duration);
    return this;
  };

  sap.firefly.UxToast.prototype.getDuration = function () {
    return sap.firefly.UxGeneric.prototype.getDuration.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxToast.prototype._openToastInternal = function (ui5control) {
    var myself = this;
    var duration = this.getDuration() > 0 ? this.getDuration() : 5000;
    var toastConfig = {
      duration: duration,
      autoClose: false,
      onClose: function onClose() {
        myself.m_isOpen = false; // close event

        if (myself.getListenerOnClose() !== null) {
          myself.getListenerOnClose().onClose(sap.firefly.UiControlEvent.create(myself));
        }
      }
    };

    if (ui5control) {
      toastConfig.of = ui5control;
      toastConfig.offset = "0 -10";
    }

    sap.m.MessageToast.show(this.getText(), toastConfig);

    this._applyBackgroundAndFontColor();

    this.m_isOpen = true;
  };

  sap.firefly.UxToast.prototype._applyBackgroundAndFontColor = function () {
    var messageType = this.getMessageType();
    var bgColor = null;
    var fontColor = null;

    if (messageType && messageType !== sap.firefly.UiMessageType.NONE) {
      // if message type set and not NONE then apply hard styling
      if (messageType === sap.firefly.UiMessageType.ERROR) {
        bgColor = "#FFD2D2";
        fontColor = "#D8000C";
      } else if (messageType === sap.firefly.UiMessageType.INFORMATION) {
        bgColor = "#BDE5F8";
        fontColor = "#00529B";
      } else if (messageType === sap.firefly.UiMessageType.SUCCESS) {
        bgColor = "#DFF2BF";
        fontColor = "#4F8A10";
      } else if (messageType === sap.firefly.UiMessageType.WARNING) {
        bgColor = "#FEEFB3";
        fontColor = "#9F6000";
      }
    } else {
      // if message type not set or NONE then use provided background and font color
      if (this.getBackgroundColor()) {
        bgColor = this.getBackgroundColor().getRgbaColor();
      }

      if (this.getFontColor()) {
        fontColor = this.getFontColor().getRgbaColor();
      }
    } // apply the colors if set


    if (bgColor !== null) {
      var oMessageToastDOM = $("#content").parent().find(".sapMMessageToast").last();
      oMessageToastDOM.css("background", bgColor);
    }

    if (fontColor !== null) {
      var oMessageToastDOM = $("#content").parent().find(".sapMMessageToast").last();
      oMessageToastDOM.css("color", fontColor);
    }
  };

  sap.firefly.UxPopover = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxPopover";
  };

  sap.firefly.UxPopover.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxPopover.prototype.newInstance = function () {
    var object = new sap.firefly.UxPopover();
    object.setup();
    return object;
  };

  sap.firefly.UxPopover.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Popover(this.getId());
    nativeControl.addStyleClass("ff-popover");
    nativeControl.setShowHeader(false);
    nativeControl.setPlacement(sap.m.PlacementType.Auto);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxPopover.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxPopover.prototype._addEvents = function (nativeControl) {
    var myself = this;
  };

  sap.firefly.UxPopover.prototype.registerOnBeforeOpen = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnBeforeOpen.call(this, listener);
    this.getNativeControl().detachBeforeOpen(this.handleBeforeOpen, this);

    if (listener) {
      this.getNativeControl().attachBeforeOpen(this.handleBeforeOpen, this);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.registerOnBeforeClose = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnBeforeClose.call(this, listener);
    this.getNativeControl().detachBeforeClose(this.handleBeforeClose, this);

    if (listener) {
      this.getNativeControl().attachBeforeClose(this.handleBeforeClose, this);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.registerOnAfterOpen = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnAfterOpen.call(this, listener);
    this.getNativeControl().detachAfterOpen(this.handleAfterOpen, this);

    if (listener) {
      this.getNativeControl().attachAfterOpen(this.handleAfterOpen, this);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.registerOnAfterClose = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnAfterClose.call(this, listener);
    this.getNativeControl().detachAfterClose(this.handleAfterClose, this);

    if (listener) {
      this.getNativeControl().attachAfterClose(this.handleAfterClose, this);
    }

    return this;
  }; // ======================================


  sap.firefly.UxPopover.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();
    var childControl = content.getNativeControl();
    this.getNativeControl().addContent(childControl);
    return this;
  };

  sap.firefly.UxPopover.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxPopover.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxPopover.prototype.getHeader = function () {
    return sap.firefly.UxGeneric.prototype.getHeader.call(this);
    ;
  };

  sap.firefly.UxPopover.prototype.setHeader = function (header) {
    sap.firefly.UxGeneric.prototype.setHeader.call(this, header);

    if (header != null) {
      this.getNativeControl().setCustomHeader(header.getNativeControl());
    } else {
      this.getNativeControl().setCustomHeader(null);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.clearHeader = function () {
    sap.firefly.UxGeneric.prototype.clearHeader.call(this);
    this.getNativeControl().destroyCustomHeader();
    return this;
  }; // ======================================


  sap.firefly.UxPopover.prototype.getFooter = function () {
    return sap.firefly.UxGeneric.prototype.getFooter.call(this);
    ;
  };

  sap.firefly.UxPopover.prototype.setFooter = function (footer) {
    sap.firefly.UxGeneric.prototype.setFooter.call(this, footer);

    if (footer != null) {
      this.getNativeControl().setFooter(footer.getNativeControl());
    } else {
      this.getNativeControl().setFooter(null);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.clearFooter = function () {
    sap.firefly.UxGeneric.prototype.clearFooter.call(this);
    this.getNativeControl().destroyFooter();
    return this;
  }; // ======================================


  sap.firefly.UxPopover.prototype.openAt = function (control) {
    sap.firefly.UxGeneric.prototype.openAt.call(this, control);

    if (control != null) {
      var nativeLocationControl = control.getNativeControl();
      this.getNativeControl().openBy(nativeLocationControl);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  };

  sap.firefly.UxPopover.prototype.isOpen = function () {
    return this.getNativeControl().isOpen();
  }; // ======================================


  sap.firefly.UxPopover.prototype.setTitle = function (title) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, title);

    if (title !== null && title !== undefined && title.length > 0) {
      this.getNativeControl().setShowHeader(true);
    } else {
      this.getNativeControl().setShowHeader(false);
    }

    this.getNativeControl().setTitle(title);
    return this;
  };

  sap.firefly.UxPopover.prototype.getTitle = function () {
    return this.getNativeControl().getTitle();
  };

  sap.firefly.UxPopover.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxPopover.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  };

  sap.firefly.UxPopover.prototype.setPlacement = function (placementType) {
    sap.firefly.UxGeneric.prototype.setPlacement.call(this, placementType);

    if (placementType === sap.firefly.UiPlacementType.AUTO) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Auto);
    } else if (placementType === sap.firefly.UiPlacementType.RIGHT) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Right);
    } else if (placementType === sap.firefly.UiPlacementType.LEFT) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Left);
    } else if (placementType === sap.firefly.UiPlacementType.TOP) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Top);
    } else if (placementType === sap.firefly.UiPlacementType.BOTTOM) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Bottom);
    } else if (placementType === sap.firefly.UiPlacementType.HORIZONTAL) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Horizontal);
    } else if (placementType === sap.firefly.UiPlacementType.VERTICAL) {
      this.getNativeControl().setPlacement(sap.m.PlacementType.Vertical);
    }

    return this;
  };

  sap.firefly.UxPopover.prototype.getPlacement = function () {
    return sap.firefly.UxGeneric.prototype.getPlacement.call(this);
  };

  sap.firefly.UxPopover.prototype.setShowArrow = function (showArrow) {
    sap.firefly.UxGeneric.prototype.setShowArrow.call(this, showArrow);
    this.getNativeControl().setShowArrow(showArrow);
    return this;
  };

  sap.firefly.UxPopover.prototype.isShowArrow = function () {
    return this.getNativeControl().getShowArrow();
  }; // Overrides
  // ======================================


  sap.firefly.UxPopover.prototype.setWidth = function (width) {
    // no need to call the generic implementation, we have dedicated methods available on this control
    sap.firefly.DfUiContext.prototype.setWidth.call(this, width); // skip generic implementation

    var widthCss = this.calculateWidthCss();
    this.getNativeControl().setContentWidth(widthCss);
    return this;
  };

  sap.firefly.UxPopover.prototype.setHeight = function (height) {
    // no need to call the generic implementation, we have dedicated methods available on this control
    sap.firefly.DfUiContext.prototype.setHeight.call(this, height); // skip generic implementation

    var heightCss = this.calculateHeightCss();
    this.getNativeControl().setContentHeight(heightCss);
    return this;
  }; // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxPopover.prototype.applyCustomCssStyling = function (element) {
    // scroll content should always have 100% (default is not set), this makes dynamic laouting better
    $(element).find(".sapMPopoverScroll").css("height", "100%");
  };

  sap.firefly.UxPopover.prototype.applyBackgroundColorCss = function (element, bgColor) {
    $(element).find(".sapMPopoverCont").css("background-color", bgColor);
  };

  sap.firefly.UxPopover.prototype.applyPaddingCss = function (element, paddingCss) {
    $(element).find(".sapMPopoverCont").css("padding", paddingCss);
  };

  sap.firefly.UxPopover.prototype.applyMarginCss = function (element, marginCss) {
    $(element).find(".sapMPopoverCont").css("margin", marginCss);
  }; // Helpers
  // ======================================
  // Event handlers
  // ======================================


  sap.firefly.UxGeneric.prototype.handleBeforeOpen = function (oEvent, parameters) {
    if (this.getListenerOnBeforeOpen() !== null) {
      this.getListenerOnBeforeOpen().onBeforeOpen(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxGeneric.prototype.handleBeforeClose = function (oEvent, parameters) {
    if (this.getListenerOnBeforeClose() !== null) {
      this.getListenerOnBeforeClose().onBeforeClose(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxGeneric.prototype.handleAfterOpen = function (oEvent, parameters) {
    if (this.getListenerOnAfterOpen() !== null) {
      this.getListenerOnAfterOpen().onAfterOpen(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxGeneric.prototype.handleAfterClose = function (oEvent, parameters) {
    if (this.getListenerOnAfterClose() !== null) {
      this.getListenerOnAfterClose().onAfterClose(sap.firefly.UiControlEvent.create(this));
    }
  };

  sap.firefly.UxScrollContainer = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxScrollContainer";
  };

  sap.firefly.UxScrollContainer.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxScrollContainer.prototype.newInstance = function () {
    var object = new sap.firefly.UxScrollContainer();
    object.setup();
    return object;
  };

  sap.firefly.UxScrollContainer.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ScrollContainer(this.getId());
    nativeControl.setHorizontal(false);
    nativeControl.setVertical(true);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxScrollContainer.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxScrollContainer.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxScrollContainer.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var nativeControl = content.getNativeControl();
      this.getNativeControl().addContent(nativeControl);
    }

    return this;
  };

  sap.firefly.UxScrollContainer.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxScrollContainer.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxScrollContainer.prototype.scrollTo = function (x, y, duration) {
    sap.firefly.UxGeneric.prototype.scrollTo.call(this, x, y, duration);

    if (this.getNativeControl() != null) {
      this.getNativeControl().scrollTo(x, y, duration);
    }

    return this;
  };

  sap.firefly.UxScrollContainer.prototype.scrollToControl = function (control, duration) {
    sap.firefly.UxGeneric.prototype.scrollToControl.call(this, control, duration);

    if (this.getNativeControl() != null && control != null) {
      var nativeControl = control.getNativeControl();
      this.getNativeControl().scrollToElement(nativeControl, duration);
    }

    return this;
  }; // ======================================


  sap.firefly.UxScrollContainer.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxScrollContainer.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxScrollContainer.prototype.applyCustomCssStyling = function (element) {
    // scroll content should always have 100% (default is auto), this makes dynamic layouting better
    $(element).find(".sapMScrollContScroll").css("height", "100%");
  }; // Helpers
  // ======================================


  sap.firefly.UxContentWrapper = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxContentWrapper";
  };

  sap.firefly.UxContentWrapper.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxContentWrapper.prototype.newInstance = function () {
    var object = new sap.firefly.UxContentWrapper();
    object.setup();
    return object;
  };

  sap.firefly.UxContentWrapper.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.firefly.XtUi5ContentWrapper(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxContentWrapper.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxContentWrapper.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxContentWrapper.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent();

    if (content !== null) {
      var nativeControl = content.getNativeControl();
      this.getNativeControl().addContent(nativeControl);
    }

    return this;
  };

  sap.firefly.UxContentWrapper.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxContentWrapper.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxContentWrapper.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxContentWrapper.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTileContainer = function () {
    sap.firefly.UxFlexLayout.call(this);
    this._ff_c = "UxTileContainer";
  };

  sap.firefly.UxTileContainer.prototype = new sap.firefly.UxFlexLayout();

  sap.firefly.UxTileContainer.prototype.newInstance = function () {
    var object = new sap.firefly.UxTileContainer();
    object.setup();
    return object;
  };

  sap.firefly.UxTileContainer.prototype.initializeNative = function () {
    sap.firefly.UxFlexLayout.prototype.initializeNative.call(this);
    var myself = this;
    this.getNativeControl().setAlignContent(sap.m.FlexAlignContent.Start);
    this.getNativeControl().setWrap(sap.m.FlexWrap.Wrap);
  };

  sap.firefly.UxTileContainer.prototype.releaseObject = function () {
    sap.firefly.UxFlexLayout.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTileContainer.prototype.registerOnClick = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnClick.call(this, listener);
    this.getNativeControl().onclick = null;

    if (listener) {
      this.getNativeControl().onclick = this.handleClick.bind(this);
    }

    return this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTile = function () {
    sap.firefly.UxTileBase.call(this);
    this._ff_c = "UxTile";
  };

  sap.firefly.UxTile.prototype = new sap.firefly.UxTileBase();

  sap.firefly.UxTile.prototype.newInstance = function () {
    var object = new sap.firefly.UxTile();
    object.setup();
    return object;
  };

  sap.firefly.UxTile.prototype.initializeNative = function () {
    sap.firefly.UxTileBase.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.GenericTile(this.getId());
    nativeControl.addStyleClass("ff-tile");
    nativeControl.addStyleClass("ff-tile-no-title"); // per default a tile has no title

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxTile.prototype.releaseObject = function () {
    sap.firefly.UxTileBase.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxTile.prototype.setContent = function (content) {
    sap.firefly.UxTileBase.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllTileContent();

    if (content !== null) {
      var childControl = content.getNativeControl();
      var tileContent = new sap.m.TileContent(this.getId() + "tileContent");
      tileContent.setContent(childControl);
      this.getNativeControl().addTileContent(tileContent);
    }

    return this;
  };

  sap.firefly.UxTile.prototype.getContent = function () {
    return sap.firefly.UxTileBase.prototype.getContent.call(this);
  };

  sap.firefly.UxTile.prototype.clearContent = function () {
    sap.firefly.UxTileBase.prototype.clearContent.call(this);
    this.getNativeControl().removeAllTileContent();
    return this;
  }; // ======================================


  sap.firefly.UxTile.prototype.setTitle = function (title) {
    sap.firefly.DfUiContext.prototype.setTitle.call(this, title); // skip superclass implementation since the property name is different

    this.getNativeControl().setHeader(title);

    this._toggleNoTitleClass();

    return this;
  };

  sap.firefly.UxTile.prototype.getTitle = function () {
    return this.getNativeControl().getHeader();
  };

  sap.firefly.UxTile.prototype.setSubtitle = function (subtitle) {
    sap.firefly.DfUiContext.prototype.setSubtitle.call(this, subtitle); // skip superclass implementation since the property name is different

    this.getNativeControl().setSubheader(subtitle);
    return this;
  };

  sap.firefly.UxTile.prototype.getSubtitle = function () {
    return this.getNativeControl().getSubheader();
  };

  sap.firefly.UxTile.prototype.setLoadState = function (loadState) {
    sap.firefly.UxTileBase.prototype.setLoadState.call(this, loadState);
    var nativeLoadState = sap.m.LoadState.Loaded;

    if (loadState === sap.firefly.UiLoadState.DISABLED) {
      nativeLoadState = sap.m.LoadState.Disabled;
    } else if (loadState === sap.firefly.UiLoadState.FAILED) {
      nativeLoadState = sap.m.LoadState.Failed;
    } else if (loadState === sap.firefly.UiLoadState.LOADED) {
      nativeLoadState = sap.m.LoadState.Loaded;
    } else if (loadState === sap.firefly.UiLoadState.LOADING) {
      nativeLoadState = sap.m.LoadState.Loading;
    }

    this.getNativeControl().setState(nativeLoadState);
    return this;
  };

  sap.firefly.UxTile.prototype.getLoadState = function () {
    return sap.firefly.UxTileBase.prototype.getLoadState.call(this);
  };

  sap.firefly.UxTile.prototype.setTileMode = function (tileMode) {
    sap.firefly.UxTileBase.prototype.setTileMode.call(this, tileMode);
    var nativeTileMode = sap.m.GenericTileMode.ContentMode;

    if (tileMode === sap.firefly.UiTileMode.CONTENT_MODE) {
      nativeTileMode = sap.m.GenericTileMode.ContentMode;
    } else if (tileMode === sap.firefly.UiTileMode.HEADER_MODE) {
      nativeTileMode = sap.m.GenericTileMode.HeaderMode;
    } else if (tileMode === sap.firefly.UiTileMode.LINE_MODE) {
      nativeTileMode = sap.m.GenericTileMode.LineMode;
    }

    this.getNativeControl().setMode(nativeTileMode);
    return this;
  };

  sap.firefly.UxTile.prototype.getTileMode = function () {
    return sap.firefly.UxTileBase.prototype.getTileMode.call(this);
  };

  sap.firefly.UxTile.prototype.setFrameType = function (frameType) {
    sap.firefly.UxTileBase.prototype.setFrameType.call(this, frameType);
    var nativeFrameType = sap.m.FrameType.OneByOne;

    if (frameType === sap.firefly.UiFrameType.AUTO) {
      nativeFrameType = sap.m.FrameType.Auto;
    } else if (frameType === sap.firefly.UiFrameType.ONE_BY_HALF) {
      nativeFrameType = sap.m.FrameType.OneByHalf;
    } else if (frameType === sap.firefly.UiFrameType.ONE_BY_ONE) {
      nativeFrameType = sap.m.FrameType.OneByOne;
    } else if (frameType === sap.firefly.UiFrameType.TWO_BY_HALF) {
      nativeFrameType = sap.m.FrameType.TwoByHalf;
    } else if (frameType === sap.firefly.UiFrameType.TWO_BY_ONE) {
      nativeFrameType = sap.m.FrameType.TwoByOne;
    }

    this.getNativeControl().setFrameType(nativeFrameType);
    return this;
  };

  sap.firefly.UxTile.prototype.getFrameType = function () {
    return sap.firefly.UxTileBase.prototype.getFrameType.call(this);
  };

  sap.firefly.UxTile.prototype.setBusy = function (busy) {
    sap.firefly.UxTileBase.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxTile.prototype.isBusy = function () {
    return this.getNativeControl().isBusy();
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxTile.prototype._toggleNoTitleClass = function () {
    //set a css class when to title present to apply special content styling (make content expand to the whole tile height)
    if (this.getTitle() && this.getTitle().length > 0) {
      this.getNativeControl().removeStyleClass("ff-tile-no-title");
    } else {
      this.getNativeControl().addStyleClass("ff-tile-no-title");
    }
  };

  sap.firefly.UxBreadcrumbs = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxBreadcrumbs";
  };

  sap.firefly.UxBreadcrumbs.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxBreadcrumbs.prototype.newInstance = function () {
    var object = new sap.firefly.UxBreadcrumbs();
    object.setup();
    return object;
  };

  sap.firefly.UxBreadcrumbs.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Breadcrumbs(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxBreadcrumbs.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxBreadcrumbs.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxBreadcrumbs.prototype.addLink = function (link) {
    sap.firefly.UxGeneric.prototype.addLink.call(this, link);
    var nativeLink = link.getNativeControl();
    this.getNativeControl().addLink(nativeLink);
    return this;
  };

  sap.firefly.UxBreadcrumbs.prototype.insertLink = function (link, index) {
    sap.firefly.UxGeneric.prototype.insertLink.call(this, link, index);
    var nativeLink = link.getNativeControl();
    this.getNativeControl().insertLink(nativeLink, index);
    return this;
  };

  sap.firefly.UxBreadcrumbs.prototype.removeLink = function (link) {
    var nativeLink = link.getNativeControl();
    this.getNativeControl().removeLink(nativeLink);
    sap.firefly.UxGeneric.prototype.removeLink.call(this, link);
    return this;
  };

  sap.firefly.UxBreadcrumbs.prototype.clearLinks = function () {
    sap.firefly.UxGeneric.prototype.clearLinks.call(this);
    this.getNativeControl().removeAllLinks();
    return this;
  }; // ======================================


  sap.firefly.UxBreadcrumbs.prototype.setCurrentLocationText = function (text) {
    sap.firefly.UxGeneric.prototype.setCurrentLocationText.call(this, text);
    this.getNativeControl().setCurrentLocationText(text);
    return this;
  };

  sap.firefly.UxBreadcrumbs.prototype.getCurrentLocationText = function () {
    return this.getNativeControl().getCurrentLocationText();
  };

  sap.firefly.UxBreadcrumbs.prototype.setSeparatorStyle = function (style) {
    sap.firefly.UxGeneric.prototype.setSeparatorStyle.call(this, style);
    var nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.Slash;

    if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.BACK_SLASH) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.BackSlash;
    } else if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.DOUBLE_BACK_SLASH) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.DoubleBackSlash;
    } else if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.DOUBLE_GREATHER_THAN) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.DoubleGreaterThan;
    } else if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.DOUBLE_SLASH) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.DoubleSlash;
    } else if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.GREATHER_THAN) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.GreaterThan;
    } else if (style === sap.firefly.UiBreadcrumbsSeparatorStyle.SLASH) {
      nativeSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle.Slash;
    }

    this.getNativeControl().setSeparatorStyle(nativeSeparatorStyle);
    return this;
  };

  sap.firefly.UxBreadcrumbs.prototype.getSeparatorStyle = function () {
    return sap.firefly.UxGeneric.prototype.getSeparatorStyle.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxBreadcrumbs.prototype.applyCustomCssStyling = function (element) {//nothing
  }; // Helpers
  // ======================================


  sap.firefly.UxMessageStrip = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxMessageStrip";
  };

  sap.firefly.UxMessageStrip.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxMessageStrip.prototype.newInstance = function () {
    var object = new sap.firefly.UxMessageStrip();
    object.setup();
    return object;
  };

  sap.firefly.UxMessageStrip.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.MessageStrip(this.getId());
    nativeControl.setEnableFormattedText(true);

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxMessageStrip.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxMessageStrip.prototype._addEvents = function (nativeControl) {
    var myself = this; //onClose event

    nativeControl.attachClose(function (oEvent) {
      if (myself.getListenerOnClose() !== null) {
        myself.getListenerOnClose().onClose(sap.firefly.UiControlEvent.create(myself));
      }
    });
  }; // ======================================


  sap.firefly.UxMessageStrip.prototype.close = function () {
    sap.firefly.UxGeneric.prototype.close.call(this);
    this.getNativeControl().close();
    return this;
  }; // ======================================


  sap.firefly.UxMessageStrip.prototype.setText = function (text) {
    sap.firefly.UxGeneric.prototype.setText.call(this, text);
    return this;
  };

  sap.firefly.UxMessageStrip.prototype.getText = function () {
    return sap.firefly.UxGeneric.prototype.getText.call(this);
  };

  sap.firefly.UxMessageStrip.prototype.setIcon = function (icon) {
    sap.firefly.DfUiContext.prototype.setIcon.call(this, icon);
    var iconUri = sap.firefly.UxGeneric.getUi5IconUri(icon);
    this.getNativeControl().setCustomIcon(iconUri); //different prop name

    return this;
  };

  sap.firefly.UxMessageStrip.prototype.getIcon = function () {
    return sap.firefly.UxGeneric.prototype.getIcon.call(this);
  };

  sap.firefly.UxMessageStrip.prototype.setShowIcon = function (showIcon) {
    sap.firefly.UxGeneric.prototype.setShowIcon.call(this, showIcon);
    this.getNativeControl().setShowIcon(showIcon);
    return this;
  };

  sap.firefly.UxMessageStrip.prototype.getShowIcon = function () {
    return sap.firefly.UxGeneric.prototype.getShowIcon.call(this);
  };

  sap.firefly.UxMessageStrip.prototype.setShowCloseButton = function (showCloseButton) {
    sap.firefly.UxGeneric.prototype.setShowCloseButton.call(this, showCloseButton);
    this.getNativeControl().setShowCloseButton(showCloseButton);
    return this;
  };

  sap.firefly.UxMessageStrip.prototype.getShowCloseButton = function () {
    return sap.firefly.UxGeneric.prototype.getShowCloseButton.call(this);
  };

  sap.firefly.UxMessageStrip.prototype.setMessageType = function (messageType) {
    sap.firefly.UxGeneric.prototype.setMessageType.call(this, messageType);
    var nativeType = null;

    if (messageType === sap.firefly.UiMessageType.NONE) {
      nativeType = sap.ui.core.MessageType.None;
    } else if (messageType === sap.firefly.UiMessageType.ERROR) {
      nativeType = sap.ui.core.MessageType.Error;
    } else if (messageType === sap.firefly.UiMessageType.INFORMATION) {
      nativeType = sap.ui.core.MessageType.Information;
    } else if (messageType === sap.firefly.UiMessageType.SUCCESS) {
      nativeType = sap.ui.core.MessageType.Success;
    } else if (messageType === sap.firefly.UiMessageType.WARNING) {
      nativeType = sap.ui.core.MessageType.Warning;
    }

    this.getNativeControl().setType(nativeType);
    return this;
  };

  sap.firefly.UxMessageStrip.prototype.getMessageType = function () {
    return sap.firefly.UxGeneric.prototype.getMessageType.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxIllustratedMessage = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxIllustratedMessage";
  };

  sap.firefly.UxIllustratedMessage.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxIllustratedMessage.prototype.newInstance = function () {
    var object = new sap.firefly.UxIllustratedMessage();
    object.setup();
    return object;
  };

  sap.firefly.UxIllustratedMessage.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.IllustratedMessage(this.getId());
    nativeControl.addStyleClass("ff-illustrated-message");
    nativeControl.setEnableFormattedText(true);
    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxIllustratedMessage.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================
  // ======================================
  // ======================================


  sap.firefly.UxIllustratedMessage.prototype.setTitle = function (text) {
    sap.firefly.UxGeneric.prototype.setTitle.call(this, text);
    return this;
  };

  sap.firefly.UxIllustratedMessage.prototype.getTitle = function () {
    return sap.firefly.UxGeneric.prototype.getTitle.call(this);
  };

  sap.firefly.UxIllustratedMessage.prototype.setDescription = function (description) {
    sap.firefly.UxGeneric.prototype.setDescription.call(this, description);
    return this;
  };

  sap.firefly.UxIllustratedMessage.prototype.getDescription = function () {
    return sap.firefly.UxGeneric.prototype.getDescription.call(this);
  };

  sap.firefly.UxIllustratedMessage.prototype.setIllustrationSize = function (illustrationSize) {
    sap.firefly.UxGeneric.prototype.setIllustrationSize.call(this, illustrationSize);
    this.getNativeControl().setIllustrationSize(sap.firefly.ui.Ui5ConstantUtils.parseIllustratedMessageSize(illustrationSize));
    return this;
  };

  sap.firefly.UxIllustratedMessage.prototype.getIllustrationSize = function () {
    return sap.firefly.UxGeneric.prototype.getIllustrationSize.call(this);
  };

  sap.firefly.UxIllustratedMessage.prototype.setIllustrationType = function (illustrationType) {
    sap.firefly.UxGeneric.prototype.setIllustrationType.call(this, illustrationType);
    this.getNativeControl().setIllustrationType(sap.firefly.ui.Ui5ConstantUtils.parseIllustratedMessageType(illustrationType));
    return this;
  };

  sap.firefly.UxIllustratedMessage.prototype.getIllustrationType = function () {
    return sap.firefly.UxGeneric.prototype.getIllustrationType.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxFireflyGrid = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxFireflyGrid";
  };

  sap.firefly.UxFireflyGrid.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxFireflyGrid.prototype.newInstance = function () {
    var object = new sap.firefly.UxFireflyGrid();
    object.setup();
    return object;
  };

  sap.firefly.UxFireflyGrid.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = null;

    if (sap.zen && sap.zen.commons && sap.zen.commons.Grid) {
      nativeControl = new sap.m.VBox({
        width: "100%",
        height: "100%",
        items: [new sap.zen.commons.Grid(myself.getId())]
      });
      var oGrid = nativeControl.getItems()[0];
      oGrid.setModel(new sap.ui.model.json.JSONModel(), "om");
      oGrid.getModel("om").setSizeLimit(2000000000);
      oGrid.bindCells({
        path: "om>/cells",
        model: "om",
        template: new sap.zen.commons.Cell({
          cellType: "{om>Semantic}",
          column: "{om>Column}",
          row: "{om>Row}",
          displayValue: "{om>Value}",
          displayLevel: "{om>DisplayLevel}",
          icon: "{om>Icon}",
          customData: [new sap.ui.core.CustomData({
            key: "Dimension",
            value: "{om>Dimension}"
          }), new sap.ui.core.CustomData({
            key: "Member",
            value: "{om>Member}"
          }), new sap.ui.core.CustomData({
            key: "DrillState",
            value: "{om>DrillState}"
          }), new sap.ui.core.CustomData({
            key: "TupleIndex",
            value: "{om>TupleIndex}"
          })]
        })
      });

      this._addEvents(oGrid);
    } else {
      nativeControl = new sap.m.Label(this.getId());
      nativeControl.setText("Error loading the firefly grid control!");
    }

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxFireflyGrid.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxFireflyGrid.prototype._addEvents = function (nativeControl) {
    var myself = this;
    nativeControl.attachRightClick(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString("Action", "CellClick");
        newParameters.putString("Dimension", oControlEvent.getParameter("cell").data().Dimension);
        newParameters.putString("Member", oControlEvent.getParameter("cell").data().Member);
        newParameters.putString("top", jQuery(oControlEvent.getParameter("link").getDomRef()).offset().top);
        newParameters.putString("left", jQuery(oControlEvent.getParameter("link").getDomRef()).offset().left);
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
    nativeControl.attachDrill(function (oControlEvent) {
      if (myself.getListenerOnPress() !== null) {
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString("Action", "Drill");
        newParameters.putString("Dimension", oControlEvent.getParameter("cell").data().Dimension);
        newParameters.putString("Member", oControlEvent.getParameter("cell").data().Member);
        newParameters.putString("TupleIndex", oControlEvent.getParameter("cell").data().TupleIndex);
        myself.getListenerOnPress().onPress(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
  }; // ======================================


  sap.firefly.UxFireflyGrid.prototype.setModelJson = function (modelJson) {
    sap.firefly.UxGeneric.prototype.setModelJson.call(this, modelJson);

    if (sap.zen && sap.zen.commons && sap.zen.commons.Grid) {
      var oGrid = this.getNativeControl().getItems()[0];
      oGrid.setVirtualRows(modelJson.getIntegerByKey("RowCount") - modelJson.getIntegerByKey("FixedRows"));
      var nColCount = modelJson.getIntegerByKey("ColCount");
      oGrid.setVirtualColumns(nColCount - modelJson.getIntegerByKey("FixedColumns"));
      oGrid.setFixedRows(modelJson.getIntegerByKey("FixedRows"));
      oGrid.setFixedColumns(modelJson.getIntegerByKey("FixedColumns"));
      oGrid.setOffsetRow(0);
      oGrid.setOffsetColumn(0);
      var aList = modelJson.getListByKey("Cells");
      var aCells = [];
      var o;

      for (var nIndex = 0; nIndex < aList.size(); ++nIndex) {
        o = aList.getStructureAt(nIndex);
        aCells.push({
          Value: o.getStringByKey("DisplayValue"),
          Semantic: o.getStringByKey("Semantic") || sap.firefly.UxUi5.CellType.STANDARD,
          Column: o.getIntegerByKey("Column"),
          Row: o.getIntegerByKey("Row"),
          TupleIndex: o.getIntegerByKey("ColumnTupleIndex") || o.getIntegerByKey("RowTupleIndex"),
          Dimension: o.getStringByKey("Dimension"),
          Member: o.getStringByKey("Member"),
          DisplayLevel: o.getIntegerByKey("DisplayLevel"),
          DrillState: o.getStringByKey("DrillState"),
          Icon: o.getStringByKey("Icon")
        });
      }

      delete oGrid._ColumnWidth;
      oGrid.getModel("om").setData({
        cells: aCells
      });
    }

    return this;
  };

  sap.firefly.UxFireflyGrid.prototype.getModelJson = function () {
    return sap.firefly.UxGeneric.prototype.getModelJson.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSacTableGrid = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSacTableGrid";
  };

  sap.firefly.UxSacTableGrid.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSacTableGrid.prototype.newInstance = function () {
    var object = new sap.firefly.UxSacTableGrid();
    object.setup();
    return object;
  };

  sap.firefly.UxSacTableGrid.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this); // load the sactable lib if needed

    sap.firefly.loadSacTableIfNeeded(this.getUiManager().getEnvironment().getStringByKey("ff_sactable"));
    var myself = this;
    var nativeControl = new sap.firefly.XtUi5SacTableGrid(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSacTableGrid.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSacTableGrid.prototype._addEvents = function (nativeControl) {
    var myself = this;
    nativeControl.attachOnSelectionChange(function (oEvent) {
      if (myself.getListenerOnSelectionChange() !== null) {
        var selectionArea = oEvent.getParameters().selection;
        var selectionAreaStr = JSON.stringify(selectionArea);
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTION_AREA, selectionAreaStr);
        myself.getListenerOnSelectionChange().onSelectionChange(sap.firefly.UiSelectionEvent.createEmptySelection(myself, newParameters));
      }
    });
    nativeControl.attachOnCellClick(function (oEvent) {
      if (myself.getListenerOnClick() !== null) {
        var cellRow = oEvent.getParameters().row;
        var cellCol = oEvent.getParameters().col;
        var selectedCell = oEvent.getParameters().selectedCell;
        var clickX = oEvent.getParameters().event.clientX;
        var clickY = oEvent.getParameters().event.clientY;
        var selectionArea = oEvent.getParameters().selectionArea;
        var selectionAreaStr = JSON.stringify(selectionArea);
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_ROW, cellRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_COLUMN, cellCol);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTED_CELL, selectedCell);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_X, clickX);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_Y, clickY);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTION_AREA, selectionAreaStr);
        myself.getListenerOnClick().onClick(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onDrillIconClick event

    nativeControl.attachOnDrillIconClick(function (oEvent) {
      if (myself.getListenerOnButtonPress() !== null) {
        var cellRow = oEvent.getParameters().row;
        var cellCol = oEvent.getParameters().col;
        var selectedCell = oEvent.getParameters().selectedCell;
        var clickX = oEvent.getParameters().event.clientX;
        var clickY = oEvent.getParameters().event.clientY;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_PRESSED_BUTTON_TYPE, sap.firefly.UiPressedButtonType.DRILL.getName());
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_ROW, cellRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_COLUMN, cellCol);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTED_CELL, selectedCell);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_X, clickX);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_Y, clickY);
        myself.getListenerOnButtonPress().onButtonPress(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onContextMenu event

    nativeControl.attachOnCellContextMenu(function (oEvent) {
      if (myself.getListenerOnContextMenu() !== null) {
        var cellRow = oEvent.getParameters().row;
        var cellCol = oEvent.getParameters().col;
        var isTitle = oEvent.getParameters().isTitle;
        var selectedCell = oEvent.getParameters().targetDescription;
        var clickX = oEvent.getParameters().event.clientX;
        var clickY = oEvent.getParameters().event.clientY;
        var selectionArea = oEvent.getParameters().currentSelectionAreas;
        var selectionAreaStr = JSON.stringify(selectionArea);
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_ROW, cellRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_COLUMN, cellCol);
        newParameters.putBoolean(sap.firefly.UiEventParams.PARAM_IS_TITLE, isTitle);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTED_CELL, selectedCell);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_X, clickX);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_CLICK_Y, clickY);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_SELECTION_AREA, selectionAreaStr);
        myself.getListenerOnContextMenu().onContextMenu(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onCellIconClick event

    nativeControl.attachOnCellIconClick(function (oEvent) {
      if (myself.getListenerOnButtonPress() !== null) {
        var cellRow = oEvent.getParameters().row;
        var cellCol = oEvent.getParameters().col;
        var className = oEvent.getParameters().className;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putString(sap.firefly.UiEventParams.PARAM_PRESSED_BUTTON_TYPE, sap.firefly.UiPressedButtonType.ICON.getName());
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_ROW, cellRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_COLUMN, cellCol);
        newParameters.putString(sap.firefly.UiEventParams.PARAM_CLASS_NAME, className);
        myself.getListenerOnButtonPress().onButtonPress(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onCellDropped event

    nativeControl.attachOnCellDropped(function (oEvent) {
      if (myself.getListenerOnTableDragAndDrop() !== null) {
        var sourceRow = oEvent.getParameters().sourceRow;
        var sourceCol = oEvent.getParameters().sourceCol;
        var targetRow = oEvent.getParameters().targetRow;
        var targetCol = oEvent.getParameters().targetCol;
        var placedBeforeCell = oEvent.getParameters().placedBeforeCell;
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_SOURCE_ROW, sourceRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_SOURCE_COLUMN, sourceCol);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_TARGET_ROW, targetRow);
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_TARGET_COLUMN, targetCol);
        newParameters.putBoolean(sap.firefly.UiEventParams.PARAM_PLACED_BEFORE_CELL, placedBeforeCell);
        myself.getListenerOnTableDragAndDrop().onTableDragAndDrop(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onExternalElementDropped event

    nativeControl.attachOnExternalElementDropped(function (oEvent) {
      var draggedControl = oEvent.getParameters().externalData;
      var droppedControl = myself.getNativeControl();
      var dropPosStr = oEvent.getParameters().placedBeforeCell ? "Before" : "After";
      var targetRow = oEvent.getParameters().targetRow;
      var targetCol = oEvent.getParameters().targetCol;
      var newParameters = sap.firefly.XProperties.create();
      newParameters.putInteger(sap.firefly.UiEventParams.PARAM_TARGET_ROW, targetRow);
      newParameters.putInteger(sap.firefly.UiEventParams.PARAM_TARGET_COLUMN, targetCol);

      myself._fireOnDropEventIfPossible(draggedControl, droppedControl, dropPosStr, newParameters); //WARNING: temp access of private method from UxGeneric

    }); //onTableUpdated event

    nativeControl.attachOnTableModelUpdated(function (oEvent) {
      if (myself.getListenerOnLoadFinished() !== null) {
        myself.getListenerOnLoadFinished().onLoadFinished(sap.firefly.UiControlEvent.create(myself, null));
      }
    }); //onColumnResize event

    nativeControl.attachOnColumnResize(function (oEvent) {
      if (myself.getListenerOnColumnResize() !== null) {
        var newSizesStr = JSON.stringify(oEvent.getParameters().newSizes);
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_NEW_SIZES, newSizesStr);
        myself.getListenerOnColumnResize().onColumnResize(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    }); //onRowResize event

    nativeControl.attachOnRowResize(function (oEvent) {
      if (myself.getListenerOnRowResize() !== null) {
        var newSizesStr = JSON.stringify(oEvent.getParameters().newSizes);
        var newParameters = sap.firefly.XProperties.create();
        newParameters.putInteger(sap.firefly.UiEventParams.PARAM_NEW_SIZES, newSizesStr);
        myself.getListenerOnRowResize().onRowResize(sap.firefly.UiControlEvent.create(myself, newParameters));
      }
    });
  };

  sap.firefly.UxSacTableGrid.prototype.registerOnDrop = function (listener) {
    sap.firefly.UxGeneric.prototype.registerOnDrop.call(this, listener);

    this._configureSactableExternalDragDrop();

    return this;
  }; // ======================================


  sap.firefly.UxSacTableGrid.prototype.setModelJson = function (jsonModel) {
    sap.firefly.UxGeneric.prototype.setModelJson.call(this, jsonModel);

    if (jsonModel) {
      var nativeJson = jsonModel.convertToNative();
      this.getNativeControl().setModelJson(nativeJson);
    } else {
      this.getNativeControl().setModelJson(null);
    }

    return this;
  };

  sap.firefly.UxSacTableGrid.prototype.getModelJson = function () {
    return sap.firefly.UxGeneric.prototype.getModelJson.call(this);
  };

  sap.firefly.UxSacTableGrid.prototype.setNoDataText = function (noDataText) {
    sap.firefly.UxGeneric.prototype.setNoDataText.call(this, noDataText);
    this.getNativeControl().setNoDataText(noDataText);
    return this;
  };

  sap.firefly.UxSacTableGrid.prototype.getNoDataText = function () {
    return sap.firefly.UxGeneric.prototype.getNoDataText.call(this);
  };

  sap.firefly.UxSacTableGrid.prototype.setBusy = function (busy) {
    sap.firefly.UxGeneric.prototype.setBusy.call(this, busy);
    return this;
  };

  sap.firefly.UxSacTableGrid.prototype.isBusy = function () {
    return sap.firefly.UxGeneric.prototype.isBusy.call(this);
  }; // read only!


  sap.firefly.UxSacTableGrid.prototype.getOffsetHeight = function () {
    //TODO: somehow this gets called during remote sync even when the control should already be destroyed, check it out why!
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return this.getNativeControl().getDomRef().offsetHeight;
    }

    return sap.firefly.UxGeneric.prototype.getOffsetHeight.call(this);
  };

  sap.firefly.UxSacTableGrid.prototype.getOffsetWidth = function () {
    //TODO: somehow this gets called during remote sync even when the control should already be destroyed, check it out why!
    if (this.getNativeControl() && this.getNativeControl().getDomRef()) {
      return this.getNativeControl().getDomRef().offsetWidth;
    }

    return sap.firefly.UxGeneric.prototype.getOffsetWidth.call(this);
  }; // Overrides
  // ======================================


  sap.firefly.UxSacTableGrid.prototype.registerOnResize = function (listener) {
    // only attach the on resize listener when someone registers for that event
    if (this.getNativeControl()) {
      var myself = this;
      this.getNativeControl().attachOnResize(function (oEvent) {
        if (myself.getListenerOnResize() !== null) {
          var newWidth = oEvent.getParameters().width;
          var newHeight = oEvent.getParameters().height;
          var newResizeEvent = sap.firefly.UiResizeEvent.create(myself);
          newResizeEvent.setResizeData(newWidth, newHeight);
          myself.getListenerOnResize().onResize(newResizeEvent);
        }
      });
    }

    return sap.firefly.UxGeneric.prototype.registerOnResize.call(this, listener);
  };

  sap.firefly.UxSacTableGrid.prototype.registerOnScrollLoad = function (listener) {
    // only attach the on data limit reached listener when someone registers for that event
    if (this.getNativeControl()) {
      var myself = this;
      this.getNativeControl().attachOnDataLimitReached(function (oEvent) {
        if (myself.getListenerOnScrollLoad() !== null) {
          var scrollTop = oEvent.getParameters().scrollTop;
          var scrollLeft = oEvent.getParameters().scrollLeft;
          var newParameters = sap.firefly.XProperties.create();

          if (scrollTop != null) {
            newParameters.putInteger(sap.firefly.UiEventParams.PARAM_SCROLL_TOP, scrollTop);
          }

          if (scrollLeft != null) {
            newParameters.putInteger(sap.firefly.UiEventParams.PARAM_SCROLL_LEFT, scrollLeft);
          }

          myself.getListenerOnScrollLoad().onScrollLoad(sap.firefly.UiControlEvent.create(myself, newParameters));
        }
      });
    }

    return sap.firefly.UxGeneric.prototype.registerOnScrollLoad.call(this, listener);
  }; // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxSacTableGrid.prototype._configureSactableExternalDragDrop = function () {
    var _this8 = this;

    if (this.getNativeDropInfo()) {
      delete this.getNativeDropInfo().mEventRegistry.dragEnter; // remove the default dragEnter event since we will be overwriting it

      this.getNativeDropInfo().attachDragEnter(function (oEvent) {
        var oDragSession = oEvent.getParameter("dragSession");
        var oDraggedControl = oDragSession.getDragControl(); // if no drag control present then it is probably not a ui5 drag event (maybe file drag event or sactable internal)

        if (!oDraggedControl) {
          oEvent.preventDefault(); // prevent the ui5 dragover event

          return;
        } // check if the dragged control is allowed to be dropped


        if (!_this8._isDropAllowedForUiElement(oDraggedControl)) {
          //WARNING: temp access of private method from UxGeneric
          oEvent.preventDefault(); // prevent the ui5 dragover event

          return;
        }

        if (sap.firefly.UiDropPosition.lookup(_this8.getNativeDropInfo().getDropPosition()) === sap.firefly.UiDropPosition.ON) {// do default stuff (all table is drop target)
        } else {
          // do sac table drag and drop handling between rows and columns
          oEvent.preventDefault(); // prevent the ui5 dragover event
          // when the draging of the control ends then disable drag drop on the table, and remove dragend event listener

          var tmpragendfunc = function tmpragendfunc(event) {
            _this8.getNativeControl().disableDragDrop();

            oDraggedControl.getDomRef().removeEventListener("dragend", tmpragendfunc);
          };

          oDraggedControl.getDomRef().addEventListener("dragend", tmpragendfunc); // register for control dragend event

          _this8.getNativeControl().enableDragDrop(oDraggedControl); // enable sac table drag drop

        }
      });
    }
  };

  sap.firefly.UxVizFrame = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxVizFrame";
  };

  sap.firefly.UxVizFrame.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxVizFrame.prototype.newInstance = function () {
    var object = new sap.firefly.UxVizFrame();
    object.setup();
    return object;
  };

  sap.firefly.UxVizFrame.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.viz");
    var myself = this;
    var nativeControl = new sap.viz.ui5.controls.VizFrame(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxVizFrame.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxVizFrame.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxVizFrame.prototype.setModelJson = function (modelJson) {
    sap.firefly.UxGeneric.prototype.setModelJson.call(this, modelJson);
    return this;
  };

  sap.firefly.UxVizFrame.prototype.getModelJson = function () {
    return sap.firefly.UxGeneric.prototype.getModelJson.call(this);
  };

  sap.firefly.UxVizFrame.prototype.setDataManifest = function (dataManifest) {
    sap.firefly.UxGeneric.prototype.setDataManifest.call(this, dataManifest);
    return this;
  };

  sap.firefly.UxVizFrame.prototype.getDataManifest = function () {
    return sap.firefly.UxGeneric.prototype.getDataManifest.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxMicroChart = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxMicroChart";
  };

  sap.firefly.UxMicroChart.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxMicroChart.prototype.newInstance = function () {
    var object = new sap.firefly.UxMicroChart();
    object.setup();
    return object;
  };

  sap.firefly.UxMicroChart.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    sap.firefly.loadUi5LibIfNeeded("sap.suite.ui.microchart");
    var myself = this;
    var nativeControl = new sap.firefly.XtUi5ContentWrapper(this.getId() + "_wrapper", {
      width: "auto",
      height: "auto"
    });

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxMicroChart.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxMicroChart.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxMicroChart.prototype.setModelJson = function (modelJson) {
    sap.firefly.UxGeneric.prototype.setModelJson.call(this, modelJson);

    if (modelJson) {
      this.renderChart(modelJson.convertToNative());
    } else {
      console.log("Cannot load data!");
    }

    return this;
  };

  sap.firefly.UxMicroChart.prototype.getModelJson = function () {
    return sap.firefly.UxGeneric.prototype.getModelJson.call(this);
  };

  sap.firefly.UxMicroChart.prototype.setDataManifest = function (dataManifest) {
    sap.firefly.UxGeneric.prototype.setDataManifest.call(this, dataManifest);
    return this;
  };

  sap.firefly.UxMicroChart.prototype.getDataManifest = function () {
    return sap.firefly.UxGeneric.prototype.getDataManifest.call(this);
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxMicroChart.prototype.renderChart = function (modelJson) {
    if (modelJson && modelJson.chart) {
      if (modelJson.chart === "Column") {
        this.renderColumnChart(modelJson);
      } else {
        this.showChartNotSupported();
      }
    } else {
      this.showChartNotSupported();
    }
  };

  sap.firefly.UxMicroChart.prototype.showChartNotSupported = function () {
    var notSupportedLbl = new sap.m.Label(this.getId() + "_notSupported");
    notSupportedLbl.setText("Chart not supported!");
    this.getNativeControl().addContent(notSupportedLbl);
    this.getNativeControl().setBackgroundColor("rgba(0,0,0,0.1)");
  };

  sap.firefly.UxMicroChart.prototype.renderColumnChart = function (modelJson) {
    var chartControl = new sap.suite.ui.microchart.ColumnMicroChart(this.getId());
    chartControl.setIsResponsive(true);

    if (modelJson.columns) {
      var columnsArr = modelJson.columns;
      var colSize = columnsArr.length;

      for (var a = 0; a < colSize; a++) {
        var tmpCol = columnsArr[a];
        var tmpNativeCol = new sap.suite.ui.microchart.ColumnMicroChartData();
        tmpNativeCol.setValue(tmpCol.value);
        tmpNativeCol.setDisplayValue(tmpCol.displayValue);
        tmpNativeCol.setLabel(tmpCol.label);
        tmpNativeCol.setColor(tmpCol.color);
        chartControl.addColumn(tmpNativeCol);
      }
    }

    if (modelJson.allowColumnLabels !== undefined) {
      chartControl.setAllowColumnLabels(modelJson.allowColumnLabels);
    }

    if (modelJson.leftTopLabel) {
      var leftTopLabel = new sap.suite.ui.microchart.ColumnMicroChartLabel();
      leftTopLabel.setLabel(modelJson.leftTopLabel.label);
      leftTopLabel.setColor(modelJson.leftTopLabel.color);
      chartControl.setLeftTopLabel(leftTopLabel);
    }

    if (modelJson.rightTopLabel) {
      var rightTopLabel = new sap.suite.ui.microchart.ColumnMicroChartLabel();
      rightTopLabel.setLabel(modelJson.rightTopLabel.label);
      rightTopLabel.setColor(modelJson.rightTopLabel.color);
      chartControl.setRightTopLabel(rightTopLabel);
    }

    if (modelJson.leftBottomLabel) {
      var leftBottomLabel = new sap.suite.ui.microchart.ColumnMicroChartLabel();
      leftBottomLabel.setLabel(modelJson.leftBottomLabel.label);
      leftBottomLabel.setColor(modelJson.leftBottomLabel.color);
      chartControl.setLeftBottomLabel(leftBottomLabel);
    }

    if (modelJson.rightBottomLabel) {
      var rightBottomLabel = new sap.suite.ui.microchart.ColumnMicroChartLabel();
      rightBottomLabel.setLabel(modelJson.rightBottomLabel.label);
      rightBottomLabel.setColor(modelJson.rightBottomLabel.color);
      chartControl.setRightBottomLabel(rightBottomLabel);
    }

    this.getNativeControl().addContent(chartControl);
  };

  sap.firefly.UxSpacer = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSpacer";
  };

  sap.firefly.UxSpacer.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSpacer.prototype.newInstance = function () {
    var object = new sap.firefly.UxSpacer();
    object.setup();
    return object;
  };

  sap.firefly.UxSpacer.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.Label(this.getId());
    nativeControl.setWidth("5px");

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSpacer.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSpacer.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================


  sap.firefly.UxSpacer.prototype.applyCustomCssStyling = function (element) {
    // disable text selection since this is a label
    element.style.userSelect = "none";
    element.style.cursor = "default";
  }; // Helpers
  // ======================================


  sap.firefly.UxSeparator = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxSeparator";
  };

  sap.firefly.UxSeparator.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxSeparator.prototype.newInstance = function () {
    var object = new sap.firefly.UxSeparator();
    object.setup();
    return object;
  };

  sap.firefly.UxSeparator.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = new sap.m.ToolbarSeparator(this.getId());

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxSeparator.prototype.releaseObject = function () {
    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxSeparator.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================
  // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRoot = function () {
    sap.firefly.UxGeneric.call(this);
    this._ff_c = "UxRoot";
    this.m_nativeAnchroId;
  };

  sap.firefly.UxRoot.prototype = new sap.firefly.UxGeneric();

  sap.firefly.UxRoot.prototype.newInstance = function () {
    var object = new sap.firefly.UxRoot();
    object.setup();
    return object;
  };

  sap.firefly.UxRoot.prototype.initializeNative = function () {
    sap.firefly.UxGeneric.prototype.initializeNative.call(this);
    var myself = this;
    var nativeControl = null; // if the custom XtUi5ContentWrapper control available then use that
    // has same content methods as sap.m.Page

    if (sap.firefly.XtUi5ContentWrapper) {
      nativeControl = new sap.firefly.XtUi5ContentWrapper(this.getId(), {
        width: "100%",
        height: "100%",
        position: "absolute"
      });
    } else {
      // use sap.m.Page as a fallback when XtUi5ContentWrapper is missing
      nativeControl = new sap.m.Page(this.getId(), {
        enableScrolling: false,
        showFooter: false,
        showHeader: false,
        showSubHeader: false
      });
    }

    this._addEvents(nativeControl);

    this.setNativeControl(nativeControl);
  };

  sap.firefly.UxRoot.prototype.releaseObject = function () {
    this._cleanUiAreaIfNecessary(this.m_nativeAnchroId);

    sap.firefly.UxGeneric.prototype.releaseObject.call(this);
  }; // ======================================


  sap.firefly.UxRoot.prototype._addEvents = function (nativeControl) {
    var myself = this;
  }; // ======================================


  sap.firefly.UxRoot.prototype.renderIntoAnchor = function (nativeAnchorId, nativeAnchorObject) {
    sap.firefly.UxGeneric.prototype.renderIntoAnchor.call(this, nativeAnchorId, nativeAnchorObject); //render the root proxy element

    if (nativeAnchorObject !== null) {
      if (nativeAnchorObject.addContent) {
        nativeAnchorObject.removeAllContent();
        nativeAnchorObject.addContent(this.getNativeControl());
      } else if (nativeAnchorObject instanceof HTMLElement) {
        this._placeAtDomElement(nativeAnchorObject);
      } else {
        sap.firefly.ui.Log.logCritical("UxRoot rendering error!");
        sap.firefly.ui.Log.logError("The specified native parent object is not supported and cannot be used as root! Make sure the content aggregation exists on the specified control!");
      }
    } else if (nativeAnchorId !== null) {
      if (window) {
        var domElement = window.document.getElementById(nativeAnchorId);

        if (domElement) {
          this.m_nativeAnchroId = nativeAnchorId;

          this._placeAtDomElement(domElement);
        } else {
          sap.firefly.ui.Log.logCritical("UxRoot rendering error!");
          sap.firefly.ui.Log.logError("Element with id " + nativeAnchorId + " does not exist in DOM. Cannot render UI. Make sure that the specified element id is defined in the HTML DOM.");
        }
      } else {
        sap.firefly.ui.Log.logCritical("UxRoot rendering error!");
        sap.firefly.ui.Log.logError("Missing window object!");
      }
    } else {
      sap.firefly.ui.Log.logCritical("UxRoot rendering error!");
      sap.firefly.ui.Log.logError("No native anchor id or anchor object specified! Cannot render UI!");
    }
  }; // ======================================


  sap.firefly.UxRoot.prototype.setContent = function (content) {
    sap.firefly.UxGeneric.prototype.setContent.call(this, content);
    this.getNativeControl().removeAllContent(); // remove previous content

    if (content !== null) {
      var childControl = content.getNativeControl();
      this.getNativeControl().addContent(childControl);
    }

    return this;
  };

  sap.firefly.UxRoot.prototype.getContent = function () {
    return sap.firefly.UxGeneric.prototype.getContent.call(this);
  };

  sap.firefly.UxRoot.prototype.clearContent = function () {
    sap.firefly.UxGeneric.prototype.clearContent.call(this);
    this.getNativeControl().removeAllContent();
    return this;
  }; // ======================================


  sap.firefly.UxRoot.prototype.setText = function (text) {
    sap.firefly.DfUiContext.prototype.setText.call(this, text); // skip superclass implementation since the property name is different

    document.title = value;
    return this;
  };

  sap.firefly.UxRoot.prototype.getText = function () {
    return document.title;
  }; // Overrides
  // ======================================
  // Control specific style and attribute handling
  // ======================================
  // Helpers
  // ======================================


  sap.firefly.UxRoot.prototype._placeAtDomElement = function (domElement) {
    if (domElement) {
      domElement.innerHTML = ""; // clear the container content

      this.getNativeControl().placeAt(domElement);
    }
  };

  sap.firefly.UxRoot.prototype._cleanUiAreaIfNecessary = function (areaId) {
    if (areaId) {
      if (sap && sap.ui && sap.ui.core && sap.ui.core.UIArea) {
        var tmpUiArea = sap.ui.core.UIArea.registry.get(areaId);

        if (tmpUiArea) {
          tmpUiArea.destroy();
        }
      }
    }
  };

  var NativeUiFramework = /*#__PURE__*/function () {
    function NativeUiFramework() {
      _classCallCheck(this, NativeUiFramework);

      this._ff_c = "NativeUiFramework";
    }

    _createClass(NativeUiFramework, [{
      key: "getThemeParameter",
      value: function getThemeParameter(paramName) {
        if (sap && sap.ui && sap.ui.core && sap.ui.core.theming && sap.ui.core.theming.Parameters) {
          return sap.ui.core.theming.Parameters.get(paramName);
        }

        return null;
      }
    }, {
      key: "getThemeParameterAsync",
      value: function getThemeParameterAsync(paramName) {
        if (sap && sap.ui && sap.ui.core && sap.ui.core.theming && sap.ui.core.theming.Parameters) {
          return sap.firefly.XPromise.resolve(sap.ui.core.theming.Parameters.get(paramName));
        }

        return sap.firefly.XPromise.resolve(null);
      }
    }], [{
      key: "staticSetupNative",
      value: function staticSetupNative() {
        sap.firefly.UiFramework.setInstance(new NativeUiFramework());
      }
    }]);

    return NativeUiFramework;
  }();

  sap.firefly.NativeUiFramework = NativeUiFramework;

  sap.firefly.NativeUiManager = function () {
    sap.firefly.DfUiManager.call(this);
    this._ff_c = "NativeUiManager";
  };

  sap.firefly.NativeUiManager.prototype = new sap.firefly.DfUiManager();
  sap.firefly.NativeUiManager.s_idCounter = 0;

  sap.firefly.NativeUiManager.create = function (session) {
    var newObject = new sap.firefly.NativeUiManager();
    newObject.setupSessionContext(session);
    return newObject;
  };

  sap.firefly.NativeUiManager.prototype.releaseObject = function () {
    sap.firefly.DfUiManager.prototype.releaseObject.call(this);
  };

  sap.firefly.NativeUiManager.prototype.setupSessionContext = function (session) {
    sap.firefly.DfUiManager.prototype.setupSessionContext.call(this, session);
    this.setDeviceInfo(this._createDeviceInfo());
    this.setDriverInfo(this._createDriverInfo()); //jQuery.sap.log.setLevel(jQuery.sap.log.Level.ALL); // set log level to ALL to see sapui5 and ui.native debugging information
  }; // ======================================


  sap.firefly.NativeUiManager.prototype.generateIdWithType = function (uiType) {
    // mp 11.2018: For ui5 we need to create globally unique ids. When
    // multiple ui managers are running
    // in embedded scenarios the same ids would be generated. We have to
    // prevent this here by random ids.
    // currently we have a global id counter
    return uiType.getName() + "_" + this._getNextId();
  };

  sap.firefly.NativeUiManager.prototype.getPlatform = function () {
    return sap.firefly.XPlatform.UI5;
  };

  sap.firefly.NativeUiManager.prototype.setTheme = function (themeName, themeBaseUrl) {
    sap.firefly.DfUiManager.prototype.setTheme.call(this, themeName, themeBaseUrl);

    if (sap && sap.ui && sap.ui.getCore()) {
      sap.ui.getCore().applyTheme(themeName, themeBaseUrl ? themeBaseUrl : undefined);
    }
  };

  sap.firefly.NativeUiManager.prototype.getTheme = function () {
    if (sap && sap.ui && sap.ui.getCore() && sap.ui.getCore().getConfiguration()) {
      return sap.ui.getCore().getConfiguration().getTheme();
    }

    return null;
  };

  sap.firefly.NativeUiManager.prototype.setRtl = function (enableRtl) {
    sap.firefly.DfUiManager.prototype.setRtl.call(this, enableRtl);

    if (sap && sap.ui && sap.ui.getCore() && sap.ui.getCore().getConfiguration()) {
      sap.ui.getCore().getConfiguration().setRTL(enableRtl);
    }
  };

  sap.firefly.NativeUiManager.prototype.isRtl = function () {
    if (sap && sap.ui && sap.ui.getCore() && sap.ui.getCore().getConfiguration()) {
      return sap.ui.getCore().getConfiguration().getRTL();
    }

    return false;
  }; //helpers
  // ======================================


  sap.firefly.NativeUiManager.prototype._getNextId = function () {
    sap.firefly.NativeUiManager.s_idCounter = sap.firefly.NativeUiManager.s_idCounter + 1;
    return sap.firefly.NativeUiManager.s_idCounter;
  };

  sap.firefly.NativeUiManager.prototype._createDeviceInfo = function () {
    var userAgent = window.navigator.userAgent;
    var platform = window.navigator.platform;
    var environment = sap.firefly.UiDeviceEnvironment.BROWSER;
    var framework = sap.firefly.UiDeviceFramework.UI5;
    var width = window.screen.width;
    var height = window.screen.height;
    var scale = window.devicePixelRatio;
    var maxTouchPoints = window.navigator.maxTouchPoints;
    return sap.firefly.UiDeviceInfo.createWithUserAgentAndPlatform(userAgent, platform, environment, framework, height, width, scale, maxTouchPoints);
  };

  sap.firefly.NativeUiManager.prototype._createDriverInfo = function () {
    var clientFramework = "SAPUI5";
    var clientFrameworkVersion = sap && sap.ui ? sap.ui.version : "unknown";
    var clientLang = window && window.navigator ? window.navigator.language : "unknown";

    var iconCollections = this._getIconCollections();

    var allIconNames = this._getAllIconNames();

    return sap.firefly.UiDriverInfo.create(clientFramework, clientFrameworkVersion, clientLang, iconCollections, allIconNames);
  };

  sap.firefly.NativeUiManager.prototype._getIconCollections = function () {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.IconPool) {
      var nativeIconCollections = sap.ui.core.IconPool.getIconCollectionNames();
      var ffIconCollectionList = sap.firefly.XListOfString.create();
      nativeIconCollections.forEach(function (item, i) {
        ffIconCollectionList.add(item);
      });
      return ffIconCollectionList;
    }

    return sap.firefly.XListOfString.create();
  };

  sap.firefly.NativeUiManager.prototype._getAllIconNames = function () {
    if (sap && sap.ui && sap.ui.core && sap.ui.core.IconPool) {
      var nativeIconCollections = sap.ui.core.IconPool.getIconCollectionNames();
      var ffIconNameList = sap.firefly.XListOfString.create();
      nativeIconCollections.forEach(function (item, i) {
        var nativeIconNames = sap.ui.core.IconPool.getIconNames(item);
        var prefix = item !== "undefined" ? "".concat(item, "/") : "";
        nativeIconNames.forEach(function (icon, i) {
          ffIconNameList.add("".concat(prefix).concat(icon));
        });
      });
      return ffIconNameList;
    }

    return sap.firefly.XListOfString.create();
  };

  sap.firefly.NativeUiManagerFactory = function () {
    sap.firefly.UiManagerFactory.call(this);
    this._ff_c = "NativeUiManagerFactory";
  };

  sap.firefly.NativeUiManagerFactory.prototype = new sap.firefly.UiManagerFactory();

  sap.firefly.NativeUiManagerFactory.staticSetupNative = function () {
    var newObject = new sap.firefly.NativeUiManagerFactory();
    sap.firefly.UiManagerFactory.registerFactory(newObject);
  };

  sap.firefly.NativeUiManagerFactory.prototype.newUiManagerInstance = function (process) {
    var nativeUiManager = sap.firefly.NativeUiManager.create(process);
    return nativeUiManager;
  };

  sap.firefly.UiDriverModule = function () {
    sap.firefly.DfModule.call(this);
    this._ff_c = "UiDriverModule";
  };

  sap.firefly.UiDriverModule.prototype = new sap.firefly.DfModule();
  sap.firefly.UiDriverModule.s_module = null;

  sap.firefly.UiDriverModule.getInstance = function () {
    if (sap.firefly.UiDriverModule.s_module === null) {
      if (sap.firefly.UiModule.getInstance() === null) {
        throw sap.firefly.XException.createInitializationException();
      }

      sap.firefly.UiDriverModule.s_module = sap.firefly.DfModule.startExt(new sap.firefly.UiDriverModule());
      sap.firefly.XPlatform.setPlatform(sap.firefly.XPlatform.UI5);
      sap.firefly.NativeUiFramework.staticSetupNative();
      var setControlFactory = sap.firefly.UiDriverModule._setControlFactory;
      setControlFactory(sap.firefly.UiType.BUTTON, sap.firefly.UxButton);
      setControlFactory(sap.firefly.UiType.TOGGLE_BUTTON, sap.firefly.UxToggleButton);
      setControlFactory(sap.firefly.UiType.MENU_BUTTON, sap.firefly.UxMenuButton);
      setControlFactory(sap.firefly.UiType.OVERFLOW_BUTTON, sap.firefly.UxOverflowButton);
      setControlFactory(sap.firefly.UiType.OVERFLOW_TOGGLE_BUTTON, sap.firefly.UxOverflowToggleButton);
      setControlFactory(sap.firefly.UiType.CHECKBOX, sap.firefly.UxCheckbox);
      setControlFactory(sap.firefly.UiType.SWITCH, sap.firefly.UxSwitch);
      setControlFactory(sap.firefly.UiType.INPUT, sap.firefly.UxInput);
      setControlFactory(sap.firefly.UiType.SEARCH_FIELD, sap.firefly.UxSearchField);
      setControlFactory(sap.firefly.UiType.IMAGE, sap.firefly.UxImage);
      setControlFactory(sap.firefly.UiType.ICON, sap.firefly.UxIcon);
      setControlFactory(sap.firefly.UiType.AVATAR, sap.firefly.UxAvatar);
      setControlFactory(sap.firefly.UiType.SLIDER, sap.firefly.UxSlider);
      setControlFactory(sap.firefly.UiType.RANGE_SLIDER, sap.firefly.UxRangeSlider);
      setControlFactory(sap.firefly.UiType.RADIO_BUTTON, sap.firefly.UxRadioButton);
      setControlFactory(sap.firefly.UiType.LINK, sap.firefly.UxLink);
      setControlFactory(sap.firefly.UiType.SUGGESTION_ITEM, sap.firefly.UxSuggestionItem);
      setControlFactory(sap.firefly.UiType.ICON_TAB_BAR, sap.firefly.UxIconTabBar);
      setControlFactory(sap.firefly.UiType.ICON_TAB_BAR_ITEM, sap.firefly.UxIconTabBarItem);
      setControlFactory(sap.firefly.UiType.TAB_BAR, sap.firefly.UxTabBar);
      setControlFactory(sap.firefly.UiType.TAB_BAR_ITEM, sap.firefly.UxTabBarItem);
      setControlFactory(sap.firefly.UiType.DROPDOWN, sap.firefly.UxDropDown);
      setControlFactory(sap.firefly.UiType.DROPDOWN_ITEM, sap.firefly.UxDropDownItem);
      setControlFactory(sap.firefly.UiType.COMBO_BOX, sap.firefly.UxComboBox);
      setControlFactory(sap.firefly.UiType.MULTI_COMBO_BOX, sap.firefly.UxMultiComboBox);
      setControlFactory(sap.firefly.UiType.RADIO_BUTTON_GROUP, sap.firefly.UxRadioButtonGroup);
      setControlFactory(sap.firefly.UiType.TREE, sap.firefly.UxTree);
      setControlFactory(sap.firefly.UiType.TREE_ITEM, sap.firefly.UxTreeItem);
      setControlFactory(sap.firefly.UiType.CUSTOM_TREE_ITEM, sap.firefly.UxCustomTreeItem);
      setControlFactory(sap.firefly.UiType.TREE_TABLE, sap.firefly.UxTreeTable);
      setControlFactory(sap.firefly.UiType.TREE_TABLE_ROW, sap.firefly.UxTreeTableRow);
      setControlFactory(sap.firefly.UiType.DATE_PICKER, sap.firefly.UxDatePicker);
      setControlFactory(sap.firefly.UiType.TIME_PICKER, sap.firefly.UxTimePicker);
      setControlFactory(sap.firefly.UiType.DATE_TIME_PICKER, sap.firefly.UxDateTimePicker);
      setControlFactory(sap.firefly.UiType.CALENDAR, sap.firefly.UxCalendar);
      setControlFactory(sap.firefly.UiType.CLOCK, sap.firefly.UxClock);
      setControlFactory(sap.firefly.UiType.NAVIGATION_CONTAINER, sap.firefly.UxNavigationContainer);
      setControlFactory(sap.firefly.UiType.PAGE, sap.firefly.UxPage);
      setControlFactory(sap.firefly.UiType.PAGE_BUTTON, sap.firefly.UxPageButton);
      setControlFactory(sap.firefly.UiType.LABEL, sap.firefly.UxLabel);
      setControlFactory(sap.firefly.UiType.TITLE, sap.firefly.UxTitle);
      setControlFactory(sap.firefly.UiType.TEXT, sap.firefly.UxText);
      setControlFactory(sap.firefly.UiType.TEXT_AREA, sap.firefly.UxTextArea);
      setControlFactory(sap.firefly.UiType.CODE_EDITOR, sap.firefly.UxCodeEditor);
      setControlFactory(sap.firefly.UiType.RICH_TEXT_EDITOR, sap.firefly.UxRichTextEditor);
      setControlFactory(sap.firefly.UiType.PANEL, sap.firefly.UxPanel);
      setControlFactory(sap.firefly.UiType.TILE_CONTAINER, sap.firefly.UxTileContainer);
      setControlFactory(sap.firefly.UiType.TILE, sap.firefly.UxTile);
      setControlFactory(sap.firefly.UiType.FILE_ICON, sap.firefly.UxFileIcon);
      setControlFactory(sap.firefly.UiType.MENU, sap.firefly.UxMenu);
      setControlFactory(sap.firefly.UiType.MENU_ITEM, sap.firefly.UxMenuItem);
      setControlFactory(sap.firefly.UiType.TOOLBAR, sap.firefly.UxToolbar);
      setControlFactory(sap.firefly.UiType.OVERFLOW_TOOLBAR, sap.firefly.UxOverflowToolbar);
      setControlFactory(sap.firefly.UiType.SEGMENTED_BUTTON, sap.firefly.UxSegmentedButton);
      setControlFactory(sap.firefly.UiType.SEGMENTED_BUTTON_ITEM, sap.firefly.UxSegmentedButtonItem);
      setControlFactory(sap.firefly.UiType.SPLITTER, sap.firefly.UxSplitter);
      setControlFactory(sap.firefly.UiType.INTERACTIVE_SPLITTER, sap.firefly.UxInteractiveSplitter);
      setControlFactory(sap.firefly.UiType.INTERACTIVE_SPLITTER_ITEM, sap.firefly.UxInteractiveSplitterItem);
      setControlFactory(sap.firefly.UiType.LIST, sap.firefly.UxList);
      setControlFactory(sap.firefly.UiType.LIST_ITEM, sap.firefly.UxListItem);
      setControlFactory(sap.firefly.UiType.CUSTOM_LIST_ITEM, sap.firefly.UxCustomListItem);
      setControlFactory(sap.firefly.UiType.GROUP_HEADER_LIST_ITEM, sap.firefly.UxGroupHeaderListItem);
      setControlFactory(sap.firefly.UiType.GRID_LIST, sap.firefly.UxGridList);
      setControlFactory(sap.firefly.UiType.GRID_LIST_ITEM, sap.firefly.UxGridListItem);
      setControlFactory(sap.firefly.UiType.NAVIGATION_LIST, sap.firefly.UxNavigationList);
      setControlFactory(sap.firefly.UiType.NAVIGATION_LIST_ITEM, sap.firefly.UxNavigationListItem);
      setControlFactory(sap.firefly.UiType.SIDE_NAVIGATION, sap.firefly.UxSideNavigation);
      setControlFactory(sap.firefly.UiType.VIZ_GRID, sap.firefly.UxVizGrid);
      setControlFactory(sap.firefly.UiType.FIREFLY_GRID, sap.firefly.UxFireflyGrid);
      setControlFactory(sap.firefly.UiType.SAC_TABLE_GRID, sap.firefly.UxSacTableGrid);
      setControlFactory(sap.firefly.UiType.CARD, sap.firefly.UxCard);
      setControlFactory(sap.firefly.UiType.BREADCRUMBS, sap.firefly.UxBreadcrumbs);
      setControlFactory(sap.firefly.UiType.MESSAGE_STRIP, sap.firefly.UxMessageStrip);
      setControlFactory(sap.firefly.UiType.ILLUSTRATED_MESSAGE, sap.firefly.UxIllustratedMessage);
      setControlFactory(sap.firefly.UiType.TABLE, sap.firefly.UxTable);
      setControlFactory(sap.firefly.UiType.TABLE_COLUMN, sap.firefly.UxTableColumn);
      setControlFactory(sap.firefly.UiType.TABLE_ROW, sap.firefly.UxTableRow);
      setControlFactory(sap.firefly.UiType.TABLE_CELL, sap.firefly.UxTableCell);
      setControlFactory(sap.firefly.UiType.RESPONSIVE_TABLE, sap.firefly.UxResponsiveTable);
      setControlFactory(sap.firefly.UiType.RESPONSIVE_TABLE_COLUMN, sap.firefly.UxResponsiveTableColumn);
      setControlFactory(sap.firefly.UiType.RESPONSIVE_TABLE_ROW, sap.firefly.UxResponsiveTableRow);
      setControlFactory(sap.firefly.UiType.HORIZONTAL_LAYOUT, sap.firefly.UxHorizontalLayout);
      setControlFactory(sap.firefly.UiType.VERTICAL_LAYOUT, sap.firefly.UxVerticalLayout);
      setControlFactory(sap.firefly.UiType.FLEX_LAYOUT, sap.firefly.UxFlexLayout);
      setControlFactory(sap.firefly.UiType.FLOW_LAYOUT, sap.firefly.UxFlowLayout);
      setControlFactory(sap.firefly.UiType.CANVAS_LAYOUT, sap.firefly.UxCanvasLayout);
      setControlFactory(sap.firefly.UiType.SCROLL_CONTAINER, sap.firefly.UxScrollContainer);
      setControlFactory(sap.firefly.UiType.CONTENT_WRAPPER, sap.firefly.UxContentWrapper);
      setControlFactory(sap.firefly.UiType.SPACER, sap.firefly.UxSpacer);
      setControlFactory(sap.firefly.UiType.SEPARATOR, sap.firefly.UxSeparator);
      setControlFactory(sap.firefly.UiType.ACTIVITY_INDICATOR, sap.firefly.UxActivityIndicator);
      setControlFactory(sap.firefly.UiType.PROGRESS_INDICATOR, sap.firefly.UxProgressIndicator);
      setControlFactory(sap.firefly.UiType.HTML, sap.firefly.UxHtml);
      setControlFactory(sap.firefly.UiType.FORMATTED_TEXT, sap.firefly.UxFormattedText);
      setControlFactory(sap.firefly.UiType.WEB_ASSEMBLY, sap.firefly.UxWebAssembly);
      setControlFactory(sap.firefly.UiType.DIALOG, sap.firefly.UxDialog);
      setControlFactory(sap.firefly.UiType.DIALOG_BUTTON, sap.firefly.UxDialogButton);
      setControlFactory(sap.firefly.UiType.ALERT, sap.firefly.UxAlert);
      setControlFactory(sap.firefly.UiType.TOAST, sap.firefly.UxToast);
      setControlFactory(sap.firefly.UiType.POPOVER, sap.firefly.UxPopover);
      setControlFactory(sap.firefly.UiType.CHART, sap.firefly.UxHighChart);
      setControlFactory(sap.firefly.UiType.VIZ_FRAME, sap.firefly.UxVizFrame);
      setControlFactory(sap.firefly.UiType.MICRO_CHART, sap.firefly.UxMicroChart);
      setControlFactory(sap.firefly.UiType.VAL_CHART, sap.firefly.UxValChart);
      setControlFactory(sap.firefly.UiType.WINDOW, sap.firefly.UxWindow);
      setControlFactory(sap.firefly.UiType.TERMINAL, sap.firefly.UxTerminal);
      setControlFactory(sap.firefly.UiType.LAUNCHPAD, sap.firefly.UxLaunchpad);
      setControlFactory(sap.firefly.UiType.APP_ICON, sap.firefly.UxAppIcon);
      setControlFactory(sap.firefly.UiType.TASK_BAR, sap.firefly.UxTaskBar);
      setControlFactory(sap.firefly.UiType.TASK_BAR_BUTTON, sap.firefly.UxTaskBarButton);
      setControlFactory(sap.firefly.UiType.ROOT, sap.firefly.UxRoot);
      sap.firefly.NativeUiManagerFactory.staticSetupNative();
      sap.firefly.DfModule.stopExt(sap.firefly.UiDriverModule.s_module);
    }

    return sap.firefly.UiDriverModule.s_module;
  };

  sap.firefly.UiDriverModule._setControlFactory = function (type, ctrlClass) {
    if (type && type.setFactory) {
      if (ctrlClass) {
        var ctrlInstance = new ctrlClass();
        type.setFactory(ctrlInstance);
      } else {
        sap.firefly.ui.Log.logDebug("---->> Skipping factory for ".concat(type.getName(), ", due to missing control class!"));
      }
    } else {
      console.error("Missing UiType, cannot set factory...");
    }
  };

  sap.firefly.UiDriverModule.prototype.getName = function () {
    return "ff2210.ui.native";
  };

  sap.firefly.UiDriverModule.getInstance();
  return sap.firefly;
});