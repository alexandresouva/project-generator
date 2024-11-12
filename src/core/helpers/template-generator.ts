import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';

export function createTemplateRule(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([(_tree: Tree, _context: SchematicContext) => {}])(
      tree,
      context
    );
  };
}
