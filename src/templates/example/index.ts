import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { SchemaModel } from './schema';
import { createTemplateRule } from '../../core/helpers/template-generator';
import { handlePromptTemplate } from '../../core/helpers/prompt-helper';
import { select } from '@inquirer/prompts';

/**
 * Regra com a implementação final do template.
 *
 * @param {SchemaModel} options - Representação do schema.
 * @returns {Rule} - Regra para aplicar o template ao projeto.
 */
export function example(_options: SchemaModel): Rule {
  return async (_tree: Tree, _context: SchematicContext): Promise<Rule> => {
    await handlePromptTemplate(async () => {
      await select({
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
    });

    return createTemplateRule();
  };
}
