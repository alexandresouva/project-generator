import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { APP_ROUTING_MODULE_PATH, LOG_PHASES } from '../../core/constants';
import { RouteImport } from '../../core/interfaces/Import';
import { getExistingRoutes } from '../../core/helpers/route-helper';
import { getSourceFile } from '../../core/helpers/utils';
import { Schema } from './Schema';
const spawn = require('cross-spawn');

export function posSchematic(schema: Schema): Rule {
  return function (tree: Tree, context: SchematicContext) {
    // Corrige problemas de formatação
    context.logger.info(LOG_PHASES.linting);
    spawn.sync('npm', ['run', 'lint:fix'], { stdio: 'inherit' });
    console.log('--------------------------------');

    // Gera as orientações finais
    context.logger.info(LOG_PHASES.updated);
    const instructions = generateProjectInstructions(schema.routes);
    console.info(instructions.join('\n'));
    return tree;
  };
}

function generateProjectInstructions(routes: RouteImport[]): string[] {
  const oldComponentName = routes.find((route) => route.path === '')?.component;
  const newComponentName = getNewComponentNameForMainRoute();

  let orientations: string[] = [];
  if (oldComponentName) {
    orientations = [
      'Para visualizar o template, atualize o componente da rota principal em `app.routing.module.ts`.',
      `\n    De: { path: '', component: ${oldComponentName} }`,
      `    Para: { path: '', component: \x1b[32m${newComponentName}\x1b[0m }\n`,
      'Em seguida, basta iniciar o projeto utilizando `npm run start`.\n',
    ];
  } else {
    orientations = [
      'Para iniciar o projeto, utilize o comando `npm run start`.\n',
    ];
  }

  orientations.push(
    'Para mais detalhes, consulte o README do projeto ou acesse a \x1b]8;;https://example.com.br\x1b\\documentação oficial\x1b]8;;\x1b\\.\n'
  );

  return orientations;
}

function getNewComponentNameForMainRoute(): string | undefined {
  const routingSource = getSourceFile(APP_ROUTING_MODULE_PATH);
  return getExistingRoutes(routingSource).find((route) => route.path === '')
    ?.component;
}
