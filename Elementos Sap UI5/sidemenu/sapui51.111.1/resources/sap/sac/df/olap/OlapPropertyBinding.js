/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/olap/OlapPropertyBinding",["sap/base/util/deepEqual","sap/ui/model/ChangeReason","sap/ui/model/PropertyBinding","sap/sac/df/olap/calculateId","sap/sac/df/thirdparty/lodash"],function(e,a,t,n,r){"use strict";var s=t.extend("sap.sac.df.olap.OlapPropertyBinding",{constructor:function(s,o,p,c){var i=this;var u=p;var l=null;t.apply(i,[s,o,u,c]);function d(){var e=s.resolve(o,u);return e?s.getProperty(e):null}i.getValue=function(){return l};i.setValue=function(e){var a=s.resolve(o,u);s.setProperty(a,e)};i.setContext=function(e){if(u!==e){sap.ui.getCore().getMessageManager().removeMessages(i.getDataState().getControlMessages(),true);u=e;i.checkUpdate()}else{i.checkUpdate()}};i.getId=r.constant(n());i.checkUpdate=function(t){var n=d();if(t||!e(n,l)){l=n;i.getDataState().setValue(l);i.checkDataState();i._fireChange({reason:a.Change})}}}});return s});
//# sourceMappingURL=OlapPropertyBinding.js.map