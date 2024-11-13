export interface DefaultImport {
  name: string;
  path: string;
  isModuleForRoot?: boolean;
}

export interface IRouteImport {
  path: string;
  component: string;
  importPath: string;
}
