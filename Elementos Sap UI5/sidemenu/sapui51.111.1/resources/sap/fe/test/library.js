/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library"], function (Core, _library) {
  "use strict";

  /**
   * Test library for SAP Fiori elements
   *
   * @namespace
   * @name sap.fe.test
   * @public
   */

  // library dependencies
  const thisLib = Core.initLibrary({
    name: "sap.fe.test",
    dependencies: ["sap.ui.core"],
    types: [],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    noLibraryCSS: true
  });
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0aGlzTGliIiwiQ29yZSIsImluaXRMaWJyYXJ5IiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5cbi8qKlxuICogVGVzdCBsaWJyYXJ5IGZvciBTQVAgRmlvcmkgZWxlbWVudHNcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUudGVzdFxuICogQHB1YmxpY1xuICovXG5cbi8vIGxpYnJhcnkgZGVwZW5kZW5jaWVzXG5jb25zdCB0aGlzTGliID0gQ29yZS5pbml0TGlicmFyeSh7XG5cdG5hbWU6IFwic2FwLmZlLnRlc3RcIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiXSxcblx0dHlwZXM6IFtdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdG5vTGlicmFyeUNTUzogdHJ1ZVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtFQUNBLE1BQU1BLE9BQU8sR0FBR0MsSUFBSSxDQUFDQyxXQUFXLENBQUM7SUFDaENDLElBQUksRUFBRSxhQUFhO0lBQ25CQyxZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7SUFDN0JDLEtBQUssRUFBRSxFQUFFO0lBQ1RDLFVBQVUsRUFBRSxFQUFFO0lBQ2RDLFFBQVEsRUFBRSxFQUFFO0lBQ1pDLFFBQVEsRUFBRSxFQUFFO0lBQ1o7SUFDQUMsT0FBTyxFQUFFLFlBQVk7SUFDckJDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQztFQUFDLE9BRVlWLE9BQU87QUFBQSJ9