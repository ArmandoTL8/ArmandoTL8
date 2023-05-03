/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/hash", "sap/ui/core/cache/CacheManager", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (hash, CacheManager, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function getMetadataETag(sUrl, sETag, mUpdatedMetaModelETags) {
    return new Promise(function (resolve) {
      // There is an Url in the FE cache, that's not in the MetaModel yet -> we need to check the ETag
      jQuery.ajax(sUrl, {
        method: "GET"
      }).done(function (oResponse, sTextStatus, jqXHR) {
        // ETag is not the same -> invalid
        // ETag is the same -> valid
        // If ETag is available use it, otherwise use Last-Modified
        mUpdatedMetaModelETags[sUrl] = jqXHR.getResponseHeader("ETag") || jqXHR.getResponseHeader("Last-Modified");
        resolve(sETag === mUpdatedMetaModelETags[sUrl]);
      }).fail(function () {
        // Case 2z - Make sure we update the map so that we invalidate the cache
        mUpdatedMetaModelETags[sUrl] = "";
        resolve(false);
      });
    });
  }
  let CacheHandlerService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(CacheHandlerService, _Service);
    function CacheHandlerService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.CacheHandlerService = CacheHandlerService;
    var _proto = CacheHandlerService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      this.oFactory = oContext.factory;
      const mSettings = oContext.settings;
      if (!mSettings.metaModel) {
        throw new Error("a `metaModel` property is expected when instantiating the CacheHandlerService");
      }
      this.oMetaModel = mSettings.metaModel;
      this.oAppComponent = mSettings.appComponent;
      this.oComponent = mSettings.component;
      this.initPromise = this.oMetaModel.fetchEntityContainer().then(() => {
        return this;
      });
      this.mCacheNeedsInvalidate = {};
    };
    _proto.exit = function exit() {
      // Deregister global instance
      this.oFactory.removeGlobalInstance(this.oMetaModel);
    };
    _proto.validateCacheKey = async function validateCacheKey(sCacheIdentifier, oComponent) {
      // Keep track if the cache will anyway need to be updated
      let bCacheNeedUpdate = true;
      let sCacheKey;
      try {
        const mCacheOutput = await CacheManager.get(sCacheIdentifier);
        // We provide a default key so that an xml view cache is written
        const mMetaModelETags = this.getETags(oComponent);
        sCacheKey = JSON.stringify(mMetaModelETags);
        // Case #1a - No cache, so mCacheOuput is empty, cacheKey = current metamodel ETags
        if (mCacheOutput) {
          // Case #2 - Cache entry found, check if it's still valid
          const mUpdatedMetaModelETags = {};
          const mCachedETags = JSON.parse(mCacheOutput.cachedETags);
          const aValidETags = await Promise.all(Object.keys(mCachedETags).map(function (sUrl) {
            // Check validity of every single Url that's in the FE Cache object
            if (mCachedETags[sUrl]) {
              if (mMetaModelETags[sUrl]) {
                // Case #2a - Same number of ETags in the cache and in the metadata
                mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
                return mCachedETags[sUrl] === mMetaModelETags[sUrl];
              } else {
                // Case #2b - No ETag in the cache for that URL, cachedETags was enhanced
                return getMetadataETag(sUrl, mCachedETags[sUrl], mUpdatedMetaModelETags);
              }
            } else {
              // Case #2z - Last Templating added an URL without ETag
              mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
              return mCachedETags[sUrl] === mMetaModelETags[sUrl];
            }
          }));
          bCacheNeedUpdate = aValidETags.indexOf(false) >= 0;
          // Case #2a - Same number of ETags and all valid -> we return the viewCacheKey
          // Case #2b - Different number of ETags and still all valid -> we return the viewCacheKey
          // Case #2c - Same number of ETags but different values, main service Etag has changed, use that as cache key
          // Case #2d - Different number of ETags but different value, main service Etag or linked service Etag has changed, new ETags should be used as cacheKey
          // Case #2z - Cache has an invalid Etag - if there is an Etag provided from MetaModel use it as cacheKey
          if (Object.keys(mUpdatedMetaModelETags).some(function (sUrl) {
            return !mUpdatedMetaModelETags[sUrl];
          })) {
            // At least one of the MetaModel URLs doesn't provide an ETag, so no caching
            sCacheKey = null;
          } else {
            sCacheKey = bCacheNeedUpdate ? JSON.stringify(mUpdatedMetaModelETags) : mCacheOutput.viewCacheKey;
          }
        } else if (Object.keys(mMetaModelETags).some(function (sUrl) {
          return !mMetaModelETags[sUrl];
        })) {
          // Check if cache can be used (all the metadata and annotations have to provide at least a ETag or a Last-Modified header)
          // Case #1-b - No Cache, mCacheOuput is empty, but metamodel etags cannot be used, so no caching
          bCacheNeedUpdate = true;
          sCacheKey = null;
        }
      } catch (e) {
        // Don't use view cache in case of issues with the LRU cache
        bCacheNeedUpdate = true;
        sCacheKey = null;
      }
      this.mCacheNeedsInvalidate[sCacheIdentifier] = bCacheNeedUpdate;
      return sCacheKey;
    };
    _proto.invalidateIfNeeded = function invalidateIfNeeded(sCacheKeys, sCacheIdentifier, oComponent) {
      // Check FE cache after XML view is processed completely
      const sDataSourceETags = JSON.stringify(this.getETags(oComponent));
      if (this.mCacheNeedsInvalidate[sCacheIdentifier] || sCacheKeys && sCacheKeys !== sDataSourceETags) {
        // Something in the sources and/or its ETags changed -> update the FE cache
        const mCacheKeys = {};
        // New ETags that need to be verified, may differ from the one used to generate the view
        mCacheKeys.cachedETags = sDataSourceETags;
        // Old ETags that are used for the xml view cache as key
        mCacheKeys.viewCacheKey = sCacheKeys;
        return CacheManager.set(sCacheIdentifier, mCacheKeys);
      } else {
        return Promise.resolve();
      }
    };
    _proto.getETags = function getETags(oComponent) {
      const mMetaModelETags = this.oMetaModel.getETags();
      // ETags from UI5 are either a Date or a string, let's rationalize that
      Object.keys(mMetaModelETags).forEach(function (sMetaModelKey) {
        if (mMetaModelETags[sMetaModelKey] instanceof Date) {
          // MetaModel contains a Last-Modified timestamp for the URL
          mMetaModelETags[sMetaModelKey] = mMetaModelETags[sMetaModelKey].toISOString();
        }
      });

      // add also the manifest hash as UI5 only considers the root component hash
      const oManifestContent = this.oAppComponent.getManifest();
      const sManifestHash = hash(JSON.stringify({
        sapApp: oManifestContent["sap.app"],
        viewData: oComponent.getViewData()
      }));
      mMetaModelETags["manifest"] = sManifestHash;
      return mMetaModelETags;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return CacheHandlerService;
  }(Service);
  _exports.CacheHandlerService = CacheHandlerService;
  let CacheHandlerServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(CacheHandlerServiceFactory, _ServiceFactory);
    function CacheHandlerServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstanceRegistry = {};
      return _this;
    }
    var _proto2 = CacheHandlerServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const sMetaModelId = oServiceContext.settings.metaModel.getId();
      let cacheHandlerInstance = this._oInstanceRegistry[sMetaModelId];
      if (!cacheHandlerInstance) {
        this._oInstanceRegistry[sMetaModelId] = cacheHandlerInstance = new CacheHandlerService(Object.assign({
          factory: this,
          scopeObject: null,
          scopeType: "service"
        }, oServiceContext));
      }
      return cacheHandlerInstance.initPromise.then(() => {
        return this._oInstanceRegistry[sMetaModelId];
      }).catch(e => {
        // In case of error delete the global instance;
        this._oInstanceRegistry[sMetaModelId] = null;
        throw e;
      });
    };
    _proto2.getInstance = function getInstance(oMetaModel) {
      return this._oInstanceRegistry[oMetaModel.getId()];
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance(oMetaModel) {
      this._oInstanceRegistry[oMetaModel.getId()] = null;
    };
    return CacheHandlerServiceFactory;
  }(ServiceFactory);
  return CacheHandlerServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZXRhZGF0YUVUYWciLCJzVXJsIiwic0VUYWciLCJtVXBkYXRlZE1ldGFNb2RlbEVUYWdzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJqUXVlcnkiLCJhamF4IiwibWV0aG9kIiwiZG9uZSIsIm9SZXNwb25zZSIsInNUZXh0U3RhdHVzIiwianFYSFIiLCJnZXRSZXNwb25zZUhlYWRlciIsImZhaWwiLCJDYWNoZUhhbmRsZXJTZXJ2aWNlIiwiaW5pdCIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9GYWN0b3J5IiwiZmFjdG9yeSIsIm1TZXR0aW5ncyIsInNldHRpbmdzIiwibWV0YU1vZGVsIiwiRXJyb3IiLCJvTWV0YU1vZGVsIiwib0FwcENvbXBvbmVudCIsImFwcENvbXBvbmVudCIsIm9Db21wb25lbnQiLCJjb21wb25lbnQiLCJpbml0UHJvbWlzZSIsImZldGNoRW50aXR5Q29udGFpbmVyIiwidGhlbiIsIm1DYWNoZU5lZWRzSW52YWxpZGF0ZSIsImV4aXQiLCJyZW1vdmVHbG9iYWxJbnN0YW5jZSIsInZhbGlkYXRlQ2FjaGVLZXkiLCJzQ2FjaGVJZGVudGlmaWVyIiwiYkNhY2hlTmVlZFVwZGF0ZSIsInNDYWNoZUtleSIsIm1DYWNoZU91dHB1dCIsIkNhY2hlTWFuYWdlciIsImdldCIsIm1NZXRhTW9kZWxFVGFncyIsImdldEVUYWdzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1DYWNoZWRFVGFncyIsInBhcnNlIiwiY2FjaGVkRVRhZ3MiLCJhVmFsaWRFVGFncyIsImFsbCIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJpbmRleE9mIiwic29tZSIsInZpZXdDYWNoZUtleSIsImUiLCJpbnZhbGlkYXRlSWZOZWVkZWQiLCJzQ2FjaGVLZXlzIiwic0RhdGFTb3VyY2VFVGFncyIsIm1DYWNoZUtleXMiLCJzZXQiLCJmb3JFYWNoIiwic01ldGFNb2RlbEtleSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsIm9NYW5pZmVzdENvbnRlbnQiLCJnZXRNYW5pZmVzdCIsInNNYW5pZmVzdEhhc2giLCJoYXNoIiwic2FwQXBwIiwidmlld0RhdGEiLCJnZXRWaWV3RGF0YSIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeSIsIl9vSW5zdGFuY2VSZWdpc3RyeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwic01ldGFNb2RlbElkIiwiZ2V0SWQiLCJjYWNoZUhhbmRsZXJJbnN0YW5jZSIsImFzc2lnbiIsInNjb3BlT2JqZWN0Iiwic2NvcGVUeXBlIiwiY2F0Y2giLCJnZXRJbnN0YW5jZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaGFzaCBmcm9tIFwic2FwL2Jhc2Uvc3RyaW5ncy9oYXNoXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENhY2hlTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvY2FjaGUvQ2FjaGVNYW5hZ2VyXCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuZnVuY3Rpb24gZ2V0TWV0YWRhdGFFVGFnKHNVcmw6IGFueSwgc0VUYWc6IGFueSwgbVVwZGF0ZWRNZXRhTW9kZWxFVGFnczogYW55KSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdC8vIFRoZXJlIGlzIGFuIFVybCBpbiB0aGUgRkUgY2FjaGUsIHRoYXQncyBub3QgaW4gdGhlIE1ldGFNb2RlbCB5ZXQgLT4gd2UgbmVlZCB0byBjaGVjayB0aGUgRVRhZ1xuXHRcdChqUXVlcnkgYXMgYW55KVxuXHRcdFx0LmFqYXgoc1VybCwgeyBtZXRob2Q6IFwiR0VUXCIgfSlcblx0XHRcdC5kb25lKGZ1bmN0aW9uIChvUmVzcG9uc2U6IGFueSwgc1RleHRTdGF0dXM6IGFueSwganFYSFI6IGFueSkge1xuXHRcdFx0XHQvLyBFVGFnIGlzIG5vdCB0aGUgc2FtZSAtPiBpbnZhbGlkXG5cdFx0XHRcdC8vIEVUYWcgaXMgdGhlIHNhbWUgLT4gdmFsaWRcblx0XHRcdFx0Ly8gSWYgRVRhZyBpcyBhdmFpbGFibGUgdXNlIGl0LCBvdGhlcndpc2UgdXNlIExhc3QtTW9kaWZpZWRcblx0XHRcdFx0bVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXSA9IGpxWEhSLmdldFJlc3BvbnNlSGVhZGVyKFwiRVRhZ1wiKSB8fCBqcVhIUi5nZXRSZXNwb25zZUhlYWRlcihcIkxhc3QtTW9kaWZpZWRcIik7XG5cdFx0XHRcdHJlc29sdmUoc0VUYWcgPT09IG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0pO1xuXHRcdFx0fSlcblx0XHRcdC5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gQ2FzZSAyeiAtIE1ha2Ugc3VyZSB3ZSB1cGRhdGUgdGhlIG1hcCBzbyB0aGF0IHdlIGludmFsaWRhdGUgdGhlIGNhY2hlXG5cdFx0XHRcdG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0gPSBcIlwiO1xuXHRcdFx0XHRyZXNvbHZlKGZhbHNlKTtcblx0XHRcdH0pO1xuXHR9KTtcbn1cbnR5cGUgQ2FjaGVIYW5kbGVyU2VydmljZVNldHRpbmdzID0ge1xuXHRtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsO1xufTtcblxuZXhwb3J0IGNsYXNzIENhY2hlSGFuZGxlclNlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlPENhY2hlSGFuZGxlclNlcnZpY2VTZXR0aW5ncz4ge1xuXHRyZXNvbHZlRm46IGFueTtcblx0cmVqZWN0Rm46IGFueTtcblx0aW5pdFByb21pc2UhOiBQcm9taXNlPGFueT47XG5cblx0b0ZhY3RvcnkhOiBDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeTtcblx0b01ldGFNb2RlbCE6IE9EYXRhTWV0YU1vZGVsO1xuXHRvQXBwQ29tcG9uZW50ITogQXBwQ29tcG9uZW50O1xuXHRvQ29tcG9uZW50ITogVUlDb21wb25lbnQ7XG5cdG1DYWNoZU5lZWRzSW52YWxpZGF0ZTogYW55O1xuXG5cdGluaXQoKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHR0aGlzLm9GYWN0b3J5ID0gb0NvbnRleHQuZmFjdG9yeTtcblx0XHRjb25zdCBtU2V0dGluZ3MgPSBvQ29udGV4dC5zZXR0aW5ncztcblx0XHRpZiAoIW1TZXR0aW5ncy5tZXRhTW9kZWwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImEgYG1ldGFNb2RlbGAgcHJvcGVydHkgaXMgZXhwZWN0ZWQgd2hlbiBpbnN0YW50aWF0aW5nIHRoZSBDYWNoZUhhbmRsZXJTZXJ2aWNlXCIpO1xuXHRcdH1cblx0XHR0aGlzLm9NZXRhTW9kZWwgPSBtU2V0dGluZ3MubWV0YU1vZGVsO1xuXHRcdHRoaXMub0FwcENvbXBvbmVudCA9IG1TZXR0aW5ncy5hcHBDb21wb25lbnQ7XG5cdFx0dGhpcy5vQ29tcG9uZW50ID0gbVNldHRpbmdzLmNvbXBvbmVudDtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gKHRoaXMub01ldGFNb2RlbCBhcyBhbnkpLmZldGNoRW50aXR5Q29udGFpbmVyKCkudGhlbigoKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9KTtcblx0XHR0aGlzLm1DYWNoZU5lZWRzSW52YWxpZGF0ZSA9IHt9O1xuXHR9XG5cdGV4aXQoKSB7XG5cdFx0Ly8gRGVyZWdpc3RlciBnbG9iYWwgaW5zdGFuY2Vcblx0XHR0aGlzLm9GYWN0b3J5LnJlbW92ZUdsb2JhbEluc3RhbmNlKHRoaXMub01ldGFNb2RlbCk7XG5cdH1cblx0YXN5bmMgdmFsaWRhdGVDYWNoZUtleShzQ2FjaGVJZGVudGlmaWVyOiBhbnksIG9Db21wb25lbnQ6IGFueSk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuXHRcdC8vIEtlZXAgdHJhY2sgaWYgdGhlIGNhY2hlIHdpbGwgYW55d2F5IG5lZWQgdG8gYmUgdXBkYXRlZFxuXHRcdGxldCBiQ2FjaGVOZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRsZXQgc0NhY2hlS2V5OiBzdHJpbmcgfCBudWxsO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1DYWNoZU91dHB1dCA9IGF3YWl0IENhY2hlTWFuYWdlci5nZXQoc0NhY2hlSWRlbnRpZmllcik7XG5cdFx0XHQvLyBXZSBwcm92aWRlIGEgZGVmYXVsdCBrZXkgc28gdGhhdCBhbiB4bWwgdmlldyBjYWNoZSBpcyB3cml0dGVuXG5cdFx0XHRjb25zdCBtTWV0YU1vZGVsRVRhZ3MgPSB0aGlzLmdldEVUYWdzKG9Db21wb25lbnQpO1xuXHRcdFx0c0NhY2hlS2V5ID0gSlNPTi5zdHJpbmdpZnkobU1ldGFNb2RlbEVUYWdzKTtcblx0XHRcdC8vIENhc2UgIzFhIC0gTm8gY2FjaGUsIHNvIG1DYWNoZU91cHV0IGlzIGVtcHR5LCBjYWNoZUtleSA9IGN1cnJlbnQgbWV0YW1vZGVsIEVUYWdzXG5cdFx0XHRpZiAobUNhY2hlT3V0cHV0KSB7XG5cdFx0XHRcdC8vIENhc2UgIzIgLSBDYWNoZSBlbnRyeSBmb3VuZCwgY2hlY2sgaWYgaXQncyBzdGlsbCB2YWxpZFxuXHRcdFx0XHRjb25zdCBtVXBkYXRlZE1ldGFNb2RlbEVUYWdzOiBhbnkgPSB7fTtcblx0XHRcdFx0Y29uc3QgbUNhY2hlZEVUYWdzID0gSlNPTi5wYXJzZShtQ2FjaGVPdXRwdXQuY2FjaGVkRVRhZ3MpO1xuXHRcdFx0XHRjb25zdCBhVmFsaWRFVGFncyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG1DYWNoZWRFVGFncykubWFwKGZ1bmN0aW9uIChzVXJsOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdC8vIENoZWNrIHZhbGlkaXR5IG9mIGV2ZXJ5IHNpbmdsZSBVcmwgdGhhdCdzIGluIHRoZSBGRSBDYWNoZSBvYmplY3Rcblx0XHRcdFx0XHRcdGlmIChtQ2FjaGVkRVRhZ3Nbc1VybF0pIHtcblx0XHRcdFx0XHRcdFx0aWYgKG1NZXRhTW9kZWxFVGFnc1tzVXJsXSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENhc2UgIzJhIC0gU2FtZSBudW1iZXIgb2YgRVRhZ3MgaW4gdGhlIGNhY2hlIGFuZCBpbiB0aGUgbWV0YWRhdGFcblx0XHRcdFx0XHRcdFx0XHRtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdID0gbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBtQ2FjaGVkRVRhZ3Nbc1VybF0gPT09IG1NZXRhTW9kZWxFVGFnc1tzVXJsXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlICMyYiAtIE5vIEVUYWcgaW4gdGhlIGNhY2hlIGZvciB0aGF0IFVSTCwgY2FjaGVkRVRhZ3Mgd2FzIGVuaGFuY2VkXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGdldE1ldGFkYXRhRVRhZyhzVXJsLCBtQ2FjaGVkRVRhZ3Nbc1VybF0sIG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3MpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBDYXNlICMyeiAtIExhc3QgVGVtcGxhdGluZyBhZGRlZCBhbiBVUkwgd2l0aG91dCBFVGFnXG5cdFx0XHRcdFx0XHRcdG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0gPSBtTWV0YU1vZGVsRVRhZ3Nbc1VybF07XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtQ2FjaGVkRVRhZ3Nbc1VybF0gPT09IG1NZXRhTW9kZWxFVGFnc1tzVXJsXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGJDYWNoZU5lZWRVcGRhdGUgPSBhVmFsaWRFVGFncy5pbmRleE9mKGZhbHNlKSA+PSAwO1xuXHRcdFx0XHQvLyBDYXNlICMyYSAtIFNhbWUgbnVtYmVyIG9mIEVUYWdzIGFuZCBhbGwgdmFsaWQgLT4gd2UgcmV0dXJuIHRoZSB2aWV3Q2FjaGVLZXlcblx0XHRcdFx0Ly8gQ2FzZSAjMmIgLSBEaWZmZXJlbnQgbnVtYmVyIG9mIEVUYWdzIGFuZCBzdGlsbCBhbGwgdmFsaWQgLT4gd2UgcmV0dXJuIHRoZSB2aWV3Q2FjaGVLZXlcblx0XHRcdFx0Ly8gQ2FzZSAjMmMgLSBTYW1lIG51bWJlciBvZiBFVGFncyBidXQgZGlmZmVyZW50IHZhbHVlcywgbWFpbiBzZXJ2aWNlIEV0YWcgaGFzIGNoYW5nZWQsIHVzZSB0aGF0IGFzIGNhY2hlIGtleVxuXHRcdFx0XHQvLyBDYXNlICMyZCAtIERpZmZlcmVudCBudW1iZXIgb2YgRVRhZ3MgYnV0IGRpZmZlcmVudCB2YWx1ZSwgbWFpbiBzZXJ2aWNlIEV0YWcgb3IgbGlua2VkIHNlcnZpY2UgRXRhZyBoYXMgY2hhbmdlZCwgbmV3IEVUYWdzIHNob3VsZCBiZSB1c2VkIGFzIGNhY2hlS2V5XG5cdFx0XHRcdC8vIENhc2UgIzJ6IC0gQ2FjaGUgaGFzIGFuIGludmFsaWQgRXRhZyAtIGlmIHRoZXJlIGlzIGFuIEV0YWcgcHJvdmlkZWQgZnJvbSBNZXRhTW9kZWwgdXNlIGl0IGFzIGNhY2hlS2V5XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhtVXBkYXRlZE1ldGFNb2RlbEVUYWdzKS5zb21lKGZ1bmN0aW9uIChzVXJsOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdHJldHVybiAhbVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHQvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIE1ldGFNb2RlbCBVUkxzIGRvZXNuJ3QgcHJvdmlkZSBhbiBFVGFnLCBzbyBubyBjYWNoaW5nXG5cdFx0XHRcdFx0c0NhY2hlS2V5ID0gbnVsbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzQ2FjaGVLZXkgPSBiQ2FjaGVOZWVkVXBkYXRlID8gSlNPTi5zdHJpbmdpZnkobVVwZGF0ZWRNZXRhTW9kZWxFVGFncykgOiBtQ2FjaGVPdXRwdXQudmlld0NhY2hlS2V5O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRPYmplY3Qua2V5cyhtTWV0YU1vZGVsRVRhZ3MpLnNvbWUoZnVuY3Rpb24gKHNVcmw6IHN0cmluZykge1xuXHRcdFx0XHRcdHJldHVybiAhbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHR9KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIENoZWNrIGlmIGNhY2hlIGNhbiBiZSB1c2VkIChhbGwgdGhlIG1ldGFkYXRhIGFuZCBhbm5vdGF0aW9ucyBoYXZlIHRvIHByb3ZpZGUgYXQgbGVhc3QgYSBFVGFnIG9yIGEgTGFzdC1Nb2RpZmllZCBoZWFkZXIpXG5cdFx0XHRcdC8vIENhc2UgIzEtYiAtIE5vIENhY2hlLCBtQ2FjaGVPdXB1dCBpcyBlbXB0eSwgYnV0IG1ldGFtb2RlbCBldGFncyBjYW5ub3QgYmUgdXNlZCwgc28gbm8gY2FjaGluZ1xuXHRcdFx0XHRiQ2FjaGVOZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdFx0c0NhY2hlS2V5ID0gbnVsbDtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvLyBEb24ndCB1c2UgdmlldyBjYWNoZSBpbiBjYXNlIG9mIGlzc3VlcyB3aXRoIHRoZSBMUlUgY2FjaGVcblx0XHRcdGJDYWNoZU5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0c0NhY2hlS2V5ID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLm1DYWNoZU5lZWRzSW52YWxpZGF0ZVtzQ2FjaGVJZGVudGlmaWVyXSA9IGJDYWNoZU5lZWRVcGRhdGU7XG5cdFx0cmV0dXJuIHNDYWNoZUtleTtcblx0fVxuXHRpbnZhbGlkYXRlSWZOZWVkZWQoc0NhY2hlS2V5czogc3RyaW5nLCBzQ2FjaGVJZGVudGlmaWVyOiBzdHJpbmcsIG9Db21wb25lbnQ6IGFueSkge1xuXHRcdC8vIENoZWNrIEZFIGNhY2hlIGFmdGVyIFhNTCB2aWV3IGlzIHByb2Nlc3NlZCBjb21wbGV0ZWx5XG5cdFx0Y29uc3Qgc0RhdGFTb3VyY2VFVGFncyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0RVRhZ3Mob0NvbXBvbmVudCkpO1xuXHRcdGlmICh0aGlzLm1DYWNoZU5lZWRzSW52YWxpZGF0ZVtzQ2FjaGVJZGVudGlmaWVyXSB8fCAoc0NhY2hlS2V5cyAmJiBzQ2FjaGVLZXlzICE9PSBzRGF0YVNvdXJjZUVUYWdzKSkge1xuXHRcdFx0Ly8gU29tZXRoaW5nIGluIHRoZSBzb3VyY2VzIGFuZC9vciBpdHMgRVRhZ3MgY2hhbmdlZCAtPiB1cGRhdGUgdGhlIEZFIGNhY2hlXG5cdFx0XHRjb25zdCBtQ2FjaGVLZXlzOiBhbnkgPSB7fTtcblx0XHRcdC8vIE5ldyBFVGFncyB0aGF0IG5lZWQgdG8gYmUgdmVyaWZpZWQsIG1heSBkaWZmZXIgZnJvbSB0aGUgb25lIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHZpZXdcblx0XHRcdG1DYWNoZUtleXMuY2FjaGVkRVRhZ3MgPSBzRGF0YVNvdXJjZUVUYWdzO1xuXHRcdFx0Ly8gT2xkIEVUYWdzIHRoYXQgYXJlIHVzZWQgZm9yIHRoZSB4bWwgdmlldyBjYWNoZSBhcyBrZXlcblx0XHRcdG1DYWNoZUtleXMudmlld0NhY2hlS2V5ID0gc0NhY2hlS2V5cztcblx0XHRcdHJldHVybiBDYWNoZU1hbmFnZXIuc2V0KHNDYWNoZUlkZW50aWZpZXIsIG1DYWNoZUtleXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cdGdldEVUYWdzKG9Db21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IG1NZXRhTW9kZWxFVGFncyA9ICh0aGlzLm9NZXRhTW9kZWwgYXMgYW55KS5nZXRFVGFncygpO1xuXHRcdC8vIEVUYWdzIGZyb20gVUk1IGFyZSBlaXRoZXIgYSBEYXRlIG9yIGEgc3RyaW5nLCBsZXQncyByYXRpb25hbGl6ZSB0aGF0XG5cdFx0T2JqZWN0LmtleXMobU1ldGFNb2RlbEVUYWdzKS5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YU1vZGVsS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChtTWV0YU1vZGVsRVRhZ3Nbc01ldGFNb2RlbEtleV0gaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdC8vIE1ldGFNb2RlbCBjb250YWlucyBhIExhc3QtTW9kaWZpZWQgdGltZXN0YW1wIGZvciB0aGUgVVJMXG5cdFx0XHRcdG1NZXRhTW9kZWxFVGFnc1tzTWV0YU1vZGVsS2V5XSA9IG1NZXRhTW9kZWxFVGFnc1tzTWV0YU1vZGVsS2V5XS50b0lTT1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gYWRkIGFsc28gdGhlIG1hbmlmZXN0IGhhc2ggYXMgVUk1IG9ubHkgY29uc2lkZXJzIHRoZSByb290IGNvbXBvbmVudCBoYXNoXG5cdFx0Y29uc3Qgb01hbmlmZXN0Q29udGVudDogYW55ID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCk7XG5cdFx0Y29uc3Qgc01hbmlmZXN0SGFzaCA9IGhhc2goXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdHNhcEFwcDogb01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0sXG5cdFx0XHRcdHZpZXdEYXRhOiBvQ29tcG9uZW50LmdldFZpZXdEYXRhKClcblx0XHRcdH0pXG5cdFx0KTtcblx0XHRtTWV0YU1vZGVsRVRhZ3NbXCJtYW5pZmVzdFwiXSA9IHNNYW5pZmVzdEhhc2g7XG5cdFx0cmV0dXJuIG1NZXRhTW9kZWxFVGFncztcblx0fVxuXHRnZXRJbnRlcmZhY2UoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5jbGFzcyBDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PENhY2hlSGFuZGxlclNlcnZpY2VTZXR0aW5ncz4ge1xuXHRfb0luc3RhbmNlUmVnaXN0cnk6IFJlY29yZDxzdHJpbmcsIENhY2hlSGFuZGxlclNlcnZpY2UgfCBudWxsPiA9IHt9O1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PENhY2hlSGFuZGxlclNlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBzTWV0YU1vZGVsSWQgPSBvU2VydmljZUNvbnRleHQuc2V0dGluZ3MubWV0YU1vZGVsLmdldElkKCk7XG5cdFx0bGV0IGNhY2hlSGFuZGxlckluc3RhbmNlID0gdGhpcy5fb0luc3RhbmNlUmVnaXN0cnlbc01ldGFNb2RlbElkXTtcblx0XHRpZiAoIWNhY2hlSGFuZGxlckluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeVtzTWV0YU1vZGVsSWRdID0gY2FjaGVIYW5kbGVySW5zdGFuY2UgPSBuZXcgQ2FjaGVIYW5kbGVyU2VydmljZShcblx0XHRcdFx0T2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRmYWN0b3J5OiB0aGlzLFxuXHRcdFx0XHRcdFx0c2NvcGVPYmplY3Q6IG51bGwsXG5cdFx0XHRcdFx0XHRzY29wZVR5cGU6IFwic2VydmljZVwiXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvU2VydmljZUNvbnRleHRcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGVIYW5kbGVySW5zdGFuY2UuaW5pdFByb21pc2Vcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W3NNZXRhTW9kZWxJZF0gYXMgQ2FjaGVIYW5kbGVyU2VydmljZTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKGU6IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBJbiBjYXNlIG9mIGVycm9yIGRlbGV0ZSB0aGUgZ2xvYmFsIGluc3RhbmNlO1xuXHRcdFx0XHR0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeVtzTWV0YU1vZGVsSWRdID0gbnVsbDtcblx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdH0pO1xuXHR9XG5cdGdldEluc3RhbmNlKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W29NZXRhTW9kZWwuZ2V0SWQoKV07XG5cdH1cblx0cmVtb3ZlR2xvYmFsSW5zdGFuY2Uob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHR0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeVtvTWV0YU1vZGVsLmdldElkKCldID0gbnVsbDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQVNBLFNBQVNBLGVBQWUsQ0FBQ0MsSUFBUyxFQUFFQyxLQUFVLEVBQUVDLHNCQUEyQixFQUFFO0lBQzVFLE9BQU8sSUFBSUMsT0FBTyxDQUFDLFVBQVVDLE9BQU8sRUFBRTtNQUNyQztNQUNDQyxNQUFNLENBQ0xDLElBQUksQ0FBQ04sSUFBSSxFQUFFO1FBQUVPLE1BQU0sRUFBRTtNQUFNLENBQUMsQ0FBQyxDQUM3QkMsSUFBSSxDQUFDLFVBQVVDLFNBQWMsRUFBRUMsV0FBZ0IsRUFBRUMsS0FBVSxFQUFFO1FBQzdEO1FBQ0E7UUFDQTtRQUNBVCxzQkFBc0IsQ0FBQ0YsSUFBSSxDQUFDLEdBQUdXLEtBQUssQ0FBQ0MsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUlELEtBQUssQ0FBQ0MsaUJBQWlCLENBQUMsZUFBZSxDQUFDO1FBQzFHUixPQUFPLENBQUNILEtB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