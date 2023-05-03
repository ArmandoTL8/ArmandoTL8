/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  /**
   * @classdesc
   * Building block used to create a paginator control.
   *
   * Usage example:
   * <pre>
   * &lt;macro:Paginator /&gt;
   * </pre>
   * @class sap.fe.macros.Paginator
   * @hideconstructor
   * @public
   * @since 1.94.0
   */
  const Paginator = MacroMetadata.extend("sap.fe.macros.paginator.Paginator", {
    /**
     * Name of the building block control.
     */
    name: "Paginator",
    /**
     * Namespace of the building block control
     */
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.paginator.Paginator",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Defines the macro stereotype used in documentation.
       */
      stereotype: "xmlmacro",
      /**
       * Properties.
       */
      properties: {
        /**
         * The identifier of the Paginator control.
         */
        id: {
          type: "string",
          isPublic: true
        }
      }
    }
  });
  return Paginator;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdpbmF0b3IiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwicHJvcGVydGllcyIsImlkIiwidHlwZSIsImlzUHVibGljIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdpbmF0b3IubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2NcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIGEgcGFnaW5hdG9yIGNvbnRyb2wuXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86UGFnaW5hdG9yIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLlBhZ2luYXRvclxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTQuMFxuICovXG5jb25zdCBQYWdpbmF0b3IgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MucGFnaW5hdG9yLlBhZ2luYXRvclwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBidWlsZGluZyBibG9jayBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJQYWdpbmF0b3JcIixcblx0LyoqXG5cdCAqIE5hbWVzcGFjZSBvZiB0aGUgYnVpbGRpbmcgYmxvY2sgY29udHJvbFxuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZSBvZiB0aGUgbWFjcm8gKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIGZyYWdtZW50IGlzIGdlbmVyYXRlZCBmcm9tIG5hbWVzcGFjZSBhbmQgbmFtZVxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5wYWdpbmF0b3IuUGFnaW5hdG9yXCIsXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB0aGUgbWFjcm8gc3RlcmVvdHlwZSB1c2VkIGluIGRvY3VtZW50YXRpb24uXG5cdFx0ICovXG5cdFx0c3RlcmVvdHlwZTogXCJ4bWxtYWNyb1wiLFxuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgUGFnaW5hdG9yIGNvbnRyb2wuXG5cdFx0XHQgKi9cblx0XHRcdGlkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcbmV4cG9ydCBkZWZhdWx0IFBhZ2luYXRvcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsU0FBUyxHQUFHQyxhQUFhLENBQUNDLE1BQU0sQ0FBQyxtQ0FBbUMsRUFBRTtJQUMzRTtBQUNEO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLFdBQVc7SUFDakI7QUFDRDtBQUNBO0lBQ0NDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLGVBQWUsRUFBRSxlQUFlO0lBQ2hDO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUUsbUNBQW1DO0lBQzdDO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUU7TUFDVDtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLFVBQVU7TUFDdEI7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRTtRQUNYO0FBQ0g7QUFDQTtRQUNHQyxFQUFFLEVBQUU7VUFDSEMsSUFBSSxFQUFFLFFBQVE7VUFDZEMsUUFBUSxFQUFFO1FBQ1g7TUFDRDtJQUNEO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FDWVosU0FBUztBQUFBIn0=