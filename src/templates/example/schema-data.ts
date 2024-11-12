import { DefaultImport } from '../../core/interfaces/Import';

/**
 * Imports necessários para este template, independente da variação escolhida.
 */
export const TEMPLATE_REQUIRED_IMPORTS: DefaultImport[] = [
  {
    name: 'MyService',
    path: './services/my.service',
  },
];

/**
 * Mapeamento de imports condicionais para cada variante do template.
 * Cada chave representa uma variante, e cada valor representa os imports correspondentes.
 */
export const TEMPLATE_CONDITIONAL_IMPORTS: Record<string, DefaultImport[]> = {
  pagination: [
    {
      name: 'MyComponent',
      path: './components/my-component.component',
    },
    {
      name: 'MyComponent2',
      path: './components/my-component2.component',
    },
  ],
  'infinite-scroll': [
    {
      name: 'HeaderComponent',
      path: './components/header/header.component',
    },
    { name: 'MyModule', path: './components/my/my.module' },
  ],
};