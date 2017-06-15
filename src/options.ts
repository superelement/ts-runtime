import * as ts from 'typescript';

export interface Options {
  annotate?: boolean;
  compilerOptions?: ts.CompilerOptions;
  declarationFileName?: string;
  force?: boolean;
  importDeclarations?: boolean;
  keepTemp?: boolean;
  libIdentifier?: string;
  libNamespace?: string;
  declarationPrefix?: string;
  moduleAlias?: boolean;
  stackTraceOutput?: number;
  tempFolderName?: string;
  log?: boolean;
  assertSafe?: true;
  assertAny?: false;
}

export const defaultOptions: Options = {
  annotate: true,
  compilerOptions: {
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ES2015,
    target: ts.ScriptTarget.ES2015,
    lib: ["lib.es2015.d.ts"],
    strictNullChecks: true,
    experimentalDecorators: true,
    sourceMap: false,
    removeComments: true,
    preserveConstEnums: true,
  },
  declarationFileName: 'tsr-declarations',
  force: false,
  importDeclarations: true,
  keepTemp: false,
  libIdentifier: 't',
  libNamespace: '_',
  declarationPrefix: '_',
  moduleAlias: false,
  stackTraceOutput: 3,
  tempFolderName: '.tsr',
  log: true,
  assertSafe: true,
  assertAny: false,
};
