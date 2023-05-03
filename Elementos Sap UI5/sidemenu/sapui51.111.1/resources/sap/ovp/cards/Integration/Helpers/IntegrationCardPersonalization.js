sap.ui.define(["sap/m/MessageToast","sap/ovp/app/OVPLogger","sap/ovp/app/resources","sap/ui/thirdparty/jquery"],function(e,t,n,jQuery){"use strict";var r="ovp-based-integration-cards";var o=new t("sap.ovp.cards.Integration.Helpers.IntegrationCardPersonalization");var a=function(e){this.oContainer=e};a.prototype.writeManifest=function(t,r){var a=false;if(a){jQuery.ajax({type:"POST",url:"/editor/card/"+t.split(":")[0],headers:{"Content-Type":"application/json"},data:JSON.stringify(r),success:function(e){o.info("Success:",e)},error:function(e){o.error("Error:",e)}})}else{try{this.oContainer.setItemValue(t,r);this.oContainer.save().then(function(){e.show(n.getText("INT_CARD_ADD_SUCCESS"))}).catch(function(t){e.show(n.getText("INT_CARD_ADD_ERROR"))})}catch(t){e.show(n.getText("INT_CARD_ADD_ERROR"))}}};a.prototype.readManifest=function(e){var t=this.oContainer.getItemValue(e);return t};a.prototype.readAllManifests=function(){var e=this.oContainer.getItemKeys()||[];return e.map(function(e){return this.readManifest(e)}.bind(this))};a.prototype.deleteAllManifests=function(){this.oContainer.clear();this.oContainer.save().then(function(){e.show("All Cards have been removed from my insights")}).catch(function(t){e.show("Error: Cards couldn't be removed")})};return{create:function(e){return sap.ushell.Container.getServiceAsync("Personalization").then(function(e){var t={shared:true};return e.getContainer(r,t)}).then(function(e){return new a(e)})}}},true);
//# sourceMappingURL=IntegrationCardPersonalization.js.map