import { DefaultImport, IRouteImport } from '../../core/interfaces/Import';

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
      name: 'My2Component',
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

/**
 * Rotas a serem adicionadas no app-routing.module
 */
export const ROUTES: IRouteImport[] = [
  {
    path: '',
    component: 'HomeComponent',
    importPath: './home/home.component',
  },
  {
    path: 'home',
    component: 'HomeComponent',
    importPath: './home/home.component',
  },
  {
    path: 'about',
    component: 'AboutComponent',
    importPath: './about/about.component',
  },
  {
    path: 'contact',
    component: 'ContactComponent',
    importPath: './contact/contact.component',
  },
];
