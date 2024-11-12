import { SchematicsException, Tree } from '@angular-devkit/schematics';

/**
 * Obtém o prefixo do arquivo angular.json.
 *
 * @param tree - O Tree que representa a árvore de arquivos.
 * @returns O valor do prefixo encontrado no angular.json.
 */
export function getPrefixFromAngularJson(tree: Tree): string {
  const configFilePath = '/angular.json';

  if (!tree.exists(configFilePath)) {
    throw new SchematicsException(
      `Não foi possível obter a sigla da equipe. O arquivo ${configFilePath} não foi encontrado.`
    );
  }

  const configBuffer = tree.read(configFilePath);
  if (!configBuffer) {
    throw new SchematicsException(
      `Erro ao obter a sigla da equipe. Não foi possível ler o arquivo ${configFilePath}.`
    );
  }

  // Converte o conteúdo do arquivo angular.json em JSON
  const configJson = JSON.parse(configBuffer.toString('utf-8'));

  // Busca o projeto default no arquivo angular.json. Caso não exista,
  // assume que o projeto padrão é o primeiro no array de projetos
  const defaultProject =
    configJson.defaultProject || Object.keys(configJson.projects)[0];
  const project = configJson.projects[defaultProject];

  if (!project || !project.prefix) {
    throw new SchematicsException(
      `Erro ao obter a sigla da equipe. O prefixo ("prefix") do projeto não foi encontrado no arquivo ${configFilePath}.`
    );
  }

  return project.prefix;
}
