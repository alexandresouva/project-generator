export interface DefaultImport {
  name: string;
  path: string;
  isModuleForRoot?: boolean;
}

export interface RouteImport {
  path: string;
  component: string;
  importPath: string;
}
