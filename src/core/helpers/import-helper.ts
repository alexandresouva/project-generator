import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { DefaultImport } from '../interfaces/Import';
import ts = require('typescript');
import { getSourceFile } from './utils';
import { Change, InsertChange } from '@schematics/angular/utility/change';
import {
  addDeclarationToModule,
  addImportToModule,
  addProviderToModule,
} from '@angular/cdk/schematics';

/**
 * Imports necessários que serão usados em todos os templates.
 */
const REQUIRED_IMPORTS: DefaultImport[] = [];

/**
 * Retorna todos os imports necessários com base na personalização fornecida.
 *
 * @param {Object} props - As propriedades ou preferências fornecidas para a personalização.
 * @param {DefaultImport[]} templateImports - Lista de imports padrões para o template.
 * @param {Record<string, DefaultImport[]>} conditionalImports - Mapa de imports condicionais baseados em valores das propriedades.
 *
 * @returns {DefaultImport[]} Lista de todos os imports necessários após combinar os obrigatórios, os do template e os condicionais.
 */
export function getAllImportsBasedOnCustomization(
  props: Object,
  templateImports: DefaultImport[],
  conditionalImports: Record<string, DefaultImport[]>
): DefaultImport[] {
  const imports = [...REQUIRED_IMPORTS, ...templateImports];

  Object.values(props).forEach((value) => {
    if (value && conditionalImports[value]) {
      imports.push(...conditionalImports[value]);
    }
  });

  return imports;
}

/**
 * Adiciona importações ao app.module.ts a partir de um array de IImport.
 *
 * @param appModuleImports - Array de objetos IImport com as informações de importação.
 * @returns Rule que aplica as mudanças no arquivo app.module.ts do projeto.
 */
export function addImportsToAppModule(appModuleImports: DefaultImport[]): Rule {
  const targetAppModulePath = 'src/app/app.module.ts';

  return (tree: Tree, _context: SchematicContext) => {
    if (!tree.exists(targetAppModulePath)) {
      throw new SchematicsException(
        `Não foi possível adicionar as importações. O arquivo "app.module.ts" não existe em ${targetAppModulePath}`
      );
    }

    // Obtém o SourceFile (representação do arquivo) do app.module.ts
    const sourceFile = getSourceFile(targetAppModulePath, tree);

    // Obtém os imports que faltam no app.module.ts
    const missingImports = getMissingImports(
      sourceFile,
      targetAppModulePath,
      appModuleImports
    );

    // Adiciona as importações ao app.module.ts
    const recorder = tree.beginUpdate(targetAppModulePath);
    missingImports.forEach((importItem) => {
      if (importItem instanceof InsertChange) {
        recorder.insertLeft(importItem.pos, importItem.toAdd);
      }
    });
    tree.commitUpdate(recorder);
    return tree;
  };
}

/**
 * Mapeia tipos específicos de arquivos (como componentes, serviços, módulos, etc.) e retorna um array
 * de objetos `Change` com as alterações a serem aplicadas ao arquivo do módulo.
 *
 * @param {ts.SourceFile} sourceFile - O arquivo fonte do `NgModule` no qual as importações serão adicionadas.
 * @param {string} modulePath - O caminho do arquivo do módulo onde as alterações serão feitas.
 * @param {IGenericImport[]} importsToProcess - A lista de importações que precisam ser verificadas e processadas.
 *
 * @returns {Change[]} Um array de objetos `Change` que representam as alterações a serem aplicadas ao arquivo do módulo.
 */
function getMissingImports(
  sourceFile: ts.SourceFile,
  modulePath: string,
  importsToProcess: DefaultImport[]
): Change[] {
  // Mapeia os tipos de arquivos para suas respectivas funções de tratamento.
  // Cada tipo de arquivo tem uma função que define como ele deve ser importado no NgModule.
  const handlers: {
    [key: string]: (
      _sourceFile: ts.SourceFile,
      _modulePath: string,
      _classifiedName: string,
      _importPath: string
    ) => Change[];
  } = {
    Component: addDeclarationToModule,
    Directive: addDeclarationToModule,
    Pipe: addDeclarationToModule,
    Service: addProviderToModule,
    Guard: addProviderToModule,
    Interceptor: addProviderToModule,
    Resolver: addProviderToModule,
    Module: (sourceFile, modulePath, classifiedName, importPath) => {
      const MODULES_REQUIRING_FOR_ROOT = ['My2Module'];

      // Verifica se o módulo precisa do forRoot()
      const moduleName = MODULES_REQUIRING_FOR_ROOT.includes(classifiedName)
        ? `${classifiedName}.forRoot()`
        : classifiedName;
      return addImportToModule(sourceFile, modulePath, moduleName, importPath);
    },
  };

  return importsToProcess
    .filter(({ name }) => name !== 'NgModule')
    .flatMap(({ name, path }) => {
      // Verifica qual handler (função) deve ser usado com base no sufixo do nome classificado
      const handler = Object.keys(handlers).find((key) => name.endsWith(key));
      // Se houver um handler correspondente, aplica-o para gerar as alterações no NgModule
      return handler
        ? handlers[handler](sourceFile, modulePath, name, path)
        : [];
    });
}
