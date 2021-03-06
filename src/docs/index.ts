/// <reference path="./typings/index.d.ts" />

import * as ts from 'typescript';
import debounce = require('lodash.debounce');
import { Options } from '../options';
import { FileReflection } from '../host';
import { contents as lib } from 'monaco-typescript/lib/lib-es6-ts.js';
import TransformWorker = require('worker-loader!./worker');
import runWindowHtml = require('./run.html');

const worker: Worker = new TransformWorker();
worker.onmessage = onMessage;

const runWindowCode = runWindowHtml
  .replace(new RegExp(/__BASE__/), window.location.href.replace(/\/?$/, '/'))
  .replace(new RegExp(/__VERSION__/g), VERSION);

let tsEditor: monaco.editor.IStandaloneCodeEditor;
let jsEditor: monaco.editor.IStandaloneCodeEditor;
let result: FileReflection[];
let runWindow: Window;

const _editorJs = document.getElementById('editor-js');
const _editorTs = document.getElementById('editor-ts');
const _runCode = document.getElementById('run-code');
const _loading = document.getElementById('loading');
const _processing = document.getElementById('processing');
const _optionsToggle = document.getElementById('options-toggle');
const _options = document.getElementById('options');
const _consoleContent = document.getElementById('console-content');

let defaultOptions: Options;
(window as any).tsr = {};

function setDefaultOptions(): void {
  defaultOptions = {
    force: true,
    noAnnotate: false,
    declarationPrefix: '_',
    compilerOptions: {
      noImplicitAny: false,
      strictNullChecks: true,
      noImplicitReturns: false,
      noImplicitThis: false,
      removeComments: false,
      experimentalDecorators: true,
      emitDecoratorMetadata: false,
      allowNonTsExtensions: true,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      target: monaco.languages.typescript.ScriptTarget.ES2015
    }
  };
}

function bootstrap(): void {
  const win = window as any;
  win.require.config({ paths: { vs: MONACO_LOCATION } });

  (window as any).MonacoEnvironment = {
    getWorkerUrl: (workerId: any, label: any) => {
      return 'proxy.js';
    }
  };

  win.require([MONACO_ENTRY], init);
}

function init(): void {
  setDefaultOptions();
  expose();
  updateCompilerOptions();

  tsEditor = monaco.editor.create(_editorTs, {
    value: [
      'interface A<T> {',
      '    prop: T;',
      '}',
      '',
      'let a: A<string> = {',
      '    prop: 1 as any',
      '};',
      ''
    ].join('\n'),
    language: 'typescript',
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    selectionClipboard: false
  });

  jsEditor = monaco.editor.create(_editorJs, {
    value: [
      '',
    ].join('\n'),
    language: 'javascript',
    readOnly: true,
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    contextmenu: false,
    quickSuggestions: false,
    parameterHints: false,
    autoClosingBrackets: false,
    suggestOnTriggerCharacters: false,
    snippetSuggestions: 'none',
    wordBasedSuggestions: false,
    selectionClipboard: false,
    find: {
      seedSearchStringFromSelection: false,
      autoFindInSelection: false
    }
  });

  ready();
}

function ready(): void {
  tsEditor.onDidChangeModelContent(debounce(onCodeChange, 400));
  _optionsToggle.onclick = toggleOptions;
  _runCode.onclick = runCode;
  initOptions();
  onCodeChange();
  fadeOut(_loading);
}

function expose() {
  (window as any).tsr.options = defaultOptions;
  (window as any).tsr.compile = onCodeChange;
  (window as any).tsr.run = runCode;
  (window as any).tsr.sync = () => {
    initOptions();
    updateCompilerOptions();
  };
}

