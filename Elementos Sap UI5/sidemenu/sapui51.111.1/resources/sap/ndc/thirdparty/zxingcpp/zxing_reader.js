var ZXing=(()=>{var r=typeof document!=="undefined"&&document.currentScript?document.currentScript.src:undefined;return function(t){t=t||{};var n=typeof t!="undefined"?t:{};var e,a;n["ready"]=new Promise(function(r,t){e=r;a=t});var i=Object.assign({},n);var u=[];var o="./this.program";var f=(r,t)=>{throw t};var c=true;var s=false;var l="";function v(r){if(n["locateFile"]){return n["locateFile"](r,l)}return l+r}var h,d,p,y;if(c||s){if(s){l=self.location.href}else if(typeof document!="undefined"&&document.currentScript){l=document.currentScript.src}if(r){l=r}if(l.indexOf("blob:")!==0){l=l.substr(0,l.replace(/[?#].*/,"").lastIndexOf("/")+1)}else{l=""}{h=r=>{var t=new XMLHttpRequest;t.open("GET",r,false);t.send(null);return t.responseText};if(s){p=r=>{var t=new XMLHttpRequest;t.open("GET",r,false);t.responseType="arraybuffer";t.send(null);return new Uint8Array(t.response)}}d=(r,t,n)=>{var e=new XMLHttpRequest;e.open("GET",r,true);e.responseType="arraybuffer";e.onload=()=>{if(e.status==200||e.status==0&&e.response){t(e.response);return}n()};e.onerror=n;e.send(null)}}y=r=>document.title=r}else{}var m=n["print"]||console.log.bind(console);var g=n["printErr"]||console.warn.bind(console);Object.assign(n,i);i=null;if(n["arguments"])u=n["arguments"];if(n["thisProgram"])o=n["thisProgram"];if(n["quit"])f=n["quit"];var w;if(n["wasmBinary"])w=n["wasmBinary"];var _=n["noExitRuntime"]||true;if(typeof WebAssembly!="object"){er("no native wasm support detected")}var b;var T=false;var A;var C=typeof TextDecoder!="undefined"?new TextDecoder("utf8"):undefined;function E(r,t,n){var e=t+n;var a=t;while(r[a]&&!(a>=e))++a;if(a-t>16&&r.buffer&&C){return C.decode(r.subarray(t,a))}var i="";while(t<a){var u=r[t++];if(!(u&128)){i+=String.fromCharCode(u);continue}var o=r[t++]&63;if((u&224)==192){i+=String.fromCharCode((u&31)<<6|o);continue}var f=r[t++]&63;if((u&240)==224){u=(u&15)<<12|o<<6|f}else{u=(u&7)<<18|o<<12|f<<6|r[t++]&63}if(u<65536){i+=String.fromCharCode(u)}else{var c=u-65536;i+=String.fromCharCode(55296|c>>10,56320|c&1023)}}return i}function F(r,t){return r?E(x,r,t):""}function P(r,t,n,e){if(!(e>0))return 0;var a=n;var i=n+e-1;for(var u=0;u<r.length;++u){var o=r.charCodeAt(u);if(o>=55296&&o<=57343){var f=r.charCodeAt(++u);o=65536+((o&1023)<<10)|f&1023}if(o<=127){if(n>=i)break;t[n++]=o}else if(o<=2047){if(n+1>=i)break;t[n++]=192|o>>6;t[n++]=128|o&63}else if(o<=65535){if(n+2>=i)break;t[n++]=224|o>>12;t[n++]=128|o>>6&63;t[n++]=128|o&63}else{if(n+3>=i)break;t[n++]=240|o>>18;t[n++]=128|o>>12&63;t[n++]=128|o>>6&63;t[n++]=128|o&63}}t[n]=0;return n-a}function W(r,t,n){return P(r,x,t,n)}function S(r){var t=0;for(var n=0;n<r.length;++n){var e=r.charCodeAt(n);if(e<=127){t++}else if(e<=2047){t+=2}else if(e>=55296&&e<=57343){t+=4;++n}else{t+=3}}return t}var j,k,x,R,M,D,O,I,U;function H(r){j=r;n["HEAP8"]=k=new Int8Array(r);n["HEAP16"]=R=new Int16Array(r);n["HEAP32"]=D=new Int32Array(r);n["HEAPU8"]=x=new Uint8Array(r);n["HEAPU16"]=M=new Uint16Array(r);n["HEAPU32"]=O=new Uint32Array(r);n["HEAPF32"]=I=new Float32Array(r);n["HEAPF64"]=U=new Float64Array(r)}var Y=n["INITIAL_MEMORY"]||16777216;var V;var z=[];var B=[];var N=[];var X=false;function q(){if(n["preRun"]){if(typeof n["preRun"]=="function")n["preRun"]=[n["preRun"]];while(n["preRun"].length){G(n["preRun"].shift())}}sr(z)}function L(){X=true;sr(B)}function Z(){if(n["postRun"]){if(typeof n["postRun"]=="function")n["postRun"]=[n["postRun"]];while(n["postRun"].length){$(n["postRun"].shift())}}sr(N)}function G(r){z.unshift(r)}function J(r){B.unshift(r)}function $(r){N.unshift(r)}var K=0;var Q=null;var rr=null;function tr(r){K++;if(n["monitorRunDependencies"]){n["monitorRunDependencies"](K)}}function nr(r){K--;if(n["monitorRunDependencies"]){n["monitorRunDependencies"](K)}if(K==0){if(Q!==null){clearInterval(Q);Q=null}if(rr){var t=rr;rr=null;t()}}}function er(r){{if(n["onAbort"]){n["onAbort"](r)}}r="Aborted("+r+")";g(r);T=true;A=1;r+=". Build with -sASSERTIONS for more info.";var t=new WebAssembly.RuntimeError(r);a(t);throw t}var ar="data:application/octet-stream;base64,";function ir(r){return r.startsWith(ar)}var ur;ur="zxing_reader.wasm";if(!ir(ur)){ur=v(ur)}function or(r){try{if(r==ur&&w){return new Uint8Array(w)}if(p){return p(r)}throw"both async and sync fetching of the wasm failed"}catch(r){er(r)}}function fr(){if(!w&&(c||s)){if(typeof fetch=="function"){return fetch(ur,{credentials:"same-origin"}).then(function(r){if(!r["ok"]){throw"failed to load wasm binary file at '"+ur+"'"}return r["arrayBuffer"]()}).catch(function(){return or(ur)})}}return Promise.resolve().then(function(){return or(ur)})}function cr(){var r={a:fn};function t(r,t){var e=r.exports;n["asm"]=e;b=n["asm"]["ma"];H(b.buffer);V=n["asm"]["qa"];J(n["asm"]["na"]);nr("wasm-instantiate")}tr("wasm-instantiate");function e(r){t(r["instance"])}function i(t){return fr().then(function(t){return WebAssembly.instantiate(t,r)}).then(function(r){return r}).then(t,function(r){g("failed to asynchronously prepare wasm: "+r);er(r)})}function u(){if(!w&&typeof WebAssembly.instantiateStreaming=="function"&&!ir(ur)&&typeof fetch=="function"){return fetch(ur,{credentials:"same-origin"}).then(function(t){var n=WebAssembly.instantiateStreaming(t,r);return n.then(e,function(r){g("wasm streaming compile failed: "+r);g("falling back to ArrayBuffer instantiation");return i(e)})})}else{return i(e)}}if(n["instantiateWasm"]){try{var o=n["instantiateWasm"](r,t);return o}catch(r){g("Module.instantiateWasm callback failed with error: "+r);return false}}u().catch(a);return{}}function sr(r){while(r.length>0){r.shift()(n)}}function lr(r,t){k.set(r,t)}function vr(r){return vn(r+24)+24}var hr=[];function dr(r){r.add_ref()}var pr=0;function yr(r){var t=new gr(r);if(!t.get_caught()){t.set_caught(true);pr--}t.set_rethrown(false);hr.push(t);dr(t);return t.get_exception_ptr()}var mr=0;function gr(r){this.excPtr=r;this.ptr=r-24;this.set_type=function(r){O[this.ptr+4>>2]=r};this.get_type=function(){return O[this.ptr+4>>2]};this.set_destructor=function(r){O[this.ptr+8>>2]=r};this.get_destructor=function(){return O[this.ptr+8>>2]};this.set_refcount=function(r){D[this.ptr>>2]=r};this.set_caught=function(r){r=r?1:0;k[this.ptr+12>>0]=r};this.get_caught=function(){return k[this.ptr+12>>0]!=0};this.set_rethrown=function(r){r=r?1:0;k[this.ptr+13>>0]=r};this.get_rethrown=function(){return k[this.ptr+13>>0]!=0};this.init=function(r,t){this.set_adjusted_ptr(0);this.set_type(r);this.set_destructor(t);this.set_refcount(0);this.set_caught(false);this.set_rethrown(false)};this.add_ref=function(){var r=D[this.ptr>>2];D[this.ptr>>2]=r+1};this.release_ref=function(){var r=D[this.ptr>>2];D[this.ptr>>2]=r-1;return r===1};this.set_adjusted_ptr=function(r){O[this.ptr+16>>2]=r};this.get_adjusted_ptr=function(){return O[this.ptr+16>>2]};this.get_exception_ptr=function(){var r=_n(this.get_type());if(r){return O[this.excPtr>>2]}var t=this.get_adjusted_ptr();if(t!==0)return t;return this.excPtr}}function wr(r){return ln(new gr(r).ptr)}function _r(r){return V.get(r)}function br(r){if(r.release_ref()&&!r.get_rethrown()){var t=r.get_destructor();if(t){_r(t)(r.excPtr)}wr(r.excPtr)}}function Tr(){pn(0);var r=hr.pop();br(r);mr=0}function Ar(r){if(!mr){mr=r}throw r}function Cr(){var r=mr;if(!r){yn(0);return 0}var t=new gr(r);t.set_adjusted_ptr(r);var n=t.get_type();if(!n){yn(0);return r}for(var e=0;e<arguments.length;e++){var a=arguments[e];if(a===0||a===n){break}var i=t.ptr+16;if(wn(a,n,i)){yn(a);return r}}yn(n);return r}function Er(){var r=mr;if(!r){yn(0);return 0}var t=new gr(r);t.set_adjusted_ptr(r);var n=t.get_type();if(!n){yn(0);return r}for(var e=0;e<arguments.length;e++){var a=arguments[e];if(a===0||a===n){break}var i=t.ptr+16;if(wn(a,n,i)){yn(a);return r}}yn(n);return r}function Fr(){var r=mr;if(!r){yn(0);return 0}var t=new gr(r);t.set_adjusted_ptr(r);var n=t.get_type();if(!n){yn(0);return r}for(var e=0;e<arguments.length;e++){var a=arguments[e];if(a===0||a===n){break}var i=t.ptr+16;if(wn(a,n,i)){yn(a);return r}}yn(n);return r}function Pr(r){return new gr(r).get_exception_ptr()}function Wr(){var r=hr.pop();if(!r){er("no exception to throw")}var t=r.excPtr;if(!r.get_rethrown()){hr.push(r);r.set_rethrown(true);r.set_caught(false);pr++}mr=t;throw t}function Sr(r,t,n){var e=new gr(r);e.init(t,n);mr=r;pr++;throw r}function jr(){return pr}var kr={};function xr(r){while(r.length){var t=r.pop();var n=r.pop();n(t)}}function Rr(r){return this["fromWireType"](D[r>>2])}var Mr={};var Dr={};var Or={};var Ir=48;var Ur=57;function Hr(r){if(undefined===r){return"_unknown"}r=r.replace(/[^a-zA-Z0-9_]/g,"$");var t=r.charCodeAt(0);if(t>=Ir&&t<=Ur){return"_"+r}return r}function Yr(r,t){r=Hr(r);return new Function("body","return function "+r+"() {\n"+'    "use strict";'+"    return body.apply(this, arguments);\n"+"};\n")(t)}function Vr(r,t){var n=Yr(t,function(r){this.name=t;this.message=r;var n=new Error(r).stack;if(n!==undefined){this.stack=this.toString()+"\n"+n.replace(/^Error(:[^\n]*)?\n/,"")}});n.prototype=Object.create(r.prototype);n.prototype.constructor=n;n.prototype.toString=function(){if(this.message===undefined){return this.name}else{return this.name+": "+this.message}};return n}var zr=undefined;function Br(r){throw new zr(r)}function Nr(r,t,n){r.forEach(function(r){Or[r]=t});function e(t){var e=n(t);if(e.length!==r.length){Br("Mismatched type converter count")}for(var a=0;a<r.length;++a){Qr(r[a],e[a])}}var a=new Array(t.length);var i=[];var u=0;t.forEach((r,t)=>{if(Dr.hasOwnProperty(r)){a[t]=Dr[r]}else{i.push(r);if(!Mr.hasOwnProperty(r)){Mr[r]=[]}Mr[r].push(()=>{a[t]=Dr[r];++u;if(u===i.length){e(a)}})}});if(0===i.length){e(a)}}function Xr(r){var t=kr[r];delete kr[r];var n=t.rawConstructor;var e=t.rawDestructor;var a=t.fields;var i=a.map(r=>r.getterReturnType).concat(a.map(r=>r.setterArgumentType));Nr([r],i,r=>{var i={};a.forEach((t,n)=>{var e=t.fieldName;var u=r[n];var o=t.getter;var f=t.getterContext;var c=r[n+a.length];var s=t.setter;var l=t.setterContext;i[e]={read:r=>u["fromWireType"](o(f,r)),write:(r,t)=>{var n=[];s(l,r,c["toWireType"](n,t));xr(n)}}});return[{name:t.name,fromWireType:function(r){var t={};for(var n in i){t[n]=i[n].read(r)}e(r);return t},toWireType:function(r,t){for(var a in i){if(!(a in t)){throw new TypeError('Missing field:  "'+a+'"')}}var u=n();for(a in i){i[a].write(u,t[a])}if(r!==null){r.push(e,u)}return u},argPackAdvance:8,readValueFromPointer:Rr,destructorFunction:e}]})}function qr(r,t,n,e,a){}function Lr(r){switch(r){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+r)}}function Zr(){var r=new Array(256);for(var t=0;t<256;++t){r[t]=String.fromCharCode(t)}Gr=r}var Gr=undefined;function Jr(r){var t="";var n=r;while(x[n]){t+=Gr[x[n++]]}return t}var $r=undefined;function Kr(r){throw new $r(r)}function Qr(r,t,n={}){if(!("argPackAdvance"in t)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}var e=t.name;if(!r){Kr('type "'+e+'" must have a positive integer typeid pointer')}if(Dr.hasOwnProperty(r)){if(n.ignoreDuplicateRegistrations){return}else{Kr("Cannot register type '"+e+"' twice")}}Dr[r]=t;delete Or[r];if(Mr.hasOwnProperty(r)){var a=Mr[r];delete Mr[r];a.forEach(r=>r())}}function rt(r,t,n,e,a){var i=Lr(n);t=Jr(t);Qr(r,{name:t,fromWireType:function(r){return!!r},toWireType:function(r,t){return t?e:a},argPackAdvance:8,readValueFromPointer:function(r){var e;if(n===1){e=k}else if(n===2){e=R}else if(n===4){e=D}else{throw new TypeError("Unknown boolean type size: "+t)}return this["fromWireType"](e[r>>i])},destructorFunction:null})}var tt=[];var nt=[{},{value:undefined},{value:null},{value:true},{value:false}];function et(r){if(r>4&&0===--nt[r].refcount){nt[r]=undefined;tt.push(r)}}function at(){var r=0;for(var t=5;t<nt.length;++t){if(nt[t]!==undefined){++r}}return r}function it(){for(var r=5;r<nt.length;++r){if(nt[r]!==undefined){return nt[r]}}return null}function ut(){n["count_emval_handles"]=at;n["get_first_emval"]=it}var ot={toValue:r=>{if(!r){Kr("Cannot use deleted val. handle = "+r)}return nt[r].value},toHandle:r=>{switch(r){case undefined:return 1;case null:return 2;case true:return 3;case false:return 4;default:{var t=tt.length?tt.pop():nt.length;nt[t]={refcount:1,value:r};return t}}}};function ft(r,t){t=Jr(t);Qr(r,{name:t,fromWireType:function(r){var t=ot.toValue(r);et(r);return t},toWireType:function(r,t){return ot.toHandle(t)},argPackAdvance:8,readValueFromPointer:Rr,destructorFunction:null})}function ct(r,t){switch(t){case 2:return function(r){return this["fromWireType"](I[r>>2])};case 3:return function(r){return this["fromWireType"](U[r>>3])};default:throw new TypeError("Unknown float type: "+r)}}function st(r,t,n){var e=Lr(n);t=Jr(t);Qr(r,{name:t,fromWireType:function(r){return r},toWireType:function(r,t){return t},argPackAdvance:8,readValueFromPointer:ct(t,e),destructorFunction:null})}function lt(r,t){if(!(r instanceof Function)){throw new TypeError("new_ called with constructor type "+typeof r+" which is not a function")}var n=Yr(r.name||"unknownFunctionName",function(){});n.prototype=r.prototype;var e=new n;var a=r.apply(e,t);return a instanceof Object?a:e}function vt(r,t,n,e,a){var i=t.length;if(i<2){Kr("argTypes array size mismatch! Must at least get return value and 'this' types!")}var u=t[1]!==null&&n!==null;var o=false;for(var f=1;f<t.length;++f){if(t[f]!==null&&t[f].destructorFunction===undefined){o=true;break}}var c=t[0].name!=="void";var s="";var l="";for(var f=0;f<i-2;++f){s+=(f!==0?", ":"")+"arg"+f;l+=(f!==0?", ":"")+"arg"+f+"Wired"}var v="return function "+Hr(r)+"("+s+") {\n"+"if (arguments.length !== "+(i-2)+") {\n"+"throwBindingError('function "+r+" called with ' + arguments.length + ' arguments, expected "+(i-2)+" args!');\n"+"}\n";if(o){v+="var destructors = [];\n"}var h=o?"destructors":"null";var d=["throwBindingError","invoker","fn","runDestructors","retType","classParam"];var p=[Kr,e,a,xr,t[0],t[1]];if(u){v+="var thisWired = classParam.toWireType("+h+", this);\n"}for(var f=0;f<i-2;++f){v+="var arg"+f+"Wired = argType"+f+".toWireType("+h+", arg"+f+"); // "+t[f+2].name+"\n";d.push("argType"+f);p.push(t[f+2])}if(u){l="thisWired"+(l.length>0?", ":"")+l}v+=(c?"var rv = ":"")+"invoker(fn"+(l.length>0?", ":"")+l+");\n";if(o){v+="runDestructors(destructors);\n"}else{for(var f=u?1:2;f<t.length;++f){var y=f===1?"thisWired":"arg"+(f-2)+"Wired";if(t[f].destructorFunction!==null){v+=y+"_dtor("+y+"); // "+t[f].name+"\n";d.push(y+"_dtor");p.push(t[f].destructorFunction)}}}if(c){v+="var ret = retType.fromWireType(rv);\n"+"return ret;\n"}else{}v+="}\n";d.push(v);var m=lt(Function,d).apply(null,p);return m}function ht(r,t,n){if(undefined===r[t].overloadTable){var e=r[t];r[t]=function(){if(!r[t].overloadTable.hasOwnProperty(arguments.length)){Kr("Function '"+n+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+r[t].overloadTable+")!")}return r[t].overloadTable[arguments.length].apply(this,arguments)};r[t].overloadTable=[];r[t].overloadTable[e.argCount]=e}}function dt(r,t,e){if(n.hasOwnProperty(r)){if(undefined===e||undefined!==n[r].overloadTable&&undefined!==n[r].overloadTable[e]){Kr("Cannot register public name '"+r+"' twice")}ht(n,r,r);if(n.hasOwnProperty(e)){Kr("Cannot register multiple overloads of a function with the same number of arguments ("+e+")!")}n[r].overloadTable[e]=t}else{n[r]=t;if(undefined!==e){n[r].numArguments=e}}}function pt(r,t){var n=[];for(var e=0;e<r;e++){n.push(O[t+e*4>>2])}return n}function yt(r,t,e){if(!n.hasOwnProperty(r)){Br("Replacing nonexistant public symbol")}if(undefined!==n[r].overloadTable&&undefined!==e){n[r].overloadTable[e]=t}else{n[r]=t;n[r].argCount=e}}function mt(r,t,e){var a=n["dynCall_"+r];return e&&e.length?a.apply(null,[t].concat(e)):a.call(null,t)}function gt(r,t,n){if(r.includes("j")){return mt(r,t,n)}var e=_r(t).apply(null,n);return e}function wt(r,t){var n=[];return function(){n.length=0;Object.assign(n,arguments);return gt(r,t,n)}}function _t(r,t){r=Jr(r);function n(){if(r.includes("j")){return wt(r,t)}return _r(t)}var e=n();if(typeof e!="function"){Kr("unknown function pointer with signature "+r+": "+t)}return e}var bt=undefined;function Tt(r){var t=hn(r);var n=Jr(t);ln(t);return n}function At(r,t){var n=[];var e={};function a(r){if(e[r]){return}if(Dr[r]){return}if(Or[r]){Or[r].forEach(a);return}n.push(r);e[r]=true}t.forEach(a);throw new bt(r+": "+n.map(Tt).join([", "]))}function Ct(r,t,n,e,a,i){var u=pt(t,n);r=Jr(r);a=_t(e,a);dt(r,function(){At("Cannot call "+r+" due to unbound types",u)},t-1);Nr([],u,function(n){var e=[n[0],null].concat(n.slice(1));yt(r,vt(r,e,null,a,i),t-1);return[]})}function Et(r,t,n){switch(t){case 0:return n?function r(t){return k[t]}:function r(t){return x[t]};case 1:return n?function r(t){return R[t>>1]}:function r(t){return M[t>>1]};case 2:return n?function r(t){return D[t>>2]}:function r(t){return O[t>>2]};default:throw new TypeError("Unknown integer type: "+r)}}function Ft(r,t,n,e,a){t=Jr(t);if(a===-1){a=4294967295}var i=Lr(n);var u=r=>r;if(e===0){var o=32-8*n;u=r=>r<<o>>>o}var f=t.includes("unsigned");var c=(r,t)=>{};var s;if(f){s=function(r,t){c(t,this.name);return t>>>0}}else{s=function(r,t){c(t,this.name);return t}}Qr(r,{name:t,fromWireType:u,toWireType:s,argPackAdvance:8,readValueFromPointer:Et(t,i,e!==0),destructorFunction:null})}function Pt(r,t,n){var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var a=e[t];function i(r){r=r>>2;var t=O;var n=t[r];var e=t[r+1];return new a(j,e,n)}n=Jr(n);Qr(r,{name:n,fromWireType:i,argPackAdvance:8,readValueFromPointer:i},{ignoreDuplicateRegistrations:true})}function Wt(r,t){t=Jr(t);var n=t==="std::string";Qr(r,{name:t,fromWireType:function(r){var t=O[r>>2];var e=r+4;var a;if(n){var i=e;for(var u=0;u<=t;++u){var o=e+u;if(u==t||x[o]==0){var f=o-i;var c=F(i,f);if(a===undefined){a=c}else{a+=String.fromCharCode(0);a+=c}i=o+1}}}else{var s=new Array(t);for(var u=0;u<t;++u){s[u]=String.fromCharCode(x[e+u])}a=s.join("")}ln(r);return a},toWireType:function(r,t){if(t instanceof ArrayBuffer){t=new Uint8Array(t)}var e;var a=typeof t=="string";if(!(a||t instanceof Uint8Array||t instanceof Uint8ClampedArray||t instanceof Int8Array)){Kr("Cannot pass non-string to std::string")}if(n&&a){e=S(t)}else{e=t.length}var i=vn(4+e+1);var u=i+4;O[i>>2]=e;if(n&&a){W(t,u,e+1)}else{if(a){for(var o=0;o<e;++o){var f=t.charCodeAt(o);if(f>255){ln(u);Kr("String has UTF-16 code units that do not fit in 8 bits")}x[u+o]=f}}else{for(var o=0;o<e;++o){x[u+o]=t[o]}}}if(r!==null){r.push(ln,i)}return i},argPackAdvance:8,readValueFromPointer:Rr,destructorFunction:function(r){ln(r)}})}var St=typeof TextDecoder!="undefined"?new TextDecoder("utf-16le"):undefined;function jt(r,t){var n=r;var e=n>>1;var a=e+t/2;while(!(e>=a)&&M[e])++e;n=e<<1;if(n-r>32&&St){return St.decode(x.subarray(r,n))}else{var i="";for(var u=0;!(u>=t/2);++u){var o=R[r+u*2>>1];if(o==0)break;i+=String.fromCharCode(o)}return i}}function kt(r,t,n){if(n===undefined){n=2147483647}if(n<2)return 0;n-=2;var e=t;var a=n<r.length*2?n/2:r.length;for(var i=0;i<a;++i){var u=r.charCodeAt(i);R[t>>1]=u;t+=2}R[t>>1]=0;return t-e}function xt(r){return r.length*2}function Rt(r,t){var n=0;var e="";while(!(n>=t/4)){var a=D[r+n*4>>2];if(a==0)break;++n;if(a>=65536){var i=a-65536;e+=String.fromCharCode(55296|i>>10,56320|i&1023)}else{e+=String.fromCharCode(a)}}return e}function Mt(r,t,n){if(n===undefined){n=2147483647}if(n<4)return 0;var e=t;var a=e+n-4;for(var i=0;i<r.length;++i){var u=r.charCodeAt(i);if(u>=55296&&u<=57343){var o=r.charCodeAt(++i);u=65536+((u&1023)<<10)|o&1023}D[t>>2]=u;t+=4;if(t+4>a)break}D[t>>2]=0;return t-e}function Dt(r){var t=0;for(var n=0;n<r.length;++n){var e=r.charCodeAt(n);if(e>=55296&&e<=57343)++n;t+=4}return t}function Ot(r,t,n){n=Jr(n);var e,a,i,u,o;if(t===2){e=jt;a=kt;u=xt;i=()=>M;o=1}else if(t===4){e=Rt;a=Mt;u=Dt;i=()=>O;o=2}Qr(r,{name:n,fromWireType:function(r){var n=O[r>>2];var a=i();var u;var f=r+4;for(var c=0;c<=n;++c){var s=r+4+c*t;if(c==n||a[s>>o]==0){var l=s-f;var v=e(f,l);if(u===undefined){u=v}else{u+=String.fromCharCode(0);u+=v}f=s+t}}ln(r);return u},toWireType:function(r,e){if(!(typeof e=="string")){Kr("Cannot pass non-string to C++ string type "+n)}var i=u(e);var f=vn(4+i+t);O[f>>2]=i>>o;a(e,f+4,i+t);if(r!==null){r.push(ln,f)}return f},argPackAdvance:8,readValueFromPointer:Rr,destructorFunction:function(r){ln(r)}})}function It(r,t,n,e,a,i){kr[r]={name:Jr(t),rawConstructor:_t(n,e),rawDestructor:_t(a,i),fields:[]}}function Ut(r,t,n,e,a,i,u,o,f,c){kr[r].fields.push({fieldName:Jr(t),getterReturnType:n,getter:_t(e,a),getterContext:i,setterArgumentType:u,setter:_t(o,f),setterContext:c})}function Ht(r,t){t=Jr(t);Qr(r,{isVoid:true,name:t,argPackAdvance:0,fromWireType:function(){return undefined},toWireType:function(r,t){return undefined}})}function Yt(){er("")}function Vt(r,t,n){x.copyWithin(r,t,t+n)}function zt(){return 2147483648}function Bt(r){try{b.grow(r-j.byteLength+65535>>>16);H(b.buffer);return 1}catch(r){}}function Nt(r){var t=x.length;r=r>>>0;var n=zt();if(r>n){return false}let e=(r,t)=>r+(t-r%t)%t;for(var a=1;a<=4;a*=2){var i=t*(1+.2/a);i=Math.min(i,r+100663296);var u=Math.min(n,e(Math.max(r,i),65536));var o=Bt(u);if(o){return true}}return false}var Xt={};function qt(){return o||"./this.program"}function Lt(){if(!Lt.strings){var r=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8";var t={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:r,_:qt()};for(var n in Xt){if(Xt[n]===undefined)delete t[n];else t[n]=Xt[n]}var e=[];for(var n in t){e.push(n+"="+t[n])}Lt.strings=e}return Lt.strings}function Zt(r,t,n){for(var e=0;e<r.length;++e){k[t++>>0]=r.charCodeAt(e)}if(!n)k[t>>0]=0}var Gt={varargs:undefined,get:function(){Gt.varargs+=4;var r=D[Gt.varargs-4>>2];return r},getStr:function(r){var t=F(r);return t}};function Jt(r,t){var n=0;Lt().forEach(function(e,a){var i=t+n;O[r+a*4>>2]=i;Zt(e,i);n+=e.length+1});return 0}function $t(r,t){var n=Lt();O[r>>2]=n.length;var e=0;n.forEach(function(r){e+=r.length+1});O[t>>2]=e;return 0}function Kt(r){return r}function Qt(r){return r%4===0&&(r%100!==0||r%400===0)}function rn(r,t){var n=0;for(var e=0;e<=t;n+=r[e++]){}return n}var tn=[31,29,31,30,31,30,31,31,30,31,30,31];var nn=[31,28,31,30,31,30,31,31,30,31,30,31];function en(r,t){var n=new Date(r.getTime());while(t>0){var e=Qt(n.getFullYear());var a=n.getMonth();var i=(e?tn:nn)[a];if(t>i-n.getDate()){t-=i-n.getDate()+1;n.setDate(1);if(a<11){n.setMonth(a+1)}else{n.setMonth(0);n.setFullYear(n.getFullYear()+1)}}else{n.setDate(n.getDate()+t);return n}}return n}function an(r,t,n){var e=n>0?n:S(r)+1;var a=new Array(e);var i=P(r,a,0,a.length);if(t)a.length=i;return a}function un(r,t,n,e){var a=D[e+40>>2];var i={tm_sec:D[e>>2],tm_min:D[e+4>>2],tm_hour:D[e+8>>2],tm_mday:D[e+12>>2],tm_mon:D[e+16>>2],tm_year:D[e+20>>2],tm_wday:D[e+24>>2],tm_yday:D[e+28>>2],tm_isdst:D[e+32>>2],tm_gmtoff:D[e+36>>2],tm_zone:a?F(a):""};var u=F(n);var o={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var f in o){u=u.replace(new RegExp(f,"g"),o[f])}var c=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];var s=["January","February","March","April","May","June","July","August","September","October","November","December"];function l(r,t,n){var e=typeof r=="number"?r.toString():r||"";while(e.length<t){e=n[0]+e}return e}function v(r,t){return l(r,t,"0")}function h(r,t){function n(r){return r<0?-1:r>0?1:0}var e;if((e=n(r.getFullYear()-t.getFullYear()))===0){if((e=n(r.getMonth()-t.getMonth()))===0){e=n(r.getDate()-t.getDate())}}return e}function d(r){switch(r.getDay()){case 0:return new Date(r.getFullYear()-1,11,29);case 1:return r;case 2:return new Date(r.getFullYear(),0,3);case 3:return new Date(r.getFullYear(),0,2);case 4:return new Date(r.getFullYear(),0,1);case 5:return new Date(r.getFullYear()-1,11,31);case 6:return new Date(r.getFullYear()-1,11,30)}}function p(r){var t=en(new Date(r.tm_year+1900,0,1),r.tm_yday);var n=new Date(t.getFullYear(),0,4);var e=new Date(t.getFullYear()+1,0,4);var a=d(n);var i=d(e);if(h(a,t)<=0){if(h(i,t)<=0){return t.getFullYear()+1}return t.getFullYear()}return t.getFullYear()-1}var y={"%a":function(r){return c[r.tm_wday].substring(0,3)},"%A":function(r){return c[r.tm_wday]},"%b":function(r){return s[r.tm_mon].substring(0,3)},"%B":function(r){return s[r.tm_mon]},"%C":function(r){var t=r.tm_year+1900;return v(t/100|0,2)},"%d":function(r){return v(r.tm_mday,2)},"%e":function(r){return l(r.tm_mday,2," ")},"%g":function(r){return p(r).toString().substring(2)},"%G":function(r){return p(r)},"%H":function(r){return v(r.tm_hour,2)},"%I":function(r){var t=r.tm_hour;if(t==0)t=12;else if(t>12)t-=12;return v(t,2)},"%j":function(r){return v(r.tm_mday+rn(Qt(r.tm_year+1900)?tn:nn,r.tm_mon-1),3)},"%m":function(r){return v(r.tm_mon+1,2)},"%M":function(r){return v(r.tm_min,2)},"%n":function(){return"\n"},"%p":function(r){if(r.tm_hour>=0&&r.tm_hour<12){return"AM"}return"PM"},"%S":function(r){return v(r.tm_sec,2)},"%t":function(){return"\t"},"%u":function(r){return r.tm_wday||7},"%U":function(r){var t=r.tm_yday+7-r.tm_wday;return v(Math.floor(t/7),2)},"%V":function(r){var t=Math.floor((r.tm_yday+7-(r.tm_wday+6)%7)/7);if((r.tm_wday+371-r.tm_yday-2)%7<=2){t++}if(!t){t=52;var n=(r.tm_wday+7-r.tm_yday-1)%7;if(n==4||n==5&&Qt(r.tm_year%400-1)){t++}}else if(t==53){var e=(r.tm_wday+371-r.tm_yday)%7;if(e!=4&&(e!=3||!Qt(r.tm_year)))t=1}return v(t,2)},"%w":function(r){return r.tm_wday},"%W":function(r){var t=r.tm_yday+7-(r.tm_wday+6)%7;return v(Math.floor(t/7),2)},"%y":function(r){return(r.tm_year+1900).toString().substring(2)},"%Y":function(r){return r.tm_year+1900},"%z":function(r){var t=r.tm_gmtoff;var n=t>=0;t=Math.abs(t)/60;t=t/60*100+t%60;return(n?"+":"-")+String("0000"+t).slice(-4)},"%Z":function(r){return r.tm_zone},"%%":function(){return"%"}};u=u.replace(/%%/g,"\0\0");for(var f in y){if(u.includes(f)){u=u.replace(new RegExp(f,"g"),y[f](i))}}u=u.replace(/\0\0/g,"%");var m=an(u,false);if(m.length>t){return 0}lr(m,r);return m.length-1}function on(r,t,n,e){return un(r,t,n,e)}zr=n["InternalError"]=Vr(Error,"InternalError");Zr();$r=n["BindingError"]=Vr(Error,"BindingError");ut();bt=n["UnboundTypeError"]=Vr(Error,"UnboundTypeError");var fn={j:vr,p:yr,s:Tr,a:Cr,g:Er,E:Fr,l:wr,K:Pr,U:Wr,n:Sr,da:jr,c:Ar,ka:Xr,Z:qr,ha:rt,ga:ft,S:st,V:Ct,y:Ft,t:Pt,R:Wt,M:Ot,la:It,A:Ut,ia:Ht,L:Yt,fa:Vt,ea:Nt,ba:Jt,ca:$t,I:Ln,z:qn,P:te,Q:re,r:On,f:Wn,ja:Qn,H:Gn,b:jn,T:Jn,h:Rn,i:Bn,v:zn,w:Vn,W:Mn,J:Nn,x:Zn,Y:ue,$:ae,_:ie,X:oe,m:xn,o:Un,d:kn,e:Sn,k:Dn,N:Kn,q:Hn,B:In,u:Xn,O:Yn,G:$n,C:ne,F:ee,D:Kt,aa:on};var cn=cr();var sn=n["___wasm_call_ctors"]=function(){return(sn=n["___wasm_call_ctors"]=n["asm"]["na"]).apply(null,arguments)};var ln=n["_free"]=function(){return(ln=n["_free"]=n["asm"]["oa"]).apply(null,arguments)};var vn=n["_malloc"]=function(){return(vn=n["_malloc"]=n["asm"]["pa"]).apply(null,arguments)};var hn=n["___getTypeName"]=function(){return(hn=n["___getTypeName"]=n["asm"]["ra"]).apply(null,arguments)};var dn=n["__embind_initialize_bindings"]=function(){return(dn=n["__embind_initialize_bindings"]=n["asm"]["sa"]).apply(null,arguments)};var pn=n["_setThrew"]=function(){return(pn=n["_setThrew"]=n["asm"]["ta"]).apply(null,arguments)};var yn=n["setTempRet0"]=function(){return(yn=n["setTempRet0"]=n["asm"]["ua"]).apply(null,arguments)};var mn=n["stackSave"]=function(){return(mn=n["stackSave"]=n["asm"]["va"]).apply(null,arguments)};var gn=n["stackRestore"]=function(){return(gn=n["stackRestore"]=n["asm"]["wa"]).apply(null,arguments)};var wn=n["___cxa_can_catch"]=function(){return(wn=n["___cxa_can_catch"]=n["asm"]["xa"]).apply(null,arguments)};var _n=n["___cxa_is_pointer_type"]=function(){return(_n=n["___cxa_is_pointer_type"]=n["asm"]["ya"]).apply(null,arguments)};var bn=n["dynCall_viijii"]=function(){return(bn=n["dynCall_viijii"]=n["asm"]["za"]).apply(null,arguments)};var Tn=n["dynCall_iij"]=function(){return(Tn=n["dynCall_iij"]=n["asm"]["Aa"]).apply(null,arguments)};var An=n["dynCall_jiii"]=function(){return(An=n["dynCall_jiii"]=n["asm"]["Ba"]).apply(null,arguments)};var Cn=n["dynCall_iiiiij"]=function(){return(Cn=n["dynCall_iiiiij"]=n["asm"]["Ca"]).apply(null,arguments)};var En=n["dynCall_jiiii"]=function(){return(En=n["dynCall_jiiii"]=n["asm"]["Da"]).apply(null,arguments)};var Fn=n["dynCall_iiiiijj"]=function(){return(Fn=n["dynCall_iiiiijj"]=n["asm"]["Ea"]).apply(null,arguments)};var Pn=n["dynCall_iiiiiijj"]=function(){return(Pn=n["dynCall_iiiiiijj"]=n["asm"]["Fa"]).apply(null,arguments)};function Wn(r,t){var n=mn();try{return _r(r)(t)}catch(r){gn(n);if(r!==r+0)throw r;pn(1,0)}}function Sn(r,t,n,e){var a=mn();try{_r(r)(t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function jn(r,t,n){var e=mn();try{return _r(r)(t,n)}catch(r){gn(e);if(r!==r+0)throw r;pn(1,0)}}function kn(r,t,n){var e=mn();try{_r(r)(t,n)}catch(r){gn(e);if(r!==r+0)throw r;pn(1,0)}}function xn(r){var t=mn();try{_r(r)()}catch(r){gn(t);if(r!==r+0)throw r;pn(1,0)}}function Rn(r,t,n,e){var a=mn();try{return _r(r)(t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function Mn(r,t,n,e,a,i,u,o){var f=mn();try{return _r(r)(t,n,e,a,i,u,o)}catch(r){gn(f);if(r!==r+0)throw r;pn(1,0)}}function Dn(r,t,n,e,a){var i=mn();try{_r(r)(t,n,e,a)}catch(r){gn(i);if(r!==r+0)throw r;pn(1,0)}}function On(r){var t=mn();try{return _r(r)()}catch(r){gn(t);if(r!==r+0)throw r;pn(1,0)}}function In(r,t,n,e,a,i,u){var o=mn();try{_r(r)(t,n,e,a,i,u)}catch(r){gn(o);if(r!==r+0)throw r;pn(1,0)}}function Un(r,t){var n=mn();try{_r(r)(t)}catch(r){gn(n);if(r!==r+0)throw r;pn(1,0)}}function Hn(r,t,n,e,a,i){var u=mn();try{_r(r)(t,n,e,a,i)}catch(r){gn(u);if(r!==r+0)throw r;pn(1,0)}}function Yn(r,t,n,e,a,i,u,o,f){var c=mn();try{_r(r)(t,n,e,a,i,u,o,f)}catch(r){gn(c);if(r!==r+0)throw r;pn(1,0)}}function Vn(r,t,n,e,a,i,u){var o=mn();try{return _r(r)(t,n,e,a,i,u)}catch(r){gn(o);if(r!==r+0)throw r;pn(1,0)}}function zn(r,t,n,e,a,i){var u=mn();try{return _r(r)(t,n,e,a,i)}catch(r){gn(u);if(r!==r+0)throw r;pn(1,0)}}function Bn(r,t,n,e,a){var i=mn();try{return _r(r)(t,n,e,a)}catch(r){gn(i);if(r!==r+0)throw r;pn(1,0)}}function Nn(r,t,n,e,a,i,u,o,f){var c=mn();try{return _r(r)(t,n,e,a,i,u,o,f)}catch(r){gn(c);if(r!==r+0)throw r;pn(1,0)}}function Xn(r,t,n,e,a,i,u,o){var f=mn();try{_r(r)(t,n,e,a,i,u,o)}catch(r){gn(f);if(r!==r+0)throw r;pn(1,0)}}function qn(r,t,n){var e=mn();try{return _r(r)(t,n)}catch(r){gn(e);if(r!==r+0)throw r;pn(1,0)}}function Ln(r,t){var n=mn();try{return _r(r)(t)}catch(r){gn(n);if(r!==r+0)throw r;pn(1,0)}}function Zn(r,t,n,e,a,i,u,o,f,c,s,l){var v=mn();try{return _r(r)(t,n,e,a,i,u,o,f,c,s,l)}catch(r){gn(v);if(r!==r+0)throw r;pn(1,0)}}function Gn(r,t,n){var e=mn();try{return _r(r)(t,n)}catch(r){gn(e);if(r!==r+0)throw r;pn(1,0)}}function Jn(r,t,n,e,a){var i=mn();try{return _r(r)(t,n,e,a)}catch(r){gn(i);if(r!==r+0)throw r;pn(1,0)}}function $n(r,t,n,e,a,i,u,o,f,c){var s=mn();try{_r(r)(t,n,e,a,i,u,o,f,c)}catch(r){gn(s);if(r!==r+0)throw r;pn(1,0)}}function Kn(r,t,n,e,a,i){var u=mn();try{_r(r)(t,n,e,a,i)}catch(r){gn(u);if(r!==r+0)throw r;pn(1,0)}}function Qn(r,t,n,e){var a=mn();try{return _r(r)(t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function re(r,t,n,e){var a=mn();try{return _r(r)(t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function te(r,t,n,e){var a=mn();try{return _r(r)(t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function ne(r,t,n,e,a,i,u,o,f,c,s){var l=mn();try{_r(r)(t,n,e,a,i,u,o,f,c,s)}catch(r){gn(l);if(r!==r+0)throw r;pn(1,0)}}function ee(r,t,n,e,a,i,u,o,f,c,s,l,v,h,d,p){var y=mn();try{_r(r)(t,n,e,a,i,u,o,f,c,s,l,v,h,d,p)}catch(r){gn(y);if(r!==r+0)throw r;pn(1,0)}}function ae(r,t,n,e){var a=mn();try{return Tn(r,t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function ie(r,t,n,e){var a=mn();try{return An(r,t,n,e)}catch(r){gn(a);if(r!==r+0)throw r;pn(1,0)}}function ue(r,t,n,e,a,i,u){var o=mn();try{return Cn(r,t,n,e,a,i,u)}catch(r){gn(o);if(r!==r+0)throw r;pn(1,0)}}function oe(r,t,n,e,a){var i=mn();try{return En(r,t,n,e,a)}catch(r){gn(i);if(r!==r+0)throw r;pn(1,0)}}var fe;rr=function r(){if(!fe)ce();if(!fe)rr=r};function ce(r){r=r||u;if(K>0){return}q();if(K>0){return}function t(){if(fe)return;fe=true;n["calledRun"]=true;if(T)return;L();e(n);if(n["onRuntimeInitialized"])n["onRuntimeInitialized"]();Z()}if(n["setStatus"]){n["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){n["setStatus"]("")},1);t()},1)}else{t()}}if(n["preInit"]){if(typeof n["preInit"]=="function")n["preInit"]=[n["preInit"]];while(n["preInit"].length>0){n["preInit"].pop()()}}ce();return t.ready}})();if(typeof exports==="object"&&typeof module==="object")module.exports=ZXing;else if(typeof define==="function"&&define["amd"])define([],function(){return ZXing});else if(typeof exports==="object")exports["ZXing"]=ZXing;
//# sourceMappingURL=zxing_reader.js.map