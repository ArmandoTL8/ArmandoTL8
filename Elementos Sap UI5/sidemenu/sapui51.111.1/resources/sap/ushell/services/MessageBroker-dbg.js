// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @fileOverview This module exposes API enpoints for Generic Communication
 * @version 1.111.1
 */
sap.ui.define([
    "sap/ushell/services/_MessageBroker/MessageBrokerEngine"
], function (MessageBrokerEngine) {
    "use strict";

    /**
     * This constructor MUST be called DIRECTLY only by the Unified Shell Container entities, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("MessageBroker").then(function (MessageBroker) {});</code>.
     * Constructs a new instance of the message broker service.
     *
     * @namespace sap.ushell.services.MessageBroker
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.72.0
     *
     * @private
     */

    var MessageBroker = function () {};

    /**
     * This is an api for Shell Container UI5 clients.
     *
     * @param {string} sClientId client id.
     * @param {array} aSubscribedChannels array of channel-objects.
     * @param {object} data additional data.
     * @param {function} fnMessageCallback callback function returns promise.
     * @param {function} fnClientConnectionCallback callback function returns promise.
     * @returns {Promise} Promise result.
     *
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.subscribe = function (
        sClientId,
        aSubscribedChannels,
        data,
        fnMessageCallback,
        fnClientConnectionCallback
    ) {
        return MessageBrokerEngine.subscribe(
            sClientId,
            aSubscribedChannels,
            data,
            fnMessageCallback,
            fnClientConnectionCallback
        );
    };

    /**
     * This is an api for Shell Container UI5 clients.
     *
     * @param {string} sClientId client ID.
     * @returns {Promise} Promise result.
     *
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.unsubscribe = function (sClientId) {
        return MessageBrokerEngine.unsubscribe(sClientId);
    };

    /**
     * This is an api for Shell Container UI5 clients.
     *
     * @param {string} sChannelId channel Id.
     * @param {string} sClientId client Id.
     * @param {string} sMessageId message Id.
     * @param {string} sMessageName message name.
     * @param {array} aTargetClientIds array of target clients Ids.
     * @param {object} data additional data.
     * @returns {Promise} Promise result.
     *
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.publish = function (
        sChannelId,
        sClientId,
        sMessageId,
        sMessageName,
        aTargetClientIds,
        data
    ) {
        return MessageBrokerEngine.publish(
            sChannelId,
            sClientId,
            sMessageId,
            sMessageName,
            aTargetClientIds,
            data);
    };

    /**
     * This is an api for Shell Container UI5 clients.
     *
     * @param {string} sOrigin iframe src.
     *
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.addAcceptedOrigin = function (sOrigin) {
        MessageBrokerEngine.addAcceptedOrigin(sOrigin);
    };

    /**
     * This is an api for Shell Container UI5 clients.
     *
     * @param {string} sOrigin iframe src.
     *
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.removeAcceptedOrigin = function (sOrigin) {
        MessageBrokerEngine.removeAcceptedOrigin(sOrigin);
    };

    /**
     * This is an api for Shell Container UI5 clients.
     * @returns {Promise} Promise result.
     * @since 1.110.0
     * @private
     */

    MessageBroker.prototype.getAcceptedOrigins = function () {
        return MessageBrokerEngine.getAcceptedOrigins();
    };

    MessageBroker.hasNoAdapter = true;
    return MessageBroker;
}, false);
