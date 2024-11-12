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

/**
 * Captura o estado atual dos arquivos dentro de um diretório específico da árvore de arquivos.
 *
 * @param {Tree} tree - A árvore de arquivos do schematic.
 * @param {string} [rootPath='/src/app'] - O caminho raiz da pasta onde os arquivos serão capturados. O valor padrão é '/src/app'.
 *
 * @returns {Map<string, string>} - Um Map contendo o caminho dos arquivos como chave e o conteúdo do arquivo como valor.
 */
export function getTreeState(
  tree: Tree,
  rootPath: string = '/src/app'
): Map<string, string> {
  const fileMap = new Map<string, string>();
  tree.getDir(rootPath).visit((path) => {
    const content = tree.read(path);
    if (content) {
      fileMap.set(path, content.toString());
    }
  });
  return fileMap;
}

/**
 * Verifica se houve mudanças entre o estado original e o estado atual da árvore de arquivos (Tree).
 *
 * @param {Map<string, string>} originalState - O estado original da árvore de arquivos, contendo caminhos e conteúdos dos arquivos.
 * @param {Map<string, string>} currentState - O estado atual da árvore de arquivos, contendo caminhos e conteúdos dos arquivos.
 *
 * @returns {boolean} - Retorna `true` se houver alguma mudança, como diferença no número de arquivos ou no conteúdo deles. Caso contrário, retorna `false`.
 */
export function hasTreeChanges(
  originalState: Map<string, string>,
  currentState: Map<string, string>
): boolean {
  if (originalState.size !== currentState.size) {
    return true;
  }

  for (const [path, originalContent] of originalState) {
    const currentContent = currentState.get(path);
    if (originalContent !== currentContent) {
      return true;
    }
  }

  return false;
}
