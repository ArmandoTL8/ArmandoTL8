// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @fileOverview This module contains API call processing logic
 * @version 1.111.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ushell/components/applicationIntegration/application/Application"
], function (Log, deepExtend, Application) {
    "use strict";

    var oAcceptedOrigins = {},
        oClientsPerChannel = {},
        oActiveClients = {};

    var MessageBrokerEngine = function () {

        /**
         * This method maps PostMessage to API
         *
         * @param {object} oPostMessageData The PostMessage object.
         *
         * @since 1.110.0
         * @private
         */

        this.processPostMessage = function (oPostMessageData) {

            return new Promise(function (resolve, reject) {

                var oMessageData = oPostMessageData.oMessageData,
                    oMessageDataBody = oMessageData.body,
                    oMessage = oPostMessageData.oMessage,
                    sOrigin = oMessage.origin,
                    oIframe = oMessage.source;

                oMessageDataBody.requestId = oMessageData.request_id;

                if (!oIframe) {
                    Log.error("Missing iframe object");
                    return reject("Missing iframe object");
                }

                this._handlePostMessageRequest(oMessageDataBody, oIframe, sOrigin)
                    .then(function (oResponse) {
                        return resolve(oResponse);
                    })
                    .catch(function (sError) {
                        return reject(sError);
                    });
            }.bind(this));
        };

        /**
         *
         * @param {string} sClientId client id.
         * @param {array} aSubscribedChannels array of channel-objects.
         * @param {object} data additional data.
         * @param {function} fnMessageCallback callback function returns promise.
         * @param {function} fnClientConnectionCallback callback function returns promise.
         * @param {object} oIframe iframe object if embedded client.
         * @param {string} sOrigin iframe origin if embedded client.
         * @returns {Promise} the result.
         *
         * @since 1.110.0
         * @private
         */

        this.subscribe = function (
            sClientId,
            aSubscribedChannels,
            data,
            fnMessageCallback,
            fnClientConnectionCallback,
            oIframe,
            sOrigin
        ) {

            return new Promise(function (resolve, reject) {

                // in case connect request received twice
                if (oActiveClients[sClientId]) {
                    Log.error("MessageBroker.subscribe: attempt to subscribe twice");
                    return reject("Client already subscribed");
                }

                if (!sClientId || !aSubscribedChannels.length ||
                    (typeof oIframe !== "object" &&
                        (typeof fnMessageCallback !== "function" ||
                            typeof fnClientConnectionCallback !== "function"))
                ) {
                    Log.error("MessageBroker.subscribe: Missing required parameter(s)");
                    return reject("Missing required parameter(s)");
                }

                for (var sChannelKey in aSubscribedChannels) {

                    var oChannel = aSubscribedChannels[sChannelKey];

                    // add new client to the channel
                    var oFullClientData = {
                        clientId: sClientId,
                        subscribedChannels: aSubscribedChannels,
                        data: data,
                        messageCallback: fnMessageCallback,
                        clientConnectionCallback: fnClientConnectionCallback,
                        iframe: oIframe || {},
                        origin: sOrigin || "",
                        isUI5: !oIframe && !sOrigin
                    };

                    if (!oClientsPerChannel[oChannel.channelId]) {
                        oClientsPerChannel[oChannel.channelId] = [];
                    }

                    oClientsPerChannel[oChannel.channelId].push(oFullClientData);
                }

                var oActiveClientData = {
                    clientId: sClientId,
                    subscribedChannels: aSubscribedChannels
                };

                var aConnectedClients = Object.values(oActiveClients);
                oActiveClients[sClientId] = oActiveClientData;

                // notify other connected clients
                if (Object.keys(oActiveClients).length > 1) {
                    this._emitEvent("clientConnected", sClientId, aSubscribedChannels, data);
                }

                return resolve(aConnectedClients);
            }.bind(this));
        };

        /**
         *
         * @param {string} sClientId client id.
         * @returns {Promise} the resolve or error.
         *
         * @since 1.110.0
         * @private
         */

        this.unsubscribe = function (sClientId) {

            return new Promise(function (resolve, reject) {

                var aSubscribedChannels = [];

                if (!sClientId) {
                    Log.error("MessageBroker.unsubscribe: Missing required parameter sClientId");
                    return reject("MessageBroker.unsubscribe: Missing required parameter sClientId");
                }

                // in case disconnect request received twice
                if (!oActiveClients[sClientId]) {
                    Log.error("MessageBroker.unsubscribe: attempt to unsubscribe twice");
                    return reject("Client already unsubscribed");
                }

                delete oActiveClients[sClientId];

                for (var sChannelKey in oClientsPerChannel) {

                    var aChannelClients = oClientsPerChannel[sChannelKey];
                    // find client and remove from the channel
                    for (var oClientKey in aChannelClients) {

                        var oClient = aChannelClients[oClientKey];

                        if (oClient.clientId === sClientId) {

                            aSubscribedChannels = oClient.subscribedChannels;
                            aChannelClients.splice(oClientKey, 1);
                            break;
                        }
                    }
                }

                this._emitEvent( "clientDisconnected", sClientId, aSubscribedChannels, {});
                return resolve();
            }.bind(this));
        };

        /**
         *
         * @param {string} sChannelId channel id.
         * @param {string} sClientId client id.
         * @param {string} sMessageId request id for embedded clients or message id for UI5 clients.
         * @param {string} sMessageName message name.
         * @param {array} aTargetClientIds array of target clients Ids.
         * @param {object} data additional data.
         *
         * @since 1.110.0
         * @private
         */

        this.publish = function (sChannelId, sClientId, sMessageId, sMessageName, aTargetClientIds, data) {

            return new Promise(function (resolve, reject) {

                var sError;

                // if channel does not exist
                if (!oClientsPerChannel[sChannelId]) {
                    sError = "Unknown channel Id: " + sChannelId;
                    Log.error(sError);
                    return reject(sError);
                }

                var aTargetClients = [];

                for (var sClientKey in aTargetClientIds) {


                    var sTargetClientId = aTargetClientIds[sClientKey];

                    // check if message is for all clients in the channel
                    if (sTargetClientId === "*") {
                        aTargetClients = oClientsPerChannel[sChannelId].concat();
                        break;
                    } else {
                        // check if target client exists
                        var oTargetClient = oClientsPerChannel[sChannelId].find(function (oClient) {
                            return oClient.clientId === sTargetClientId;
                        });

                        if (oTargetClient) {
                            aTargetClients.push(this._deepCopy(oTargetClient));
                        }
                    }
                }

                if (aTargetClients.length) {
                    this._sendMessage("request", aTargetClients, sChannelId, sMessageId, sMessageName, sClientId, data)
                        .then(function (oResponse) {
                            return resolve(oResponse);
                        })
                        .catch(function (sErrorMsg) {
                            return reject(sErrorMsg);
                        });
                } else {
                    sError = "Target client(s) not found in the provided channel";
                    Log.error(sError);
                    return reject(sError);
                }
            }.bind(this));
        };

        /**
         *
         * @param {string} sOrigin iframe origin.
         *
         * @since 1.110.0
         * @private
         */

        this.addAcceptedOrigin = function (sOrigin) {

            if (sOrigin) {
                oAcceptedOrigins[sOrigin] = true;
            } else {
                Log.error("MessageBroker.addAcceptedOrigin: Missing required parameter sOrigin");
            }
        };

        /**
         *
         * @param {string} sOrigin iframe origin.
         *
         * @since 1.110.0
         * @private
         */

        this.removeAcceptedOrigin = function (sOrigin) {
            delete oAcceptedOrigins[sOrigin];
        };

        /**
         *
         * @returns {promise} the result.
         *
         * @since 1.110.0
         * @private
         */

        this.getAcceptedOrigins = function () {
            return Promise.resolve(Object.keys(oAcceptedOrigins));
        };

        /**
         * This function is for testing the state of oActiveClients in qunit
         *
         * @returns {object} the result.
         *
         * @since 1.110.0
         * @private
         */

        this.getConnectedClients = function () {
            return this._deepCopy(oClientsPerChannel);
        };

        /**
         * This function notifies clients of various events in a channel
         *
         * @param {string} sMessageName message name.
         * @param {string} sClientId client id.
         * @param {array} aSubscribedChannels subscribed channels of the client.
         * @param {object} data additional data.
         *
         * @since 1.110.0
         * @private
         */

        this._emitEvent = function (sMessageName, sClientId, aSubscribedChannels, data) {

            var oNotifiedClients = {};

            for (var sChannelKey in oClientsPerChannel) {

                var oChannel = oClientsPerChannel[sChannelKey];

                for (var sClientKey in oChannel) {

                    var oClient = oChannel[sClientKey];
                    // do not notify the same client who initiated the event
                    if (oClient.clientId !== sClientId && !oNotifiedClients[oClient.clientId]) {
                        if (oClient.isUI5 !== false) {
                            oClient.clientConnectionCallback(sMessageName, sClientId, aSubscribedChannels, data);
                        } else {
                            var oParams = {
                                    clientId: sClientId,
                                    channelId: "sap.ushell.MessageBroker",
                                    messageName: sMessageName,
                                    subscribedChannels: aSubscribedChannels,
                                    data: data
                                },
                                oMessageBody = this._buildPostMessageObject("event", oParams);
                            this._sendPostMessageToClient(oMessageBody, oClient.iframe, oClient.origin, false);
                        }

                        oNotifiedClients[oClient.clientId] = true;
                    }
                }
            }
        };

        /**
         * This function sends message to UI5 client and awaits for reply
         *
         * @param {object} oClient target client object.
         * @param {string} sClientId client id.
         * @param {string} sChannelId channel id.
         * @param {string} sMessageId request id for embedded clients or message id for UI5 clients.
         * @param {string} sMessageName message name.
         * @param {object} data additional data.
         * @returns {Promise} Promise result.
         *
         * @since 1.110.0
         * @private
         */


        this._sendMessageToUI5Client = function(oClient, sClientId, sChannelId, sMessageId, sMessageName, data) {

            return new Promise(function (resolve, reject) {
                oClient.messageCallback(sClientId, sChannelId, sMessageName, data)
                    .then(function (oResponse) {
                        if (oResponse) {
                            var oRequestingClient = oClientsPerChannel[sChannelId].find(function (oStoredClient) {
                                    return oStoredClient.clientId === sClientId;
                                }),
                                oRequestingClientClone = this._deepCopy(oRequestingClient);

                            // send data back to client who requested it
                            if (oRequestingClientClone.isUI5 !== false) {
                                oRequestingClientClone.messageCallback(oClient.clientId, sChannelId, sMessageName, oResponse, sMessageId);
                            } else {
                                var oParams = {
                                        clientId: oClient.clientId,
                                        channelId: sChannelId,
                                        messageName: sMessageName,
                                        subscribedChannels: oClient.subscribedChannels,
                                        data: oResponse,
                                        requestId: sMessageId
                                    },
                                    oMessageBody = this._buildPostMessageObject("response", oParams);
                                // send data back to client who requested it
                                this._sendPostMessageToClient(oMessageBody, oRequestingClientClone.iframe, oRequestingClientClone.origin, false);
                            }
                        }

                        return resolve();
                    }.bind(this))
                    .catch(function (sError) {
                        return reject(sError);
                    });
            }.bind(this));
        };

        /**
         * This function sends message to embedded client and awaits for reply
         *
         * @param {string} sActionType request/response.
         * @param {object} oClient target client object.
         * @param {object} oParams post message parameters.
         * @returns {Promise} Promise result.
         *
         * @since 1.110.0
         * @private
         */


        this._sendMessageToEmbeddedClient = function(sActionType, oClient, oParams) {

            return new Promise(function (resolve, reject) {

                var oMessageBody = this._buildPostMessageObject(sActionType, oParams);

                this._sendPostMessageToClient(oMessageBody, oClient.iframe, oClient.origin, true)
                    .then(function (oResponse) {
                        if (oResponse) {
                            var oRequestingClient = oClientsPerChannel[oParams.channelId].find(function (oStoredClient) {
                                    return oStoredClient.clientId === oParams.clientId;
                                }),
                                oRequestingClientClone = this._deepCopy(oRequestingClient);

                            // send data back to client who requested it
                            if (oRequestingClientClone.isUI5 !== false) {
                                oRequestingClientClone.messageCallback(oClient.clientId, oParams.channelId, oParams.messageName, oResponse.body, oParams.requestId);
                            } else {
                                oResponse.request_id = oResponse.correlationMessageId = oParams.requestId;
                                this._sendPostMessageToClient(oResponse, oRequestingClientClone.iframe, oRequestingClientClone.origin, false);
                            }
                        }

                        return resolve();
                    }.bind(this))
                    .catch(function (sError) {
                        return reject(sError);
                    });
            }.bind(this));
        };

        /**
         * This function sends message to client(s)
         *
         * @param {string} sActionType action type (response/request).
         * @param {array} aTargetClients target clients.
         * @param {string} sChannelId channel id.
         * @param {string} sMessageId request id for embedded clients or message id for UI5 clients.
         * @param {string} sMessageName message name.
         * @param {string} sClientId client id.
         * @param {object} data additional data.
         * @returns {Promise} Promise result.
         *
         * @since 1.110.0
         * @private
         */

        this._sendMessage = function (sActionType, aTargetClients, sChannelId, sMessageId, sMessageName, sClientId, data) {

            return new Promise(function (resolve, reject) {

                if (!aTargetClients.length) {
                    return resolve(aTargetClients);
                }

                for (var sClientKey in aTargetClients) {

                    var oClient = aTargetClients[sClientKey];

                    // do not send message to the same client who requested to send it
                    if (oClient.clientId !== sClientId) {
                        if (oClient.isUI5 !== false) {

                            this._sendMessageToUI5Client(oClient, sClientId, sChannelId, sMessageId, sMessageName, data)
                                .then(function (oResponse) {
                                    return resolve(oResponse);
                                })
                                .catch(function (sError) {
                                    return reject(sError);
                                });
                        } else {
                            var oParams = {
                                clientId: sClientId,
                                channelId: sChannelId,
                                messageName: sMessageName,
                                requestId: sMessageId,
                                data: data
                            };

                            this._sendMessageToEmbeddedClient(sActionType, oClient, oParams)
                                .then(function (oResponse) {
                                    return resolve(oResponse);
                                })
                                .catch(function (sError) {
                                    return reject(sError);
                                });
                        }
                    }
                }
            }.bind(this));
        };

        /**
         *
         * @param {string} sEndpoint api method name.
         * @param {array} aParams api parameters.
         * @returns {Promise} Promise result.
         *
         * @since 1.110.0
         * @private
         */

        this._callApi = function (sEndpoint, aParams) {
            return this[sEndpoint].apply(this, aParams);
        };

        /**
         * @param {object} oMessageDataBody message object.
         * @param {object} oIframe The iFrame object.
         * @param {string} sOrigin iframe origin.
         * @returns {Promise} Promise result.
         *
         * @since 1.110.0
         * @private
         */

        this._handlePostMessageRequest = function (oMessageDataBody, oIframe, sOrigin) {

            return new Promise(function (resolve, reject) {

                var sEndpoint,
                    sStatus = "accepted",
                    bPostMsgResponse = false,
                    sClientId = oMessageDataBody.clientId,
                    sChannelId = oMessageDataBody.channelId,
                    sRequestId = oMessageDataBody.requestId,
                    sMessageName = oMessageDataBody.messageName,
                    aSubscribedChannels = oMessageDataBody.subscribedChannels,
                    aTargetClientIds = oMessageDataBody.targetClientIds || [],
                    data = oMessageDataBody.data;

                var oEndpointParams = {
                    subscribe: [
                        sClientId,
                        aSubscribedChannels,
                        data,
                        null,
                        null,
                        oIframe,
                        sOrigin
                    ],
                    unsubscribe: [
                        sClientId
                    ],
                    publish: [
                        sChannelId,
                        sClientId,
                        sRequestId,
                        sMessageName,
                        aTargetClientIds,
                        data
                    ]
                };

                var oPostMessageParams = {
                        channelId: sChannelId,
                        clientId: sClientId,
                        messageName: sMessageName,
                        data: data,
                        requestId: sRequestId
                    },
                    oResponseObject = this._buildPostMessageObject("response", oPostMessageParams);

                switch (sMessageName) {
                    case "connect":
                        sEndpoint = "subscribe";
                        bPostMsgResponse = true;
                        break;
                    case "disconnect":
                        sEndpoint = "unsubscribe";
                        bPostMsgResponse = true;
                        break;
                    default:
                        sEndpoint = "publish";
                        break;
                }

                this._callApi(sEndpoint, oEndpointParams[sEndpoint])
                    .then(function (oResponse) {
                        if (Array.isArray(oResponse)) {
                            oResponseObject.body.activeClients = oResponse.concat();
                        }
                        return resolve({ _noresponse_: true });
                    })
                    .catch(function (sError) {
                        // do not send post message, only reject promise
                        bPostMsgResponse = false;
                        return reject(sError);
                    })
                    .finally(function () {
                        if (bPostMsgResponse) {
                            if (sStatus) {
                                oResponseObject.body.status = sStatus;
                            }
                            this._sendPostMessageToClient(oResponseObject, oIframe, sOrigin, false);
                        }
                    }.bind(this));
            }.bind(this));
        };

        /**
         * @param {object} oMessageDataBody message body.
         * @param {object} oIframe The iFrame object.
         * @param {string} sTargetDomain target domain.
         *
         * @since 1.110.0
         * @private
         */

        this._sendPostMessageToClient = function (oMessageDataBody, oIframe, sTargetDomain, bWaitForResponse) {
            return Application.postMessageToIframeObject(oMessageDataBody, oIframe, sTargetDomain, bWaitForResponse);
        };

        /**
         * This function builds post message object
         *
         * @param {string} sType object type.
         * @param {object} oParams object properties.
         * @returns {function} relevant function to call.
         *
         * @since 1.110.0
         * @private
         */

        this._buildPostMessageObject = function (sObjectType, oParams) {

            var sServiceName = "sap.ushell.services.MessageBroker",
                oMessageBody = {
                    request: {
                        channelId: oParams.channelId,
                        clientId: oParams.clientId,
                        messageName: oParams.messageName,
                        data: oParams.data
                    },
                    response: {
                        channelId: oParams.channelId,
                        clientId: oParams.clientId,
                        correlationMessageId: oParams.requestId,
                        messageName: oParams.messageName,
                        data: oParams.data
                    },
                    event: {
                        channelId: oParams.channelId,
                        clientId: oParams.clientId,
                        messageName: oParams.messageName,
                        subscribedChannels: oParams.subscribedChannels,
                        data: oParams.data
                    }
                };

            var oObjectParams = {
                request: [
                    sServiceName,
                    oMessageBody.request
                ],
                response: [
                    sServiceName,
                    oParams.requestId,
                    oMessageBody.response,
                    true
                ],
                event: [
                    sServiceName,
                    oMessageBody.event
                ]
            };

            if (oParams.activeClients) {
                oMessageBody[sObjectType].activeClients = oParams.activeClients;
            }

            var sMethod = this._buildFunctionName("createPostMessage", sObjectType === "response" ? sObjectType : "request");
            return Application[sMethod].apply(this, oObjectParams[sObjectType]);
        };

        /**
         * This function builds function name dynamically
         *
         * @param {string} sPrefix function name prefix.
         * @param {string} sType function type.
         * @returns {string} function name to call.
         *
         * @since 1.110.0
         * @private
         */

        this._buildFunctionName = function (sPrefix, sType) {
            sType = sType.charAt(0).toUpperCase() + sType.substring(1);
            return sPrefix + sType;
        };

        /**
         * Deep copy
         *
         * @param {object} oEntity.
         * @returns {object} deep copy.
         *
         * @since 1.110.0
         * @private
         */

        this._deepCopy = function (oEntity) {
            return deepExtend(oEntity);
        };
    };

    return new MessageBrokerEngine();
}, false);
