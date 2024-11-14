import { confirm } from '@inquirer/prompts';

/**
 * Função para lidar com a personalização do template.
 *
 * @param {() => Promise<T>} customPrompts - Callback que será executada para obter as preferências do usuário.
 * @returns {Promise<T | undefined>} - Preferências do usuário ou undefined, se não for personalizado.
 */
export async function promptForTemplateCustomization<T>(
  customPrompts?: () => Promise<T>
): Promise<T | undefined> {
  if (!customPrompts) return undefined;

  const shouldCustomizeTemplate = await confirm({
    message: 'Deseja personalizar o template?',
  });

  if (shouldCustomizeTemplate) {
    return customPrompts();
  }
}
