/* eslint-disable no-console */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { TemplateSchema, TemplateOptions } from './schema';
import { createTemplateRule } from '../../core/helpers/template-generator';
import { handlePromptTemplate } from '../../core/helpers/prompt-helper';
import { select } from '@inquirer/prompts';
import {
  TEMPLATE_CONDITIONAL_IMPORTS,
  TEMPLATE_REQUIRED_IMPORTS,
} from './schema-data';
import { getAllImportsBasedOnCustomization } from '../../core/helpers/import-helper';

/**
 * Regra com a implementação final do template.
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
            description: 'Exemplo: https://paginacao',
          },
          {
            name: 'Scroll Infinito',
            value: 'infinite-scroll',
            description: 'Exemplo: https://paginacao',
          },
        ],
      });
      return answers;
    });

    const imports = getAllImportsBasedOnCustomization(
      userPreferences ?? defaultTemplatePreferences,
      TEMPLATE_REQUIRED_IMPORTS,
      TEMPLATE_CONDITIONAL_IMPORTS
    );

    console.log(imports);

    return createTemplateRule();
  };
}
