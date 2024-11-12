import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SchemaModel } from './schema';

/**
 * Regra com a implementação final do template.
 *
 * @param {SchemaModel} options - Representação do schema.
 * @returns {Rule} - Regra para aplicar o template ao projeto.
 */
export function example(_options: SchemaModel): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.logger.info('Aplicando template...');
    return tree;
  };
}
