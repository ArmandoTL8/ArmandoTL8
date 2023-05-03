// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @fileOverview MenuAdapter for the ABAP platform.
 */

sap.ui.define([
    "sap/ushell/Config",
    "sap/base/Log",
    "sap/ushell/library"
], function (Config, Log, ushellLibrary) {
    "use strict";

    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
    * Constructs a new instance of the MenuAdapter for the ABAP
    * platform
    *
    * @constructor
    * @since 1.72.0
    *
    * @private
    */
    var MenuAdapter = function () {};

    /**
     * Returns whether the menu is enabled
     *
     * @returns {Promise<boolean>} True if the menu is enabled
     *
     * @since 1.72.0
     * @private
     */
    MenuAdapter.prototype.isMenuEnabled = function () {
        var bMenuEnabled = Config.last("/core/menu/enabled");
        var iAssignedSpacesCount = this._getAssignedSpaces().length;
        return Promise.resolve(bMenuEnabled && iAssignedSpacesCount > 0);
    };

    /**
     * Gets the menu entries for the spaces assigned to the user.
     * Handles the MyHomeSpace visibility.
     * @returns {Promise<MenuEntry[]>} The menu entries, @see sap.ushell.services.menu#MenuEntry
     *
     * @since 1.72.0
     * @private
     */
     MenuAdapter.prototype.getMenuEntries = function () {
        var bHomeAppEnabled = Config.last("/core/homeApp/enabled");
        var bMyHomeSpaceEnabled = Config.last("/core/spaces/myHome/enabled");
        var bMyHomeUserEnabled = Config.last("/core/spaces/myHome/userEnabled");
        var sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");

        var aMetatagMenu = this._getAssignedSpaces();

        // only remove myHomeSpace when myHome is enabled and user has disabled it
        // remove myHomeSpace when homeApp is enabled
        if ((bHomeAppEnabled && bMyHomeSpaceEnabled) || (bMyHomeSpaceEnabled && !bMyHomeUserEnabled)) {
            for (var i = 0; i < aMetatagMenu.length; i++) {
                if (aMetatagMenu[i].id === sMyHomeSpaceId) {
                    aMetatagMenu = aMetatagMenu.slice(1);
                    break;
                }
            }
        }
        var aMenuEntries = this._buildMenuEntries(aMetatagMenu);
        return Promise.resolve(aMenuEntries);
    };

    /**
     * Gets the menu entries for the spaces assigned to the user.
     * Handles the MyHomeSpace visibility.
     * Those menu items and their structure are used for the selection in bookmarking.
     * @returns {Promise<MenuEntry[]>} The menu entries, @see sap.ushell.services.menu#MenuEntry
     *
     * @since 1.104.0
     * @private
     */
     MenuAdapter.prototype.getContentNodeEntries = function () {
        var aMetatagMenu = this._getAssignedSpaces();
        this._removeMyHomeForContentNodes(aMetatagMenu);
        var aMenuEntries = this._buildMenuEntries(aMetatagMenu);
        return Promise.resolve(aMenuEntries);
    };

    /**
     * Gets the content nodes for the spaces assigned to the user.
     * Handles the MyHomeSpace visibility.
     * @returns {Promise<ContentNode[]>} The content nodes, @see sap.ushell.services.menu#ContentNode
     *
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype.getContentNodes = function () {
        var aMetatagMenu = this._getAssignedSpaces();
        this._removeMyHomeForContentNodes(aMetatagMenu);
        var aContentNodes = this._buildContentNodes(aMetatagMenu);
        return Promise.resolve(aContentNodes);
    };

    /**
     * Builds based on the metatags a menu which is accepted by the menu service
     * @param {object[]} aMetatagMenu The menu content from the metatags
     * @returns {MenuEntry[]} The menu structure required by the menu service, @see sap.ushell.services.menu#MenuEntry
     *
     * @private
     * @since 1.100.0
     */
     MenuAdapter.prototype._buildMenuEntries = function (aMetatagMenu) {
        // Create a 1st level menu entry for each user-assigned space
        // having 2nd level sub menu entries for its pages inside if needed

        var aMenuEntries = aMetatagMenu
            .filter(this._isSpaceNotEmpty.bind(null, "FLP menu"))
            .map(function (oSpace) {
                var oTopMenuEntry = {
                    title: oSpace.title || oSpace.id,
                    "help-id": "Space-" + oSpace.id,
                    description: oSpace.description,
                    icon: undefined,
                    type: "IBN",
                    target: {
                        semanticObject: "Launchpad",
                        action: "openFLPPage",
                        parameters: [
                            {
                                name: "spaceId",
                                value: oSpace.id
                            },
                            {
                                name: "pageId",
                                value: oSpace.pages[0].id
                            }
                        ],
                        innerAppRoute: undefined
                    },
                    menuEntries: []
                };

                var aSubMenuEntries = oSpace.pages.map(function (oPage) {
                    return {
                        title: oPage.title || oPage.id,
                        "help-id": "Page-" + oPage.id,
                        description: oPage.description,
                        icon: undefined,
                        type: "IBN",
                        target: {
                            semanticObject: "Launchpad",
                            action: "openFLPPage",
                            parameters: [
                                {
                                    name: "spaceId",
                                    value: oSpace.id
                                },
                                {
                                    name: "pageId",
                                    value: oPage.id
                                }
                            ],
                            innerAppRoute: undefined
                        },
                        menuEntries: []
                    };
                });

                if (aSubMenuEntries.length > 1) {
                    oTopMenuEntry.menuEntries = aSubMenuEntries;
                }

                return oTopMenuEntry;
            });

        return aMenuEntries;
    };

    /**
     * Builds content nodes based on the assigned spaces metatag data
     * @param {object[]} aMetatagMenu The assigned spaces and pages from the metatags
     * @returns {ContentNode[]} The content nodes required by the menu service, @see sap.ushell.services.menu#ContentNode
     *
     * @private
     * @since 1.105.0
     */
    MenuAdapter.prototype._buildContentNodes = function (aMetatagMenu) {
        var aContentNodes = aMetatagMenu
            .filter(this._isSpaceNotEmpty.bind(null, "content nodes"))
            .map(function (oSpace) {
                return {
                    id: oSpace.id,
                    label: oSpace.title || oSpace.id,
                    type: ContentNodeType.Space,
                    isContainer: false,
                    children: oSpace.pages.map(function (oPage) {
                        return {
                            id: oPage.id,
                            label: oPage.title || oPage.id,
                            type: ContentNodeType.Page,
                            isContainer: true
                        };
                    })
                };
            });

        return aContentNodes;
    };

    /**
     * Filter function that checks if a space is empty to filter it out. Also logs a warning message.
     * @param {string} sEntityName Name of the entity where the space is filtered out for the warning message
     * @param {object} oSpace The space to be filtered
     *
     * @returns {boolean} true = keep, false = remove
     *
     * @private
     * @since 1.105.0
     */
    MenuAdapter.prototype._isSpaceNotEmpty = function (sEntityName, oSpace) {
        if (!oSpace.pages || oSpace.pages.length === 0) {
            Log.warning("FLP space " + oSpace.id + " without page omitted in " + sEntityName + ".", "", "sap.ushell_abap.adapters.abap.MenuAdapter");
            return false;
        }
        return true;
    };

    /**
     * The backend adds the FLP MyHome space as first space if it is active in the FLP settings.
     * If the user has deactivated the FLP MyHome in the user settings, the space has to be removed again.
     * If the custom MyHome is active the home space is not removed.
     * @param {object[]} aMetatagMenu The assigned spaces and pages from the metatags
     *
     * @private
     * @since 1.105.0
     */
    MenuAdapter.prototype._removeMyHomeForContentNodes = function (aMetatagMenu) {
        var bHomeAppEnabled = Config.last("/core/homeApp/enabled");
        var bMyHomeSpaceEnabled = Config.last("/core/spaces/myHome/enabled");
        var bMyHomeUserEnabled = Config.last("/core/spaces/myHome/userEnabled");
        var sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");

        //always keep myHomeSpace when homeApp is enabled
        if (bHomeAppEnabled) {
            return;
        }

        // only remove myHomeSpace when myHome is enabled and user has disabled it
        if (bMyHomeSpaceEnabled && !bMyHomeUserEnabled) {
            // if the MyHome space is active it is always in the first position
            if (aMetatagMenu[0] && aMetatagMenu[0].id === sMyHomeSpaceId) {
                aMetatagMenu.shift();
            }
        }
    };

    /**
     * Gets the menu entries for the pages assigned to the user by querying the
     * content of the meta tag with the name' sap.ushell.assignedSpaces'.
     *
     * @returns {object[]} The assigned spaces from the 'sap.ushell.assignedSpaces' meta tag
     *
     * @since 1.73.0
     * @private
     */
    MenuAdapter.prototype._getAssignedSpaces = function () {
        var oMetatag = document.querySelector("meta[name='sap.ushell.assignedSpaces']");
        if (!oMetatag) {
            return [];
        }
        var aMetatagMenu = JSON.parse(oMetatag.getAttribute("content"));
        return aMetatagMenu;
    };

    return MenuAdapter;

}, true);
