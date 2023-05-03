ace.define("ace/mode/julia_highlight_rules",[],function(e,t,i){"use strict";var n=e("../lib/oop");var r=e("./text_highlight_rules").TextHighlightRules;var o=function(){this.$rules={start:[{include:"#function_decl"},{include:"#function_call"},{include:"#type_decl"},{include:"#keyword"},{include:"#operator"},{include:"#number"},{include:"#string"},{include:"#comment"}],"#bracket":[{token:"keyword.bracket.julia",regex:"\\(|\\)|\\[|\\]|\\{|\\}|,"}],"#comment":[{token:["punctuation.definition.comment.julia","comment.line.number-sign.julia"],regex:"(#)(?!\\{)(.*$)"}],"#function_call":[{token:["support.function.julia","text"],regex:"([a-zA-Z0-9_]+!?)([\\w\\xff-\\u218e\\u2455-\\uffff]*\\()"}],"#function_decl":[{token:["keyword.other.julia","meta.function.julia","entity.name.function.julia","meta.function.julia","text"],regex:"(function|macro)(\\s*)([a-zA-Z0-9_\\{]+!?)([\\w\\xff-\\u218e\\u2455-\\uffff]*)([(\\\\{])"}],"#keyword":[{token:"keyword.other.julia",regex:"\\b(?:function|type|immutable|macro|quote|abstract|bitstype|typealias|module|baremodule|new)\\b"},{token:"keyword.control.julia",regex:"\\b(?:if|else|elseif|while|for|in|begin|let|end|do|try|catch|finally|return|break|continue)\\b"},{token:"storage.modifier.variable.julia",regex:"\\b(?:global|local|const|export|import|importall|using)\\b"},{token:"variable.macro.julia",regex:"@[\\w\\xff-\\u218e\\u2455-\\uffff]+\\b"}],"#number":[{token:"constant.numeric.julia",regex:"\\b0(?:x|X)[0-9a-fA-F]*|(?:\\b[0-9]+\\.?[0-9]*|\\.[0-9]+)(?:(?:e|E)(?:\\+|-)?[0-9]*)?(?:im)?|\\bInf(?:32)?\\b|\\bNaN(?:32)?\\b|\\btrue\\b|\\bfalse\\b"}],"#operator":[{token:"keyword.operator.update.julia",regex:"=|:=|\\+=|-=|\\*=|/=|//=|\\.//=|\\.\\*=|\\\\=|\\.\\\\=|^=|\\.^=|%=|\\|=|&=|\\$=|<<=|>>="},{token:"keyword.operator.ternary.julia",regex:"\\?|:"},{token:"keyword.operator.boolean.julia",regex:"\\|\\||&&|!"},{token:"keyword.operator.arrow.julia",regex:"->|<-|--\x3e"},{token:"keyword.operator.relation.julia",regex:">|<|>=|<=|==|!=|\\.>|\\.<|\\.>=|\\.>=|\\.==|\\.!=|\\.=|\\.!|<:|:>"},{token:"keyword.operator.range.julia",regex:":"},{token:"keyword.operator.shift.julia",regex:"<<|>>"},{token:"keyword.operator.bitwise.julia",regex:"\\||\\&|~"},{token:"keyword.operator.arithmetic.julia",regex:"\\+|-|\\*|\\.\\*|/|\\./|//|\\.//|%|\\.%|\\\\|\\.\\\\|\\^|\\.\\^"},{token:"keyword.operator.isa.julia",regex:"::"},{token:"keyword.operator.dots.julia",regex:"\\.(?=[a-zA-Z])|\\.\\.+"},{token:"keyword.operator.interpolation.julia",regex:"\\$#?(?=.)"},{token:["variable","keyword.operator.transposed-variable.julia"],regex:"([\\w\\xff-\\u218e\\u2455-\\uffff]+)((?:'|\\.')*\\.?')"},{token:"text",regex:"\\[|\\("},{token:["text","keyword.operator.transposed-matrix.julia"],regex:"([\\]\\)])((?:'|\\.')*\\.?')"}],"#string":[{token:"punctuation.definition.string.begin.julia",regex:"'",push:[{token:"punctuation.definition.string.end.julia",regex:"'",next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.single.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:'"',push:[{token:"punctuation.definition.string.end.julia",regex:'"',next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.double.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:'\\b[\\w\\xff-\\u218e\\u2455-\\uffff]+"',push:[{token:"punctuation.definition.string.end.julia",regex:'"[\\w\\xff-\\u218e\\u2455-\\uffff]*',next:"pop"},{include:"#string_custom_escaped_char"},{defaultToken:"string.quoted.custom-double.julia"}]},{token:"punctuation.definition.string.begin.julia",regex:"`",push:[{token:"punctuation.definition.string.end.julia",regex:"`",next:"pop"},{include:"#string_escaped_char"},{defaultToken:"string.quoted.backtick.julia"}]}],"#string_custom_escaped_char":[{token:"constant.character.escape.julia",regex:'\\\\"'}],"#string_escaped_char":[{token:"constant.character.escape.julia",regex:"\\\\(?:\\\\|[0-3]\\d{,2}|[4-7]\\d?|x[a-fA-F0-9]{,2}|u[a-fA-F0-9]{,4}|U[a-fA-F0-9]{,8}|.)"}],"#type_decl":[{token:["keyword.control.type.julia","meta.type.julia","entity.name.type.julia","entity.other.inherited-class.julia","punctuation.separator.inheritance.julia","entity.other.inherited-class.julia"],regex:"(type|immutable)(\\s+)([a-zA-Z0-9_]+)(?:(\\s*)(<:)(\\s*[.a-zA-Z0-9_:]+))?"},{token:["other.typed-variable.julia","support.type.julia"],regex:"([a-zA-Z0-9_]+)(::[a-zA-Z0-9_{}]+)"}]};this.normalizeRules()};o.metaData={fileTypes:["jl"],firstLineMatch:"^#!.*\\bjulia\\s*$",foldingStartMarker:"^\\s*(?:if|while|for|begin|function|macro|module|baremodule|type|immutable|let)\\b(?!.*\\bend\\b).*$",foldingStopMarker:"^\\s*(?:end)\\b.*$",name:"Julia",scopeName:"source.julia"};n.inherits(o,r);t.JuliaHighlightRules=o});ace.define("ace/mode/folding/cstyle",[],function(e,t,i){"use strict";var n=e("../../lib/oop");var r=e("../../range").Range;var o=e("./fold_mode").FoldMode;var a=t.FoldMode=function(e){if(e){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end))}};n.inherits(a,o);(function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(e,t,i){var n=e.getLine(i);if(this.singleLineBlockCommentRe.test(n)){if(!this.startRegionRe.test(n)&&!this.tripleStarBlockCommentRe.test(n))return""}var r=this._getFoldWidgetBase(e,t,i);if(!r&&this.startRegionRe.test(n))return"start";return r};this.getFoldWidgetRange=function(e,t,i,n){var r=e.getLine(i);if(this.startRegionRe.test(r))return this.getCommentRegionBlock(e,r,i);var o=r.match(this.foldingStartMarker);if(o){var a=o.index;if(o[1])return this.openingBracketBlock(e,o[1],i,a);var l=e.getCommentFoldRange(i,a+o[0].length,1);if(l&&!l.isMultiLine()){if(n){l=this.getSectionRange(e,i)}else if(t!="all")l=null}return l}if(t==="markbegin")return;var o=r.match(this.foldingStopMarker);if(o){var a=o.index+o[0].length;if(o[1])return this.closingBracketBlock(e,o[1],i,a);return e.getCommentFoldRange(i,a,-1)}};this.getSectionRange=function(e,t){var i=e.getLine(t);var n=i.search(/\S/);var o=t;var a=i.length;t=t+1;var l=t;var u=e.getLength();while(++t<u){i=e.getLine(t);var s=i.search(/\S/);if(s===-1)continue;if(n>s)break;var g=this.getFoldWidgetRange(e,"all",t);if(g){if(g.start.row<=o){break}else if(g.isMultiLine()){t=g.end.row}else if(n==s){break}}l=t}return new r(o,a,l,e.getLine(l).length)};this.getCommentRegionBlock=function(e,t,i){var n=t.search(/\s*$/);var o=e.getLength();var a=i;var l=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var u=1;while(++i<o){t=e.getLine(i);var s=l.exec(t);if(!s)continue;if(s[1])u--;else u++;if(!u)break}var g=i;if(g>a){return new r(a,n,g,t.length)}}}).call(a.prototype)});ace.define("ace/mode/julia",[],function(e,t,i){"use strict";var n=e("../lib/oop");var r=e("./text").Mode;var o=e("./julia_highlight_rules").JuliaHighlightRules;var a=e("./folding/cstyle").FoldMode;var l=function(){this.HighlightRules=o;this.foldingRules=new a;this.$behaviour=this.$defaultBehaviour};n.inherits(l,r);(function(){this.lineCommentStart="#";this.blockComment="";this.$id="ace/mode/julia"}).call(l.prototype);t.Mode=l});(function(){ace.require(["ace/mode/julia"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();
//# sourceMappingURL=mode-julia.js.map