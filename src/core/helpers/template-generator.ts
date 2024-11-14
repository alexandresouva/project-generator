import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { buildComponent } from '@angular/cdk/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';

import {
  getAllProjectDependencies,
  getMissingRequiredDependencies,
  REQUIRED_DEPENDENCIES,
} from './dependency-helper';
import {
  getPrefixFromAngularJson,
  getTreeState,
  hasTreeChanges,
} from './utils';
import { SchemaBase } from '../interfaces/Schema';
import { LOG_PHASES } from '../constants';
import { DefaultImport, RouteImport } from '../interfaces/Import';
import { addRoutesToRoutingModule } from './route-helper';
import { addImportsToAppModule } from './import-helper';

const semver = require('semver');

export function createTemplateRule(
  options: SchemaBase,
  imports: DefaultImport[],
  routes: RouteImport[]
): Rule {
  const dependencies = getAllProjectDependencies();
  if (!dependencies) {
    throw new SchematicsException(
      '\n Ocorreu um erro ao listar as dependências do projeto. Para mais detalhes, consulte o log. \n'
    );
  }

  // Interrompe o schematic caso falte alguma dependência obrigatória
  const missingDependencies = getMissingRequiredDependencies(dependencies);
  if (missingDependencies.length > 0) {
    const { errorMsg, infoMsg } =
      generateDependenciesErrorMessage(missingDependencies);
    console.error(errorMsg);
    console.info(infoMsg);
    return noop();
  }

  // Interrompe o schematic caso alguma dependência obrigatória
  // esteja em uma versão incompatível
  for (const [name, expectedVersion] of Object.entries(REQUIRED_DEPENDENCIES)) {
    const currentVersion = dependencies[name];
    const isValidVersion = semver.satisfies(currentVersion, expectedVersion);

    if (!isValidVersion) {
      console.error('\nDependência desatualizada!\n');
      console.info(
        `A versão da dependência ${name} instalada (${currentVersion}) não satisfaz a versão esperada para o template (${expectedVersion}). Por favor, instale uma versão compatível.\n`
      );
    }
  }

  return (tree: Tree, context: SchematicContext) => {
    const originalState = getTreeState(tree);
    options.teamAcronym = getPrefixFromAngularJson(tree);

    return chain([
      buildComponent({ ...options, skipImport: true }),
      addImportsToAppModule(imports),
      () => addRoutesToRoutingModule(routes),
      (tree: Tree, context: SchematicContext) => {
        const currentTreeState = getTreeState(tree);
        context.logger.info(LOG_PHASES.start);

        if (hasTreeChanges(originalState, currentTreeState)) {
          context.logger.info(LOG_PHASES.updating);

          // Após a geração dos arquivos, inicia a etapa de pós schematic
          context.addTask(new RunSchematicTask('posSchematic', { routes }));
        } else {
          context.logger.info(LOG_PHASES.noChanges);
        }
      },
    ])(tree, context);
  };
}

/**
 * Formata uma mensagem sobre as dependências ausentes em um projeto.
 *
 * @param {string[]} missingDependencies - Array de nomes de dependências que estão faltando.
 * @returns {string} Mensagem de erro formatada.
 */
function generateDependenciesErrorMessage(missingDependencies: string[]): {
  errorMsg: string;
  infoMsg: string;
} {
  let errorMsg = '\nO projeto atual não possui';
  if (missingDependencies.length === 1) {
    errorMsg = `${errorMsg} a dependência: ${missingDependencies[0]}.`;
  } else {
    const lastDependency = missingDependencies.pop();
    errorMsg = `${errorMsg} as dependências ${missingDependencies.join(
      ', '
    )} e ${lastDependency}.`;
  }

  const infoMsg = `\nSem ela(s), não é possível garantir a correta estilização e funcionamento do template gerado. Para resolver o problema, você pode: \n\n 1) Gerar o projeto utilizando o gaw-cli (https://example.com.br). \n 2) Atualizar o projeto atual executando o seguinte comando:\n\nnpm install ${missingDependencies.join(
    ' '
  )}\n\nEm seguida, tente novamente.\n`;

  return {
    errorMsg,
    infoMsg,
  };
}
