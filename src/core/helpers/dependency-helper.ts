import { execSync } from 'child_process';

/**
 * Dependências necessárias para a inicialização de um projeto
 */
export const REQUIRED_DEPENDENCIES = {
  rxjs: '^7.0.0',
};

/**
 * Obtém todas as dependências do projeto usando `npm list`.
 *
 * @returns {IDependencies} Um objeto contendo todas as dependências do projeto.
 */
export function getAllProjectDependencies():
  | Record<string, string>
  | undefined {
  const dependencies: Record<string, string> = {};

  try {
    // Executa o comando npm list para obter todas as dependências com `--json`
    const output = execSync('npm list --depth=0 --json', {
      encoding: 'utf-8',
    });
    const parsedOutput = JSON.parse(output);

    for (const [name, info] of Object.entries(parsedOutput.dependencies)) {
      dependencies[name] = (info as { version: string }).version;
    }
  } catch {
    return undefined;
  }
  return dependencies;
}

/**
 * Verifica as dependências obrigatórias e retorna uma lista das ausentes.
 *
 * @param dependencies Um objeto contendo as dependências atuais do projeto.
 * @returns Uma lista com os nomes das dependências obrigatórias que estão ausentes.
 */
export function getMissingRequiredDependencies(
  dependencies: Record<string, string>
): string[] {
  const missingDependencies: string[] = [];

  for (const dependencyName of Object.keys(REQUIRED_DEPENDENCIES)) {
    if (!dependencies[dependencyName]) {
      missingDependencies.push(dependencyName);
    }
  }

  return missingDependencies;
}
