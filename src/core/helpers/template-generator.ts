import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  getAllProjectDependencies,
  getMissingRequiredDependencies,
} from './dependency-helper';
import { getPrefixFromAngularJson } from './utils';
import { SchemaBase } from '../interfaces/Schema';

export function createTemplateRule(options: SchemaBase): Rule {
  const dependencies = getAllProjectDependencies();
  if (!dependencies) {
    throw new SchematicsException(
      '\n Ocorreu um erro ao listar as dependências do projeto. Para mais detalhes, consulte o log. \n'
    );
  }

  // Interrompe a geração caso falte alguma dependência obrigatória
  const missingDependencies = getMissingRequiredDependencies(dependencies);
  if (missingDependencies.length > 0) {
    const { errorMsg, infoMsg } =
      generateDependenciesErrorMessage(missingDependencies);
    console.error(errorMsg);
    console.info(infoMsg);
    return noop();
  }

  return (tree: Tree, context: SchematicContext) => {
    options.teamAcronym = getPrefixFromAngularJson(tree);

    return chain([(_tree: Tree, _context: SchematicContext) => {}])(
      tree,
      context
    );
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
