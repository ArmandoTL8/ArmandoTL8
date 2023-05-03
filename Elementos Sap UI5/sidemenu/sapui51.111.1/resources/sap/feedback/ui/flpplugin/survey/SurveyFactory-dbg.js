/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["./ValidationHandler", "./Balancer", "./PresentationController", "../config/CentralConfig", "../config/ConfigurationLoader"],
	function (ValidationHandler, Balancer, PresentationController, CentralConfig, ConfigurationLoader) {
		"use strict";

		return {
			/**
			 * Return the instance of Balancer.
			 * @returns {sap.feedback.ui.flpplugin.survey.Balancer} Balancer's Instance
			 */
			createBalancer: function () {
				return new Balancer();
			},

			/**
			 * Return the instance of CentralConfig.
			 * @returns {sap.feedback.ui.flpplugin.config.CentralConfig} CentralConfig's Instance.
			 */
			createCentralConfiguration: function () {
				return new CentralConfig();
			},

			/**
			 * Return the instance of PresentationController.
			 * @returns {sap.feedback.ui.flpplugin.survey.PresentationController} PresentationController's Instance.
			 */
			createPresentationController: function () {
				return new PresentationController();
			},

			/**
			 * Return the instance of ValidationHandler.
			 * @returns {sap.feedback.ui.flpplugin.survey.ValidationHandler} ValidationHandler's Instance.
			 */
			createValidationHandler: function () {
				return new ValidationHandler();
			},

			/**
			 * Return the instance of ConfigurationLoader.
			 * @returns {sap.feedback.ui.flpplugin.config.ConfigurationLoader} ConfigurationLoader's Instance.
			 */
			createConfigurationLoader: function () {
				return new ConfigurationLoader();
			}
		};
	}
);
