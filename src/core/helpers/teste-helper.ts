import * as ts from 'typescript';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { getSourceFile } from './utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { addRouteDeclarationToModule } from '@angular/cdk/schematics';

interface Route {
  path?: string;
  component?: string;
  loadChildren?: string;
  matcher?: string;
  redirectTo?: string;
  pathMatch?: string;
}

export interface IRouteImport {
  path: string;
  component: string;
  importPath: string;
}

export function addRoutesToRoutingModule(
  routes: IRouteImport[],
  shouldReplaceMainPath: boolean
): Rule {
  const routingModulePath = 'src/app/app-routing.module.ts';

  return (tree: Tree, _context: SchematicContext) => {
    const routingSource = getSourceFile(routingModulePath, tree);
    const routingFileContent =
      tree.read(routingModulePath)?.toString('utf-8') ?? '';

    // Verificar se o array `routes` contém ao menos uma rota com path: '' quando `shouldReplaceMainPath` é true
    if (shouldReplaceMainPath && !routes.some((route) => route.path === '')) {
      throw new SchematicsException(
        'A rota com path: xxx é obrigatória quando shouldReplaceMainPath é true.'
      );
    }

    // Obter as rotas existentes no projeto de destino
    const existingRoutes = getExistingRoutes(tree, routingModulePath);

    // Filtrar as rotas que serão adicionadas, excluindo aquelas com path '**'
    const routesToBeAdded = routes.filter(
      (route) =>
        route.path !== '**' &&
        !existingRoutes.some(
          (existingRoute) => existingRoute.path === route.path
        )
    );

    // Verificar se há uma rota com path: '' a ser substituída
    const mainPathRoute = routes.find((route) => route.path === '');
    const existingMainPathRouteIndex = existingRoutes.findIndex(
      (route) => route.path === ''
    );

    if (shouldReplaceMainPath && mainPathRoute) {
      if (existingMainPathRouteIndex !== -1) {
        // Substituir a rota com path: '' existente no projeto
        existingRoutes[existingMainPathRouteIndex] = mainPathRoute;
      } else {
        // Adicionar a nova rota com path: '' ao conjunto de rotas a serem adicionadas
        routesToBeAdded.push(mainPathRoute);
      }
    }

    // Adicionar as novas rotas e os imports
    const recorder = tree.beginUpdate(routingModulePath);
    routesToBeAdded.forEach((route) => {
      const routeDeclaration = `{ path: '${route.path}', component: ${route.component} }`;
      const change = addRouteDeclarationToModule(
        routingSource,
        routingModulePath,
        routeDeclaration
      );

      // Aplicar a mudança ao recorder para inserção da rota
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    // Adicionar as importações necessárias, evitando duplicação
    routesToBeAdded.forEach((route) => {
      const importStatement = `import { ${route.component} } from '${route.importPath}';\n`;

      if (!routingFileContent.includes(importStatement)) {
        recorder.insertLeft(0, importStatement);
      }
    });

    tree.commitUpdate(recorder);
    return tree;
  };
}

export function getExistingRoutes(
  tree: Tree,
  routingModulePath: string
): Route[] {
  let routes: Route[] = [];

  const sourceFileContent = tree.read(routingModulePath)?.toString('utf-8');
  if (!sourceFileContent) {
    throw new SchematicsException(
      `Arquivo ${routingModulePath} não encontrado.`
    );
  }

  const routesSourceFile = getSourceFile(routingModulePath, tree);
  routes = findRoutes(routesSourceFile);
  return routes;
}

function findRoutes(node: ts.Node): Route[] {
  const routes: Route[] = [];

  if (isRouteArray(node)) {
    const routeArray = (node as ts.VariableDeclaration)
      .initializer as ts.ArrayLiteralExpression;
    routeArray.elements.forEach((element) => {
      if (ts.isObjectLiteralExpression(element)) {
        const route = processRouteObject(element);
        routes.push(route);
      }
    });
  }

  // Acumula rotas encontradas recursivamente nos filhos
  node.forEachChild((childNode) => {
    routes.push(...findRoutes(childNode));
  });

  return routes;
}

function isRouteArray(node: ts.Node): boolean {
  return (
    (ts.isVariableDeclaration(node) &&
      node.name.getText() === 'routes' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)) ??
    false
  );
}

function processRouteObject(node: ts.ObjectLiteralExpression): Route {
  const route: Route = {};

  // Definir o mapeamento de propriedades esperadas para as variáveis
  const routeMapping: { [key: string]: keyof Route } = {
    path: 'path',
    component: 'component',
    loadChildren: 'loadChildren',
    matcher: 'matcher',
    redirectTo: 'redirectTo',
    pathMatch: 'pathMatch',
  };

  // Iterar sobre as propriedades do objeto de rota e atribuir dinamicamente ao route
  node.properties.forEach((property) => {
    if (ts.isPropertyAssignment(property)) {
      const name = property.name.getText();
      const value = property.initializer.getText().replace(/['"]/g, '');

      // Usar o mapeamento para atribuir a propriedade correspondente
      if (routeMapping[name]) {
        route[routeMapping[name]] = value;
      }
    }
  });

  return route;
}
