/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  "sap/sac/df/utils/TokenHelper",
  [
    "sap/m/Token",
    "sap/ui/core/CustomData",
    "sap/sac/df/types/ComparisonOperator",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (Token, CustomData, ComparisonOperator, _) {
    "use strict";
    function calcCompOp(sStrict, sEqual) {
      if (sStrict) {
        if (sStrict === "<") {
          return sEqual ? ComparisonOperator.LESS_EQUAL : ComparisonOperator.LESS;
        } else {
          return sEqual ? ComparisonOperator.GREATER_EQUAL : ComparisonOperator.GREATER;
        }
      } else {
        return ComparisonOperator.EQUAL;
      }
    }
    function datsToDate(sDats){
      return new Date(sDats);
    }
    function dateToYMD(date) {
      if (typeof (date) !== "object") {
        throw new Error("Invalid date");
      }
      var d = date.getDate();
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
    }
    function TokenHelper() {
      var that = this;
      that.dateToYMD = dateToYMD;
      that.datsToDate = datsToDate;
      that.rangeToToken = function (oRange) {
        return new Token({
          key: oRange.Low,
          text: oRange.Text,
          customData: _.map(oRange, function (oE, sN) {
            return new CustomData({
              key: sN,
              value: oE
            });
          })
        });
      };
      this.tokenToRange = function (oToken) {
        var oData = oToken.data();
        if (oData.ComparisonOperator) {
          return {
            ComparisonOperator: oData.ComparisonOperator,
            High: oData.High,
            IsExcluding: oData.IsExcluding,
            Low: oToken.getKey(),
            Text: oToken.getText()
          };
        } else {
          return {
            ComparisonOperator: ComparisonOperator.EQUAL,
            Low: oToken.getKey(),
            IsExcluding: false,
            Text: oToken.getText()
          };
        }
      };
      this.stringToTokens = function (s) {
        return _.map(s.split(","), this.stringToToken);
      };
      this.stringToToken = function (s) {
        var oRange = null;
        var aMatch = s.match(/(!)?(.+) - (.+)/);
        if (aMatch) {
          oRange = {
            Low: aMatch[2],
            High: aMatch[3],
            IsExcluding: !!aMatch[1],
            Text: s,
            ComparisonOperator: ComparisonOperator.BETWEEN
          };
        } else {
          aMatch = s.match(/(!)?(<|>)?(=)?(.+)/);
          if (aMatch) {
            oRange = {
              Low: aMatch[4],
              Text: s,
              IsExcluding: !!aMatch[1],
              ComparisonOperator: calcCompOp(aMatch[2], aMatch[3])
            };
          }
        }
        return that.rangeToToken(oRange);
      };
    }
    return new TokenHelper();
  }
);
