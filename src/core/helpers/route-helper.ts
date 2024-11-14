import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { addRouteDeclarationToModule } from '@angular/cdk/schematics';
import { InsertChange } from '@schematics/angular/utility/change';

import * as ts from 'typescript';
import { getSourceFile } from './utils';
import { RouteImport } from '../interfaces/Import';
import { APP_ROUTING_MODULE_PATH } from '../constants';

interface Route {
  path?: string;
  component?: string;
  loadChildren?: string;
  matcher?: string;
  redirectTo?: string;
  pathMatch?: string;
}

export function addRoutesToRoutingModule(routes: RouteImport[]): Rule {
  return (tree: Tree) => {
    const routingSource = getSourceFile(APP_ROUTING_MODULE_PATH, tree);
    const routingFileContent = tree
      .read(APP_ROUTING_MODULE_PATH)
      ?.toString('utf-8');

    if (!routingFileContent) {
      throw new SchematicsException(
        `Não foi possível ler o arquivo ${APP_ROUTING_MODULE_PATH}`
      );
    }

    const existingRoutes = getExistingRoutes(routingSource);
    const newRotes = routes.filter(
      (route) =>
        !existingRoutes.some(
          (existingRoute) => existingRoute.path === route.path
        )
    );

    // Adiciona as novas rotas no array de rotas
    const recorder = tree.beginUpdate(APP_ROUTING_MODULE_PATH);
    newRotes.forEach((route) => {
      const routeDeclaration = `{ path: '${route.path}', component: ${route.component} }`;
      const change = addRouteDeclarationToModule(
        routingSource,
        APP_ROUTING_MODULE_PATH,
        routeDeclaration
      );

      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    // Adiciona as importações necessárias no topo do arquivo
    newRotes.forEach((route) => {
      const importStatement = `import { ${route.component} } from '${route.importPath}';\n`;

      if (!routingFileContent.includes(importStatement)) {
        recorder.insertLeft(0, importStatement);
      }
    });

    tree.commitUpdate(recorder);
    return tree;
  };
}

export function getExistingRoutes(node: ts.Node): Route[] {
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
    routes.push(...getExistingRoutes(childNode));
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
  const routeMapping: { [key: string]: keyof Route } = {
    path: 'path',
    component: 'component',
    loadChildren: 'loadChildren',
    matcher: 'matcher',
    redirectTo: 'redirectTo',
    pathMatch: 'pathMatch',
  };

  node.properties.forEach((property) => {
    if (ts.isPropertyAssignment(property)) {
      const name = property.name.getText();
      const value = property.initializer.getText().replace(/['"]/g, '');

      if (routeMapping[name]) {
        route[routeMapping[name]] = value;
      }
    }
  });

  return route;
}