function initOptions() {
  let inputs = document
    .getElementById('options')
    .getElementsByClassName('compilerOption') as
    NodeListOf<HTMLInputElement | HTMLSelectElement>;

  for (let i = 0; i < inputs.length; i++) {
    if ((window as any).tsr.options.compilerOptions.hasOwnProperty(inputs[i].name)) {
      if (inputs[i] instanceof HTMLInputElement) {
        if ((inputs[i] as HTMLInputElement).type === 'checkbox') {
          (inputs[i] as HTMLInputElement).checked = !!defaultOptions.compilerOptions[inputs[i].name];
        } else if ((inputs[i] as HTMLInputElement).type === 'text') {
        (inputs[i] as HTMLInputElement).value = `${defaultOptions.compilerOptions[inputs[i].name]}`;
        }

      } else if (inputs[i] instanceof HTMLSelectElement) {
        (inputs[i] as HTMLSelectElement).value = `${defaultOptions.compilerOptions[inputs[i].name]}`;
      }
    }

    inputs[i].onchange = onCompilerOptionChange;
  }

  inputs = document
    .getElementById('options')
    .getElementsByClassName('tsrOption') as
    NodeListOf<HTMLInputElement | HTMLSelectElement>;

  for (let i = 0; i < inputs.length; i++) {
    if ((window as any).tsr.options.hasOwnProperty(inputs[i].name)) {
      if (inputs[i] instanceof HTMLInputElement) {
        if ((inputs[i] as HTMLInputElement).type === 'checkbox') {
          (inputs[i] as HTMLInputElement).checked = !!defaultOptions[inputs[i].name];
        } else if ((inputs[i] as HTMLInputElement).type === 'text') {
          (inputs[i] as HTMLInputElement).value = defaultOptions[inputs[i].name];
        }
      } else if (inputs[i] instanceof HTMLSelectElement) {
        (inputs[i] as HTMLSelectElement).value = `${defaultOptions[inputs[i].name]}`;
      }
    }

    inputs[i].onchange = onOptionChange;
  }
}

function onOptionChange(this: HTMLInputElement | HTMLSelectElement, ev: Event): any {
  let value = (window as any).tsr.options[this.name];

  if (this instanceof HTMLInputElement) {
    if ((this as HTMLInputElement).type === 'checkbox') {
      value = !!(this as HTMLInputElement).checked;
    } else if ((this as HTMLInputElement).type === 'text') {
      value = (this as HTMLInputElement).value;
    }
  } else if (this instanceof HTMLSelectElement) {
    value = (this as HTMLSelectElement).value;
  } else {
    value = this.value;
  }

  (window as any).tsr.options[this.name] = value;

  updateCompilerOptions();
  onCodeChange();
}

function onCompilerOptionChange(this: HTMLInputElement | HTMLSelectElement, ev: Event): any {
  let value = (window as any).tsr.options.compilerOptions[this.name];

  if (this instanceof HTMLInputElement) {
    if ((this as HTMLInputElement).type === 'checkbox') {
      value = !!(this as HTMLInputElement).checked;
    } else if ((this as HTMLInputElement).type === 'text') {
      value = (this as HTMLInputElement).value;
    }
  } else if (this instanceof HTMLSelectElement) {
    value = (this as HTMLSelectElement).value;
  } else {
    value = this.value;
  }

  (window as any).tsr.options.compilerOptions[this.name] = value;

  updateCompilerOptions();
  onCodeChange();
}

function onCodeChange(event?: monaco.editor.IModelContentChangedEvent): void {
  transform(event);
}

function onMessage(e: MessageEvent) {
  if (e.data.name === 'transformed') {
    const transformed: FileReflection[] = e.data.data;

    hideProcessingIndicator();

    if (transformed && transformed.length !== 0) {
      result = transformed;
      jsEditor.getModel().setValue(transformed[0].text);
    }
  }

  if (e.data.name === 'log') {
    const message: any = e.data.data.message;
    const optionalParams: any[] = e.data.data.optionalParams;
    (console as any)[e.data.type](message, ...optionalParams);
    updateConsole(e.data.type, message, ...optionalParams);
  }
}

function transform(event?: monaco.editor.IModelContentChangedEvent): void {
  const modules = [
    {
      name: 'lib.d.ts',
      text: lib
    },
    {
      name: 'src/playground.ts',
      text: tsEditor.getValue()
    }
  ];

  clearConsole();
  showProcessingIndicator();

  worker.postMessage({
    name: 'transform',
    entryFiles: ['src/playground'],
    reflections: modules,
    options: getOptions()
  });
}

function runCode(): void {
  let win: Window;

  if (!runWindow || runWindow.closed) {
    win = window.open('', '', 'width=800,height=600');
    runWindow = win;
  } else {
    win = runWindow;
  }

  win.document.open()
  win.document.write(getWindowCode());
  win.document.close();
}

function updateJsEditor(text: string): void {
  jsEditor.getModel().setValue(text);
}

function updateCompilerOptions(): void {
  const compilerOptions = getCompilerOptions();
  compilerOptions.allowNonTsExtensions = true;
  compilerOptions.noEmit = true;
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
}

