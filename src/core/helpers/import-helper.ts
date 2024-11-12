import { DefaultImport } from '../interfaces/Import';

/**
 * Imports necessários que serão usados em todos os templates.
 */
const REQUIRED_IMPORTS: DefaultImport[] = [];

export function getAllImportsBasedOnCustomization(
  props: Object,
  templateImports: DefaultImport[],
  conditionalImports: Record<string, DefaultImport[]>
): DefaultImport[] {
  const imports = [...REQUIRED_IMPORTS, ...templateImports];

  Object.values(props).forEach((value) => {
    if (value && conditionalImports[value]) {
      imports.push(...conditionalImports[value]);
    }
  });

  return imports;
}
