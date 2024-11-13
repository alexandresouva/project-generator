import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { TemplateSchema, TemplateOptions } from './schema';
import { createTemplateRule } from '../../core/helpers/template-generator';
import { handlePromptTemplate } from '../../core/helpers/prompt-helper';
import { select } from '@inquirer/prompts';
import {
  ROUTES,
  TEMPLATE_CONDITIONAL_IMPORTS,
  TEMPLATE_REQUIRED_IMPORTS,
} from './schema-data';
import { getAllImportsBasedOnCustomization } from '../../core/helpers/import-helper';
import { preSchematic } from '../../schematics/pre-schematic';

/**
 * Wrapper que contem regras a serem checadas antes
 * da execução do template principal.
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
export function example(_options: TemplateSchema): Rule {
  return async (_tree: Tree, _context: SchematicContext): Promise<Rule> => {
    const defaultTemplatePreferences: TemplateOptions = {
      dataViewMode: 'pagination',
    };
    const userPreferences = await handlePromptTemplate(async () => {
      const answers = { ...defaultTemplatePreferences };
      answers.dataViewMode = await select({
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
      });
      return answers;
    });

    // Atribui as preferências ao template no schema
    _options = {
      ..._options,
      ...userPreferences,
    };

    const imports = getAllImportsBasedOnCustomization(
      userPreferences ?? defaultTemplatePreferences,
      TEMPLATE_REQUIRED_IMPORTS,
      TEMPLATE_CONDITIONAL_IMPORTS
    );

    return createTemplateRule(_options, imports, ROUTES);
  };
}