function getOptions(): Options {
  return JSON.parse(JSON.stringify((window as any).tsr.options));
}

function getCompilerOptions(): Options {
  return JSON.parse(JSON.stringify((window as any).tsr.options.compilerOptions));
}

function getWindowCode(): string {
  return runWindowCode
    .replace(/__CODE__/, sanitizeRunCode(getJsCode()))
    .replace(/__CODE_TSR__/, sanitizeRunCode(getTsrCode()));
}

function getJsCode(): string {
  let resultReflection: FileReflection;
  let jsCode = '';

  if (result) {
    resultReflection = find(result, (element) => {
      return /src\/playground\.js$/.test(element.name);
    });
  }

  if (resultReflection && resultReflection.text) {
    jsCode = resultReflection.text;
  } else {
    jsCode = jsEditor.getValue();
  }

  return jsCode;
}

function getTsrCode(): string {
  let tsrReflection: FileReflection;
  let tsrCode = '';

  if (result) {
    tsrReflection = find(result, (element) => {
      return /tsr\-declarations\.js$/.test(element.name);
    });
  }

  if (tsrReflection && tsrReflection.text) {
    tsrCode = tsrReflection.text;
  }

  const libIdentifier = getLibIdentifier(getJsCode());

  let libDeclaration = `var ___t = ___t ? ___t : window.t.default;`;
  libDeclaration += `\nvar ${libIdentifier} = ___t;`;

  tsrCode = libDeclaration + '\n' + tsrCode;

  return tsrCode;
}

function sanitizeRunCode(text: string): string {
  let result = text;

  const regexLib = /import(.*)from "ts-runtime\/lib";\s/ig;
  const regexDeclarations = /import ".*tsr-declarations";\s/ig;

  const libMatches = new RegExp(regexLib).exec(text);

  if (libMatches !== null) {
    if (typeof libMatches[0] === 'string') {
      result = text.replace(libMatches[0], '');
    }
  }

  const declarationMatches = new RegExp(regexDeclarations).exec(result);

  if (declarationMatches !== null) {
    if (typeof declarationMatches[0] === 'string') {
      result = result.replace(declarationMatches[0], '')
    }
  }

  return result;
}

function getLibIdentifier(text: string): string {
  let libIdentifier = 't';

  const regexLib = /import(.*)from "ts-runtime\/lib";\s/ig;

  const libMatches = new RegExp(regexLib).exec(text);

  if (libMatches !== null) {
    if (typeof libMatches[1] === 'string') {
      libIdentifier = libMatches[1].trim();
    }
  }

  return libIdentifier;
}

function clearConsole(): void {
  _consoleContent.innerHTML = '';
}

function wrapConsoleText(type: string, text: string): string {
  return `<span class="log-${type}"><span class="icon-${type}"></span>${text}</span>`;
}

function updateConsole(type: string, message: any, ...optionalParams: any[]): void {
  let text = logToText(message);

  for (let param of optionalParams) {
    text += `\n   ${logToText(param)}`;
  }

  text = wrapConsoleText(type, text);

  _consoleContent.innerHTML += `${text}\n`;
}

function logToText(message: any): string {
  if (typeof message === 'object' && message !== null) {
    return JSON.stringify(message);
  }

  return `${escape(message)}`;
}

function escape(text: string): string {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function toggleOptions(this: HTMLElement, ev: Event): void {
  this.classList.toggle('active');
  _options.classList.toggle('visible');
}

function showProcessingIndicator(): void {
  _processing.style.display = 'inline-block';
}

function hideProcessingIndicator(): void {
  _processing.style.display = 'none';
}

function fadeOut(target: HTMLElement, interval = 5, reduce = 0.01): void {
  target.style.opacity = '1';

  const fadeEffect = setInterval(() => {
    if (parseFloat(target.style.opacity) < 0.05) {
      clearInterval(fadeEffect);
      target.style.opacity = '0';
      target.style.display = 'none';
    } else {
      target.style.opacity = `${parseFloat(target.style.opacity) - reduce}`;
    }
  }, interval);
}

function find<T>(input: T[], test: (element: T) => boolean): T {
  if (!Array.isArray(input)) {
    return null;
  }

  for (let el of input) {
    if (test(el)) {
      return el;
    }
  }

  return null;
}

bootstrap();
