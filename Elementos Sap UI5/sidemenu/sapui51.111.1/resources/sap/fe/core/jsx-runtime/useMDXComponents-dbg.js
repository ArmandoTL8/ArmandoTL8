/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/jsx-runtime/ViewLoader", "sap/fe/macros/macroLibrary", "sap/m/FormattedText", "sap/m/HBox", "sap/m/Panel", "sap/m/Title", "sap/ui/codeeditor/CodeEditor", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockRuntime, ClassSupport, MDXViewLoader, macroLibrary, FormattedText, HBox, Panel, Title, CodeEditor, Fragment, library, XMLPreprocessor, _jsx) {
  "use strict";

  var TitleLevel = library.TitleLevel;
  var createReference = ClassSupport.createReference;
  var parseXMLString = BuildingBlockRuntime.parseXMLString;
  function p(strValue) {
    const content = Array.isArray(strValue.children) ? strValue.children.map(child => {
      let output;
      if (typeof child === "string") {
        output = child;
      } else {
        switch (child.getMetadata().getName()) {
          case "sap.m.Link":
            output = `<a href="${child.getHref()}">${child.getText()}</a>`;
            break;
          case "sap.ui.codeeditor.CodeEditor":
            output = `<code>${child.getValue()}</code>`;
            break;
        }
      }
      return output;
    }).join("") : strValue.children;
    return _jsx(FormattedText, {
      htmlText: content,
      class: "sapUiTinyMarginBottom"
    });
  }
  function h1(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H1,
      class: "sapUiTinyMarginBottom"
    });
  }
  function a(strValue) {
    return `<a href={strValue.href}>${strValue.children}</a>`;
  }
  function ul(strValue) {
    const ulContent = `<ul>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</ul>`;
    return _jsx(FormattedText, {
      htmlText: ulContent
    });
  }
  function li(strValue) {
    return `<li>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</li>`;
  }
  function h2(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H2,
      class: "sapUiSmallMarginTop sapUiTinyMarginBottom"
    });
  }
  function pre(content) {
    return content.children;
  }
  function BuildingBlockPlayground(inValue) {
    const sourceHBox = createReference();
    const binding = inValue.binding ? {
      path: inValue.binding
    } : undefined;
    const target = _jsx(Panel, {
      headerText: inValue.headerText || "",
      class: "sapUiSmallMarginTop",
      children: _jsx(HBox, {
        ref: sourceHBox
      })
    });
    // 	<TabContainer>
    // 		{{
    // 			items: [
    // 				<TabContainerItem name={"Sample"}>{{ content:  }},</TabContainerItem>,
    // 				<TabContainerItem name={"Source"}>
    // 					{{
    // 						content: (
    // 							<CodeBlock editable={false} lineNumbers={true} type={"xml"} lineCount={10}>
    // 								{inValue.children}
    // 							</CodeBlock>
    // 						)
    // 					}}
    // 				</TabContainerItem>
    // 			]
    // 		}}
    // 	</TabContainer>
    // );
    if (binding) {
      target.bindElement(binding);
    }
    macroLibrary.register();
    const fragmentOrPromise = XMLPreprocessor.process(parseXMLString(`<root>${inValue.children}</root>`, true)[0], {
      name: "myBuildingBlockFragment"
    }, MDXViewLoader.preprocessorData);
    Promise.resolve(fragmentOrPromise).then(fragment => {
      return Fragment.load({
        definition: fragment.firstElementChild,
        controller: MDXViewLoader.controller
      });
    }).then(fragmentContent => {
      sourceHBox.current.removeAllItems();
      sourceHBox.current.addItem(fragmentContent);
    }).catch(err => {
      Log.error(err);
    });
    return target;
  }
  function CodeBlock(inValue) {
    var _inValue$children, _snippet$split, _inValue$className;
    const snippet = ((_inValue$children = inValue.children) === null || _inValue$children === void 0 ? void 0 : _inValue$children.trim()) || "";
    const lineCount = inValue.lineCount || Math.max((_snippet$split = snippet.split("\n")) === null || _snippet$split === void 0 ? void 0 : _snippet$split.length, 3);
    const type = inValue.type || (inValue === null || inValue === void 0 ? void 0 : (_inValue$className = inValue.className) === null || _inValue$className === void 0 ? void 0 : _inValue$className.split("-")[1]) || "js";
    const myCodeEditor = _jsx(CodeEditor, {
      class: "sapUiTinyMargin",
      lineNumbers: inValue.lineNumbers || false,
      type: type,
      editable: inValue.editable || false,
      maxLines: lineCount,
      height: "auto",
      width: "98%"
    });
    myCodeEditor.setValue(snippet);
    if (inValue.source) {
      fetch(inValue.source).then(res => res.text()).then(text => {
        var _text$split;
        const newLineCount = Math.max((_text$split = text.split("\n")) === null || _text$split === void 0 ? void 0 : _text$split.length, 3);
        myCodeEditor.setMaxLines(newLineCount);
        myCodeEditor.setValue(text);
      }).catch(e => {
        myCodeEditor.setValue(e.message);
      });
    }
    return myCodeEditor;
  }
  const provideComponenents = function () {
    return {
      p: p,
      a: a,
      h1: h1,
      h2: h2,
      ul: ul,
      li: li,
      pre: pre,
      code: CodeBlock,
      CodeBlock: CodeBlock,
      BuildingBlockPlayground: BuildingBlockPlayground
    };
  };
  return provideComponenents;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwIiwic3RyVmFsdWUiLCJjb250ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiY2hpbGRyZW4iLCJtYXAiLCJjaGlsZCIsIm91dHB1dCIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEhyZWYiLCJnZXRUZXh0IiwiZ2V0VmFsdWUiLCJqb2luIiwiaDEiLCJUaXRsZUxldmVsIiwiSDEiLCJhIiwidWwiLCJ1bENvbnRlbnQiLCJsaSIsImgyIiwiSDIiLCJwcmUiLCJCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZCIsImluVmFsdWUiLCJzb3VyY2VIQm94IiwiY3JlYXRlUmVmZXJlbmNlIiwiYmluZGluZyIsInBhdGgiLCJ1bmRlZmluZWQiLCJ0YXJnZXQiLCJoZWFkZXJUZXh0IiwiYmluZEVsZW1lbnQiLCJtYWNyb0xpYnJhcnkiLCJyZWdpc3RlciIsImZyYWdtZW50T3JQcm9taXNlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsInBhcnNlWE1MU3RyaW5nIiwibmFtZSIsIk1EWFZpZXdMb2FkZXIiLCJwcmVwcm9jZXNzb3JEYXRhIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwiZnJhZ21lbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJjb250cm9sbGVyIiwiZnJhZ21lbnRDb250ZW50IiwiY3VycmVudCIsInJlbW92ZUFsbEl0ZW1zIiwiYWRkSXRlbSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJDb2RlQmxvY2siLCJzbmlwcGV0IiwidHJpbSIsImxpbmVDb3VudCIsIk1hdGgiLCJtYXgiLCJzcGxpdCIsImxlbmd0aCIsInR5cGUiLCJjbGFzc05hbWUiLCJteUNvZGVFZGl0b3IiLCJsaW5lTnVtYmVycyIsImVkaXRhYmxlIiwic2V0VmFsdWUiLCJzb3VyY2UiLCJmZXRjaCIsInJlcyIsInRleHQiLCJuZXdMaW5lQ291bnQiLCJzZXRNYXhMaW5lcyIsImUiLCJtZXNzYWdlIiwicHJvdmlkZUNvbXBvbmVuZW50cyIsImNvZGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbInVzZU1EWENvbXBvbmVudHMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgcGFyc2VYTUxTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1EWFZpZXdMb2FkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL1ZpZXdMb2FkZXJcIjtcbmltcG9ydCBtYWNyb0xpYnJhcnkgZnJvbSBcInNhcC9mZS9tYWNyb3MvbWFjcm9MaWJyYXJ5XCI7XG5pbXBvcnQgRm9ybWF0dGVkVGV4dCBmcm9tIFwic2FwL20vRm9ybWF0dGVkVGV4dFwiO1xuaW1wb3J0IEhCb3ggZnJvbSBcInNhcC9tL0hCb3hcIjtcbmltcG9ydCBQYW5lbCBmcm9tIFwic2FwL20vUGFuZWxcIjtcbmltcG9ydCBUaXRsZSBmcm9tIFwic2FwL20vVGl0bGVcIjtcbmltcG9ydCBDb2RlRWRpdG9yIGZyb20gXCJzYXAvdWkvY29kZWVkaXRvci9Db2RlRWRpdG9yXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgeyBUaXRsZUxldmVsIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5mdW5jdGlvbiBwKHN0clZhbHVlOiBhbnkpIHtcblx0Y29uc3QgY29udGVudCA9IEFycmF5LmlzQXJyYXkoc3RyVmFsdWUuY2hpbGRyZW4pXG5cdFx0PyBzdHJWYWx1ZS5jaGlsZHJlblxuXHRcdFx0XHQubWFwKChjaGlsZDogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IG91dHB1dDtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHRvdXRwdXQgPSBjaGlsZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3dpdGNoIChjaGlsZC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSkge1xuXHRcdFx0XHRcdFx0XHRjYXNlIFwic2FwLm0uTGlua1wiOlxuXHRcdFx0XHRcdFx0XHRcdG91dHB1dCA9IGA8YSBocmVmPVwiJHtjaGlsZC5nZXRIcmVmKCl9XCI+JHtjaGlsZC5nZXRUZXh0KCl9PC9hPmA7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJzYXAudWkuY29kZWVkaXRvci5Db2RlRWRpdG9yXCI6XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0ID0gYDxjb2RlPiR7Y2hpbGQuZ2V0VmFsdWUoKX08L2NvZGU+YDtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmpvaW4oXCJcIilcblx0XHQ6IHN0clZhbHVlLmNoaWxkcmVuO1xuXHRyZXR1cm4gPEZvcm1hdHRlZFRleHQgaHRtbFRleHQ9e2NvbnRlbnR9IGNsYXNzPXtcInNhcFVpVGlueU1hcmdpbkJvdHRvbVwifSAvPjtcbn1cblxuZnVuY3Rpb24gaDEoc3RyVmFsdWU6IGFueSkge1xuXHRyZXR1cm4gPFRpdGxlIHRleHQ9e3N0clZhbHVlLmNoaWxkcmVufSBsZXZlbD17VGl0bGVMZXZlbC5IMX0gY2xhc3M9e1wic2FwVWlUaW55TWFyZ2luQm90dG9tXCJ9IC8+O1xufVxuZnVuY3Rpb24gYShzdHJWYWx1ZTogYW55KSB7XG5cdHJldHVybiBgPGEgaHJlZj17c3RyVmFsdWUuaHJlZn0+JHtzdHJWYWx1ZS5jaGlsZHJlbn08L2E+YDtcbn1cbmZ1bmN0aW9uIHVsKHN0clZhbHVlOiBhbnkpIHtcblx0Y29uc3QgdWxDb250ZW50ID0gYDx1bD4ke0FycmF5LmlzQXJyYXkoc3RyVmFsdWUuY2hpbGRyZW4pID8gc3RyVmFsdWUuY2hpbGRyZW4uam9pbihcIlwiKSA6IHN0clZhbHVlLmNoaWxkcmVufTwvdWw+YDtcblx0cmV0dXJuIDxGb3JtYXR0ZWRUZXh0IGh0bWxUZXh0PXt1bENvbnRlbnR9IC8+O1xufVxuZnVuY3Rpb24gbGkoc3RyVmFsdWU6IGFueSkge1xuXHRyZXR1cm4gYDxsaT4ke0FycmF5LmlzQXJyYXkoc3RyVmFsdWUuY2hpbGRyZW4pID8gc3RyVmFsdWUuY2hpbGRyZW4uam9pbihcIlwiKSA6IHN0clZhbHVlLmNoaWxkcmVufTwvbGk+YDtcbn1cbmZ1bmN0aW9uIGgyKHN0clZhbHVlOiBhbnkpIHtcblx0cmV0dXJuIDxUaXRsZSB0ZXh0PXtzdHJWYWx1ZS5jaGlsZHJlbn0gbGV2ZWw9e1RpdGxlTGV2ZWwuSDJ9IGNsYXNzPXtcInNhcFVpU21hbGxNYXJnaW5Ub3Agc2FwVWlUaW55TWFyZ2luQm90dG9tXCJ9IC8+O1xufVxuZnVuY3Rpb24gcHJlKGNvbnRlbnQ6IGFueSkge1xuXHRyZXR1cm4gY29udGVudC5jaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gQnVpbGRpbmdCbG9ja1BsYXlncm91bmQoaW5WYWx1ZTogYW55KSB7XG5cdGNvbnN0IHNvdXJjZUhCb3ggPSBjcmVhdGVSZWZlcmVuY2U8SEJveD4oKTtcblx0Y29uc3QgYmluZGluZyA9IGluVmFsdWUuYmluZGluZyA/IHsgcGF0aDogaW5WYWx1ZS5iaW5kaW5nIH0gOiB1bmRlZmluZWQ7XG5cdGNvbnN0IHRhcmdldCA9IChcblx0XHQ8UGFuZWwgaGVhZGVyVGV4dD17aW5WYWx1ZS5oZWFkZXJUZXh0IHx8IFwiXCJ9IGNsYXNzPXtcInNhcFVpU21hbGxNYXJnaW5Ub3BcIn0+XG5cdFx0XHQ8SEJveCByZWY9e3NvdXJjZUhCb3h9PjwvSEJveD5cblx0XHQ8L1BhbmVsPlxuXHQpO1xuXHQvLyBcdDxUYWJDb250YWluZXI+XG5cdC8vIFx0XHR7e1xuXHQvLyBcdFx0XHRpdGVtczogW1xuXHQvLyBcdFx0XHRcdDxUYWJDb250YWluZXJJdGVtIG5hbWU9e1wiU2FtcGxlXCJ9Pnt7IGNvbnRlbnQ6ICB9fSw8L1RhYkNvbnRhaW5lckl0ZW0+LFxuXHQvLyBcdFx0XHRcdDxUYWJDb250YWluZXJJdGVtIG5hbWU9e1wiU291cmNlXCJ9PlxuXHQvLyBcdFx0XHRcdFx0e3tcblx0Ly8gXHRcdFx0XHRcdFx0Y29udGVudDogKFxuXHQvLyBcdFx0XHRcdFx0XHRcdDxDb2RlQmxvY2sgZWRpdGFibGU9e2ZhbHNlfSBsaW5lTnVtYmVycz17dHJ1ZX0gdHlwZT17XCJ4bWxcIn0gbGluZUNvdW50PXsxMH0+XG5cdC8vIFx0XHRcdFx0XHRcdFx0XHR7aW5WYWx1ZS5jaGlsZHJlbn1cblx0Ly8gXHRcdFx0XHRcdFx0XHQ8L0NvZGVCbG9jaz5cblx0Ly8gXHRcdFx0XHRcdFx0KVxuXHQvLyBcdFx0XHRcdFx0fX1cblx0Ly8gXHRcdFx0XHQ8L1RhYkNvbnRhaW5lckl0ZW0+XG5cdC8vIFx0XHRcdF1cblx0Ly8gXHRcdH19XG5cdC8vIFx0PC9UYWJDb250YWluZXI+XG5cdC8vICk7XG5cdGlmIChiaW5kaW5nKSB7XG5cdFx0dGFyZ2V0LmJpbmRFbGVtZW50KGJpbmRpbmcpO1xuXHR9XG5cdG1hY3JvTGlicmFyeS5yZWdpc3RlcigpO1xuXHRjb25zdCBmcmFnbWVudE9yUHJvbWlzZSA9IFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdHBhcnNlWE1MU3RyaW5nKGA8cm9vdD4ke2luVmFsdWUuY2hpbGRyZW59PC9yb290PmAsIHRydWUpWzBdLFxuXHRcdHsgbmFtZTogXCJteUJ1aWxkaW5nQmxvY2tGcmFnbWVudFwiIH0sXG5cdFx0TURYVmlld0xvYWRlci5wcmVwcm9jZXNzb3JEYXRhXG5cdCk7XG5cdFByb21pc2UucmVzb2x2ZShmcmFnbWVudE9yUHJvbWlzZSlcblx0XHQudGhlbigoZnJhZ21lbnQ6IEVsZW1lbnQpID0+IHtcblx0XHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogZnJhZ21lbnQuZmlyc3RFbGVtZW50Q2hpbGQgYXMgYW55LCBjb250cm9sbGVyOiBNRFhWaWV3TG9hZGVyLmNvbnRyb2xsZXIgfSk7XG5cdFx0fSlcblx0XHQudGhlbigoZnJhZ21lbnRDb250ZW50OiBhbnkpID0+IHtcblx0XHRcdHNvdXJjZUhCb3guY3VycmVudC5yZW1vdmVBbGxJdGVtcygpO1xuXHRcdFx0c291cmNlSEJveC5jdXJyZW50LmFkZEl0ZW0oZnJhZ21lbnRDb250ZW50KTtcblx0XHR9KVxuXHRcdC5jYXRjaCgoZXJyOiBhbnkpID0+IHtcblx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdH0pO1xuXHRyZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gQ29kZUJsb2NrKGluVmFsdWU6IGFueSkge1xuXHRjb25zdCBzbmlwcGV0ID0gaW5WYWx1ZS5jaGlsZHJlbj8udHJpbSgpIHx8IFwiXCI7XG5cdGNvbnN0IGxpbmVDb3VudCA9IGluVmFsdWUubGluZUNvdW50IHx8IE1hdGgubWF4KHNuaXBwZXQuc3BsaXQoXCJcXG5cIik/Lmxlbmd0aCwgMyk7XG5cdGNvbnN0IHR5cGUgPSBpblZhbHVlLnR5cGUgfHwgaW5WYWx1ZT8uY2xhc3NOYW1lPy5zcGxpdChcIi1cIilbMV0gfHwgXCJqc1wiO1xuXHRjb25zdCBteUNvZGVFZGl0b3IgPSAoXG5cdFx0PENvZGVFZGl0b3Jcblx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luXCJcblx0XHRcdGxpbmVOdW1iZXJzPXtpblZhbHVlLmxpbmVOdW1iZXJzIHx8IGZhbHNlfVxuXHRcdFx0dHlwZT17dHlwZX1cblx0XHRcdGVkaXRhYmxlPXtpblZhbHVlLmVkaXRhYmxlIHx8IGZhbHNlfVxuXHRcdFx0bWF4TGluZXM9e2xpbmVDb3VudH1cblx0XHRcdGhlaWdodD17XCJhdXRvXCJ9XG5cdFx0XHR3aWR0aD17XCI5OCVcIn1cblx0XHQ+PC9Db2RlRWRpdG9yPlxuXHQpO1xuXHRteUNvZGVFZGl0b3Iuc2V0VmFsdWUoc25pcHBldCk7XG5cdGlmIChpblZhbHVlLnNvdXJjZSkge1xuXHRcdGZldGNoKGluVmFsdWUuc291cmNlKVxuXHRcdFx0LnRoZW4oKHJlcykgPT4gcmVzLnRleHQoKSlcblx0XHRcdC50aGVuKCh0ZXh0KSA9PiB7XG5cdFx0XHRcdGNvbnN0IG5ld0xpbmVDb3VudCA9IE1hdGgubWF4KHRleHQuc3BsaXQoXCJcXG5cIik/Lmxlbmd0aCwgMyk7XG5cdFx0XHRcdG15Q29kZUVkaXRvci5zZXRNYXhMaW5lcyhuZXdMaW5lQ291bnQpO1xuXHRcdFx0XHRteUNvZGVFZGl0b3Iuc2V0VmFsdWUodGV4dCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChlKSA9PiB7XG5cdFx0XHRcdG15Q29kZUVkaXRvci5zZXRWYWx1ZShlLm1lc3NhZ2UpO1xuXHRcdFx0fSk7XG5cdH1cblx0cmV0dXJuIG15Q29kZUVkaXRvcjtcbn1cblxuY29uc3QgcHJvdmlkZUNvbXBvbmVuZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcblx0XHRwOiBwLFxuXHRcdGE6IGEsXG5cdFx0aDE6IGgxLFxuXHRcdGgyOiBoMixcblx0XHR1bDogdWwsXG5cdFx0bGk6IGxpLFxuXHRcdHByZTogcHJlLFxuXHRcdGNvZGU6IENvZGVCbG9jayxcblx0XHRDb2RlQmxvY2s6IENvZGVCbG9jayxcblx0XHRCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZDogQnVpbGRpbmdCbG9ja1BsYXlncm91bmRcblx0fTtcbn07XG5leHBvcnQgZGVmYXVsdCBwcm92aWRlQ29tcG9uZW5lbnRzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBYUEsU0FBU0EsQ0FBQyxDQUFDQyxRQUFhLEVBQUU7SUFDekIsTUFBTUMsT0FBTyxHQUFHQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0gsUUFBUSxDQUFDSSxRQUFRLENBQUMsR0FDN0NKLFFBQVEsQ0FBQ0ksUUFBUSxD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