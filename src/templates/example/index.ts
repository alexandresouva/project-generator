import { Rule } from '@angular-devkit/schematics';
import { TemplateSchema, TemplateOptions } from './schema';
import { createTemplateRule } from '../../core/helpers/template-generator';
import { promptForTemplateCustomization } from '../../core/helpers/prompt-helper';
import { select } from '@inquirer/prompts';
import {
  ROUTES,
  TEMPLATE_CONDITIONAL_IMPORTS,
  TEMPLATE_REQUIRED_IMPORTS,
} from './schema-data';
import { getAllImportsBasedOnCustomization } from '../../core/helpers/import-helper';
import { preSchematic } from '../../schematics/pre-schematic';

/**
 * Wrapper que contém regras a serem checadas antes
 * da execução do schematic do template.
 */
export default function (options: TemplateSchema): Rule {
  return preSchematic(example(options));
}

/**
 * Regra com a implementação do template.
 *
 * @param {TemplateSchema} options - Representação do schema.
 * @returns {Rule} - Regra para aplicar o template ao projeto.
 */
export function example(options: TemplateSchema): Rule {
  return async (): Promise<Rule> => {
    const defaultSettings: TemplateOptions = {
      dataViewMode: 'pagination',
    };
    const userPreferences = await getUserPreferences();
    const finalSettings = userPreferences ?? defaultSettings;

    // Atribui as preferências finais ao schema
    options = {
      ...options,
      ...finalSettings,
    };

    // Obtém os imports baseado na customização escolhida
    const imports = getAllImportsBasedOnCustomization(
      finalSettings,
      TEMPLATE_REQUIRED_IMPORTS,
      TEMPLATE_CONDITIONAL_IMPORTS
    );

    return createTemplateRule(options, imports, ROUTES);
  };
}

/**
 * Função para coletar preferências do usuário para o template.
 * @returns {Promise<TemplateOptions | undefined>} - Preferências do usuário ou undefined, em caso de erro.
 */
async function getUserPreferences(): Promise<TemplateOptions | undefined> {
  const userPreferences = await promptForTemplateCustomization<TemplateOptions>(
    async () => {
      return {
        dataViewMode: await select({
          message: 'Como os dados deverão ser exibidos na tabela principal?',
          choices: [
            {
              name: 'Paginação',
              value: 'pagination',
              description:
                'Veja a demonstração em: https://bb.linkficticio.com/paginacao',
            },
            {
              name: 'Scroll Infinito',
              value: 'infinite-scroll',
              description:
                'Veja a demonstração em: https://bb.linkficticio.com/scroll-infinito',
            },
          ],
        }),
      };
    }
  );

  return userPreferences;
}
