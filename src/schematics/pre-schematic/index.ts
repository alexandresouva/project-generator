import { noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { execSync } from 'child_process';

export function preSchematic(schematic: Rule): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (hasLocalGitChanges()) {
      const orientations: string[] = [
        'Por favor, faça o commit ou guarde as alterações antes de executar este comando. Sugestões:',
        '\n\n  \x1b[32mgit stash\x1b[0m --> guardar alterações em staging.',
        '\n  \x1b[32mgit add && git commit\x1b[0m --> faz o commit das mudanças.',
        '\n\nEm seguida, tente gerar o template novamente. \n',
      ];

      console.error('Existem arquivos modificados ou em staging.\n');
      console.info(orientations.join(''));
      return noop();
    }
    return schematic(tree, context);
  };
}

/**
 * Verifica se existem alterações sem commit ou stash no repositório Git local.
 *
 * @returns {boolean} Retorna `true` se houver alterações não confirmadas ou em
 *                   staging, caso contrário, retorna `false`.
 *
 */
export function hasLocalGitChanges(): boolean {
  try {
    const output = execSync('git status --porcelain', {
      encoding: 'utf-8',
    });
    return output.length > 0;
  } catch {
    return false;
  }
}
